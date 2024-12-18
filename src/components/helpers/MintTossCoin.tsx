"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import {
  findAssociatedTokenPda,
  mintTokensTo,
} from "@metaplex-foundation/mpl-toolbox";
import { TOKEN_DECIMALS } from "@/utils/helpers";
import { publicKey } from "@metaplex-foundation/umi";
import { base58 } from "@metaplex-foundation/umi/serializers";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { HelperBlock } from "./HelperBlock";

export const MintTossCoin = () => {
  const wallet = useWallet();

  /**
   * Handles the minting of "Toss Coin" tokens.
   *
   * This function initializes the Umi client, sets up the wallet adapter identity,
   * and mints a specific number of "Toss Coin" tokens to the associated token account.
   * The transaction is confirmed and the resulting signature is logged for on-chain verification.
   */
  const handleMintTossCoin = async () => {
    const umi = createUmi("https://api.devnet.solana.com");
    umi.use(walletAdapterIdentity(wallet)).use(mplTokenMetadata());

    // Retrieve the public key for the Toss Coin mint from environment variables.
    const tossCoinMint = publicKey(process.env.NEXT_PUBLIC_TOSS_COIN!);

    // Calculate the amount of tokens to mint (200 tokens adjusted by token decimals).
    const amountToMint = 200 * Math.pow(10, TOKEN_DECIMALS);

    // Create the mint instruction to mint tokens to the associated token account.
    const mintTokensIx = mintTokensTo(umi, {
      mint: tossCoinMint,
      token: findAssociatedTokenPda(umi, {
        mint: tossCoinMint,
        owner: umi.identity.publicKey,
      }),
      amount: amountToMint,
    });

    const tx = await mintTokensIx.sendAndConfirm(umi);

    // Deserialize the transaction signature for logging and verification.
    const signature = base58.deserialize(tx.signature)[0];

    console.log("\nTransaction Complete");
    console.log("View Transaction on Solana Explorer");
    console.log(`https://explorer.solana.com/tx/${signature}?cluster=devnet`);
  };

  return (
    <HelperBlock
      title="Mint More Tokens"
      explanation="Mints 200 TossCoin tokens to the user's associated token account on the Solana Devnet and logs the transaction details."
      buttonLabel="Mint TossCoin"
      buttonAction={handleMintTossCoin}
      buttonDisabled={!wallet.publicKey}
      key="mint-more-tokens"
    />
  );
};
