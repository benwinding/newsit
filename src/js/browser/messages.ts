import { MessageChannelObj, MessageChannelType, RootState } from "./models";
import { getBrowserInstance } from "./browser";
import { Runtime } from "webextension-polyfill-ts";

const system = getBrowserInstance();

export const MessageApi = {
  async requestWithResponse<T>(channel: MessageChannelType, data?: {}): Promise<T> {
    const msg: MessageChannelObj = {
      channel: channel,
      data: data,
    };
    return system.runtime.sendMessage(msg).catch((err) => {
      const tabClosed = err.message.includes("Receiving end does not exist.");
      if (!tabClosed) {
        console.error("requestWithResponse", err);
      }
    });
  },
  emitEvent(channel: MessageChannelType, data?: {}): Promise<any> {
    const msg: MessageChannelObj = {
      channel: channel,
      data: data,
    };
    return system.runtime.sendMessage(msg);
  },
  emitEventToTab(
    channel: MessageChannelType,
    tabId: number,
    data?: {}
  ): Promise<any> {
    const msg: MessageChannelObj = {
      channel: channel,
      data: data,
    };
    return system.tabs.sendMessage(tabId, msg);
  },
  onEvent<T>(
    channel: MessageChannelType,
    cb: (data: T, sender?: Runtime.MessageSender) => Promise<any> | any
  ): void {
    async function listenerCallback(
      request: MessageChannelObj,
      sender: Runtime.MessageSender
    ): Promise<any> {
      const sendingChannel = request && request.channel;
      if (sendingChannel !== channel) {
        return;
      }
      console.log("onEvent: " + sendingChannel, { request });
      cb(request.data, sender);
      return true;
    }
    system.runtime.onMessage.addListener(listenerCallback);
  },
};
