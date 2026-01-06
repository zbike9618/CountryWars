import * as server from "@minecraft/server"
const { world, system } = server;
import { ActionFormData, ModalFormData, MessageFormData } from "@minecraft/server-ui"
import { Util } from "./util.js";
const countryDatas = new Dypro("country");
export class MakeCountry {

    static async makeForm(player) {
        const form = new ModalFormData()
        form.title({ translate: "cw.mcform.title" })
        form.textField({ translate: "cw.mcform.WriteCountryNameLabel" }, { translate: "cw.mcform.WriteCountryNamePlaceholder" })//国名
        form.toggle({ translate: "cw.mcform.toggle" }, { defaultValue: false, tooltip: { translate: "cw.mcform.toggleTooltip" } })//平和主義か
        const res = await form.show(player)
        if (res.canceled) return;
        make(player, res.formValues)

    }
    //constructurはなし
    /**
     * 国を作る
     * @param {import("@minecraft/server").Entity} player 
     * 
     */
    static make(player, { countryName, isPeace }) {
        const countryData =
        {
            name: countryName,
            money: 0,
            isPeace: isPeace,

        }
        const id = countryDatas.idList.length + 1;
        countryDatas.set(id, countryData);
    }

}