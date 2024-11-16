import Link from "next/link";
import { WalletButton } from "./solana/solana-provider";
import { ClusterUiSelect } from "./cluster/cluster-ui";

const Header = () => {
  return (
    <header className="wrapper flex items-center justify-between">
      <Link href="/">
        <h1 className="font-bold text-pretty text-3xl text-white/85">
          CoinToss
        </h1>
      </Link>

      <div className="flex items-center space-x-2">
        <WalletButton />
        <ClusterUiSelect />
      </div>
    </header>
  );
};

export default Header;
