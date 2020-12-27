import React from "react";
import ReactDOM from "react-dom";

import { front } from "./browser/front";
import { MessageApi } from "./browser/messages";
import { useApi } from "./browser/useApi";
import { Header } from "./shared/header";
import { SettingsForm } from "./shared/settings-form";
import { setTimeoutAsyc } from "./shared/utils";

// let version = 0;
export function MyComp() {
  const [, fetchHn, loadingApi] = useApi<void>(async () => {
    const tabId = await front.getCurrentTabId();
    MessageApi.emitEventToTab("request_reddit", tabId);
    MessageApi.emitEventToTab("request_hn", tabId);
    await setTimeoutAsyc(200);
  }, null);

  return (
    <div className="column">
      <Header />
      <SettingsForm
        isPopupPage={true}
        onClickCheck={() => fetchHn()}
        isLoading={loadingApi}
      />
      <section className="section py-1">
        <button
          onClick={() => front.gotoOptionsPage()}
          className="button"
        >
          More Options
        </button>
      </section>
    </div>
  );
}

ReactDOM.render(<MyComp />, document.getElementById("app"));
