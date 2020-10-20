import { MessageChannelObj, MessageChannelType, RootState } from "./models";
import { system } from "./browser";

export class BackApi {
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
  }

  onMessage(channel: MessageChannelType, cb: (data: any) => void) {
    function listenerCallback(
      request: MessageChannelObj,
      sender: chrome.runtime.MessageSender,
      sendResponse: (data: any) => void
    ) {
      if (request.channel !== channel) {
        return;
      }
      sendResponse(request.data);
      !!cb && cb(request.data);
    }
    system.runtime.onMessage.addListener(listenerCallback);
  }
}
