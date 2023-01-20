import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Address } from "wagmi";
import { FetchBalanceResult } from "@wagmi/core";

const ArrowIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      className={className}
      aria-hidden="true"
      focusable="false"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 384 512"
    >
      <path d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.8 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"></path>
    </svg>
  );
};

const CopyIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      className={className}
      aria-hidden="true"
      focusable="false"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
    >
      <path d="M502.6 70.63l-61.25-61.25C435.4 3.371 427.2 0 418.7 0H255.1c-35.35 0-64 28.66-64 64l.0195 256C192 355.4 220.7 384 256 384h192c35.2 0 64-28.8 64-64V93.25C512 84.77 508.6 76.63 502.6 70.63zM464 320c0 8.836-7.164 16-16 16H255.1c-8.838 0-16-7.164-16-16L239.1 64.13c0-8.836 7.164-16 16-16h128L384 96c0 17.67 14.33 32 32 32h47.1V320zM272 448c0 8.836-7.164 16-16 16H63.1c-8.838 0-16-7.164-16-16L47.98 192.1c0-8.836 7.164-16 16-16H160V128H63.99c-35.35 0-64 28.65-64 64l.0098 256C.002 483.3 28.66 512 64 512h192c35.2 0 64-28.8 64-64v-32h-47.1L272 448z"></path>
    </svg>
  );
};

const LinkIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      className={className}
      aria-hidden="true"
      focusable="false"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 448 512"
    >
      <path d="M384 32c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96C0 60.7 28.7 32 64 32H384zM160 144c-13.3 0-24 10.7-24 24s10.7 24 24 24h94.1L119 327c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l135-135V328c0 13.3 10.7 24 24 24s24-10.7 24-24V168c0-13.3-10.7-24-24-24H160z"></path>
    </svg>
  );
};

const Dropdown = ({
  address,
  balance,
}: {
  address: Address;
  balance: FetchBalanceResult;
}) => {
  const [open, setOpen] = useState(false);

  const dropdownRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        event.target instanceof HTMLElement &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [dropdownRef]);

  const copyAddress = () => {
    try {
      navigator.clipboard.writeText(address);
      toast.success("Address copied");
    } catch (error) {
      toast.error("Failed to copy address");
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <div
        onClick={() => setOpen(!open)}
        className="cursor-pointer border-gray-500 hover:border-gray-400 border-2 w-fit px-4 py-2 rounded-md flex justify-center items-center select-none"
      >
        {address.substring(0, 6)}...
        {address.substring(address.length - 4, address.length)}
        <ArrowIcon
          className={`fill-slate-200 h-4 ml-2 ${open ? "rotate-180" : ""}`}
        />
      </div>

      {open && (
        <div className="z-50 w-80 min-w-fit min-h-fit p-4 bg-[#161616] rounded-md absolute top-12 right-0 border-gray-700 border-2">
          <div className="flex justify-center items-center">
            <p
              className="cursor-pointer group flex items-center"
              onClick={copyAddress}
            >
              {address.substring(0, 8)}...
              {address.substring(address.length - 6, address.length)}
              <CopyIcon className="h-5 w-5 inline-block ml-2 fill-slate-200 group-hover:fill-gray-400" />
            </p>
            <a
              href={`https://mumbai.polygonscan.com/address/${address}`}
              rel="noopener noreferrer"
              target="_blank"
              className="ml-2 group"
            >
              <LinkIcon className="h-5 w-5 fill-slate-200 group-hover:fill-gray-400" />
            </a>
          </div>

          <div className="text-center mt-4 pb-8">
            <h2 className="text-2xl font-bold">{balance?.symbol}</h2>
            <p>{balance?.formatted}</p>

            {balance.value?.isZero() && (
              <p className="mt-4">
                Go get some Mumbai testnet Matic from the{" "}
                <a
                  href="https://faucet.polygon.technology/"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="text-teal-300 underline"
                >
                  faucet
                </a>{" "}
                to get started.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
