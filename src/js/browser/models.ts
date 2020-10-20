export interface RootState {
  isEnabled: boolean;
  btnsize: number;
  placement: string;
  blackListed: string[];
}

export interface MessageChannelObj {
  channel: MessageChannelType;
  data: any;
}

export type MessageChannelType =
  | "check_active_tab"
  | "tab_active"
  | "change_icon_enable"
  | "request_hn"
  | "request_reddit";
