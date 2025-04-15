export type Artist = {
  id: string;
  name: string;
};

export type Album = {
  id: string;
  name: string;
  artists: Artist[];
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  release_date: string;
}; 