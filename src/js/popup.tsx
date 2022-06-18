import React from "react";
import ReactDOM from "react-dom";

import { useApi } from "./ui/useApi";
import { Header } from "./ui/header";
import { SettingsForm } from "./ui/settings-form";

import { createPopupController } from "./popup.controller";

const pc = createPopupController();

export function PopupWindow() {
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
        <button onClick={() => pc.LaunchOptionsPage()} className="button">
          More Options
        </button>
      </section>
    </div>
  );
}

ReactDOM.render(<PopupWindow />, document.getElementById("app"));
