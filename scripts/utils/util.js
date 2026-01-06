import * as server from "@minecraft/server";
const { world, system } = server;
import { Dypro } from "./dypro";
import { Data } from "./data";
const playerDatas = new Dypro("player");
export class Util {
    getAllPlayerIdsSorted() {
        return playerDatas.idList.sort((a, b) =>
            Data.wordOrder.findIndex(playerDatas.get(a).name) -
            Data.wordOrder.findIndex(playerDatas.get(b).name))
    }
}