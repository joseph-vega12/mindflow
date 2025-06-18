import { useEffect, useState } from 'react';

interface Args {
  interval?: number;
  initialTime?: number;
  started?: boolean;
}

export const useInterval = (
  cb: () => void,
  { interval = 500, started = false }: Args
): { stop: () => void; resume: () => void } => {
  const [runningTimeFunc, setRunningTimeFunc] = useState<any>(null);

  const stop = () => {
    if (!runningTimeFunc) return;

    clearInterval(runningTimeFunc);
    setRunningTimeFunc(null);
  };

  const resume = () => {
    if (runningTimeFunc) return;

    setRunningTimeFunc(() => setInterval(() => cb(), interval));
  };

  useEffect(() => {
    if (started) {
      resume();
    }
  }, []);

  return { stop, resume };
};
