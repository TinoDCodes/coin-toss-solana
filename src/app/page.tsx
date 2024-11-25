import BetSectionUI from "@/components/bet/BetSectionUI";
import CountDown from "@/components/ui/custom/CountDown";

export default function Page() {
  return (
    <div className="wrapper h-full flex flex-col items-center justify-center space-y-20">
      <BetSectionUI />

      <CountDown />
    </div>
  );
}
