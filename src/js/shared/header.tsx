import React from 'react';
import { front } from '../browser/front';

export function Header() {
  const [version, setVersion] = React.useState(null);

  React.useEffect(() => {
    let isMounted = true;
    front.getVersion().then((version: any) => {
      isMounted && setVersion(version);
    });
    return () => isMounted = false;
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
