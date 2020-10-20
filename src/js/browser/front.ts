import { MessageChannelObj, MessageChannelType, RootState } from "./models";
import { system } from "./browser";
export { logger } from "../shared/logger";

export class FrontApi {
  async sendMessage<T>(channel: MessageChannelType, data: {}): Promise<T> {
    return new Promise((resolve) => {
      const msg: MessageChannelObj = {
        channel: channel,
        data: data,
      };
      system.runtime.sendMessage(msg, (response) => {
        resolve(response);
      });
    });
  }

  async getStorage<T extends Partial<RootState>>(defaultValues: T): Promise<T> {
    return new Promise((resolve, reject) => {
      system.storage.sync.get(defaultValues, (values) => {
        resolve(values as T);
      });
    });
  }
}
