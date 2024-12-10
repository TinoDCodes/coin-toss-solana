"use client";

import { PayoutBetDialog } from "../ui/custom/PayoutBetDialog";
import { HelperBlock } from "./HelperBlock";

export const PayoutBet = () => {
  return (
    <HelperBlock
      title="Process Bet Payout"
      explanation="Process the paying out of a bet. (The below button will open the dialog for you to enter the required values)."
      buttonLabel="Payout Bet"
      customButton={<PayoutBetDialog />}
      key="process-bet-payout"
    />
  );
};
