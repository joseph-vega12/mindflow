import { Text, TextProps } from '@chakra-ui/react';
import React, { FC, useMemo } from 'react';

interface Props extends TextProps {
  time: number;
}

export const Timer: FC<Props> = ({ time, ...rest }) => {
  const formattedTime = useMemo(() => {
    if (!time) {
      return '00:00';
    }

    let min: string | number = Math.floor(time / (1000 * 60));
    let sec: string | number = Math.floor((time % (1000 * 60)) / 1000);

    if (min < 10) {
      min = `0${min}`;
    }

    if (sec < 10) {
      sec = `0${sec}`;
    }

    return `${min}:${sec}`;
  }, [time]);

  return (
    <Text fontSize="2xl" fontWeight="600" color="blue.500" {...rest}>
      {formattedTime}
    </Text>
  );
};
