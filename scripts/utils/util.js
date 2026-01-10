import * as server from "@minecraft/server";
const { world, system, ItemStack } = server;
import "./phone.js";
import { Dypro } from "./dypro";
import { Data } from "./data";
const playerDatas = new Dypro("player");
export class Util {
    getAllPlayerIdsSorted() {
        return playerDatas.idList.sort((a, b) =>
            Data.wordOrder.findIndex(playerDatas.get(a).name) -
            Data.wordOrder.findIndex(playerDatas.get(b).name))
    }
    /**
 * アイテムの名前をLangに変換
 * @param {string} typeId 
 * @returns {string}
 */
    static langChangeItemName(typeId) {
        const item = new ItemStack(typeId)
        return item.localizationKey;
    }
    static addMoney(player, int) {
        const playerData = playerDatas.get(player.id);
        playerData.money += int;
        playerDatas.set(player.id, playerData);
    }
    static removeMoney(player, int) {
        const playerData = playerDatas.get(player.id);
        playerData.money -= int;
        playerDatas.set(player.id, playerData);
    }
    static getMoney(player) {
        return playerDatas.get(player.id)?.money ?? 0;
    }
    static setMoney(player, int) {
        const playerData = playerDatas.get(player.id);
        playerData.money = int;
        playerDatas.set(player.id, playerData);
    }
}