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
  | "host_add_to_list"
  | "host_remove_from_list"
  | "check_active_tab"
  | "tab_url_changed"
  | "request_api"
  | "result_from_hn"
  | "result_from_reddit";
