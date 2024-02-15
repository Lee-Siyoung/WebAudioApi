export interface ItemData {
  id: string;
  src: string;
  pcm: string;
  duration: number;
}

export interface ItemList {
  datas: ItemData[];
}
