"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { generateSigner, percentAmount } from "@metaplex-foundation/umi";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import {
  createFungible,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  createTokenIfMissing,
  findAssociatedTokenPda,
  getSplAssociatedTokenProgramId,
  mintTokensTo,
} from "@metaplex-foundation/mpl-toolbox";
import { base58 } from "@metaplex-foundation/umi/serializers";
import { Button } from "../ui/button";
import { HelperBlock } from "./HelperBlock";

const TOKEN_DECIMALS = 9;

/**
 * Handles the creation of a new fungible token mint on the Solana blockchain.
 *
 * This process involves:
 * 1. Uploading metadata to Arweave using the Irys uploader.
 * 2. Generating a new mint account for the token.
 * 3. Creating the mint and token accounts if needed.
 * 4. Minting initial tokens to the associated token account.
 * 5. Logging transaction and token details for reference.
 */
export const CreateMint = () => {
  const wallet = useWallet();

  /**
   * Handles the creation of a new fungible token mint on the Solana blockchain.
   *
   * This process involves:
   * 1. Uploading metadata to Arweave using the Irys uploader.
   * 2. Generating a new mint account for the token.
   * 3. Creating the mint and token accounts if needed.
   * 4. Minting initial tokens to the associated token account.
   * 5. Logging transaction and token details for reference.
   */
  const handleCreateTokenMint = async () => {
    try {
      // Create an Umi instance for interacting with Solana.
      const umi = createUmi("https://api.devnet.solana.com");
      umi
        .use(walletAdapterIdentity(wallet)) // Integrate wallet for transactions.
        .use(mplTokenMetadata()) // Use metadata module for token metadata creation.
        .use(irysUploader()); // Use Irys for metadata upload to Arweave.

      // Metadata for the token, including image and description.
      const metadata = {
        name: "Nash Toss Coin",
        symbol: "NATOC",
        description:
          "Nash Toss Coin is a token created for Nash's coin toss Solana dApp",
        image:
          "https://unsplash.com/photos/a-person-holding-a-coin-in-their-hand-mJcQSltkdeM",
      };

      // Upload metadata to Arweave via the Irys uploader.
      const metadataUri = await umi.uploader
        .uploadJson(metadata)
        .catch((err) => {
          throw new Error(`Failed to upload metadata: ${err}`);
        });

      // Generate a new signer for the token mint.
      const mintSigner = generateSigner(umi);

      // Create the fungible token mint instruction.
      const createFungibleIx = await createFungible(umi, {
        mint: mintSigner, // The token mint signer.
        name: "Nash Toss Coin", // Token name.
        uri: metadataUri, // Metadata URI pointing to Arweave.
        sellerFeeBasisPoints: percentAmount(0), // No royalty fee.
        decimals: TOKEN_DECIMALS, // Token precision/decimals.
      });

      // Ensure the associated token account exists for the mint owner.
      const createTokenAccountIx = await createTokenIfMissing(umi, {
        mint: mintSigner.publicKey,
        owner: umi.identity.publicKey,
        ataProgram: getSplAssociatedTokenProgramId(umi), // Associated Token Program.
      });

      // Mint initial tokens to the associated token account.
      const mintTokensIx = await mintTokensTo(umi, {
        mint: mintSigner.publicKey, // Mint address.
        token: findAssociatedTokenPda(umi, {
          mint: mintSigner.publicKey,
          owner: umi.identity.publicKey, // Owner of the token account.
        }),
        amount: BigInt(1000 * Math.pow(10, TOKEN_DECIMALS)), // Initial token supply.
      });

      // Combine instructions and send the transaction.
      console.log("Sending transaction");
      const tx = await createFungibleIx
        .add(createTokenAccountIx)
        .add(mintTokensIx)
        .sendAndConfirm(umi);

      // Deserialize the transaction signature for display.
      const signature = base58.deserialize(tx.signature)[0];

      // Log the transaction and token details for user reference.
      console.log("\nTransaction Complete");
      console.log("View Transaction on Solana Explorer:");
      console.log(`https://explorer.solana.com/tx/${signature}?cluster=devnet`);
      console.log("View Token on Solana Explorer:");
      console.log(
        `https://explorer.solana.com/address/${mintSigner.publicKey}?cluster=devnet`
      );
    } catch (error) {
      // Handle any errors during token mint creation.
      console.error("Failed to create token mint:", error);
    }
  };

  return (
    <HelperBlock
      title="Create New Token Mint"
      explanation="Creates a new fungible token on the Solana Devnet with metadata uploaded to Arweave, mints 1,000 tokens to the user's associated account, and logs the transaction and token details."
      buttonLabel="CREATE TOKEN"
      buttonAction={handleCreateTokenMint}
      buttonDisabled={!wallet.publicKey}
    />
  );
};
