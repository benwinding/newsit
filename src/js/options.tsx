import React from "react";
import ReactDOM from "react-dom";

import { Header } from "./shared/header";
import { SettingsForm } from "./shared/settings-form";

export function MyComp() {
  return (
    <div className="column">
      <Header />
      <SettingsForm isPopupPage={false} />
    </div>
  );
}

ReactDOM.render(<MyComp />, document.getElementById("app"));
