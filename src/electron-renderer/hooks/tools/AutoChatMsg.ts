import { IPCM } from "common/ipcEventConst";
import { TimeHelper } from "common/timer";
import { ipcRenderer } from "electron";

export default class AutoChatMsg {
    _isStarting = false;

    _interval: NodeJS.Timer | null = null;

    text: string = "";

    chatCount = 0;

    async start() {
        if (!this._isStarting) {
            this._isStarting = true;
            this.text = await this.getChatText();
            this.logic()
            this._interval = setInterval(async () => {
                this.text = await this.getChatText();

                if(!this.text) return

                if(this.chatCount > 9) {
                    // 使用喇叭
                    this.use()
                }

                this.logic()
            }, TimeHelper.minute(10));
        }
    }

    getChatText() {
        return new Promise<string>((resolve) => {
            ipcRenderer.once(IPCM.RECEIVE_CHAT_MSG, (_, text) => {
                if(typeof text === "string"){
                    resolve(text ?? "");
                }
            })

            ipcRenderer.send(IPCM.RECEIVE_CHAT_MSG)
        })
    }

    stop() {
        if (this._isStarting && this._interval) {
            this._isStarting = false;
            clearInterval(this._interval);
        }
    }

    use() {
        // 40049
        for (let n = window?.PlayerBag?.BAG_START; n < window.xself?.bag?.bagEnd; n++) {
            let i = window.xself.bag.getItem(n);
            if(i && i.id === 40049) {
                window.ItemManager.doItem(i)
                return
            }
        }
    }

    logic() {
        const { nato, MsgHandler, Define } = window

        nato.Network.sendCmd(MsgHandler.createChatMsg(Define.CHAT_TYPE_WORLD, this.text, -1), null, null)
        this.chatCount++
    }
}