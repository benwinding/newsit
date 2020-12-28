import React from "react";
import ReactDOM from "react-dom";

import { useApi } from "./browser/useApi";

import { Header } from "./shared/header";
import { SettingsForm } from "./shared/settings-form";

import { createPopupController } from "./popup.controller";

const pc = createPopupController();

// let version = 0;
export function MyComp() {
  const [, fetchHn, loadingApi] = useApi<void>(async () => {
    await pc.SendCheckApiEvent();
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
          onClick={() => pc.LaunchOptionsPage()}
          className="button"
        >
          More Options
        </button>
      </section>
    </div>
  );
}

ReactDOM.render(<MyComp />, document.getElementById("app"));
