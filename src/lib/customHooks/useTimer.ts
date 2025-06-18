import { useEffect, useState } from 'react';

interface UseTimerArgs {
  interval?: number;
  initialTime?: number;
  started?: boolean;
}

export const useTimer = ({
  interval = 500,
  initialTime = 0,
  started = false
}: UseTimerArgs): [number, { start: () => void; stop: () => void; resume: () => void; restart: () => void }] => {
  const [runningTime, setRunningTime] = useState<number>(initialTime);
  const [runningTimeFunc, setRunningTimeFunc] = useState<any>(null);

  const start = () => {
    if (runningTimeFunc) {
      stop();
    }

    setRunningTime(initialTime);
    setRunningTimeFunc(
      setInterval(() => {
        setRunningTime((prev) => prev + interval);
      }, interval)
    );
  };

  const restart = () => {
    setRunningTime(0);
  };

  const stop = () => {
    if (!runningTimeFunc) return;

    clearInterval(runningTimeFunc);
    setRunningTimeFunc(null);
  };

  const resume = () => {
    if (runningTimeFunc) return;

    setRunningTimeFunc(
      setInterval(() => {
        setRunningTime((prev) => prev + interval);
      }, interval)
    );
  };

  useEffect(() => {
    if (started) {
      start();
    }

    return () => {
      clearInterval(runningTimeFunc);
    };
  }, []);

  return [runningTime, { stop, resume, start, restart }];
};
