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
  emitEvent<T>(channel: MessageChannelType, data: {}): void {
    const msg: MessageChannelObj = {
      channel: channel,
      data: data,
    };
    system.runtime.sendMessage(msg);
  },
  subscribeTo(channel: MessageChannelType, cb: (data: any, tabId?: number) => Promise<any>) {
    function listenerCallback(
      request: MessageChannelObj,
      sender: chrome.runtime.MessageSender,
      sendResponse: (data: any) => void
    ) {
      if (request.channel !== channel) {
        return;
      }
      const tabId = sender.tab && sender.tab.id;
      cb(request.data, tabId).then((result) => {
        sendResponse(result);
      });
      return true;
    }
    system.runtime.onMessage.addListener(listenerCallback);
  },
};
