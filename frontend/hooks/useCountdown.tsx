import { useEffect, useState } from "react";

const useCountdown = (time: number) => {
  const [remaining, setRemaining] = useState<number>(time > 0 ? time : 0);

  useEffect(() => {
    setRemaining(time > 0 ? time : 0);
    const countdown = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [time]);

  return [remaining];
};

export default useCountdown;
