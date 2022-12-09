const Button = ({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      {...props}
      className={`${props.className} rounded-lg bg-slate-700 disabled:bg-slate-700 disabled:pointer-events-none hover:bg-slate-600 px-5 py-2 text-slate-200`}
    >
      {children}
    </button>
  );
};

export default Button;
