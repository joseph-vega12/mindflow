import React, { FC, useMemo, useState } from 'react';

import { Box, Flex, SimpleGrid, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import _ from 'lodash';

import { BoundVideo, VideoFeedActivity } from 'types';

import { BasePage, BasePageTitle } from 'components/layout/Pages';
import { EmptyData, Indicator, Loading, PercentageProgress, VideoPlayer } from 'components/common';
import { Meta, VideosList } from 'components/Pages/Classes';

import { useAuthContext, useFirebaseContext } from 'lib/firebase';
import { usePlaylists } from 'lib/api';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { db } from 'lib/firebase/firebaseInit';

export const Training: FC<{}> = () => {
  const { firestore } = useFirebaseContext();
  const { user } = useAuthContext();
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const playlistsIds = ['zvephgab', 'mADJpTBb'];
  const [playlists, playlistsLoading] = usePlaylists(playlistsIds);
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState<number>(0);
  const watchedVideos = useMemo(() => _.get(user, ['userDetails', 'activity', 'stats', 'videos']), [user.userDetails]);

  const { data: watchedVideo, refetch, isLoading } = useQuery(
    ['query:users videos watched'],
    async () => {
      const usersRef = collection(db, 'users')
        .withConverter({
          fromFirestore: (doc) => {
            if (doc.id === user.uid) {
              return {
                ...doc.data().activity.stats.videos
              };
            }
          },
          toFirestore: (doc) => doc
        })

      const usersSnap = await getDocs(usersRef);

      const users = usersSnap.docs.map((d) => {
        return d.data();
      });
      return users;
    },
    {
      refetchOnMount: true,
      refetchOnWindowFocus: true
    }
  );

  const playlistIndicators = useMemo<
    { total: number; watched: number; playlistTitle: string; playlistId: string }[]
  >(() => {
    if (!playlists) return [];

    const watched = {};

    watchedVideo?.map((video) => {
      return Object.assign(watched, video);
    });

    const watchedVideosIds = Object.keys(watched);
    return playlists.map((playlist) => {
      const watchedVideosInPlaylist = playlist.videos.filter((videoMediaId) =>
        watchedVideosIds.includes(videoMediaId.mediaid)
      );

      return {
        total: playlist.videos.length,
        watched: watchedVideosInPlaylist.length,
        playlistTitle: playlist.title,
        playlistId: playlist.feedid
      };
    });
  }, [playlists, watchedVideo, isLoading]);

  const currentVideo: BoundVideo | null = useMemo(() => {
    if (playlistsLoading) return null;
    const watchedVideosIds = Object.keys(watchedVideos);

    const videos = _.flatten(playlists.map((p) => p.videos));
    const foundVideo = videos.find(({ mediaid }) => mediaid === videoId);

    if (foundVideo) {
      const playlistIdx = playlists.findIndex((p) => foundVideo.playlistId === p.feedid);
      setCurrentPlaylistIndex(playlistIdx);
      return foundVideo;
    }

    if (!foundVideo) {
      const [fistNotWatchedVideo] = videos.filter((v) => !watchedVideosIds.includes(v.mediaid));

      if (!fistNotWatchedVideo) return null;

      return fistNotWatchedVideo;
    }

    return null;
  }, [videoId, playlistsLoading, playlists]);

  const onVideoFinished = async () => {
    if (!currentVideo) return null;

    const { firstName, lastName, picture } = user.userDetails;

    const newVideoFeedEvent: VideoFeedActivity = {
      relatedKey: currentVideo.mediaid,
      timestamp: +new Date(),
      type: 'video',
      userId: user.uid,
      user: {
        id: user.uid,
        firstName,
        lastName,
        picture
      }
    };

    if (user.userDetails.businessId) {
      newVideoFeedEvent.businessId = user.userDetails.businessId;
    }

    newVideoFeedEvent.user.picture = picture || '';


    await addDoc(collection(db, 'feed'), newVideoFeedEvent);

    const getNextVideoId = () => {
      const playlist = playlists[currentPlaylistIndex];

      const videoIndex = playlist.videos.findIndex((video) => video.mediaid === videoId);

      if (videoIndex < playlist.videos.length - 1) {
        const nextVideo = playlist.videos[videoIndex + 1];
        return nextVideo.mediaid;
      }

      // Last of the playlist
      if (currentPlaylistIndex === playlists.length) {
        return playlist.videos[0]?.mediaid;
      }
      return null;
    };

    const nextVideoId = getNextVideoId();

    await queryClient.invalidateQueries('user');

    if (!nextVideoId) {
      return navigate('/');
    }
    navigate(`/training/${nextVideoId}`);
  };

  return (
    <BasePage spacing="md">
      <BasePageTitle paddingBottom="md" title="Training Videos" />
      <Flex
        height="100%"
        justifyContent={{ lg: 'space-between', md: 'flex-start' }}
        key={videoId}
        flexDirection={{ md: 'column', lg: 'row' }}
      >
        <Flex
          direction="column"
          width="100%"
          marginRight={{ lg: 'xl', md: 'none' }}
          marginBottom={{ lg: 'none', md: 'lg' }}
        >
          <SimpleGrid columns={2} marginBottom={{ lg: 'xl', md: 'md' }}>
            {playlistIndicators.map((playlistIndicator) => (
              <Box
                key={playlistIndicator.playlistId}
                _first={{
                  marginRight: 'md'
                }}
              >
                <Indicator
                  key={playlistIndicator.playlistId}
                  color="teal"
                  value={playlistIndicator.watched}
                  label={`${playlistIndicator.playlistTitle} videos watched`}
                  isLoading={playlistsLoading}
                />
                <Loading isLoading={playlistsLoading}>
                  <PercentageProgress value={playlistIndicator.watched} max={playlistIndicator.total} />
                </Loading>
              </Box>
            ))}
          </SimpleGrid>
          {currentVideo && (
            <Box>
              <VideoPlayer videoUrl={currentVideo.url} onFinish={onVideoFinished} />
              <Box marginTop={[15, 25]}>
                <Meta video={currentVideo} />
              </Box>
            </Box>
          )}
        </Flex>
        <Flex width="100%">
          <Box
            width="100%"
            overflow="auto"
            height="fit-content"
            borderColor="gray.200"
            borderWidth={1}
            borderStyle="solid"
            borderRadius={10}
            padding={3}
          >
            <Tabs
              height="100%"
              overflow="auto"
              variant="enclosed"
              index={currentPlaylistIndex}
              onChange={setCurrentPlaylistIndex}
            >
              <TabList mb={2} borderBottomColor="gray.300" d="flex">
                {playlists?.map((playlist) => (
                  <Tab
                    key={playlist.feedid}
                    _selected={{
                      borderColor: 'gray.300',
                      borderBottomColor: 'white',
                      fontWeight: 'bold',
                      color: 'blue.500',
                      outline: 'none',
                      boxShadow: 'none'
                    }}
                    backgroundColor="transparent"
                    flex="1"
                    py="3"
                    borderBottomColor="gray.300"
                    fontSize={['sm', 'md']}
                    borderRadius={10}
                    borderBottomLeftRadius={0}
                    borderBottomRightRadius={0}
                  >
                    {playlist.title} Videos
                  </Tab>
                ))}
              </TabList>
              <TabPanels height="550px" overflow="auto" px={3}>
                {playlists?.map((playlist) => {
                  return (
                    <TabPanel key={playlist.feedid}>
                      <EmptyData empty={!playlist.videos.length}>
                        <VideosList
                          videos={playlist.videos}
                          watchedVideos={watchedVideo}
                          currentVideo={videoId}
                          refetch={refetch}
                        />
                      </EmptyData>
                    </TabPanel>
                  );
                })}
              </TabPanels>
            </Tabs>
          </Box>
        </Flex>
      </Flex>
    </BasePage>
  );
};
