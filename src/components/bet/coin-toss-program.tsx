"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useAnchorProvider } from "../solana/solana-provider";
import {
  COIN_TOSS_PROGRAM_ID as programId,
  getCoinTossProgram,
} from "coin_toss/src";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCluster } from "../cluster/cluster-data-access";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import toast from "react-hot-toast";
import { TOKEN_DECIMALS } from "@/utils/helpers";
import { useTossCoinAccount } from "../toss-coin-data-access";
import { getAccount } from "@solana/spl-token";
import { useTransactionToast } from "@/layouts/AppLayout";

export function useCoinTossProgram() {
  const { cluster } = useCluster();
  const { connection } = useConnection();
  const wallet = useWallet();
  const provider = useAnchorProvider();
  const program = getCoinTossProgram(provider);

  const { coinAccount } = useTossCoinAccount();
  const transactionToast = useTransactionToast();
  const mint = new PublicKey(process.env.NEXT_PUBLIC_TOSS_COIN!);

  const getProgramAccount = useQuery({
    queryKey: ["get-coin-toss-program-account", { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const {
    data: coinVault,
    error: coinVaultError,
    isPending: isCoinVaultPending,
  } = useQuery({
    queryKey: ["get-coin-vault", programId, { cluster }],
    queryFn: async () => {
      try {
        let [tokenVaultAddress] = PublicKey.findProgramAddressSync(
          [Buffer.from("token_vault"), mint.toBuffer()],
          programId
        );

        const tokenVaultInfo = await getAccount(connection, tokenVaultAddress);

        if (!tokenVaultAddress || !tokenVaultInfo)
          throw new Error("Failed to find token vault account!");

        return tokenVaultInfo;
      } catch (error) {
        throw error;
      }
    },
    refetchInterval: 30 * 1000,
  });

  const initialize = useMutation({
    mutationKey: ["coin-toss", "initialize", { cluster }],
    mutationFn: () =>
      program.methods
        .initialize()
        .accounts({
          coinTossTokenMint: mint,
        })
        .rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
    },
    onError: () =>
      toast.error("Failed to run Initialize instruction on Coin Toss program"),
  });

  const deposit = useMutation({
    mutationKey: ["coin-toss", "transfer-in", { cluster }],
    mutationFn: (amount: number) =>
      program.methods
        .transferIn(new BN(amount))
        .accounts({
          coinTossTokenMint: mint,
          senderTokenAccount: coinAccount!.pubkey,
        })
        .rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
    },
    onError: () => toast.error("Failed to deposit tokens into vault!"),
  });

  const airDrop = useMutation({
    mutationKey: ["coin-toss", "transfer-out", wallet.publicKey],
    mutationFn: () =>
      program.methods
        .transferOut(new BN(5, TOKEN_DECIMALS))
        .accounts({
          coinTossTokenMint: mint,
          senderTokenAccount: coinAccount!.pubkey,
        })
        .rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
    },
    onError: () => toast.error("Failed to transfer tokens out of vault!"),
  });

  return {
    getProgramAccount,
    initialize,
    deposit,
    airDrop,
    coinVault,
    coinVaultError,
    isCoinVaultPending,
  };
}
