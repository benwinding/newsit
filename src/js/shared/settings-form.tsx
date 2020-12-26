import React from "react";
import { front } from "../browser/front";
import { MessageApi } from "../browser/messages";
import { PlacementType } from "../browser/models";
import { debounce } from "./utils";

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

const debounceSetAllEnabled = debounce<boolean>(
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

async function changeHostBlacklisted(isBlackListed: boolean) {
  const url = await front.getCurrentTabUrl();
  if (isBlackListed) {
    await front.blackListAdd(url);
  } else {
    await front.blackListRemove(url);
  }
  const isAllEnabled = await front.getIsAllEnabled();
  const iconOn = isAllEnabled && !isBlackListed;
  MessageApi.emitEvent("change_icon_enable", iconOn);
}

export function SettingsForm(props: {
  isPopupPage: boolean;
  onClickCheck?(): void;
  isLoading?: boolean;
}) {
  const { onClickCheck, isLoading, isPopupPage } = props;

  const [hasSiteEnabled, setHasSiteEnabled] = React.useState(false);
  const [hasAllEnabled, setHasAllEnabled] = React.useState(false);
  const [btnsPlacement, setBtnsPlacement] = React.useState(
    "br" as PlacementType
  );
  const [formBtnsSize, setFormBtnsSize] = React.useState(1);

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
        setHasAllEnabled(vals.isEnabled);
        setFormBtnsSize(vals.btnsize);
        setBtnsPlacement(vals.placement);
      });
    return () => (isMounted = false);
  }, []);

  const siteEnabledChanged = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const isSiteEnabled = e.target.checked;
    setHasSiteEnabled(isSiteEnabled);
    changeHostBlacklisted(isSiteEnabled);
  };

  const runAllEnabledChanged = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const allEnabled = e.target.checked;
    debounceSetAllEnabled(allEnabled);
    setHasAllEnabled(allEnabled);
  };

  const onBtnsLocationChanged = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value as PlacementType;
    debounceSetPlacement(value);
    setBtnsPlacement(value);
  };

  const onFormBtnsSizeChanged = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = +e.target.value;
    debounceSetSize(value);
    setFormBtnsSize(value);
  };

  return (
    <div className="section">
      <section className="form">
        {isPopupPage && (
          <>
            <div className="field">
              <div className="control has-text-centered">
                <button
                  onClick={(e) => !isLoading && onClickCheck()}
                  disabled={isLoading}
                  className={
                    "button is-info " + (isLoading ? "is-loading" : "")
                  }
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
          </>
        )}
        <div className="field">
          <div className="control">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={hasAllEnabled}
                onChange={runAllEnabledChanged}
              />
              <span className="ml-2">Run automatically on page load</span>
            </label>
          </div>
        </div>
        <div className="field">
          <label className="label">Links Location</label>
          <div className="control">
            <div className="select">
              <select value={btnsPlacement} onChange={onBtnsLocationChanged}>
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
    </div>
  );
}
