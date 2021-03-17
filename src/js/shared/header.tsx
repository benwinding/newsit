import React from "react";
import { system } from "../browser/browser";

export function Header() {
  const [version, setVersion] = React.useState(null);

  React.useEffect(() => {
    let isMounted = true;
    const ver = system.runtime.getManifest().version;
    setVersion(ver);
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="hero is-dark is-bold">
      <div id="newsit-header" className="hero-body">
        <div className="container">
          <a href="https://newsit.benwinding.com" target="_blank">
            <img src="img/icon.svg" style={{ width: "90px" }} />
          </a>
          <p className="is-pulled-right">version: {version}</p>
        </div>
      </div>
    </section>
  );
}
