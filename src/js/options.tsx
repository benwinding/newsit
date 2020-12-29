import React from "react";
import ReactDOM from "react-dom";
import { createOptionsController } from "./options.controller";

import { Header } from "./shared/header";
import { SettingsForm } from "./shared/settings-form";

const oc = createOptionsController();

export function MyComp() {
  const [hosts, setHosts] = React.useState<string[]>([]);

  React.useEffect(() => {
    let mounted = true;

    oc.ListenBlackListedChanged((blackListed) => {
      mounted && setHosts(blackListed);
    });

    return () => (mounted = false);
  }, []);

  function removeHostFromList(hostToRemove: string) {
    oc.RemoveHostFromList(hostToRemove);
  }

  const items = hosts.map((hostItem, index) => (
    <div
      className="py-3"
      key={index}
      style={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <button
        className="delete mr-3"
        onClick={() => removeHostFromList(hostItem)}
      ></button>
      <p>{hostItem}</p>
    </div>
  ));

  return (
    <div className="column">
      <Header />
      <SettingsForm isPopupPage={false} />
      <section className="hero is-bold">
        <div className="hero-body">
          <div className="container">
            <h4 className="title">Disabled Sites</h4>
          </div>
        </div>
      </section>
      <section className="hero is-light">
        <div className="hero-body">
          <div className="container">{items}</div>
        </div>
      </section>
    </div>
  );
}

ReactDOM.render(<MyComp />, document.getElementById("app"));
