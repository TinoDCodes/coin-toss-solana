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
import { getAccount } from "@solana/spl-token";
import { useTransactionToast } from "@/components/AppLayout";
import { useUserCoinAccount } from "./user-coin-account";

/**
 * Custom hook to interact with the Coin Toss Solana program.
 * Provides functionality for fetching program data, managing deposits, airdrops, program initialization, etc.
 *
 * @returns Object containing queries, mutations, and program-related data.
 */
export function useCoinTossProgram() {
  const { cluster } = useCluster();
  const { connection } = useConnection();
  const wallet = useWallet();
  const provider = useAnchorProvider();

  // Get the Coin Toss program instance using the provider
  const program = getCoinTossProgram(provider);

  // User's associated coin account and transaction toast handler
  const { userCoinAccount } = useUserCoinAccount();
  const transactionToast = useTransactionToast();

  // Public key for the Coin Toss token mint, fetched from environment variables
  const mint = new PublicKey(process.env.NEXT_PUBLIC_TOSS_COIN!);

  // ============================
  // QUERY: Fetch Program Account Data
  // ============================

  /**
   * Query to fetch the program's account information.
   * Useful for checking the program's on-chain state.
   */
  const getProgramAccount = useQuery({
    queryKey: ["get-coin-toss-program-account", { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  // ============================
  // QUERY: Fetch Coin Vault Data
  // ============================

  /**
   * Query to fetch the Coin Vault's token account information.
   * This account holds tokens deposited into the program.
   */
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

  // ==============================
  // MUTATION: Initialize Program
  // ==============================

  /**
   * Mutation to initialize the Coin Toss program.
   * This sets up the program's required state and accounts.
   */
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

  // ==============================
  // MUTATION: Deposit Tokens
  // ==============================

  /**
   * Mutation to deposit tokens into the Coin Vault.
   * Users can stake tokens as part of the Coin Toss program.
   *
   * @param amount - Number of tokens to deposit.
   */
  const deposit = useMutation({
    mutationKey: ["coin-toss", "transfer-in", { cluster }],
    mutationFn: (amount: number) =>
      program.methods
        .transferIn(new BN(amount))
        .accounts({
          coinTossTokenMint: mint,
          senderTokenAccount: userCoinAccount!.pubkey,
        })
        .rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
    },
    onError: () => toast.error("Failed to deposit tokens into vault!"),
  });

  // ==============================
  // MUTATION: Airdrop Tokens
  // ==============================

  /**
   * Mutation to airdrop tokens from the Coin Vault to the user.
   * Typically used for testing.
   */
  const airDrop = useMutation({
    mutationKey: ["coin-toss", "transfer-out", wallet.publicKey],
    mutationFn: () =>
      program.methods
        .transferOut(new BN(10 * Math.pow(10, TOKEN_DECIMALS))) // Airdrop fixed amount
        .accounts({
          coinTossTokenMint: mint,
          senderTokenAccount: userCoinAccount!.pubkey,
        })
        .rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
    },
    onError: () => toast.error("Failed to transfer tokens out of vault!"),
  });

  // ==============================
  // MUTATION: Place Bet
  // ==============================

  /**
   * Mutation to place a bet in the Coin Toss program.
   * Users can place a bet by specifying a bet ID, stake amount, and odds.
   *
   * @param betId - Unique identifier for the bet.
   * @param stake - Number of tokens to stake.
   * @param odds - The odds for the bet.
   */
  const placeBet = useMutation({
    mutationKey: ["coin-toss", "place-bet", wallet.publicKey],
    mutationFn: ({
      betId,
      stake,
      odds,
    }: {
      betId: string;
      stake: number;
      odds: number;
    }) =>
      program.methods
        .placeBet(betId, new BN(stake), new BN(odds))
        .accounts({
          coinTossTokenMint: mint,
          userTokenAccount: userCoinAccount!.pubkey,
        })
        .rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
    },
    onError: () => toast.error("Failed to place bet!"),
  });

  // Return all queries, mutations, and relevant program data for use in the component
  return {
    getProgramAccount,
    initialize,
    deposit,
    airDrop,
    coinVault,
    coinVaultError,
    isCoinVaultPending,
    placeBet,
  };
}
