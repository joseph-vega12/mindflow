import { Box, BoxProps } from '@chakra-ui/react';
import React, { FC, useCallback, useEffect, useRef } from 'react';

// @ts-ignore
import ReactJWPlayer from 'react-jw-player';

interface Props extends BoxProps {
  videoUrl: string;
  onFinish?: () => void;
  /** When true, allow finish events again (e.g. after a progress reset). */
  isActive?: boolean;
}

export const VideoPlayer: FC<Props> = ({ videoUrl, onFinish, id, isActive = true, ...rest }) => {
  const onFinishRef = useRef(onFinish);
  const hasFinishedRef = useRef(false);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    hasFinishedRef.current = false;
  }, [videoUrl, id]);

  useEffect(() => {
    if (!isActive) return;

    // Allow re-watching after a reset without a full remount.
    hasFinishedRef.current = false;

    try {
      // @ts-ignore
      const player = window.jwplayer?.(id);
      if (player?.seek) {
        player.seek(0);
      }
    } catch (e) {
      // Player may not be ready yet.
    }
  }, [isActive, id]);

  const handleFinish = useCallback(() => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    // Call immediately so tutorial progress updates without a page refresh.
    // Safe as long as parents never unmount this player on completion.
    onFinishRef.current?.();
  }, []);

  // Attach native JW listeners after the player exists.
  useEffect(() => {
    if (!id || typeof window === 'undefined') return;

    let cancelled = false;
    let attempts = 0;

    const tryAttach = () => {
      if (cancelled) return;

      try {
        // @ts-ignore
        const player = window.jwplayer?.(id);
        if (player?.on) {
          player.on('complete', handleFinish);
          return;
        }
      } catch (e) {
        console.error('Failed to attach JW player finish listeners', e);
      }

      if (attempts++ < 40) {
        window.setTimeout(tryAttach, 250);
      }
    };

    tryAttach();

    return () => {
      cancelled = true;
    };
  }, [handleFinish, id]);

  // Do not put `id` on the Chakra wrapper — ReactJWPlayer already uses playerId as the
  // DOM id. Duplicate ids + JW DOM mutation causes React removeChild crashes.
  return (
    <Box {...rest}>
      <ReactJWPlayer
        playerId={id || videoUrl}
        playerScript="https://cdn.jwplayer.com/libraries/qQXZCMwI.js"
        file={videoUrl}
        onOneHundredPercent={handleFinish}
      />
    </Box>
  );
};
