import { createContext } from 'react';
import { JWPlayerPlaylist, JWPlayerVideo } from 'types';

export interface BineuralBeatsContextProps {
  playlist?: JWPlayerPlaylist;
  isPlaylistLoading: boolean;

  currentAudio: JWPlayerVideo | null;
  audio: HTMLAudioElement | null;
  volume: number;
  duration: number;

  isPlaying: boolean;
  audioIsLoading: boolean;

  onToggleAudio: () => void;
  setVolume: (volume: number) => void;

  onNextAudio: () => void;
  onPreviousAudio: () => void;

  onSelectedAudio: (mediaid: string) => void;
}

const BineuralBeatsContext = createContext<BineuralBeatsContextProps>(
  {} as BineuralBeatsContextProps
);
BineuralBeatsContext.displayName = 'BineuralBeatsContext';

export { BineuralBeatsContext };
