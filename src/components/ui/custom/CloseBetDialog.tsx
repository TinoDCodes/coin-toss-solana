import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAnchorProvider } from "@/components/solana/solana-provider";
import {
  getCoinTossProgram,
  COIN_TOSS_PROGRAM_ID as programId,
} from "coin_toss/src";
import toast from "react-hot-toast";
import { PublicKey } from "@solana/web3.js";
import { useTransactionToast } from "@/components/AppLayout";
import { useState } from "react";

export const CloseBetDialog = () => {
  const wallet = useWallet();
  const provider = useAnchorProvider();
  const transactionToast = useTransactionToast();

  // -------- STATE VARIABLES ---------
  const [betId, setBetId] = useState<string>("");
  const [userAddress, setUserAddress] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Anchor program instance for the Coin Toss program
  const program = getCoinTossProgram(provider);

  /**
   * Handles the closing of a bet account on-chain.
   *
   * This function interacts with the blockchain to close a specific bet account
   * associated with the provided bet ID and user's public address. It manages
   * loading states, error handling, and displays transaction feedback.
   */
  const handleCloseBet = async () => {
    setLoading(true);

    try {
      const userAddressPubkey = new PublicKey(userAddress);

      /**
       * Send the request to the blockchain to close the bet account.
       * The bet account is derived using the bet ID and the user's public key.
       */
      const signature = await program.methods
        .closeBetAccount(betId, userAddressPubkey)
        .rpc();

      if (!signature) throw new Error("Failed to close Bet Account!");

      transactionToast(signature);

      // Close the dialog after successfully closing the bet account.
      setDialogOpen(false);
      setBetId("");
      setUserAddress("");
    } catch (error) {
      toast.error("Unable to close bet account!");
      console.error(error);
    }

    setLoading(false);
  };

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(value) => setDialogOpen(value)}
    >
      <DialogTrigger asChild>
        <Button
          size="lg"
          disabled={!wallet.publicKey}
          className="text-white bg-[#00c48f] hover:bg-[#00c48f] hover:opacity-90 hover:scale-95 mt-auto transition"
        >
          Close Bet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Close Bet Account</DialogTitle>
          <DialogDescription>
            Close the on-chain Bet Account associated with the specified Bet ID
            and User Address.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="betId"
              className="text-right"
            >
              Bet ID
            </Label>
            <Input
              id="betId"
              placeholder="Enter Bet ID"
              value={betId}
              onChange={(e) => setBetId(e.target.value.trim())}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="userAddress"
              className="text-right"
            >
              User Address
            </Label>
            <Input
              id="userAddress"
              placeholder="Enter User's Wallet Address"
              value={userAddress}
              onChange={(e) => setUserAddress(e.target.value.trim())}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleCloseBet}
            className={`bg-red-600 hover:bg-red-500 ${
              loading && "animate-pulse"
            }`}
            disabled={!wallet.publicKey || !betId || !userAddress || loading}
          >
            {loading ? "Closing..." : "Close Bet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
