import { useQuery } from 'react-query';
import axios from 'axios';

import { BoundPlaylist, BoundVideo, JWPlayerPlaylist } from 'types';

import { secondsParser } from 'lib/utils';

export const usePlaylists = (playlistsIds: string[]): [BoundPlaylist[], boolean] => {
  const { isFetching, data } = useQuery(
    ['playlists', ...playlistsIds],
    async () => {
      const promises: Promise<any>[] = [];

      for (const playlistId of playlistsIds) {
        promises.push(axios.get(`https://cdn.jwplayer.com/v2/playlists/${playlistId}`));
      }

      const playlistsResp = await Promise.all(promises);
      const playlistsList: JWPlayerPlaylist[] = playlistsResp.map((resp) => resp.data);

      return playlistsList.map((playlist) => {
        const videos: BoundVideo[] = playlist.playlist.reduce((prev: any, video) => {
          const { sources, duration } = video;

          const videoSource = sources.filter(({ type }) => type === 'video/mp4').pop();
          if (!videoSource) return prev;

          return [
            ...prev,
            {
              ...video,
              url: videoSource.file,
              time: secondsParser(duration),
              playlistId: playlist.feedid
            }
          ];
        }, []);

        return { ...playlist, videos };
      });
    },
    {
      refetchOnMount: true,
      refetchOnWindowFocus: false
    }
  );

  return [data as BoundPlaylist[], isFetching];
};
