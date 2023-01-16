const ErrorPage = ({
  errorText,
  errorCode,
}: {
  errorText: string;
  errorCode: number;
}) => {
  return (
    <div className="h-screen w-screen text-center flex flex-col justify-center items-center">
      <h1 className="text-9xl text-slate-200">{errorCode}</h1>
      <p className="p-2">{errorText}</p>
    </div>
  );
};

export default ErrorPage;
