import React, { FC, useEffect, useState, useMemo } from 'react';
import { find, findIndex } from 'lodash';

import { JWPlayerVideo } from 'types';

import { BineuralBeatsContext } from './BineuralBeatsContext';
import { useAudio } from 'lib/customHooks';
import { usePlaylists } from 'lib/api';
import { useMatch } from 'react-router-dom';

interface Props { }

export const BineauralBeatsProvider: FC<Props> = ({ children }) => {
  const [playlists, isPlaylistLoading] = usePlaylists(['RPWANtQs']);
  const [playlist] = playlists ?? [];

  const [currentAudio, setCurrentAudio] = useState<JWPlayerVideo | null>(null);
  const [isPlaying, { audio, setVolume, onToggleAudio, setSource, audioIsLoading, volume, duration }] = useAudio();

  // Diagnostics should not play any bineural
  const isDiagnostic = useMatch('/diagnostics/:diagnosticId');

  useEffect(() => {
    if (isPlaying && isDiagnostic) {
      onToggleAudio();
    }
  }, [isPlaying, isDiagnostic]);

  useEffect(() => {
    if (currentAudio) {
      const [source] = currentAudio.sources;

      setSource(source.file, isPlaying);
    }
  }, [currentAudio]);

  useEffect(() => {
    if (playlist?.playlist) {
      setCurrentAudio(playlist.playlist[0]);
    }
  }, [playlist]);

  const onNextAudio = () => {
    const currentAudioIndex = findIndex(playlist.playlist, { mediaid: currentAudio?.mediaid });

    const nextAudio = playlist.playlist[currentAudioIndex + 1];

    if (!nextAudio) {
      setCurrentAudio(playlist.playlist[0]);
    } else {
      setCurrentAudio(nextAudio);
    }
  };

  const onPreviousAudio = () => {
    const currentAudioIndex = findIndex(playlist.playlist, { mediaid: currentAudio?.mediaid });

    const playlistLastAudioIndex = playlist.playlist.length - 1;
    const previousAudioIndex = currentAudioIndex - 1;

    if (previousAudioIndex < 0) {
      setCurrentAudio(playlist.playlist[playlistLastAudioIndex]);
    } else {
      setCurrentAudio(playlist.playlist[previousAudioIndex]);
    }
  };

  const onSelectedAudio = (mediaid: string) => {
    const audio = find(playlist?.playlist, { mediaid });
    if (!audio) return null;

    setCurrentAudio(audio);
  };

  return (
    <BineuralBeatsContext.Provider
      value={{
        playlist,
        isPlaylistLoading,

        audio,
        audioIsLoading,
        currentAudio,
        duration,
        isPlaying,

        setVolume,
        volume,

        onNextAudio,
        onPreviousAudio,
        onSelectedAudio,
        onToggleAudio
      }}
    >
      {children}
    </BineuralBeatsContext.Provider>
  );
};
