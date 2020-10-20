import React from "react";
import ReactDOM from "react-dom";

import { front } from "./browser/front";
// import * as store from "./shared/store";
// const logg = core.logger.MakeLogger("content.js");

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
  front.sendMessage('change_icon_enable', iconOn);
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
    front.sendMessage('change_icon_enable', iconOn);
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

/* 

Vue.config.productionTip = false;
import { core, sys } from "./shared/core";
import { store } from "./shared/store";

{




    .then((items) => {
      new Vue({
        el: "#app",
        data: {
          formBtnsEnabled: items.isEnabled,
          formBtnsSize: items.btnsize,
          formBtnsLocation: items.placement,
          options: {
            formBtnsLocation: [
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
            ],
          },
          version: 0,
          formCurrentSiteEnabled: true,
          isLoadingBtn: false,
        },
        created: function () {
          // `this` points to the vm instance
          let a = this;
          getIsNotBlackListed().then((isBlackListed) => {
            a.formCurrentSiteEnabled = isBlackListed;
          });
          store.getVersion().then((version) => {
            this.version = version;
          });
        },
        computed: {
          btnSizePx: function () {
            const val = this.formBtnsSize;
            const max = 129;
            const min = 19;
            const scaled = (val - 0.2) * 38 + 2 * 14;
            return scaled;
          },
        },
        watch: {
          formBtnsEnabled: function (val, oldVal) {
            store.setEnabledAll(val);
            logg.log("formBtnsEnabled changed to: " + val);
          },
          formBtnsSize: function (val, oldVal) {
            store.setBtnSize(val);
            logg.log("formBtnsSize changed to: " + val);
          },
          formBtnsLocation: function (val, oldVal) {
            store.setBtnPlacement(val);
            logg.log("formBtnsLocation changed to: " + val);
          },
          formCurrentSiteEnabled: function (val, oldVal) {
            store
              .getCurrentTabUrl()
              .then((thisUrl) => {
                if (val) removeHostFromBlackList(thisUrl);
                else addHostToBlackList(thisUrl);
                let action = "nowActive";
                this.messageCurrentTab({
                  action: action,
                });
              })
              .catch((err) => {
                logg.error(err);
              });
          },
        },
        methods: {
          messageCurrentTab: function (request) {
            sys.tabs.query(
              {
                active: true,
                windowType: "normal",
                currentWindow: true,
              },
              function (d) {
                let tabId = d[0].id;
                logg.log(
                  "Sending to tab with message, with request: " +
                    JSON.stringify(request)
                );
                sys.tabs.sendMessage(tabId, request);
              }
            );
          },
          onClickCheckNow: function (e) {
            // Called when the user clicks on the browser action.
            this.messageCurrentTab({
              action: "check",
            });
            const a = this;
            a.isLoadingBtn = true;
            setTimeout(function () {
              a.isLoadingBtn = false;
            }, 1000);
          },
        },
      });
    });
}

*/
