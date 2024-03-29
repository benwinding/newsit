import { store } from './store';
import { MessageChannelObj, MessageChannelType } from "./models";
import { system } from "./browser";
import { Runtime } from "webextension-polyfill-ts";
import { MakeLogger } from "./logger";

type UnsubscribeFn = () => void;

const logger = MakeLogger("messages", store);

function handleMessageError(err: {message: string}) {
  const tabClosed = err.message.includes("Receiving end does not exist.");
  if (!tabClosed) {
    logger.error("requestWithResponse", err);
  }
}

export const MessageApi = {
  async requestWithResponse<T>(
    channel: MessageChannelType,
    tabId: number,
    data?: {}
  ): Promise<T> {
    const msg: MessageChannelObj = {
      channel: channel,
      data: data,
    };
    return system.tabs.sendMessage(tabId, msg).catch(handleMessageError);
  },
  async emitEvent(channel: MessageChannelType, data?: {}): Promise<void> {
    const msg: MessageChannelObj = {
      channel: channel,
      data: data,
    };
    logger.log("^ emitting event: ", msg);
    await system.runtime.sendMessage(msg).catch(handleMessageError);
  },
  async emitEventToTab(
    channel: MessageChannelType,
    tabId: number,
    data?: {}
  ): Promise<void> {
    const msg: MessageChannelObj = {
      channel: channel,
      data: data,
    };
    logger.log("^ emitting event to tab(" + tabId + "): ", msg);
    await system.tabs.sendMessage(tabId, msg).catch(handleMessageError);
  },
  onEvent<T>(
    channel: MessageChannelType,
    cb: (data: T, sender?: Runtime.MessageSender) => Promise<any>
  ): UnsubscribeFn {
    function listenerCallback(
      request: MessageChannelObj,
      sender: Runtime.MessageSender,
      sendResponse?: (value: any) => void,
    ): any {
      const sendingChannel = request && request.channel;
      if (sendingChannel !== channel) {
        return;
      }
      logger.log("> recieved event: " + sendingChannel, { request, sender });
      cb(request.data, sender).then(result => {
        logger.log("> sending back result to: " + sendingChannel, { result });
        sendResponse?.(result);
        return result;
      })
      return true;
    }
    logger.log(">> listener registered for events", { channel });
    system.runtime.onMessage.addListener(listenerCallback);
    function unSubscribe() {
      logger.log("<< unregistering listener", { channel });
      system.runtime.onMessage.removeListener(listenerCallback);
    }
    return unSubscribe;
  },
};
