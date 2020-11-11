export interface RootState {
  isEnabled: boolean;
  btnsize: number;
  placement: PlacementType;
  blackListed: string[];
}

export interface ButtonResult {
  text: string;
  link?: string;
}

export type PlacementType = 'br' | 'bl' | 'tr' | 'tl';

export interface MessageChannelObj {
  channel: MessageChannelType;
  data: any;
}

export type MessageChannelType =
  | "check_active_tab"
  | "tab_active"
  | "change_icon_enable"
  | "request_hn"
  | "request_reddit"
  | "result_from_hn"
  | "result_from_reddit";
