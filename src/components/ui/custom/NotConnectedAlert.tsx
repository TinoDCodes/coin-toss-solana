import { WalletButton } from "@/components/solana/solana-provider";
import { CircleAlert } from "lucide-react";

export const NotConnectedAlert = () => {
  return (
    <div className="flex flex-col items-center space-y-5">
      <div className="flex items-center justify-center space-x-2 bg-muted px-8 py-2 rounded">
        <CircleAlert className="h-5 w-5" />
        <p>
          <strong>Wallet Connection Needed</strong> To access this and other
          features, connect your Solana wallet.
        </p>
      </div>

      <WalletButton />
    </div>
  );
};
