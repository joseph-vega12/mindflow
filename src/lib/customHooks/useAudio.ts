import { useEffect, useState } from 'react';

type UseAudioReturn = [
  boolean,
  {
    audio: HTMLAudioElement | null;
    onToggleAudio: () => void;
    setSource: (url: string, play: boolean) => void;
    setVolume: (volume: number) => void;
    audioIsLoading: boolean;
    volume: number;
    duration: number;
  }
];

export const useAudio = (url?: string): UseAudioReturn => {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(url ? new Audio(url) : null);
  const [audioIsLoading, setAudioIsLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState<number>(1);
  const [duration, setDuration] = useState<number>(0);

  const toggle = () => setPlaying(!playing);

  // Handles audio play state
  useEffect(() => {
    if (audio) {
      playing ? audio.play() : audio.pause();
    }
  }, [playing, audio]);

  useEffect(() => {
    if (audio) {
      audio.volume = volume;
    }
  }, [audio, volume]);

  const clearAudioListener = () => {
    if (audio) {
      audio.removeEventListener('canplay', () => {});
      audio.removeEventListener('ended', () => setPlaying(false));
    }
  };

  useEffect(() => {
    if (audio) {
      // When the audio can be played
      audio.addEventListener('canplay', () => setAudioIsLoading(false));
      audio.addEventListener('canplay', () => setAudioIsLoading(false));

      // @ts-ignore
      audio.addEventListener('timeupdate', (ev) => setDuration(Math.round(ev.target?.currentTime)));
    }

    return () => {
      clearAudioListener();
    };
  }, [audio]);

  const setSource = (newSource: string, play: boolean) => {
    setAudioIsLoading(true);
    setPlaying(false);
    clearAudioListener();

    if (audio) {
      audio.pause();
    }

    if (!newSource) return null;

    setAudio(new Audio(newSource));

    if (play) {
      setPlaying(true);
    }
  };

  return [
    playing,
    { audio, onToggleAudio: toggle, setSource, audioIsLoading, setVolume, volume, duration }
  ];
};
