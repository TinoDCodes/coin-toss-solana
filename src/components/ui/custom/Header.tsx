import Link from "next/link";
import { CoinBalance } from "./CoinBalance";
import { WalletButton } from "@/components/solana/solana-provider";

const Header = () => {
  return (
    <header className="wrapper flex items-center justify-between">
      <Link href="/">
        <h1 className="font-bold text-pretty text-3xl text-white/85">
          CoinToss
        </h1>
      </Link>

      <section className="flex items-center gap-8">
        <Link
          href="/helpers"
          className="font-medium text-muted-foreground hover:text-accent"
        >
          Helpers
        </Link>
        <Link
          href="/vault"
          className="font-medium text-muted-foreground hover:text-accent"
        >
          Vault
        </Link>
        <Link
          href="/account"
          className="font-medium text-muted-foreground hover:text-accent"
        >
          Account
        </Link>
      </section>

      <div className="flex items-center space-x-4">
        <CoinBalance />
        <WalletButton />
        {/* <ClusterUiSelect /> */}
      </div>
    </header>
  );
};

export default Header;
