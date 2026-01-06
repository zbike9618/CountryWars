import * as server from "@minecraft/server"
const { world, system, } = server;
import { ActionFormData, ModalFormData } from "@minecraft/server-ui"
import { Dypro } from "../utils/dypro";
const playerDatas = new Dypro("player");
system.beforeEvents.startup.subscribe(ev => {
    /**
     * setLivesコマンドを定義
     * @type {import("@minecraft/server").CustomCommand}
     */
    const command = {
        name: "cw:tpaccept", // コマンド名
        description: "特定のプレイヤーにtpする", // コマンド説明
        permissionLevel: server.CommandPermissionLevel.Any, // 権限レベル: ope
        // 必須の引数
        mandatoryParameters: [
        ], // なし
        // 引数
        optionalParameters: [
            { name: "cw:target", type: server.CustomCommandParamType.PlayerSelector }

        ],
    }
    const scommand = {
        name: "cw:tpa", // コマンド名
        description: "特定のプレイヤーにtpする", // コマンド説明
        permissionLevel: server.CommandPermissionLevel.Any, // 権限レベル: ope
        // 必須の引数
        mandatoryParameters: [
        ], // なし
        // 引数
        optionalParameters: [
            { name: "cw:target", type: server.CustomCommandParamType.PlayerSelector }
        ],
    }

    ev.customCommandRegistry.registerCommand(command, DoCommand);
    ev.customCommandRegistry.registerCommand(scommand, DoCommand);
});

function DoCommand(origin, selector) {
    // もし実行者エンティティの種族がプレイヤーではないなら
    if (origin.sourceEntity?.typeId !== "minecraft:player") {
        // コマンド結果を返す
        return {
            status: CustomCommandStatus.Failure, // 失敗
            message: "実行者はプレイヤーである必要があります",
        }
    }
    const player = origin.sourceEntity;
    const target = selector[0];
    //関数を実行する
    tpaccept(player, target);


    // コマンド結果を返す
    return {
        status: CustomCommandStatus.Success, // 成功
        message: undefined, // メッセージなし
    }
}
/**
 * 
 * @param {import("@minecraft/server").Player} player 
 * @param {import("@minecraft/server").Player} target 
 */
function tpaccept(player, target = undefined) {
    if (target) {
        tpaSend(player, target)
    } else {
        tpaForm(player)
    }
}
async function tpaForm(player) {
    const form = new ActionFormData()

    const playerData = playerDatas.get(player.id)
    form.title({ translate: "cw.tpaform.title" })
    form.button({ translate: "cw.tpaform.accept" })
    form.button({ translate: "cw.tpaform.recieve" } + { text: `()` })
    const res = await form.show(player)
    if (res.canceled) return;
    if (res.selection == 0) {
        tpaSendForm(player)
    }
    if (res.selection == 1) {
        tpaRecieve(player)
    }
}
async function tpaRecieve(player) {
    const form = new ActionFormData()
    form.title({ translate: "cw.tpaform.title" })

    const res = await form.show(player)
}
