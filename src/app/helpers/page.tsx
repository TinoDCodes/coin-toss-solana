import { CloseBetAccount } from "@/components/helpers/CloseBetAccount";
import { CreateMint } from "@/components/helpers/CreateMint";
import { GetBetAccountData } from "@/components/helpers/GetBetAccountData";
import { MintTossCoin } from "@/components/helpers/MintTossCoin";
import { PayoutBet } from "@/components/helpers/PayoutBet";

export default function HelpersPage() {
  return (
    <div className="wrapper h-full flex items-center justify-center gap-6 flex-wrap">
      <CreateMint />
      <MintTossCoin />
      <GetBetAccountData />
      <CloseBetAccount />
      <PayoutBet />
    </div>
  );
}
