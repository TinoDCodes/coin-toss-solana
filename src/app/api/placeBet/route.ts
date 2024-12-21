import { createServiceRoleClient } from "@/utils/supabase/admin";

/**
 * Handles the POST request to insert a new bet record into the database.
 *
 * This function expects the following JSON payload:
 * - `betId`: Unique identifier for the bet.
 * - `eventId`: Identifier for the associated event.
 * - `selectionId`: Identifier for the selected outcome.
 * - `stake`: Amount wagered on the bet.
 * - `odds`: Betting odds.
 * - `walletAddress`: User's wallet address.
 * - `status`: Status of the bet (e.g., "open").
 *
 * Returns:
 * - 400 response if any required fields are missing or if there is an insertion error.
 * - 200 response if the bet is successfully inserted.
 *
 * @param request - The incoming HTTP request containing the bet data.
 * @returns A JSON response indicating success or failure.
 */
export async function POST(request: Request) {
  const supabase = createServiceRoleClient();

  const { betId, eventId, selectionId, stake, odds, walletAddress, status } =
    await request.json();

  // Validate that all required fields are present
  if (
    !betId ||
    !eventId ||
    !selectionId ||
    !stake ||
    !odds ||
    !walletAddress ||
    !status
  ) {
    return Response.json(
      { sucess: false },
      {
        status: 400,
        statusText: "Missing bet data fields, cannot insert record!",
      }
    );
  }

  // Attempt to insert the bet record into the database
  const { data, error } = await supabase.from("bets").insert([
    {
      bet_id: betId,
      event_id: eventId,
      selection_id: selectionId,
      stake: stake,
      odds: odds,
      wallet_address: walletAddress,
      status: status,
    },
  ]);

  // Handle database insertion errors
  if (error) {
    return Response.json(
      { sucess: false },
      { status: 400, statusText: "Faiiled to insert bet record!" }
    );
  }

  // Return success response with inserted data
  return Response.json({ success: true, bet: data, betId }, { status: 200 });
}
