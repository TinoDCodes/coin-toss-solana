import React from "react";
import { Button } from "../ui/button";

type HelperBlockProps = {
  title: string;
  explanation: string;
  buttonLabel: string;
  buttonAction?: () => void;
  buttonDisabled?: boolean;
  input?: React.ReactNode;
  customButton?: React.ReactNode;
};

export const HelperBlock = ({
  title,
  explanation,
  buttonLabel,
  buttonAction,
  buttonDisabled,
  input,
  customButton,
}: HelperBlockProps) => {
  return (
    <div className="h-[11rem] w-80 bg-[#334b49] rounded-lg shadow-lg p-4 flex flex-col items-center">
      <h2 className="font-bold text-lg text-white">{title}</h2>
      <p
        className={`text-center text-sm mb-2 ${
          input ? "line-clamp-1" : "line-clamp-3"
        }`}
      >
        {explanation}
      </p>

      {input}

      {customButton ? (
        <>{customButton}</>
      ) : (
        <Button
          variant="default"
          size="lg"
          className="text-white bg-[#00c48f] hover:bg-[#00c48f] hover:opacity-90 hover:scale-95 mt-auto transition"
          onClick={buttonAction}
          disabled={buttonDisabled}
        >
          {buttonLabel}
        </Button>
      )}
    </div>
  );
};
