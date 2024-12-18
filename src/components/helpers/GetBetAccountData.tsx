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

  // -------- STATE VARIABLES ---------
  const [betId, setBetId] = useState<string>("");

  // Input component for entering the Bet ID.
  const betIdInput = (
    <Input
      id="betId"
      type="text"
      placeholder="Enter Bet ID"
      value={betId}
      onChange={(e) => setBetId(e.target.value)}
    />
  );

  /**
   * Fetches and logs the data for a specific bet account using its Program Derived Address (PDA).
   *
   * Steps:
   * 1. Derives the PDA for the bet account using the "user-bet" seed, wallet public key, and bet ID.
   * 2. Fetches the bet account data from the program.
   * 3. Converts raw data to a human-readable format.
   * 4. Logs the fetched bet account data to the console.
   */
  const handleGetBetAccountData = async () => {
    // Derive the Program Derived Address (PDA) for the bet account.
    const [pda] = await PublicKey.findProgramAddressSync(
      [
        Buffer.from("user-bet"),
        wallet.publicKey!.toBuffer(),
        Buffer.from(betId),
      ],
      programId
    );

    const betAccountData = await program.account.userBetData.fetch(pda);

    // Format the data into a human-readable format.
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
