"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { HelperBlock } from "./HelperBlock";
import { useAnchorProvider } from "../solana/solana-provider";
import { getCoinTossProgram } from "coin_toss/src";
import { useTransactionToast } from "../AppLayout";
import { PublicKey } from "@solana/web3.js";
import toast from "react-hot-toast";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

export const PayoutBet = () => {
  const wallet = useWallet();

  const provider = useAnchorProvider();

  // Anchor program instance for the Coin Toss program
  const program = getCoinTossProgram(provider);

  const transactionToast = useTransactionToast();

  const handlePayoutBet = async () => {
    try {
      const mint = new PublicKey(process.env.NEXT_PUBLIC_TOSS_COIN!);
      const userAddress = new PublicKey(
        "4ieZVKt1DtbHmtyHr2PHwfdHn61LZi6VT1GBsWMgX4e8"
      );
      const betId = "my-test-bet-8";

      const receiverTokenAccount = getAssociatedTokenAddressSync(
        mint,
        userAddress
      );

      const signature = await program.methods
        .processBetPayout(betId, userAddress)
        .accounts({
          coinTossTokenMint: mint,
          receiverTokenAccount: receiverTokenAccount,
        })
        .rpc();

      if (!signature)
        throw new Error(`Failed to payout bet with id: ${betId}!`);

      transactionToast(signature);
    } catch (error) {
      toast.error("Unable to perform bet payout!");
      console.error(error);
    }
  };

  return (
    <HelperBlock
      title="Process Bet Payout"
      explanation="Process the paying out of a bet for a particular betId and correspondig userAddress. (For now both values are hard coded in the component code)."
      buttonLabel="Payout Bet"
      buttonAction={handlePayoutBet}
      buttonDisabled={!wallet.publicKey}
      key="process-bet-payout"
    />
  );
};
