import React from "react";
import ReactDOM from "react-dom";

import { front } from "./browser/front";
import { MessageApi } from "./browser/messages";
import { PlacementType } from "./browser/models";
import { useApi } from "./browser/react-utils";

async function getIsBlackListed() {
  const thisUrl = await front.getCurrentTabUrl();
  const isBlackListed = await front.isBlackListed(thisUrl);
  return isBlackListed;
}

export function debounce<T>(
  fn: (v: T) => void,
  delayMs: number
): (v: T) => void {
  let timeoutID = 0;
  return function () {
    clearTimeout(timeoutID);
    var args = arguments;
    var that = this;
    timeoutID = setTimeout(function () {
      fn.apply(that, args);
    }, delayMs);
  };
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
  MessageApi.emitEvent("change_icon_enable", iconOn);
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

const setTimeoutAsyc = (ms: number) =>
  new Promise((res) => setTimeout(res, ms));

const debounceSetEnabled = debounce<boolean>(
  (val) => front.setEnabledAll(val),
  300
);
const debounceSetPlacement = debounce<PlacementType>(
  (val) => front.setStorage({ placement: val }),
  300
);
const debounceSetSize = debounce<number>(
  (val) => front.setStorage({ btnsize: val }),
  300
);

// let version = 0;
export function MyComp(props: any) {
  const [version, setVersion] = React.useState(null);
  const [hasSiteEnabled, setHasSiteEnabled] = React.useState(false);
  const [hasRunAutomatic, setHasRunAutomatic] = React.useState(false);
  const [btnsLocation, setBtnsLocation] = React.useState("br" as PlacementType);
  const [formBtnsSize, setFormBtnsSize] = React.useState(1);
  const [currentUrl, setCurrentUrl] = React.useState("");
  const [result, fetchHn, loadingHn] = useApi<void>(async () => {
    const tabId = await front.getCurrentTabId();
    MessageApi.emitEventToTab("request_hn", tabId);
    await setTimeoutAsyc(200);
  }, null);

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
        setBtnsLocation(vals.placement);
      });
    front.getCurrentTabUrl().then((currentUrl) => {
      isMounted && setCurrentUrl(currentUrl);
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
  const runAutomaticChanged = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const allEnabled = e.target.checked;
    setHasRunAutomatic(allEnabled);
    debounceSetEnabled(allEnabled);
    const iconOn = allEnabled && hasSiteEnabled;
    MessageApi.emitEvent("change_icon_enable", iconOn);
  };
  const onBtnsLocationChanged = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value as PlacementType;
    setBtnsLocation(value);
    debounceSetPlacement(value);
  };
  const onFormBtnsSizeChanged = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = +e.target.value;
    setFormBtnsSize(value);
    debounceSetSize(value);
  };

  async function onClickCheck() {
    return fetchHn();
  }

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
              <button
                onClick={(e) => !loadingHn && onClickCheck()}
                disabled={loadingHn}
                className={"button is-info " + (loadingHn ? "is-loading" : "")}
              >
                Check Current Page
              </button>
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
                onChange={onFormBtnsSizeChanged}
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
                style={{ width: "100px", zoom: formBtnsSize }}
              />
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}

ReactDOM.render(<MyComp />, document.getElementById("app"));
