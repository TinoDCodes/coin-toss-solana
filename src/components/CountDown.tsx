"use client";

import { getTimeLeft } from "@/utils/helpers";
import { CountDownTime } from "@/utils/types";
import { useEffect, useState } from "react";

const targetTime = new Date();
targetTime.setMinutes(targetTime.getMinutes() + 59);

const CountDown = () => {
  const [timeLeft, setTimeLeft] = useState<CountDownTime>({
    minutes: "00",
    seconds: "00",
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const remainingTime = getTimeLeft(targetTime);

      setTimeLeft(remainingTime);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
