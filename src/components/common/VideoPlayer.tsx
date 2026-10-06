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
  const finishTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    hasFinishedRef.current = false;
    return () => {
      if (finishTimeoutRef.current) {
        clearTimeout(finishTimeoutRef.current);
      }
    };
  }, [videoUrl, id]);

  // react-jw-player binds some callbacks only at player init and ignores prop updates.
  // Defer onFinish so React doesn't unmount the player inside JW's complete handler
  // (that teardown race blanks the whole page until a manual refresh).
  const handleFinish = useCallback(() => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;

    finishTimeoutRef.current = setTimeout(() => {
      onFinishRef.current?.();
    }, 300);
  }, []);

  const handleReady = useCallback(() => {
    if (!id || typeof window === 'undefined') return;

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
