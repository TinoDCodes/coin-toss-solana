"use client";

import { CoinFace } from "@/utils/types";
import { Coins } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";

const faces: CoinFace[] = [
  {
    id: 1,
    label: "Heads",
    imageSrc: "/heads-coin.svg",
    value: "heads",
  },
  {
    id: 2,
    label: "Tails",
    imageSrc: "/tails-coin.svg",
    value: "tails",
  },
];

const BetSectionUI = () => {
  const [selectedFace, setSelectedFace] = useState<CoinFace>(faces[0]);
  const [betAmount, setBetAmount] = useState<string>("1");
  const [potentialEarnings, setPotentialEarnings] = useState(0);

  // Simulated odds (2x payout for this example)
  const odds = 2;

  useEffect(() => {
    // Calculate potential earnings whenever bet amount changes
    const amount = parseInt(betAmount) || 0;
    setPotentialEarnings(amount * odds);
  }, [betAmount]);

  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || value === "0") {
      setBetAmount("");
    } else {
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue) && numericValue > 0) {
        setBetAmount(numericValue.toString());
      }
    }
  };
  return (
    <div className="justify-self-center flex flex-col items-center space-y-8">
      <h1 className="font-bold text-center text-xl text-white">Pick A Side</h1>
      {/*--------- COIN SELECTION ----------*/}
      <section className="flex items-center space-x-4">
        {faces.map((face) => (
          <div
            key={face.id}
            className="flex flex-col items-center space-y-1"
          >
            <button
              id={`${face.value} coin`}
              name={`${face.value} coin`}
              onClick={() => setSelectedFace(face)}
              className={`${
                !(selectedFace.value === face.value) && "opacity-40 border-none"
              } hover:scale-95 transition rounded-full border-2 border-amber-400 p-1`}
            >
              <Image
                src={face.imageSrc}
                alt={`${face.value} coin`}
                height={96}
                width={96}
                sizes="96px"
                className="h-24 w-24"
              />
            </button>

            <label
              htmlFor={`${face.value} coin`}
              className="font-medium text-sm"
            >
              {face.label}
            </label>
          </div>
        ))}
      </section>

      {/*--------- INPUTS ----------*/}
      <section className="flex items-center gap-4">
        <div>
          <Label htmlFor="betAmount">Bet Amount</Label>
          <div className="relative">
            <Coins className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              type="number"
              id="betAmount"
              placeholder="Enter bet amount"
              className="pl-8 border-[#4b5563]"
              min={1}
              value={betAmount}
              onChange={handleBetAmountChange}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="potentialEarnings">Potential Earnings</Label>
          <div className="relative">
            <Coins className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              type="number"
              id="potentialEarnings"
              className="pl-8 border-[#4b5563]"
              value={potentialEarnings}
              readOnly
            />
          </div>
        </div>
      </section>

      <Button
        variant="secondary"
        size="lg"
        className="w-full bg-[#f59e0b] text-white hover:opacity-90 hover:bg-[#f59e0b] transition"
      >
        PLACE BET
      </Button>
    </div>
  );
};

export default BetSectionUI;