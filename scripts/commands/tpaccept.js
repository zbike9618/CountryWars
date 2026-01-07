import * as server from "@minecraft/server"
const { world, system, } = server;
import { ActionFormData, ModalFormData, MessageFormData } from "@minecraft/server-ui"
import { ShortPlayerData } from "../utils/playerData";
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
            status: server.CustomCommandStatus.Failure, // 失敗
            message: "実行者はプレイヤーである必要があります",
        }
    }
    const player = origin.sourceEntity;
    const target = selector ? selector[0] : undefined
    //関数を実行する（制限された実行コンテキストから抜けるためsystem.run()を使用）
    system.run(() => {
        tpaccept(player, target);
    });


    // コマンド結果を返す
    return {
        status: server.CustomCommandStatus.Success, // 成功
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

    const playerData = new ShortPlayerData(player.id)
    form.title({ translate: "cw.tpaform.title" })
    form.button({ translate: "cw.tpaform.accept" })
    form.button({ translate: "cw.tpaform.recieve", with: [`${(playerData.get("tpa") || []).length}`] })
    const res = await form.show(player)
    if (res.canceled) return;
    if (res.selection == 0) {
        tpaSendForm(player)
    }
    if (res.selection == 1) {
        tpaRecieve(player)
    }
}
/**
 * 
 * @param {import("@minecraft/server").Player} player 
 */
async function tpaRecieve(player) {
    const playerData = new ShortPlayerData(player.id)
    const form = new ActionFormData()
    const tpaArray = playerData.get("tpa")
    if (!tpaArray) {
        const mform = new MessageFormData()
        mform.title({ translate: "cw.tpaform.recieve", with: [`0`] })
        mform.body({ translate: "cw.tpaformR.nobodyAccept" })
        mform.button1({ translate: "cw.form.redo" })
        mform.button2({ translate: "cw.form.cancel" })
        const respone = await mform.show(player)
        if (respone.canceled) return;
        if (respone.selection == 0) {
            tpaForm(player)
        }
        return;
    }
    form.title({ translate: "cw.tpaform.recieve", with: [`${tpaArray.length}`] })
    for (const playerId of tpaArray) {
        const playerData = playerDatas.get(playerId)
        form.button(playerData.name)
    }
    const res = await form.show(player)
    if (res.canceled) return;
    const playerId = tpaArray[res.selection]
    const target = playerDatas.get(playerId);
    const mform = new MessageFormData()
    mform.title({ translate: "cw.tpaform.recieve", with: [`0`] })
    mform.body({ translate: "cw.tpaformR.body", with: [target.name, player.name] })
    mform.button2({ translate: "cw.form.deny" })
    mform.button1({ translate: "cw.form.accept" })
    const respone = await mform.show(player)
    if (respone.canceled) return;
    if (respone.selection == 0) {
        player.teleport(world.getEntity(playerId).location)
        playerData.remove("tpa", res.selection)
    }
}

async function tpaSendForm(player) {
    const form = new ActionFormData()
    form.title({ translate: "cw.tpaform.accept" })
    const AllPlayerIds = world.getAllPlayers().filter(p => p != player).map(player => player.id)
    if (AllPlayerIds.length == 0) {
        const mform = new MessageFormData()
        mform.title({ translate: "cw.tpaform.accept" })
        mform.body({ translate: "cw.tpaformS.nobodyAccept" })
        mform.button1({ translate: "cw.form.redo" })
        mform.button2({ translate: "cw.form.cancel" })
        const respone = await mform.show(player)
        if (respone.canceled) return;
        if (respone.selection == 0) {
            tpaForm(player)
        }
        return;
    }
    for (const playerId of AllPlayerIds) {
        const playerData = playerDatas.get(playerId)
        form.button(playerData.name)
    }
    const res = await form.show(player)
    if (res.canceled) return;
    const playerId = AllPlayerIds[res.selection]
    const target = playerDatas.get(playerId);
    const mform = new MessageFormData()
    mform.title({ translate: "cw.tpaform.accept" })
    mform.body({ translate: "cw.tpaformS.body", with: [player.name, target.name] })
    mform.button2({ translate: "cw.form.no" })
    mform.button1({ translate: "cw.form.yes" })
    const respone = await mform.show(player)
    if (respone.canceled) return;
    if (respone.selection == 0) {
        tpaSend(player, world.getEntity(playerId))
    }
}
function tpaSend(player, target) {
    const playerData = new ShortPlayerData(target.id)
    const tpa = playerData.get("tpa") || [];
    if (tpa.includes(player.id)) {

        player.sendMessage({ translate: "cw.tpa.secondsend", with: [target.name] })
        target.sendMessage({ translate: "cw.tpa.secondnotice", with: [player.name] })
        return;
    }
    tpa.push(player.id)
    playerData.set("tpa", tpa)
    player.sendMessage({ translate: "cw.tpa.send", with: [target.name] })
    target.sendMessage({ translate: "cw.tpa.notice", with: [player.name] })

}
