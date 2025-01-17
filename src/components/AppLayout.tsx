"use client";

import { ExplorerLink } from "@/components/cluster/cluster-ui";
import Header from "@/components/ui/custom/Header";
import { ReactNode, useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";

/**
 * Layout component for the application.
 *
 * This layout wraps the app content with a header, footer, and a toast notification container.
 * It provides consistent styling and structure across the app.
 *
 * @param {Object} props - The component props.
 * @param {ReactNode} props.children - The child components to be rendered within the layout.
 *
 * @returns {JSX.Element} The application layout component.
 *
 * @example
 * <AppLayout>
 *   <HomePage />
 * </AppLayout>
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-full flex flex-col bg-background">
      <Header />

      <main className="flex-grow">{children}</main>

      <footer className="footer footer-center p-4 bg-base-300 text-base-content">
        <aside>
          <p>
           © 2025 Coin Toss Solana. All rights reserved.
          </p>
        </aside>
      </footer>
      <Toaster position="bottom-right" />
    </div>
  );
}

export function AppModal({
  children,
  title,
  hide,
  show,
  submit,
  submitDisabled,
  submitLabel,
}: {
  children: ReactNode;
  title: string;
  hide: () => void;
  show: boolean;
  submit?: () => void;
  submitDisabled?: boolean;
  submitLabel?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    if (!dialogRef.current) return;
    if (show) {
      dialogRef.current.showModal();
    } else {
      dialogRef.current.close();
    }
  }, [show, dialogRef]);

  return (
    <dialog
      className="modal"
      ref={dialogRef}
    >
      <div className="modal-box space-y-5">
        <h3 className="font-bold text-lg">{title}</h3>
        {children}
        <div className="modal-action">
          <div className="join space-x-2">
            {submit ? (
              <button
                className="btn btn-xs lg:btn-md btn-primary"
                onClick={submit}
                disabled={submitDisabled}
              >
                {submitLabel || "Save"}
              </button>
            ) : null}
            <button
              onClick={hide}
              className="btn"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}

export function AppHero({
  children,
  title,
  subtitle,
}: {
  children?: ReactNode;
  title: ReactNode;
  subtitle: ReactNode;
}) {
  return (
    <div className="hero py-[64px]">
      <div className="hero-content text-center">
        <div className="max-w-2xl">
          {typeof title === "string" ? (
            <h1 className="text-5xl font-bold">{title}</h1>
          ) : (
            title
          )}
          {typeof subtitle === "string" ? (
            <p className="py-6">{subtitle}</p>
          ) : (
            subtitle
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Custom hook to display a toast notification when a transaction is sent.
 *
 * @returns {(signature: string) => void} A function that triggers the toast notification
 *                                       with a transaction explorer link.
 *
 * @example
 * const showTransactionToast = useTransactionToast();
 * showTransactionToast("5fG3H2...TxSignature");
 */
export function useTransactionToast() {
  /**
   * Displays a success toast notification for the transaction.
   *
   * @param {string} signature - The transaction signature to generate an explorer link.
   */
  return (signature: string) => {
    toast.success(
      <div className={"text-center"}>
        <div className="text-lg">Transaction sent</div>
        <ExplorerLink
          path={`tx/${signature}`}
          label={"View Transaction"}
          className="btn btn-xs btn-primary"
        />
      </div>,
      {
        duration: 6000,
      }
    );
  };
}
