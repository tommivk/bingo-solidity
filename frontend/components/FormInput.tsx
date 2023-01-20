import { forwardRef } from "react";
import { UseFormRegisterReturn } from "react-hook-form";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  allowDecimals?: boolean;
  allowNegative?: boolean;
  ref: UseFormRegisterReturn<string>;
};

// eslint-disable-next-line react/display-name
const FormInput = forwardRef<HTMLInputElement, Props>(
  (
    { allowDecimals = true, allowNegative = true, className, ...props },
    ref
  ) => {
    const unallowedChars = ["e", "E", "+"];
    if (!allowDecimals) unallowedChars.push(".");
    if (!allowNegative) unallowedChars.push("-");

    return (
      <input
        {...props}
        ref={ref}
        className={`${className} py-1 px-2 rounded-sm text-slate-900`}
        onKeyDown={(event) =>
          props.type === "number" &&
          unallowedChars.includes(event.key) &&
          event.preventDefault()
        }
      ></input>
    );
  }
);

export default FormInput;
