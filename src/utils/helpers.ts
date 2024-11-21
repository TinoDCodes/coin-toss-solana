import { CountDownTime } from "./types";

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
