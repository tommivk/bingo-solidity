import Spinner from "./Spinner";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  children: React.ReactNode;
};

const Button = ({ children, loading, ...props }: Props) => {
  return (
    <button
      {...props}
      className={`${props.className} rounded-lg bg-slate-700 disabled:bg-slate-700 disabled:pointer-events-none hover:bg-slate-600 px-5 py-2 text-slate-200`}
    >
      {loading ? <Spinner size={20} /> : children}
    </button>
  );
};

export default Button;
