const Input = ({
  className,
  allowDecimals = true,
  allowNegative = true,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  allowDecimals?: boolean;
  allowNegative?: boolean;
}) => {
  const unallowedChars = ["e", "E", "+"];
  if (!allowDecimals) unallowedChars.push(".");
  if (!allowNegative) unallowedChars.push("-");

  return (
    <input
      {...props}
      className={`${className} py-1 px-2 rounded-sm text-slate-900`}
      onKeyDown={(event) =>
        props.type === "number" &&
        unallowedChars.includes(event.key) &&
        event.preventDefault()
      }
    ></input>
  );
};

export default Input;
