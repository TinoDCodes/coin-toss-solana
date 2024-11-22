"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { createAssociatedToken } from "@metaplex-foundation/mpl-toolbox";
import { publicKey } from "@metaplex-foundation/umi";

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

        if (!fetchTokenAccounts || fetchTokenAccounts.value.length === 0) {
          const umi = createUmi("https://api.devnet.solana.com");
          umi.use(walletAdapterIdentity(wallet)).use(mplTokenMetadata());

          await createAssociatedToken(umi, {
            mint: publicKey(process.env.NEXT_PUBLIC_TOSS_COIN!),
            owner: umi.identity.publicKey,
          }).sendAndConfirm(umi);

          const newTokenAccount = await connection
            .getParsedTokenAccountsByOwner(wallet.publicKey!, {
              mint: mint,
              programId: TOKEN_PROGRAM_ID,
            })
            .then((res) => res.value[0]);

          return newTokenAccount;
        }

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
