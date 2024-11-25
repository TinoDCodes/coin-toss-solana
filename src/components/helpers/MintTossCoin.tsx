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

  const handleMintTossCoin = async () => {
    const umi = createUmi("https://api.devnet.solana.com");
    umi.use(walletAdapterIdentity(wallet)).use(mplTokenMetadata());

    const tossCoinMint = publicKey(process.env.NEXT_PUBLIC_TOSS_COIN!);

    const amountToMint = 200 * Math.pow(10, TOKEN_DECIMALS);

    const mintTokensIx = mintTokensTo(umi, {
      mint: tossCoinMint,
      token: findAssociatedTokenPda(umi, {
        mint: tossCoinMint,
        owner: umi.identity.publicKey,
      }),
      amount: amountToMint,
    });

    const tx = await mintTokensIx.sendAndConfirm(umi);

    // finally we can deserialize the signature that we can check on chain.
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
