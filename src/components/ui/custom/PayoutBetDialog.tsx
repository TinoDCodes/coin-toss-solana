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
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAnchorProvider } from "@/components/solana/solana-provider";
import { getCoinTossProgram } from "coin_toss/src";
import { useTransactionToast } from "@/components/AppLayout";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import toast from "react-hot-toast";

export const PayoutBetDialog = () => {
  const wallet = useWallet();
  const provider = useAnchorProvider();

  const [betId, setBetId] = useState<string>("");
  const [userAddress, setUserAddress] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Anchor program instance for the Coin Toss program
  const program = getCoinTossProgram(provider);

  const transactionToast = useTransactionToast();

  const handlePayoutBet = async () => {
    setLoading(true);

    try {
      const mint = new PublicKey(process.env.NEXT_PUBLIC_TOSS_COIN!);
      const userAddressPubkey = new PublicKey(userAddress);

      const receiverTokenAccount = getAssociatedTokenAddressSync(
        mint,
        userAddressPubkey
      );

      const signature = await program.methods
        .processBetPayout(betId, userAddressPubkey)
        .accounts({
          coinTossTokenMint: mint,
          receiverTokenAccount: receiverTokenAccount,
        })
        .rpc();

      if (!signature)
        throw new Error(`Failed to payout bet with id: ${betId}!`);

      transactionToast(signature);
      setDialogOpen(false);
    } catch (error) {
      toast.error("Unable to perform bet payout!");
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
          Payout Bet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Process Bet Payout </DialogTitle>
          <DialogDescription>
            Process the payout for the Bet Account associated with the specified
            Bet ID and User Address.
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
            onClick={handlePayoutBet}
            className={`bg-green-600 hover:bg-green-500 ${
              loading && "animate-pulse"
            }`}
            disabled={!wallet.publicKey || !betId || !userAddress || loading}
          >
            {loading ? "Processing..." : "Payout Bet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
