import { ButtonResult } from "../shared/models";
import { alist } from "../shared/allowlist";
import { getTabUrl, logger, makeRequest, processResults } from "./api";
import { MessageApi } from "../shared/messages";
import { getCurrentTab } from "../shared/browser";
import { ResultItem } from "../shared/ResultItem";

export async function onRequestBackgroundReddit(
  tabId: number
): Promise<ButtonResult> {
  const searchUrl = await getTabUrl(tabId);
  const blocked = await alist.IsUrlBlackListed(searchUrl);
  if (blocked) {
    logger.log("Reddit API: Url blocked");
    return {
      text: "-",
    };
  }
  const queryString = "sort=top&q=" + encodeURIComponent("url:" + searchUrl);
  const requestUrl = "https://old.reddit.com/search?" + queryString;
  const data = await makeRequest(requestUrl, false);
  const tab = await getCurrentTab();
  const itemsAll = await MessageApi.requestWithResponse<ResultItem[]>('request_reddit_dom_parse', tab.id, data);
  if (itemsAll.length == 0) {
    logger.log("Reddit API: No urls matches found");
    return {
      text: "-",
    };
  }
  const itemsResults = processResults(itemsAll, searchUrl);
  logger.log("Reddit API: parsing api", { response: data, tab, itemsAll, itemsResults });
  return itemsResults;
}
