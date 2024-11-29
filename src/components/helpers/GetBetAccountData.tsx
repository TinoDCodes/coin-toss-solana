"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { HelperBlock } from "./HelperBlock";
import { Input } from "../ui/input";
import { useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { COIN_TOSS_PROGRAM_ID as programId } from "coin_toss/src";

export const GetBetAccountData = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

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

    const betAccountInfo = await connection.getAccountInfo(pda);

    console.log("Bet account info:", betAccountInfo);
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
