import React from "react";
import { PlacementType } from "../browser/models";
import { createSettingsFormController } from "./settings-form.controller";

const sfc = createSettingsFormController();

const formBtnsLocation = sfc.GetFormBtnsLocation();

interface SettingsFormProps {
  isPopupPage: boolean;
  onClickCheck?(): void;
  isLoading?: boolean;
}

interface SettingsFormState {
  hasCurrentEnabled: boolean;
  hasAllEnabled: boolean;
  btnsPlacement: PlacementType;
  formBtnsSize: number;
  blackListStr: string;
  blackListAlteredStr: string;
}

export class SettingsForm extends React.Component<
  SettingsFormProps,
  SettingsFormState
> {
  state = {
    hasCurrentEnabled: true,
    hasAllEnabled: false,
    btnsPlacement: "br" as PlacementType,
    formBtnsSize: 1,
    blackListStr: "",
    blackListAlteredStr: "",
  };

  constructor(props: SettingsFormProps) {
    super(props);
  }

  componentDidMount() {
    const ctx = this;
    sfc.ListenBlackListChanged(async (list) => {
      const isBlackListed = await sfc.IsCurrentUrlBlacklisted();
      const isEnabled = !isBlackListed;
      ctx.setState({ blackListStr: list.join("\n") });
      ctx.setState({ hasCurrentEnabled: isEnabled });
    });
    sfc.ListenPlacementChanged((v) => {
      ctx.setState({ btnsPlacement: v });
    });
    sfc.ListenBtnSizeChanged((v) => {
      ctx.setState({ formBtnsSize: v });
    });
    sfc.ListenIsEnabledChanged((v) => {
      ctx.setState({ hasAllEnabled: v });
    });
  }

  onCurrentUrlBlackListedChanged(value: boolean) {
    sfc.SetCurrentEnabled(value);
    this.setState({ hasCurrentEnabled: value });
  }

  onAllEnabledChanged(value: boolean) {
    sfc.SetAllEnabled(value);
    this.setState({ hasAllEnabled: value });
  }

  onBtnsLocationChanged(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value as PlacementType;
    sfc.SetPlacement(value);
    this.setState({ btnsPlacement: value });
  }

  onFormBtnsSizeChanged(e: React.ChangeEvent<HTMLInputElement>) {
    const value = +e.target.value;
    sfc.SetBtnSize(value);
    this.setState({ formBtnsSize: value });
  }

  onSaveHosts() {
    const newHosts = this.state.blackListAlteredStr;
    const newHostArr = newHosts.split("\n");
    sfc.SetHostsArr(newHostArr);
    this.setState({ blackListAlteredStr: "" });
  }

  render() {
    const {
      hasCurrentEnabled,
      hasAllEnabled,
      btnsPlacement,
      formBtnsSize,
      blackListStr,
      blackListAlteredStr,
    } = this.state;
    const { isPopupPage, onClickCheck, isLoading } = this.props;

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
                onChange={this.onCurrentUrlBlackListedChanged}
                title="Enabled on this website"
              />
            </>
          )}
          <CheckBox
            value={hasAllEnabled}
            onChange={this.onAllEnabledChanged}
            title="Run automatically on page load"
          />
          <p>Hosts Blocked</p>
          <textarea
            style={{ width: "100%", height: isPopupPage ? "60px" : "200px" }}
            defaultValue={blackListStr}
            onChange={(e) => {
              const text = e.target.value;
              this.setState({ blackListAlteredStr: text });
            }}
          ></textarea>
          {!!blackListAlteredStr && (
            <div className="field">
              <div className="control has-text-centered pt-1">
                <button
                  onClick={(e) => this.onSaveHosts()}
                  disabled={isLoading}
                  className="button is-info"
                >
                  Save Hosts
                </button>
              </div>
            </div>
          )}
          <div className="field">
            <label className="label">Links Location</label>
            <div className="control">
              <div className="select">
                <select
                  value={btnsPlacement}
                  onChange={this.onBtnsLocationChanged}
                >
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
                onChange={this.onFormBtnsSizeChanged}
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
