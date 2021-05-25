import { RootState } from "./models";

export interface IStore {
  GetStorage<T extends Partial<RootState>>(defaultValues: T): Promise<T>;
  SetStorage<T extends Partial<RootState>>(newValues: T): Promise<void>;
  OnStorageChanged(
    storageKey: keyof RootState,
    cb: (newValue: any) => void,
    defaultValue?: any
  ): void;
}
