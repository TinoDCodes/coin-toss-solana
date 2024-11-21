import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import CoinTossIDL from "../target/idl/coin_toss.json";
import type { CoinToss } from "../target/types/coin_toss";

// Re-export the generated IDL and type
export { CoinToss, CoinTossIDL };

// The programId is imported from the program IDL.
export const COIN_TOSS_PROGRAM_ID = new PublicKey(CoinTossIDL.address);

// This is a helper function to get the Coin Toss Anchor program.
export function getCoinTossProgram(provider: AnchorProvider) {
  return new Program(CoinTossIDL as CoinToss, provider);
}
