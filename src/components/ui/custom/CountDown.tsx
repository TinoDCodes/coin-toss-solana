"use client";

import { useEventData } from "@/components/bet/event-data-access";
import { getTimeLeft } from "@/utils/helpers";
import { CountDownTime } from "@/utils/types";
import { useEffect, useState } from "react";

const CountDown = () => {
  const { eventData, eventError, isEventFetching } = useEventData();

  // -------- STATE VARIABLES ---------
  const [timeLeft, setTimeLeft] = useState<CountDownTime>({
    minutes: "00",
    seconds: "00",
  });

  /**
   * A React `useEffect` hook to start a countdown timer based on the target event date-time.
   *
   * This effect initializes an interval timer that updates the remaining time until the target event occurs.
   * The timer recalculates the time left every second and updates the state accordingly.
   *
   * The interval is cleared when the component unmounts or when `eventData` changes.
   *
   * @param eventData - The event data containing the `date_time` property (ISO string).
   */
  useEffect(() => {
    if (eventData) {
      const targetTime = new Date(eventData.date_time);

      const interval = setInterval(() => {
        const remainingTime = getTimeLeft(targetTime);

        setTimeLeft(remainingTime);
      }, 1000);

      // Cleanup function to clear the interval when the component unmounts
      // or when the dependency array changes.
      return () => clearInterval(interval);
    }
  }, [eventData]);

  return (
    <div>
      <h2 className="font-medium text-center mb-4">Next Coin Toss in...</h2>

      <section className="flex items-center justify-center space-x-6">
        <div className="bg-white/10 py-2 px-4 rounded-md shadow-[#4b5563] shadow-md flex flex-col items-center">
          <h3 className="text-[#14b8a6] font-bold text-5xl text-center mb-1 animate-in transition">
            {timeLeft.minutes}
          </h3>

          <small className="text-center opacity-85">minutes</small>
        </div>

        <div className="bg-white/10 py-2 px-4 rounded-md shadow-[#4b5563] shadow-md flex flex-col items-center">
          <h3 className="text-[#14b8a6] font-bold text-5xl text-center mb-1 animate-in transition">
            {timeLeft.seconds}
          </h3>

          <small className="text-center opacity-85">seconds</small>
        </div>
      </section>
    </div>
  );
};

export default CountDown;
