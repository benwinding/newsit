import { core } from "./shared/core";
import { store } from "./shared/store";
const logg = core.logger.MakeLogger("content.js");

// let version = 0;
export function MyComp(props) {
  const [version, setVersion] = React.useState(0);

  React.useEffect(() => {
    let isMounted = true;
    store.getVersion().then((version) => {
      isMounted && setVersion(version);
    });
    return () => (isMounted = false);
  }, [version]);

  return (
    <div className="column">
      <section className="hero is-dark is-bold">
        <div id="newsit-header" className="hero-body">
          <div className="container">
            <a href="https://newsit.benwinding.com" target="_blank">
              <img src="img/icon.svg" style={{width: "90px"}} />
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
                <input type="checkbox" v-model="formCurrentSiteEnabled" />
                Enabled on this website
              </label>
            </div>
          </div>
          <div className="field">
            <div className="control">
              <label className="checkbox">
                <input type="checkbox" v-model="formBtnsEnabled" />
                Run automatically on page load
              </label>
            </div>
          </div>
          <div className="field">
            <label className="label">Links Location</label>
            <div className="control">
              <div className="select">
                <select v-model="formBtnsLocation">
                  <option disabled value="">
                    Nothing selected
                  </option>
                  <option>{/* {{ option.text }} */}</option>
                </select>
              </div>
            </div>
          </div>
          <div className="field">
            <label className="label">Link Size</label>
            <div className="control">
              <input
                type="range"
                v-model="formBtnsSize"
                min="0.2"
                max="2"
                step="0.05"
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

  function getIsHostBlackListed() {
    return new Promise((resolve, reject) => {
      store
        .getCurrentTabUrl()
        .then((thisUrl) => store.isNotBlackListed(thisUrl))
        .then(() => resolve(true))
        .catch((err) => {
          logg.errPopup(err);
          resolve(false);
        });
    });
  }

  function removeHostFromBlackList(url) {
    store.removeHostFromBlackList(url);
    store
      .getCurrentTabId()
      .then((tabId) => core.sendMessageIconEnabled(true, tabId));
  }

  function addHostToBlackList(url) {
    store.addHostToBlackList(url);
    store
      .getCurrentTabId()
      .then((tabId) => core.sendMessageIconEnabled(false, tabId));
  }

  core
    .getStorage({
      isEnabled: true,
      btnsize: 0.8,
      placement: "br",
    })
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
          getIsHostBlackListed().then((isBlackListed) => {
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
