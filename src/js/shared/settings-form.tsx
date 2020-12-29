import React from "react";
import { PlacementType } from "../browser/models";
import { createSettingsFormController } from "./settings-form.controller";

const sfc = createSettingsFormController();

const formBtnsLocation = sfc.GetFormBtnsLocation();

export function SettingsForm(props: {
  isPopupPage: boolean;
  onClickCheck?(): void;
  isLoading?: boolean;
}) {
  const { onClickCheck, isLoading, isPopupPage } = props;

  const [hasCurrentEnabled, setCurrentEnabled] = React.useState(true);
  const [hasAllEnabled, setHasAllEnabled] = React.useState(false);
  const [btnsPlacement, setBtnsPlacement] = React.useState(
    "br" as PlacementType
  );
  const [formBtnsSize, setFormBtnsSize] = React.useState(1);
  const [blackList, setBlackList] = React.useState('');

  React.useEffect(() => {
    let mounted = true;
    sfc.ListenBlackListChanged(async (list) => {
      const isBlackListed = await sfc.IsCurrentUrlBlacklisted();
      const isEnabled = !isBlackListed;
      mounted && setBlackList(list.join('\n'));
      mounted && setCurrentEnabled(isEnabled);
    });
    sfc.ListenPlacementChanged((v) => {
      mounted && setBtnsPlacement(v);
    });
    sfc.ListenBtnSizeChanged((v) => {
      mounted && setFormBtnsSize(v);
    });
    sfc.ListenIsEnabledChanged((v) => {
      mounted && setHasAllEnabled(v);
    });
    return () => (mounted = false);
  }, []);

  function onCurrentUrlBlackListedChanged(isEnabled: boolean) {
    sfc.SetCurrentEnabled(isEnabled);
    setCurrentEnabled(isEnabled);
  }

  function onAllEnabledChanged(value: boolean) {
    sfc.SetAllEnabled(value);
    setHasAllEnabled(value);
  }

  const onBtnsLocationChanged = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value as PlacementType;
    sfc.SetPlacement(value);
    setBtnsPlacement(value);
  };

  const onFormBtnsSizeChanged = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = +e.target.value;
    sfc.SetBtnSize(value);
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
            <CheckBox
              value={hasCurrentEnabled}
              onChange={onCurrentUrlBlackListedChanged}
              title="Enabled on this website"
            />
          </>
        )}
        <CheckBox
          value={hasAllEnabled}
          onChange={onAllEnabledChanged}
          title="Run automatically on page load"
        />
        <textarea style={{width: '100%', height: '4em'}} defaultValue={blackList}>
        </textarea>
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

function CheckBox(props: {
  title: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  function changed(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.checked;
    props.onChange(value);
  }
  return (
    <div className="field">
      <div className="control">
        <label className="checkbox">
          <input type="checkbox" checked={props.value} onChange={changed} />
          <span className="ml-2">{props.title}</span>
        </label>
      </div>
    </div>
  );
}
