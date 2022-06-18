export const DEFAULT_STATE: RootState = {
  isEnabled: true,
  hideWhenNoResults: false,
  btnsize: 0.8,
  btnzindex: 999,
  placement: "br",
  blackListed: [],
  debug: false,
};

export interface RootState {
  isEnabled: boolean;
  hideWhenNoResults: boolean;
  btnsize: number;
  btnzindex: number;
  placement: PlacementType;
  blackListed: string[];
  debug?: boolean;
}

export interface ButtonResult {
  text: string;
  link?: string;
  other_results?: OtherResult[];
}

export interface OtherResult {
  post_url: string;
  post_title: string;
  post_upvotes: number;
  post_date: string;
  post_by: string;
  comments_count: number;
  comments_link: string;
}

export type PlacementType = "br" | "bl" | "tr" | "tl";

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
  | "request_reddit_dom_parse"
  | "result_from_hn"
  | "result_from_reddit";
