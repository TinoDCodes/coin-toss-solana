"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { HandCoins } from "lucide-react";
import { useTossCoinAccount } from "./toss-coin-data-access";

export const CoinBalance = () => {
  const wallet = useWallet();
  const { coinAccount, error } = useTossCoinAccount();

  if (!wallet.publicKey) return null;

  if (error) {
    console.error(error);

    return null;
  }

  return (
    <div className="flex items-center gap-1 text-white/95">
      <HandCoins className="h-5 w-5" />

      <strong>
        {coinAccount?.account.data.parsed.info.tokenAmount.uiAmount}
      </strong>
    </div>
  );
};
