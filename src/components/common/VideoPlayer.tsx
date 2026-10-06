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

  // Defer React state updates so they don't run inside JW's complete/remove DOM cycle.
  const handleFinish = useCallback(() => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;

    finishTimeoutRef.current = setTimeout(() => {
      onFinishRef.current?.();
    }, 0);
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

  // Do not put `id` on the Chakra wrapper — ReactJWPlayer already uses playerId as the
  // DOM id. Duplicate ids + JW's DOM mutation causes React removeChild crashes.
  return (
    <Box {...rest}>
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
