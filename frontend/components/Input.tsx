const Input = ({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <input
      {...props}
      className={`${className} py-1 px-2 rounded-sm text-slate-900`}
    ></input>
  );
};

export default Input;
