import React from "react";
import ReactDOM from "react-dom";
import { front } from "./browser/front";

import { Header } from "./shared/header";
import { SettingsForm } from "./shared/settings-form";

// let version = 0;
export function MyComp() {
  const [hosts, setHosts] = React.useState<string[]>([]);

  React.useEffect(() => {
    let mounted = true;
    front.getBlackListedHosts().then((blackListed) => {
      mounted && setHosts(blackListed);
    });
    return () => (mounted = false);
  }, []);

  function removeHostFromList(host: string) {
    front.blackListRemove(host);
    setHosts(hosts.filter((h) => h !== host));
  }

  const items = hosts.map((hostItem, index) => (
    <div className="columns is-mobile" key={index}>
      <div className="column is-narrow">
        <button
          className="delete"
          onClick={() => removeHostFromList(hostItem)}
        ></button>
      </div>
      <div className="column is-info">{hostItem}</div>
    </div>
  ));

  return (
    <div className="column">
      <Header />
      <SettingsForm isPopupPage={false} />
      <section className="hero is-bold">
        <div id="newsit-header" className="hero-body">
          <div className="container">
            <h4 className="title has-text-centered">Disabled Sites</h4>
          </div>
        </div>
      </section>
      <section className="hero is-light">
        <div className="container">
          <div className="column is-6">{items}</div>
        </div>
      </section>
    </div>
  );
}

ReactDOM.render(<MyComp />, document.getElementById("app"));
