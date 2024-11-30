"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { HelperBlock } from "./HelperBlock";
import { Input } from "../ui/input";
import { useState } from "react";
import { PublicKey } from "@solana/web3.js";
import {
  getCoinTossProgram,
  COIN_TOSS_PROGRAM_ID as programId,
} from "coin_toss/src";
import { useAnchorProvider } from "../solana/solana-provider";

export const GetBetAccountData = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const provider = useAnchorProvider();

  // Anchor program instance for the Coin Toss program
  const program = getCoinTossProgram(provider);

  const [betId, setBetId] = useState<string>("");

  const betIdInput = (
    <Input
      id="betId"
      type="text"
      placeholder="Enter Bet ID"
      value={betId}
      onChange={(e) => setBetId(e.target.value)}
    />
  );

  const handleGetBetAccountData = async () => {
    const [pda] = await PublicKey.findProgramAddressSync(
      [
        Buffer.from("user-bet"),
        wallet.publicKey!.toBuffer(),
        Buffer.from(betId),
      ],
      programId
    );

    const betAccountData = await program.account.userBetData.fetch(pda);

    const humanReadableData = {
      user: betAccountData.user.toString(),
      betId: betAccountData.betId,
      stake: betAccountData.stake.toNumber(),
      odds: betAccountData.odds.toNumber(),
    };

    console.log("Bet account info:", humanReadableData);
  };

  return (
    <HelperBlock
      title="Get Bet Account Data"
      explanation="Retrieve bet data from chain"
      buttonLabel="Get Bet"
      buttonAction={handleGetBetAccountData}
      buttonDisabled={!wallet.publicKey || !betId.trim()}
      input={betIdInput}
      key="get-bet-account-data"
    />
  );
};
