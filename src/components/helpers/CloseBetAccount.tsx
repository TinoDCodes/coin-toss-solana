"use client";

import { HelperBlock } from "./HelperBlock";
import { CloseBetDialog } from "../ui/custom/CloseBetDialog";

export const CloseBetAccount = () => {
  return (
    <HelperBlock
      title="Close Bet Account"
      explanation="Close an on-chain Bet Account. (The below button will open the dialog for you to enter the required values)"
      buttonLabel="Close Bet"
      customButton={<CloseBetDialog />}
      key="close-user-bet-account"
    />
  );
};
