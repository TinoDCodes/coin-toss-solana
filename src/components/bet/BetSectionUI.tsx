"use client";

import { Bet, CoinFace } from "@/utils/types";
import { Coins, Loader } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { useEventData } from "./event-data-access";
import { ODDS_DECIMALS, submitBet, TOKEN_DECIMALS } from "@/utils/helpers";
import { useCoinTossProgram } from "./coin-toss-program";
import { useWallet } from "@solana/wallet-adapter-react";

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
  const wallet = useWallet();
  const { placeBet } = useCoinTossProgram();
  const {
    selections,
    eventData,
    isSelectionsPending,
    headsMarket,
    isHeadsMarketPending,
    tailsMarket,
    isTailsMarketPending,
  } = useEventData();

  const [selectedFace, setSelectedFace] = useState<CoinFace>(faces[0]);
  const [betAmount, setBetAmount] = useState<string>("1");
  const [odds, setOdds] = useState<number>(0);
  const [potentialEarnings, setPotentialEarnings] = useState<number>(0);

  useEffect(() => {
    // Calculate potential earnings whenever bet amount changes
    const amount = parseFloat(betAmount) || 0;

    // Round potential earnings to 3 decimal places using Number()
    const earnings = Number((amount * odds).toFixed(3));

    setPotentialEarnings(earnings);
  }, [betAmount, odds]);

  useEffect(() => {
    if (headsMarket && tailsMarket) {
      if (selectedFace.value === "heads") {
        const newOdds = Number((1 / headsMarket.price).toFixed(3));
        setOdds(newOdds);
      } else if (selectedFace.value === "tails") {
        const newOdds = Number((1 / tailsMarket.price).toFixed(3));
        setOdds(newOdds);
      }
    }
  }, [selectedFace, headsMarket, tailsMarket]);

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

  const handlePlaceBet = async () => {
    const betId: string = "my-test-bet-10";
    const stake = Number(betAmount) * Math.pow(10, TOKEN_DECIMALS);
    const betOdds = odds * Math.pow(10, ODDS_DECIMALS);
    const selectionId =
      selectedFace.value === "heads"
        ? headsMarket!.selection_id
        : tailsMarket!.selection_id;

    const res = await placeBet.mutateAsync({ betId, stake, odds: betOdds });

    if (res) {
      const betData: Bet = {
        bet_id: betId,
        event_id: eventData!.id,
        selection_id: selectionId,
        stake: stake,
        odds: odds,
        wallet_address: wallet.publicKey!.toString(),
        status: "open",
      };

      await submitBet(betData);

      setSelectedFace(faces[0]);
      setBetAmount("1");
    }
  };

  if (isSelectionsPending || isHeadsMarketPending || isTailsMarketPending) {
    return (
      <div className="flex items-center justify-center">
        <Loader className="h-10 w-10 text-white animate-spin" />
      </div>
    );
  }

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
        className={`w-full bg-[#f59e0b] text-white hover:opacity-90 hover:bg-[#f59e0b] transition ${
          placeBet.isPending && "animate-pulse"
        }`}
        onClick={handlePlaceBet}
        disabled={!wallet.publicKey}
      >
        {placeBet.isPending ? "placing bet..." : "PLACE BET"}
      </Button>
    </div>
  );
};

export default BetSectionUI;
