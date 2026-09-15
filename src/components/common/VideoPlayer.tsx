import { Box, BoxProps } from '@chakra-ui/react';
import React, { FC, useCallback, useRef } from 'react';

// @ts-ignore
import ReactJWPlayer from 'react-jw-player';

interface Props extends BoxProps {
  videoUrl: string;
  onFinish?: () => void;
}

export const VideoPlayer: FC<Props> = ({ videoUrl, onFinish, id, ...rest }) => {
  const hasFinishedRef = useRef(false);

  const handleFinish = useCallback(() => {
    if (hasFinishedRef.current || !onFinish) return;
    hasFinishedRef.current = true;
    onFinish();
  }, [onFinish]);

  return (
    <Box {...rest}>
      <ReactJWPlayer
        playerId={id || videoUrl}
        playerScript="https://cdn.jwplayer.com/libraries/qQXZCMwI.js"
        file={videoUrl}
        onOneHundredPercent={handleFinish}
        onNinetyFivePercent={handleFinish}
        onComplete={handleFinish}
      />
    </Box>
  );
};
