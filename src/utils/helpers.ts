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

export const TOKEN_DECIMALS = 9;
export const ODDS_DECIMALS = 3;

export function ellipsify(str = "", len = 4) {
  if (str.length > 30) {
    return (
      str.substring(0, len) + ".." + str.substring(str.length - len, str.length)
    );
  }
  return str;
}

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

    /* FOR TESTING */
    // const result = await response.json();
    // console.log("Bet submitted successfully:", result);
  } catch (error) {
    console.error("Error submitting bet:", error);
  }
}

export const newBetId = () => {
  const alphabet =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const nanoid = customAlphabet(alphabet, 25);

  return nanoid();
};
