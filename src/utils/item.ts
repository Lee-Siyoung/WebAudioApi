import itemList from "@/assets/itemList.json";
import { ItemList } from "@/types/itemList";

class Item {
  private itemList: ItemList;

  constructor(itemList: ItemList) {
    this.itemList = itemList;
  }

  public getItem(): ItemList["datas"] {
    return this.itemList.datas;
  }
}

const item = new Item(itemList);

export default item;
