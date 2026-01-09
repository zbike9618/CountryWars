import * as server from "@minecraft/server";
import { world, system, CommandPermissionLevel, CustomCommandStatus } from "@minecraft/server";
import * as ui from "@minecraft/server-ui";
import { JOB_CONFIG, JOB_LIMIT } from "../config/jobs_config.js";
import { Util } from "../utils/util";
import { default as config } from "../config/config.js";

/**
 * ブロック破壊時の処理
 */
world.afterEvents.playerBreakBlock.subscribe(ev => {
    const { player, brokenBlockPermutation } = ev;
    const blockId = brokenBlockPermutation.type.id;

    for (const jobId of ["miner", "lumberjack", "farmer", "netherdigger"]) { // ← 制限！
        if (!player.hasTag(`job:${jobId}`)) continue;

        const job = JOB_CONFIG[jobId];
        if (!job.blockRewards) continue;

        const reward = job.blockRewards[blockId];
        if (reward !== undefined) {
            Util.addMoney(player, reward)
            const score = Util.getMoney(player);
            player.runCommand(`titleraw @s actionbar {"rawtext":[{"text":"§a${job.name}として${config.coinname}${reward}獲得！ 残高: ${config.coinname}${score}"}]}`);

        }
    }
});

/**
 * ブロック設置時の処理
 * → 建築者(builder)と農夫(farmer)のみ
 */
world.afterEvents.playerPlaceBlock.subscribe(ev => {
    const { player, block } = ev;
    const blockId = block.typeId;

    for (const jobId of ["builder", "farmer"]) { // ← 制限！
        if (!player.hasTag(`job:${jobId}`)) continue;

        const job = JOB_CONFIG[jobId];
        if (!job.blockRewards) continue;

        const reward = job.blockRewards[blockId];
        if (reward !== undefined) {
            Util.addMoney(player, reward)
            const score = Util.getMoney(player);
            player.runCommand(`titleraw @s actionbar {"rawtext":[{"text":"§a${job.name}として${config.coinname}${reward}獲得！ 残高: ${config.coinname}${score}"}]}`);

        }
    }
});

/**
 * Mob討伐時の処理
 */
world.afterEvents.entityDie.subscribe(ev => {
    const { deadEntity, damageSource } = ev;
    const killer = damageSource?.damagingEntity;
    if (!killer) return;

    const mobId = deadEntity.typeId;

    for (const jobId of ["hunter"]) { // ← 制限！
        if (!killer.hasTag(`job:${jobId}`)) continue;

        const job = JOB_CONFIG[jobId];
        if (!job.mobRewards) continue;

        const reward = job.mobRewards[mobId];
        if (reward !== undefined) {
            Util.addMoney(killer, reward)
            const score = Util.getMoney(killer);
            killer.runCommand(`titleraw @s actionbar {"rawtext":[{"text":"§a${job.name}として${config.coinname}${reward}獲得！ 残高: ${config.coinname}${score}"}]}`);

        }
    }
});


// 職業選択フォーム
function show_form(player) {
    const form = new ui.ActionFormData();
    form.title("職業選択");

    const playerJobs = player.getTags().filter(tag => tag.startsWith("job:"));

    // JOB_CONFIG からボタンを生成（就職中なら緑色）
    for (const jobId in JOB_CONFIG) {
        const job = JOB_CONFIG[jobId];
        if (player.hasTag(`job:${jobId}`)) {
            form.button(`§a${job.name}（就職中）`);
        } else {
            form.button(job.name);
        }
    }

    form.show(player).then((response) => {
        if (response.canceled) return;

        const selectedJobId = Object.keys(JOB_CONFIG)[response.selection];
        const selectedJob = JOB_CONFIG[selectedJobId];

        if (player.hasTag(`job:${selectedJobId}`)) {
            // すでに就職している → 離職
            player.removeTag(`job:${selectedJobId}`);
            sendActionBar(player, `§e職業「${selectedJob.name}」を辞めました`);
        } else {
            // 上限チェック
            if (playerJobs.length >= JOB_LIMIT) {
                sendActionBar(player, `§c職業は最大 ${JOB_LIMIT} 個までです！`);
                return;
            }
            // 新しく就職
            player.addTag(`job:${selectedJobId}`);
            sendActionBar(player, `§a職業「${selectedJob.name}」に就きました！`);
        }

        system.run(() => show_form(player));

    }).catch(error =>
        player.sendMessage("An error occurred: " + error.message)
    );
}


function sendActionBar(player, message) {
    player.runCommand(`titleraw @s actionbar {"rawtext":[{"text":"${message}"}]}`);
}
server.system.beforeEvents.startup.subscribe(ev => {
    ev.customCommandRegistry.registerCommand({
        name: "cw:jobs",
        description: "職業を選択するコマンド",
        permissionLevel: server.CommandPermissionLevel.Any,
        mandatoryParameters: [
        ],
        optionalParameters: [
        ]
    }, (origin, arg) => {
        if (origin.sourceEntity?.typeId === "minecraft:player") {
            let player = origin.sourceEntity;
            system.run(() => {  // 1tick後に安全に実行
                show_form(player);
            });
        }
    });
});

server.system.beforeEvents.startup.subscribe(ev => {
    ev.customCommandRegistry.registerCommand({
        name: "cw:money",
        description: "所持金を表示するコマンド",
        permissionLevel: server.CommandPermissionLevel.Any,
        mandatoryParameters: [
        ],
        optionalParameters: [
        ]
    }, (origin, arg) => {
        if (origin.sourceEntity?.typeId === "minecraft:player") {
            let player = origin.sourceEntity;
            system.run(() => {  // 1tick後に安全に実行
                const score = Util.getMoney(player);
                player.sendMessage(`§a所持金:${config.coinname}${score}`);
            });
        }
    });
});