import { createServiceRoleClient } from "@/utils/supabase/admin";
import { Bet } from "@/utils/types";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { clusterApiUrl, Connection, Keypair, PublicKey } from "@solana/web3.js";
import { CoinToss, getCoinTossProgram } from "coin_toss/src";

/**
 * Handles the GET request to process and settle open bets.
 * - Secures the route with an API key.
 * - Retrieves open bets from the database.
 * - Fetches associated events and selections data.
 * - Updates bet statuses based on event results.
 *
 * @param {Request} request - The incoming HTTP request.
 * @returns {Promise<Response>} The HTTP response with the success or failure details.
 */
export async function GET(request: Request) {
  // SECURE THE API ROUTE
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.API_KEY}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createServiceRoleClient();
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  try {
    const keypair = getWalletKeypair();
    const wallet = new Wallet(keypair);
    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
    const program = getCoinTossProgram(provider);

    const { data: betsData, error: betsError } = await supabase
      .from("bets")
      .select("*")
      .eq("status", "open");

    if (betsError) {
      throw new Error(`Unable to retrieve bets! -- ${betsError.message}`);
    }

    const bets: Bet[] = betsData;

    // Extract unique event IDs and selection IDs from bets
    const eventIds = [...new Set(bets.map((bet) => bet.event_id))];
    const selectionIds = [...new Set(bets.map((bet) => bet.selection_id))];

    // Fetch events and selections in bulk
    const { data: eventsData, error: eventsError } = await supabase
      .from("events")
      .select("*")
      .in("id", eventIds);

    if (eventsError) {
      throw new Error(`Unable to retrieve events! -- ${eventsError.message}`);
    }

    const { data: selectionsData, error: selectionsError } = await supabase
      .from("selections")
      .select("*")
      .in("id", selectionIds);

    if (selectionsError) {
      throw new Error(
        `Unable to retrieve selections! -- ${selectionsError.message}`
      );
    }

    const eventsMap = Object.fromEntries(
      eventsData.map((event) => [event.id, event])
    );
    const selectionsMap = Object.fromEntries(
      selectionsData.map((selection) => [selection.id, selection])
    );

    const currentDateTime = new Date().toISOString();

    // Process bets
    const updatedBets = [];
    for (const bet of bets) {
      const event = eventsMap[bet.event_id];
      const selection = selectionsMap[bet.selection_id];

      if (!event || !selection) {
        console.warn(
          `Missing event or selection for bet ID: ${bet.id}. Skipping...`
        );
        continue; // Skip invalid bets
      }

      // Skip bets for events that have not yet occurred
      if (new Date(event.date_time) > new Date(currentDateTime)) {
        console.log(
          `Event for bet ID: ${bet.id} has not yet occurred. Skipping...`
        );
        continue;
      }

      // Settle bet on chain if it was won
      if (
        event.result.toLocaleLowerCase() === selection.title.toLocaleLowerCase()
      ) {
        await payoutBet(bet, program);
      }

      await closeBetAccount(bet, program);

      updatedBets.push({
        ...bet,
        status:
          event.result.toLocaleLowerCase() ===
          selection.title.toLocaleLowerCase()
            ? "won"
            : "lost",
        settled_at: currentDateTime,
      });
    }

    console.log("Updated bets: ", updatedBets);

    // Perform a batch upsert
    const { data: dbUpdates, error: updateError } = await supabase
      .from("bets")
      .upsert(updatedBets)
      .select();

    if (updateError) {
      throw new Error(
        `Failed to perform database upsert! -- ${updateError.message}`
      );
    }

    // Return a success response
    return new Response(JSON.stringify({ success: true, dbUpdates }), {
      status: 200,
    });
  } catch (error) {
    // Handle unexpected errors
    return new Response(JSON.stringify({ success: false, error: error }), {
      status: 400,
      statusText: "An unexpected error occurred while settling bets.",
    });
  }
}

/**
 * Retrieves the wallet keypair from environment variables.
 *
 * @returns {Keypair} The keypair object.
 */
const getWalletKeypair = (): Keypair => {
  const privateKey = JSON.parse(process.env.WALLET_PRIVATE_KEY || "[]");

  // Ensure the private key array is valid
  if (!Array.isArray(privateKey) || privateKey.length !== 64) {
    throw new Error("Invalid private key array.");
  }

  return Keypair.fromSecretKey(Uint8Array.from(privateKey));
};

/**
 * Payout the bet to the user if it was won.
 *
 * @param {Bet} bet - The bet object.
 * @param {Program<CoinToss>} program - The Solana program instance.
 * @returns {Promise<void>} A promise that resolves when the bet is successfully paid out.
 */
const payoutBet = async (
  bet: Bet,
  program: Program<CoinToss>
): Promise<void> => {
  try {
    const mint = new PublicKey(process.env.NEXT_PUBLIC_TOSS_COIN!);
    const userAddressPubkey = new PublicKey(bet.wallet_address);

    // Derive the associated token account for the user.
    const receiverTokenAccount = getAssociatedTokenAddressSync(
      mint,
      userAddressPubkey
    );

    // Call the Solana program's `processBetPayout` method
    const signature = await program.methods
      .processBetPayout(bet.bet_id, userAddressPubkey)
      .accounts({
        coinTossTokenMint: mint,
        receiverTokenAccount: receiverTokenAccount,
      })
      .rpc();

    if (!signature) {
      throw new Error(`Failed to payout bet with id: ${bet.bet_id}!`);
    }
  } catch (error) {
    throw new Error(
      `Failed to payout bet with id: ${bet.bet_id}! Error: ${error}`
    );
  }
};

/**
 * Closes the bet account after settling.
 *
 * @param {Bet} bet - The bet object.
 * @param {Program<CoinToss>} program - The Solana program instance.
 * @returns {Promise<void>} A promise that resolves when the bet account is closed.
 */
const closeBetAccount = async (
  bet: Bet,
  program: Program<CoinToss>
): Promise<void> => {
  try {
    const userAddressPubkey = new PublicKey(bet.wallet_address);

    // Send the request to the blockchain to close the bet account
    const signature = await program.methods
      .closeBetAccount(bet.bet_id, userAddressPubkey)
      .rpc();

    if (!signature) {
      throw new Error(`Failed to close Bet Account with bet ID: ${bet.bet_id}`);
    }
  } catch (error) {
    throw new Error(
      `Failed to close bet with id: ${bet.bet_id}! Error: ${error}`
    );
  }
};
