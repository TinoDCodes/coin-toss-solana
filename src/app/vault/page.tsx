"use client";

import { useCoinTossProgram } from "@/components/bet/coin-toss-program";
import { ExplorerLink } from "@/components/cluster/cluster-ui";
import { WalletButton } from "@/components/solana/solana-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ellipsify, TOKEN_DECIMALS } from "@/utils/helpers";
import { useWallet } from "@solana/wallet-adapter-react";
import { Coins, Loader } from "lucide-react";
import React, { useState } from "react";

export default function VaultPage() {
  const { publicKey } = useWallet();
  const {
    airDrop,
    deposit,
    getProgramAccount,
    initialize,
    coinVault,
    coinVaultError,
    isCoinVaultPending,
  } = useCoinTossProgram();

  const [depositAmount, setDepositAmount] = useState<string>("");

  const vaultBalance = coinVault
    ? Number(coinVault.amount) / Math.pow(10, TOKEN_DECIMALS)
    : 0;

  const handleDepositAmountChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = event.target;

    const amount = parseFloat(value) <= 0 ? "" : value;
    setDepositAmount(amount);
  };

  if (getProgramAccount.isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (!getProgramAccount.data?.value) {
    return (
      <div className="wrapper h-full flex items-center justify-center">
        <article className="alert alert-warning text-center opacity-70">
          Program account not found. Make sure you have deployed the program and
          are on the correct cluster.
        </article>
      </div>
    );
  }

  return (
    <div className="wrapper h-full flex flex-col items-center space-y-20">
      <section className="flex flex-col items-center space-y-4">
        <h1 className="font-bold text-white text-3xl text-center">
          Coin Vault
        </h1>
        <small className="text-base text-white/75">
          This page displays the token vault balance and lets you manage
          vault-related tasks.
        </small>

        <strong className="font-bold text-center text-7xl py-8">
          {vaultBalance} tkns
        </strong>

        <p className="mb-6">
          <ExplorerLink
            path={`account/${coinVault?.address}`}
            label={ellipsify(coinVault?.address.toString())}
          />
        </p>
      </section>

      {/*------ COIN TOSS SOLANA PROGRAM UTILITIES ------*/}
      {!publicKey ? (
        <WalletButton />
      ) : (
        <section className="flex items-center space-x-10">
          <article className="flex flex-col space-y-4">
            <div>
              <Label htmlFor="depositAmount">Deposit Amount</Label>
              <div className="relative mt-1">
                <Coins className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  type="number"
                  id="depositAmount"
                  placeholder="Enter deposit amount"
                  className="pl-8 border-[#4b5563]"
                  min={0}
                  value={depositAmount}
                  onChange={handleDepositAmountChange}
                />
              </div>
            </div>
            <Button
              variant="default"
              size="lg"
              className={`bg-emerald-400 hover:bg-emerald-500 text-white text-lg ${
                deposit.isPending && "animate-pulse"
              }`}
              onClick={() => {
                const actualAmount =
                  parseFloat(depositAmount) * Math.pow(10, TOKEN_DECIMALS);
                console.log(actualAmount);
                deposit.mutateAsync(actualAmount);
              }}
              disabled={deposit.isPending || !depositAmount.trim()}
            >
              {deposit.isPending ? "processing" : "Deposit"}
            </Button>
          </article>

          <div className="flex flex-col h-full justify-between">
            <Button
              variant="default"
              size="lg"
              className={`bg-cyan-400 hover:bg-cyan-500 text-white text-lg ${
                initialize.isPending && "animate-pulse"
              }`}
              onClick={() => initialize.mutateAsync()}
              disabled
            >
              {initialize.isPending ? "Initializing..." : "Initialize"}
            </Button>

            <Button
              variant="default"
              size="lg"
              className={`bg-amber-400 hover:bg-amber-500 text-white text-lg ${
                airDrop.isPending && "animate-pulse"
              }`}
              onClick={() => airDrop.mutateAsync()}
              disabled={airDrop.isPending}
            >
              {airDrop.isPending ? "processing" : "Request Airdrop"}
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
