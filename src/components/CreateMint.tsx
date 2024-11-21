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
import { Button } from "./ui/button";

const TOKEN_DECIMALS = 9;

export const CreateMint = () => {
  const wallet = useWallet();

  const handleCreateTokenMint = async () => {
    // creating an umi instance with the user's wallet
    const umi = createUmi("https://api.devnet.solana.com");
    umi
      .use(walletAdapterIdentity(wallet))
      .use(mplTokenMetadata())
      .use(irysUploader());

    const metadata = {
      name: "Nash Toss Coin",
      symbol: "NATOC",
      description:
        "Nash Toss Coin is a token created for nash's coin toss solana dapp",
      image:
        "https://unsplash.com/photos/a-person-holding-a-coin-in-their-hand-mJcQSltkdeM",
    };

    // Call upon Umi's `uploadJson` function to upload our metadata to Arweave via Irys.
    const metadataUri = await umi.uploader.uploadJson(metadata).catch((err) => {
      throw new Error(err);
    });

    const mintSigner = generateSigner(umi);

    const createFungibleIx = await createFungible(umi, {
      mint: mintSigner,
      name: "Nash Toss Coin",
      uri: metadataUri,
      sellerFeeBasisPoints: percentAmount(0),
      decimals: TOKEN_DECIMALS,
    });

    // This instruction will create a new Associated Token Account if required, if one is found then it skips.
    const createTokenAccountIx = await createTokenIfMissing(umi, {
      mint: mintSigner.publicKey,
      owner: umi.identity.publicKey,
      ataProgram: getSplAssociatedTokenProgramId(umi),
    });

    // The final instruction (if required) is to mint the tokens to the token account in the previous ix.
    const mintTokensIx = await mintTokensTo(umi, {
      mint: mintSigner.publicKey,
      token: findAssociatedTokenPda(umi, {
        mint: mintSigner.publicKey,
        owner: umi.identity.publicKey,
      }),
      amount: BigInt(1000),
    });

    console.log("Sending transaction");
    const tx = await createFungibleIx
      .add(createTokenAccountIx)
      .add(mintTokensIx)
      .sendAndConfirm(umi);

    // finally we can deserialize the signature that we can check on chain.
    const signature = base58.deserialize(tx.signature)[0];

    // Log out the signature and the links to the transaction and the NFT.
    // Explorer links are for the devnet chain, you can change the clusters to mainnet.
    console.log("\nTransaction Complete");
    console.log("View Transaction on Solana Explorer");
    console.log(`https://explorer.solana.com/tx/${signature}?cluster=devnet`);
    console.log("View Token on Solana Explorer");
    console.log(
      `https://explorer.solana.com/address/${mintSigner.publicKey}?cluster=devnet`
    );
  };

  return (
    <Button
      variant="default"
      size="lg"
      className="bg-cyan-400 text-white"
      onClick={handleCreateTokenMint}
      disabled={!wallet.publicKey}
    >
      CREATE TOKEN
    </Button>
  );
};
