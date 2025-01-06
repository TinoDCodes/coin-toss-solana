"use client";

import { useUserCoinAccount } from "@/components/bet/user-coin-account";
import { NO_TOKEN_ACCOUNT_FOUND } from "@/utils/helpers";
import { useWallet } from "@solana/wallet-adapter-react";
import { AccountInfo, ParsedAccountData, PublicKey } from "@solana/web3.js";
import { HandCoins } from "lucide-react";
import { NoTokenAccountDialog } from "./NoTokenAccountDialog";

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
  const displayedBalance =
    userCoinAccount && isCoinAccount(userCoinAccount)
      ? userCoinAccount.account.data.parsed.info.tokenAmount.uiAmount.toFixed(2)
      : "";

  /**
   * Handles cases where the wallet is not connected.
   *
   * If the `publicKey` is missing from the wallet, nothing is rendered.
   */
  if (!wallet.publicKey) return null;

  /**
   * Handles case where no token account if found for the connected wallet address.
   *
   * Triggers a dialog prompting the user to sign the transaction that will create an account for them.
   */
  if (userCoinAccount === NO_TOKEN_ACCOUNT_FOUND) {
    console.log(userCoinAccount);

    return <NoTokenAccountDialog />;
  }

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

/**
 * Type guard to check if the given value is a coin account object.
 *
 * @param account - The value to check. It can be a string or a coin account object.
 * @returns `true` if the value is a coin account object; otherwise, `false`.
 */
function isCoinAccount(
  account:
    | string
    | { pubkey: PublicKey; account: AccountInfo<ParsedAccountData> }
): account is { pubkey: PublicKey; account: AccountInfo<ParsedAccountData> } {
  return typeof account !== "string";
}
