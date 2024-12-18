"use client";

import { useUserCoinAccount } from "@/components/bet/user-coin-account";
import { useWallet } from "@solana/wallet-adapter-react";
import { HandCoins } from "lucide-react";

export const CoinBalance = () => {
  const wallet = useWallet();
  const { userCoinAccount, coinAccountError } = useUserCoinAccount();

  /**
   * Retrieves and formats the user's token balance for display.
   *
   * If the `userCoinAccount` exists, it formats the balance to two decimal places.
   * If the user is not connected (no public key in the wallet) or if there's an error
   * with the token account, appropriate fallback behavior is implemented.
   *
   * @returns {string | null} The formatted balance as a string, or null if the wallet is disconnected or an error occurs.
   */
  const displayedBalance = userCoinAccount
    ? userCoinAccount.account.data.parsed.info.tokenAmount.uiAmount.toFixed(2)
    : "";

  /**
   * Handles cases where the wallet is not connected.
   *
   * If the `publicKey` is missing from the wallet, nothing is rendered.
   */
  if (!wallet.publicKey) return null;

  /**
   * Handles token account errors.
   *
   * Logs the error to the console for debugging and prevents further rendering.
   */
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
