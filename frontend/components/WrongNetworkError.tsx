const WrongNetworkError = () => {
  return (
    <div className="fixed top-0 w-screen h-screen bg-black opacity-80 z-40 flex justify-center items-center">
      <h1 className="text-slate-200 text-2xl z-50 opacity-100 p-10">
        Please switch To Polygon Mumbai Network
      </h1>
    </div>
  );
};

export default WrongNetworkError;
