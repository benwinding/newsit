import React from "react";
import ReactDOM from "react-dom";

import { front } from "./browser/front";
import { MessageApi } from "./browser/messages";

async function getIsBlackListed() {
  const thisUrl = await front.getCurrentTabUrl();
  const isBlackListed = await front.isBlackListed(thisUrl);
  return isBlackListed;
}

async function setHostBlacklisted(url: string, isBlackListed: boolean) {
  if (isBlackListed) {
    await front.setHostDontRun(url);
  } else {
    await front.setHostRun(url);
  }
  // const tabId = await front.getCurrentTabId();
  const isAllEnabled = await front.getIsAllEnabled();
  const iconOn = isAllEnabled && !isBlackListed;
  MessageApi.emitEvent('change_icon_enable', iconOn);
}

const formBtnsLocation = [
  {
    value: "br",
    text: "Bottom Right",
  },
  {
    value: "bl",
    text: "Bottom Left",
  },
  {
    value: "tr",
    text: "Top Right",
  },
  {
    value: "tl",
    text: "Top Left",
  },
];

const calculateBtnSize = (val: number) => {
  const max = 129;
  const min = 19;
  const scaled = (val - 0.2) * 38 + 2 * 14;
  return scaled;
};

// let version = 0;
export function MyComp(props: any) {
  const [version, setVersion] = React.useState(null);
  const [hasSiteEnabled, setHasSiteEnabled] = React.useState(false);
  const [hasRunAutomatic, setHasRunAutomatic] = React.useState(false);
  const [btnsLocation, setBtnsLocation] = React.useState("br");
  const [formBtnsSize, setFormBtnsSize] = React.useState(1);
  const [btnSizePx, setBtnSizePx] = React.useState(calculateBtnSize(1));
  const [currentUrl, setCurrentUrl] = React.useState("");
  const [currentTabId, setCurrentTabId] = React.useState(0);

  React.useEffect(() => {
    let isMounted = true;
    front
      .getStorage({
        isEnabled: true,
        btnsize: 0.8,
        placement: "br",
      })
      .then((vals) => {
        if (!isMounted) return;
        setHasRunAutomatic(vals.isEnabled);
        setFormBtnsSize(vals.btnsize);
        setBtnSizePx(calculateBtnSize(vals.btnsize));
        setBtnsLocation(vals.placement);
      });
    front.getCurrentTabUrl().then((currentUrl) => {
      isMounted && setCurrentUrl(currentUrl);
    });
    front.getCurrentTabId().then((tabId) => {
      isMounted && setCurrentTabId(tabId);
    });
    front.getVersion().then((version: any) => {
      isMounted && setVersion(version);
    });
    getIsBlackListed().then((isBlackListed) => {
      const siteIsEnabled = !isBlackListed;
      isMounted && setHasSiteEnabled(siteIsEnabled);
    });
    return () => (isMounted = false);
  }, []);

  const siteEnabledChanged = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    const isBlackListed = !checked;
    setHostBlacklisted(currentUrl, isBlackListed);
    setHasSiteEnabled(checked);
  };
  const runAutomaticChanged = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const allEnabled = e.target.checked;
    setHasRunAutomatic(allEnabled);
    front.setEnabledAll(allEnabled);
    const iconOn = allEnabled && hasSiteEnabled;
    MessageApi.emitEvent('change_icon_enable', iconOn);
  };
  const onBtnsLocationChanged = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setBtnsLocation(value);
  };
  const onFormBtnsSize = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = +e.target.value;
    setFormBtnsSize(value);
    setBtnSizePx(calculateBtnSize(value));
  };

  return (
    <div className="column">
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
      <section id="newsit-form" className="section">
        <section className="form">
          <div className="field">
            <div className="control has-text-centered">
              <button className="button is-info">Check Current Page</button>
            </div>
          </div>
          <div className="field">
            <div className="control">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={hasSiteEnabled}
                  onChange={siteEnabledChanged}
                />
                <span className="ml-2">Enabled on this website</span>
              </label>
            </div>
          </div>
          <div className="field">
            <div className="control">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={hasRunAutomatic}
                  onChange={runAutomaticChanged}
                />
                <span className="ml-2">Run automatically on page load</span>
              </label>
            </div>
          </div>
          <div className="field">
            <label className="label">Links Location</label>
            <div className="control">
              <div className="select">
                <select value={btnsLocation} onChange={onBtnsLocationChanged}>
                  <option disabled value="">
                    Nothing selected
                  </option>
                  {formBtnsLocation.map((item) => {
                    return (
                      <option value={item.value} key={item.value}>
                        {item.text}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>
          <div className="field">
            <label className="label">Link Size</label>
            <div className="control">
              <input
                type="range"
                value={formBtnsSize}
                onChange={onFormBtnsSize}
                min="0.2"
                max="2"
                step="0.05"
              />
              <span>{formBtnsSize}</span>
            </div>
            <div>
              <img
                id="btnsPreview"
                src="https://i.imgur.com/dVvDrfN.png"
                style={{ height: btnSizePx + "px" }}
              />
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}

ReactDOM.render(<MyComp />, document.getElementById("app"));
