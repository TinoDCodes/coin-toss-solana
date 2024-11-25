"use client";

import { useUserCoinAccount } from "@/components/bet/user-coin-account";
import { useWallet } from "@solana/wallet-adapter-react";
import { HandCoins } from "lucide-react";

export const CoinBalance = () => {
  const wallet = useWallet();
  const { userCoinAccount, coinAccountError } = useUserCoinAccount();

  const displayedBalance = userCoinAccount
    ? userCoinAccount.account.data.parsed.info.tokenAmount.uiAmount.toFixed(2)
    : "";

  if (!wallet.publicKey) return null;

  if (coinAccountError) {
    console.error(coinAccountError);

    return null;
  }

  return (
    <div className="flex items-center gap-1 text-white/95">
      <HandCoins className="h-5 w-5" />

      <strong>{displayedBalance}</strong>
    </div>
  );
};
