import Spinner from "./Spinner";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  children: React.ReactNode;
};

const Button = ({ children, loading, ...props }: Props) => {
  return (
    <button
      {...props}
      className={`${props.className} relative rounded-lg bg-slate-700 disabled:bg-slate-700 disabled:pointer-events-none hover:bg-slate-600 px-5 py-2 text-slate-200`}
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
