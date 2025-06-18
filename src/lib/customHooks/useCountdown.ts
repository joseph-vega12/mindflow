import { useEffect, useRef, useState } from 'react';

export interface UseCountdownArgs {
  countdownTime?: number;
  interval?: number;
  started?: boolean;
}

export interface UseCountdown {
  state: {
    time: number;
    countdownTime: number;
  };
  actions: {
    start: () => void;
    pause: () => void;
    reset: (newCountdownTime?: number) => void;
  };
}

export const useCountdown = ({
  countdownTime = 60_000,
  interval = 500,
  started = false
}: UseCountdownArgs): UseCountdown => {
  const [countdownTimeState, setCountdownTimeState] = useState(countdownTime);
  const [time, setTime] = useState<number>(countdownTime);

  const countRef = useRef<any>(null);

  const start = () => {
    countRef.current = setInterval(() => {
      if (time < 0) return null;

      setTime((prevState) => {
        const newState = prevState - interval;

        return newState < 0 ? 0 : newState;
      });
    }, interval);
  };

  const pause = () => {
    if (countRef) {
      clearInterval(countRef.current);
    }
  };

  useEffect(() => {
    if (started) {
      start();
    }

    return () => {
      pause();
    };
  }, []);

  useEffect(() => {
    if (time === 0) {
      pause();
    }
  }, [time]);

  const reset = (newCountdownTime: number = countdownTime) => {
    clearInterval(countRef.current);
    setCountdownTimeState(newCountdownTime);
    setTime(newCountdownTime);
  };

  return {
    state: {
      countdownTime: countdownTimeState,
      time
    },
    actions: {
      start,
      pause,
      reset
    }
  };
};
