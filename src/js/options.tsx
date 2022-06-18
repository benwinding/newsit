import React from "react";
import ReactDOM from "react-dom";

import { Header } from "./ui/header";
import { SettingsForm } from "./ui/settings-form";

export function MyComp() {
  return (
    <div className="column">
      <Header />
      <SettingsForm isPopupPage={false} />
    </div>
  );
}

ReactDOM.render(<MyComp />, document.getElementById("app"));
