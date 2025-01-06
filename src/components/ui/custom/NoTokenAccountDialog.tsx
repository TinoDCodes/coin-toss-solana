import { useState } from "react";
import { Button } from "../button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../dialog";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { createAssociatedToken } from "@metaplex-foundation/mpl-toolbox";
import { publicKey } from "@metaplex-foundation/umi";
import { useWallet } from "@solana/wallet-adapter-react";
import { useUserCoinAccount } from "@/components/bet/user-coin-account";
import toast from "react-hot-toast";

export const NoTokenAccountDialog = () => {
  const wallet = useWallet();
  const { refetchUserCoinAccount } = useUserCoinAccount();

  // -------- STATE VARIABLES ---------
  const [loading, setLoading] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(true);

  /**
   * Handles the creation of an associated token account for the user's wallet, for the Toss Coin Mint.
   * This is required for holding tokens and participating in betting events.
   *
   * @returns {Promise<void>} Resolves when the token account creation process is complete.
   * @throws Logs an error if token account creation fails and displays an error toast notification.
   */
  const handleTokenAccountCreation = async () => {
    setLoading(true);

    try {
      const umi = createUmi("https://api.devnet.solana.com");
      umi.use(walletAdapterIdentity(wallet)).use(mplTokenMetadata());

      // Create the associated token account.
      const { result, signature } = await createAssociatedToken(umi, {
        mint: publicKey(process.env.NEXT_PUBLIC_TOSS_COIN!),
        owner: umi.identity.publicKey,
      }).sendAndConfirm(umi);

      // Refresh the user's coin account data
      refetchUserCoinAccount();

      // Notify the user of successful account creation
      toast.success("Account created successfully");

      // Close the dialog
      setDialogOpen(false);
    } catch (error) {
      console.error(
        "Something went wrong while trying to create token account!",
        error
      );
      toast.error("Failed to create token account");
    }

    setLoading(false);
  };

  /**
   * Handles the disconnection of the user's wallet and closes the dialog.
   *
   * @returns {Promise<void>} Resolves when the wallet is successfully disconnected.
   */
  const handleDisconnect = async () => {
    await wallet.disconnect();
    setDialogOpen(false);
  };

  return (
    <Dialog open={dialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>No Token Account Found❗</DialogTitle>
          <DialogDescription>
            It seems you don&apos;t have a token account for this token yet. To
            participate in betting events, you&apos;ll need to create one to
            hold your tokens. Click &apos;Create Account&apos; to set it up, or
            disconnect if you wish to cancel.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="destructive"
            onClick={handleDisconnect}
          >
            Disconnect
          </Button>
          <Button
            onClick={handleTokenAccountCreation}
            className={`${
              loading && "animate-pulse"
            } bg-accent hover:bg-accent hover:opacity-95`}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
