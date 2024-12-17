import { Bet, CountDownTime } from "./types";
import { customAlphabet } from "nanoid";

/**
 * Calculates the remaining time until a target date, formatted as a digital clock.
 *
 * @param {Date} target - The target date and time.
 * @returns {CountDownTime} An object containing the remaining time as 2-digit strings for `minutes` and `seconds`.
 *
 * @example
 * const targetTime = new Date();
 * targetTime.setMinutes(targetTime.getMinutes() + 5);
 * const timeLeft = getTimeLeft(targetTime);
 * console.log(timeLeft); // { minutes: "04", seconds: "59" }
 */
export const getTimeLeft = (target: Date): CountDownTime => {
  const now = new Date();
  const difference = target.getTime() - now.getTime();

  if (difference <= 0) {
    return { minutes: "00", seconds: "00" }; // Return "00:00" when the target time has passed
  }

  const minutes = Math.floor(difference / 1000 / 60);
  const seconds = Math.floor((difference / 1000) % 60);

  const formatTime = (value: number): string =>
    value.toString().padStart(2, "0");

  return {
    minutes: formatTime(minutes),
    seconds: formatTime(seconds),
  };
};

/**
 * Number of token decimals for token related calculations.
 */
export const TOKEN_DECIMALS = 9;

/**
 * Number of decimal places used for scaling odds and related calculations.
 */
export const ODDS_DECIMALS = 3;

/**
 * Shortens a given string by truncating the middle section.
 * Useful for displaying long strings like wallet addresses.
 *
 * @param {string} [str=""] - The string to ellipsify.
 * @param {number} [len=4] - The number of characters to keep at the start and end.
 * @returns {string} The ellipsified string.
 *
 * @example
 * ellipsify("abcdefghijklmnopqrstuvwxyz"); // "abcd..wxyz"
 * ellipsify("short", 2); // "short"
 */
export function ellipsify(str = "", len = 4) {
  if (str.length > 30) {
    return (
      str.substring(0, len) + ".." + str.substring(str.length - len, str.length)
    );
  }
  return str;
}

/**
 * Submits a bet to the backend API.
 *
 * @param {Bet} betData - The bet data containing details like bet ID, event ID, stake, etc.
 * @throws Will throw an error if the API request fails.
 *
 * @example
 * const bet = {
 *   bet_id: "12345",
 *   event_id: 1,
 *   selection_id: 2,
 *   stake: 50,
 *   odds: 1.75,
 *   wallet_address: "0x123...",
 *   status: "open",
 * };
 * await submitBet(bet);
 */
export async function submitBet(betData: Bet) {
  try {
    const response = await fetch("/api/placeBet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        betId: betData.bet_id,
        eventId: betData.event_id,
        selectionId: betData.selection_id,
        stake: betData.stake,
        odds: betData.odds,
        walletAddress: betData.wallet_address,
        status: betData.status,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to submit bet");
    }
  } catch (error) {
    console.error("Error submitting bet:", error);
  }
}

/**
 * Generates a new unique Bet ID using a custom alphabet.
 *
 * @returns {string} A randomly generated Bet ID string.
 *
 * @example
 * const betId = newBetId();
 * console.log(betId); // "aB3cD9eFgHiJkLmN0pQrStUvWx"
 */
export const newBetId = () => {
  const alphabet =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const nanoid = customAlphabet(alphabet, 25);

  return nanoid();
};
