/**
 * Represents the countdown timer structure with minutes and seconds.
 */
export type CountDownTime = {
  /** Minutes remaining as a string (e.g., "05"). */
  minutes: string;
  /** Seconds remaining as a string (e.g., "30"). */
  seconds: string;
};

/**
 * Allowed values for the coin face.
 */
export type CoinFaceValue = "heads" | "tails";

/**
 * Represents a coin face (e.g., heads or tails) with associated properties.
 */
export type CoinFace = {
  /** Unique identifier for the coin face. */
  id: number;
  /** Human-readable label for the coin face (e.g., "Heads"). */
  label: string;
  /** URL or path to the image representing the coin face. */
  imageSrc: string;
  /** The actual value of the coin face ("heads" or "tails"). */
  value: CoinFaceValue;
};

/**
 * Allowed sports for betting. Currently supports only "Esports".
 */
export type BetSport = "Esports";

/**
 * Possible results of a betting event.
 */
export type EventResult = CoinFaceValue | "pending";

/**
 * Represents a betting event.
 */
export type BetEvent = {
  /** Unique identifier for the event. */
  id: number;
  /** Title or name of the event. */
  title: string;
  /** Sport category of the event. */
  sport: BetSport;
  /** Date and time when the event occurs, in ISO format. */
  date_time: string;
  /** The result of the event, either "heads", "tails", or "pending". */
  result: EventResult;
};

/**
 * Represents a selection for a particular bet event.
 */
export type Selection = {
  /** Unique identifier for the selection. */
  id: number;
  /** The title or value of the selection, matching a coin face value. */
  title: CoinFaceValue;
  /** Identifier of the event associated with the selection. */
  event_id: number;
};

/**
 * Represents a market within a betting event.
 */
export type Market = {
  /** Unique identifier for the market. */
  id: number;
  /** Identifier of the event associated with the market. */
  event_id: number;
  /** Identifier of the selection associated with the market. */
  selection_id: number;
  /** Timestamp indicating when the market was created or updated. */
  timestamp: string;
  /** Price or odds associated with the market. */
  price: number;
};

/**
 * Allowed statuses for a bet.
 */
export type BetStatus = "open" | "lost" | "won" | "void";

/**
 * Represents a user's bet within the application.
 */
export type Bet = {
  /** Optional unique identifier for the bet (usually set by the database). */
  id?: number;
  /** Unique bet identifier (custom application generated string). */
  bet_id: string;
  /** Identifier of the event the bet is associated with. */
  event_id: number;
  /** Identifier of the selection chosen for the bet. */
  selection_id: number;
  /** Amount of stake placed on the bet. */
  stake: number;
  /** The odds or price associated with the bet. */
  odds: number;
  /** User's wallet address placing the bet. */
  wallet_address: string;
  /** Current status of the bet ("open", "lost", "won", or "void"). */
  status: BetStatus;
  /** Optional timestamp indicating when the bet was created (usually set by the database). */
  created_at?: string;
};
