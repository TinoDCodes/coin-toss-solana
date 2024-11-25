import { Button } from "../ui/button";

type HelperBlockProps = {
  title: string;
  explanation: string;
  buttonLabel: string;
  buttonAction: () => void;
  buttonDisabled?: boolean;
};

export const HelperBlock = ({
  title,
  explanation,
  buttonLabel,
  buttonAction,
  buttonDisabled,
}: HelperBlockProps) => {
  return (
    <div className="h-[11rem] w-80 bg-[#334b49] rounded-lg shadow-lg p-4 flex flex-col items-center">
      <h2 className="font-bold text-lg text-white">{title}</h2>
      <p className="text-center text-sm line-clamp-3 mb-2">{explanation}</p>

      <Button
        variant="default"
        size="lg"
        className="text-white bg-[#00c48f] hover:bg-[#00c48f] hover:opacity-90 hover:scale-95 mt-auto transition"
        onClick={buttonAction}
        disabled={buttonDisabled}
      >
        {buttonLabel}
      </Button>
    </div>
  );
};
