import Spinner from "./Spinner";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  children: React.ReactNode;
  size?: "sm" | "lg";
};

const Button = ({ children, loading, size = "sm", ...props }: Props) => {
  return (
    <button
      {...props}
      className={`${
        props.className
      } relative rounded-lg bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 border-2 border-slate-600
      focus:border-slate-500 disabled:text-slate-500 disabled:pointer-events-none text-slate-200 select-none
        ${size === "sm" ? "px-5 py-2" : "font-bold text-lg px-16 py-4"}`}
    >
      <span className={`${loading ? "invisible" : ""}`}>
        {children}
        {loading && (
          <span className="visible absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
            <Spinner size={20} />
          </span>
        )}
      </span>
    </button>
  );
};

export default Button;
