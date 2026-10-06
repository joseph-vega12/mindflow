import { Box, BoxProps } from '@chakra-ui/react';
import React, { FC, useCallback, useEffect, useRef } from 'react';

// @ts-ignore
import ReactJWPlayer from 'react-jw-player';

interface Props extends BoxProps {
  videoUrl: string;
  onFinish?: () => void;
}

export const VideoPlayer: FC<Props> = ({ videoUrl, onFinish, id, ...rest }) => {
  const onFinishRef = useRef(onFinish);
  const hasFinishedRef = useRef(false);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    hasFinishedRef.current = false;
  }, [videoUrl, id]);

  // react-jw-player binds some callbacks only at player init and ignores prop updates.
  // Keep a stable handler that always delegates to the latest onFinish ref.
  const handleFinish = useCallback(() => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    onFinishRef.current?.();
  }, []);

  const handleReady = useCallback(() => {
    if (!id || typeof window === 'undefined') return;

    // Prefer the real JW "complete" event so progress isn't marked ~5% early.
    try {
      // @ts-ignore
      const player = window.jwplayer?.(id);
      if (!player?.on) return;

      player.on('complete', handleFinish);
    } catch (e) {
      console.error('Failed to attach JW player finish listeners', e);
    }
  }, [handleFinish, id]);

  return (
    <Box id={id} {...rest}>
      <ReactJWPlayer
        playerId={id || videoUrl}
        playerScript="https://cdn.jwplayer.com/libraries/qQXZCMwI.js"
        file={videoUrl}
        onReady={handleReady}
        onOneHundredPercent={handleFinish}
      />
    </Box>
  );
};
