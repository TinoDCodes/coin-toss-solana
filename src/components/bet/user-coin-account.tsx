"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { NO_TOKEN_ACCOUNT_FOUND } from "@/utils/helpers";

/**
 * Custom hook to manage the user's token account for the Toss Coin Mint.
 *
 * - Checks if the user's associated token account exists.
 * - Creates a new associated token account if it doesn't exist.
 * - Polls periodically for updates.
 */
export function useUserCoinAccount() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const {
    data: userCoinAccount,
    error: coinAccountError,
    isPending: isCoinAccountPending,
    refetch: refetchUserCoinAccount,
  } = useQuery({
    queryKey: ["coin-data", wallet.publicKey],
    queryFn: async () => {
      try {
        const mint = new PublicKey(process.env.NEXT_PUBLIC_TOSS_COIN!);

        // Fetch token accounts owned by the user for the specified mint.
        const fetchTokenAccounts =
          await connection.getParsedTokenAccountsByOwner(wallet.publicKey!, {
            mint: mint,
            programId: TOKEN_PROGRAM_ID,
          });

        // If no token accounts exist.
        if (!fetchTokenAccounts || fetchTokenAccounts.value.length === 0) {
          return null;
        }

        // If accounts exist, return the first one.
        const tokenAccount = fetchTokenAccounts.value[0];
        return tokenAccount;
      } catch (error) {
        console.error("Error fetching or creating token account:", error);
        throw new Error(
          "Something went wrong while retrieving Token Account!!"
        );
      }
    },
    refetchIntervalInBackground: true,
    refetchInterval: 30 * 1000, // Poll every 30 seconds.
    enabled: !!wallet.publicKey, // Enable only if the wallet is connected.
  });

  return {
    userCoinAccount,
    coinAccountError,
    isCoinAccountPending,
    refetchUserCoinAccount,
  };
}
