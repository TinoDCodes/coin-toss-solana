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

export type BetSport = "Esports";

export type EventResult = CoinFaceValue | "pending";

export type BetEvent = {
  id: number;
  title: string;
  sport: BetSport;
  date_time: string;
  result: EventResult;
};

export type Selection = {
  id: number;
  title: CoinFaceValue;
  event_id: number;
};

export type Market = {
  id: number;
  event_id: number;
  selection_id: number;
  timestamp: string;
  price: number;
};

export type BetStatus = "open" | "lost" | "won" | "void";

export type Bet = {
  id?: number;
  bet_id: string;
  event_id: number;
  selection_id: number;
  stake: number;
  odds: number;
  wallet_address: string;
  status: BetStatus;
  created_at?: string;
};
