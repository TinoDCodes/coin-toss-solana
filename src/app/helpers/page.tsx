import { CreateMint } from "@/components/helpers/CreateMint";
import { MintTossCoin } from "@/components/helpers/MintTossCoin";

export default function HelpersPage() {
  return (
    <div className="wrapper h-full flex items-center justify-center gap-6">
      <CreateMint />
      <MintTossCoin />
    </div>
  );
}
