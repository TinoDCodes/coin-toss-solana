"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

export function useTossCoinAccount() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const {
    data: coinAccount,
    error,
    isPending,
  } = useQuery({
    queryKey: ["coin-data", wallet.publicKey],
    queryFn: async () => {
      try {
        const mint = new PublicKey(process.env.NEXT_PUBLIC_TOSS_COIN!);
        const fetchTokenAccounts =
          await connection.getParsedTokenAccountsByOwner(wallet.publicKey!, {
            mint: mint,
            programId: TOKEN_PROGRAM_ID,
          });

        const tokenAccount = fetchTokenAccounts.value[0];

        return tokenAccount;
      } catch (error) {
        throw new Error(
          "Something went wrong while retrieving Token Account!!"
        );
      }
    },
    refetchIntervalInBackground: true,
    refetchInterval: 30 * 1000,
    enabled: !!wallet.publicKey,
  });

  return { coinAccount, error };
}
