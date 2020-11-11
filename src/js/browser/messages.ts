import { MessageChannelObj, MessageChannelType, RootState } from "./models";
import { system } from "./browser";

export const MessageApi = {
  onStorageChanged(storageKey: keyof RootState, cb: (newValue: any) => void) {
    type StorageChanges = { [key: string]: chrome.storage.StorageChange };
    function listenerCallback(changes: StorageChanges) {
      Object.entries(changes).map(([key, val]) => {
        if (key === storageKey) {
          cb(val.newValue);
        }
      });
    }
    system.storage.onChanged.addListener(listenerCallback);
  },
  requestWithResponse<T>(channel: MessageChannelType, data?: {}): Promise<T> {
    return new Promise((resolve) => {
      const msg: MessageChannelObj = {
        channel: channel,
        data: data,
      };
      system.runtime.sendMessage(msg, (response) => {
        resolve(response);
      });
    });
  },
  emitEvent(channel: MessageChannelType, data?: {}): void {
    const msg: MessageChannelObj = {
      channel: channel,
      data: data,
    };
    system.runtime.sendMessage(msg);
  },
  emitEventToTab(channel: MessageChannelType, tabId: number, data?: {}): void {
    const msg: MessageChannelObj = {
      channel: channel,
      data: data,
    };
    system.tabs.sendMessage(tabId, msg);
  },
  onEvent<T>(
    channel: MessageChannelType,
    cb: (data: T, sender?: chrome.runtime.MessageSender) => Promise<any> | any
  ): void {
    function listenerCallback(
      request: MessageChannelObj,
      sender: chrome.runtime.MessageSender,
    ) {
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
