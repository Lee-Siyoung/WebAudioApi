export interface ItemData {
  id: string;
  src: string;
  pcm: string;
  duration: number;
  samplerate: number;
}

export interface ItemList {
  datas: ItemData[];
}
