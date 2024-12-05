"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { HelperBlock } from "./HelperBlock";
import { useAnchorProvider } from "../solana/solana-provider";
import {
  getCoinTossProgram,
  COIN_TOSS_PROGRAM_ID as programId,
} from "coin_toss/src";
import { PublicKey } from "@solana/web3.js";
import { useTransactionToast } from "../AppLayout";
import toast from "react-hot-toast";

export const CloseBetAccount = () => {
  const wallet = useWallet();
  const provider = useAnchorProvider();

  // Anchor program instance for the Coin Toss program
  const program = getCoinTossProgram(provider);

  const transactionToast = useTransactionToast();

  const handleCloseBet = async () => {
    try {
      const userAddress = new PublicKey(
        "4ieZVKt1DtbHmtyHr2PHwfdHn61LZi6VT1GBsWMgX4e8"
      );
      const betId = "my-test-bet-8";

      const signature = await program.methods
        .closeBetAccount(betId, userAddress)
        .rpc();

      if (!signature) throw new Error("Failed to close Bet Account!");

      transactionToast(signature);
    } catch (error) {
      toast.error("Unable to close bet account!");
      console.error(error);
    }
  };

  return (
    <HelperBlock
      title="Close Bet Account"
      explanation="Close a specified bet account on chain. (For now the betId and userAddress used as the PDA seeds are hardcoded into the function code.)"
      buttonLabel="Close Bet"
      buttonAction={handleCloseBet}
      buttonDisabled={!wallet.publicKey}
      key="close-user-bet-account"
    />
  );
};
