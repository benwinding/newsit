import { RootState } from "./models";

export interface IStore {
  GetStorage(): Promise<RootState>;
  SetStorage<T extends Partial<RootState>>(newValues: T): Promise<void>;
  OnStorageChanged(
    storageKey: keyof RootState,
    cb: (newValue: any) => void
  ): void;
}
