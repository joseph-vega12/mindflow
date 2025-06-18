export interface BoundVideo extends JWPlayerVideo {
  url: string;
  time: string;
  playlistId?: string;
  attachments: {
    name: string;
    link: string;
  }[];
}

export interface BoundPlaylist extends JWPlayerPlaylist {
  videos: BoundVideo[];
}

export interface JWPlayerVideo {
  title: string;
  mediaid: string;
  image: string;
  images: { src: string; width: number; type: string }[];
  feedid: string;
  duration: number;
  pubdate: number;
  description?: string;
  sources: {
    file: string;
    type: string;
    height: number;
    width: number;
    label: string;
  }[];
  tracks: {
    file: string;
    kind: string;
  }[];
}

export interface JWPlayerPlaylist {
  title: string;
  description?: string;
  kind: 'MANUAL' | 'DYNAMIC';
  feedid: string;
  links: {
    first: string;
    last: string;
  };
  playlist: JWPlayerVideo[];
  feed_instance_id: string;
}
