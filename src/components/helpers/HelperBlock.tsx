import React from "react";
import { Button } from "../ui/button";

type HelperBlockProps = {
  /** The title displayed at the top of the helper block. */
  title: string;
  /** A brief explanation or description shown below the title. */
  explanation: string;
  /** Label for the primary action button. */
  buttonLabel: string;
  /** Optional function to execute when the button is clicked. */
  buttonAction?: () => void;
  /** Determines if the button should be disabled. */
  buttonDisabled?: boolean;
  /** Optional input field or additional ReactNode displayed within the block. */
  input?: React.ReactNode;
  /** A custom button component to replace the default action button. */
  customButton?: React.ReactNode;
};

/**
 * A reusable component that displays a helper block with a title, explanation,
 * optional input, and customizable button actions.
 *
 * @param {HelperBlockProps} props - The properties for the helper block.
 * @returns {JSX.Element} A styled helper block component.
 */
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
