export type CountDownTime = {
  minutes: string;
  seconds: string;
};

export type CoinFaceValue = "heads" | "tails";

export type CoinFace = {
  id: number;
  label: string;
  imageSrc: string;
  value: CoinFaceValue;
};
