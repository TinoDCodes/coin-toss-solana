import { CreateMint } from "@/components/helpers/CreateMint";
import { GetBetAccountData } from "@/components/helpers/GetBetAccountData";
import { MintTossCoin } from "@/components/helpers/MintTossCoin";

export default function HelpersPage() {
  return (
    <div className="wrapper h-full flex items-center justify-center gap-6">
      <CreateMint />
      <MintTossCoin />
      <GetBetAccountData />
    </div>
  );
}
