import React from "react";

import { PlacementType } from "../browser/models";
import { debounce } from "./utils";

import { createSettingsFormController } from "./settings-form.controller";

const sfc = createSettingsFormController();

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
  (val) => sfc.SetAllEnabled(val),
  300
);
const debounceSetPlacement = debounce<PlacementType>(
  (val) => sfc.SetPlacement(val),
  300
);
const debounceSetSize = debounce<number>(
  (val) => sfc.SetBtnSize(val),
  300
);
const debounceSetBlackListed = debounce<boolean>(
  (val) => sfc.SetBlackListed(val),
  300
);

export function SettingsForm(props: {
  isPopupPage: boolean;
  onClickCheck?(): void;
  isLoading?: boolean;
}) {
  const { onClickCheck, isLoading, isPopupPage } = props;

  const [currentUrlBlackListed, setCurrentUrlBlacklisted] = React.useState(
    false
  );
  const [hasAllEnabled, setHasAllEnabled] = React.useState(false);
  const [btnsPlacement, setBtnsPlacement] = React.useState(
    "br" as PlacementType
  );
  const [formBtnsSize, setFormBtnsSize] = React.useState(1);

  React.useEffect(() => {
    let mounted = true;
    sfc.GetSettings().then((vals) => {
      if (!mounted) return;
      setHasAllEnabled(vals.isEnabled);
      setFormBtnsSize(vals.btnsize);
      setBtnsPlacement(vals.placement);
    });
    sfc
      .IsCurrentUrlBlacklisted()
      .then(
        (isBlacklisted) => mounted && setCurrentUrlBlacklisted(isBlacklisted)
      );
    return () => (mounted = false);
  }, []);

  const currentUrlBlackListedChanged = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const isBlackListed = !e.target.checked;
    debounceSetBlackListed(isBlackListed);
    setCurrentUrlBlacklisted(isBlackListed);
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
    <div className="section py-1">
      <section className="form">
        {isPopupPage && (
          <>
            <div className="field">
              <div className="control has-text-centered pt-2">
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
                    checked={currentUrlBlackListed}
                    onChange={currentUrlBlackListedChanged}
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
          <div style={{ height: "90px" }}>
            <img
              id="btnsPreview"
              src="https://i.imgur.com/dVvDrfN.png"
              style={{
                width: "100px",
                transformOrigin: "top left",
                transform: `scale(${formBtnsSize})`,
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
