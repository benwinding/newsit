import React, { CSSProperties, useEffect, useState } from "react";
import ReactDOM from "react-dom";

import { ButtonResult, PlacementType } from "./browser/models";
import { createContentController } from "./content.controller";

import { BtnItem } from "./shared/buttons";
import { IFrame } from "./shared/IFrame";
import { setTimeoutAsyc } from "./shared/utils";

const cc = createContentController();

interface DbState {
  isBlackListed: boolean;
  isEnabled: boolean;
  hideWhenNoResults: boolean;
  shouldShow: boolean;
  size: number;
  zindex: number;
  iframeWidth: number;
  iframeHeight: number;
  placement: PlacementType;
  placementStyles: Partial<CSSProperties>;
}

class Container extends React.Component<{}, DbState> {
  state = {
    isBlackListed: false,
    isEnabled: false,
    hideWhenNoResults: false,
    shouldShow: false,
    size: 1,
    zindex: 999,
    iframeWidth: 100,
    iframeHeight: 48,
    placement: "br" as PlacementType,
    placementStyles: {} as Partial<CSSProperties>,
  };

  componentDidMount() {
    const ctx = this;
    function updateShouldShow() {
      const shouldShow = ctx.state.isEnabled && !ctx.state.isBlackListed;
      ctx.setState({ shouldShow: shouldShow });
    }
    function updatePlacementStyles() {
      const styles = cc.CalculatePlacementStyles(
        ctx.state.size,
        ctx.state.placement
      );
      ctx.setState({
        placementStyles: styles,
      });
    }
    cc.ListenPlacementChanged((v) => {
      ctx.setState({ placement: v });
      updatePlacementStyles();
    });
    cc.ListenBtnSizeChanged((v) => {
      ctx.setState({ size: v });
      updatePlacementStyles();
    });
    cc.ListenZindexChanged((v) => {
      ctx.setState({ zindex: v });
    });
    cc.ListenIsEnabledChanged((v) => {
      ctx.setState({ isEnabled: v });
      updateShouldShow();
    });
    cc.ListenHideWhenNoResultsChanged((v) => {
      ctx.setState({ hideWhenNoResults: v });
      updateShouldShow();
    });
    cc.ListenIsTabBlackListedChanged((v) => {
      ctx.setState({ isBlackListed: v });
      updateShouldShow();
    });
    cc.ListenCheckPageTrigger(async () => {
      ctx.setState({ shouldShow: false });
      setTimeoutAsyc(1).then(() => {
        ctx.setState({ shouldShow: true });
      });
    });
    cc.ListenTabUrlChanged(async () => {
      ctx.setState({ shouldShow: false });
      setTimeoutAsyc(1).then(() => {
        updateShouldShow();
      });
    });
  }

  sizeChanged(newWidth: number, newHeight: number) {
    this.setState({
      iframeWidth: newWidth,
      iframeHeight: newHeight,
    });
  }

  render() {
    const {
      iframeWidth,
      iframeHeight,
      placement,
      placementStyles,
      hideWhenNoResults,
      shouldShow,
      zindex,
    } = this.state;
    const isReversed = (placement + "").includes("l");

    return (
      <>
        {shouldShow && (
          <>
            <style>{`a, a:visited, a:active { color: white; }`}</style>
            <div
              style={{
                zIndex: zindex,
                position: "fixed",
                bottom: "0px",
                border: "0px",
                width: iframeWidth + "px",
                height: iframeHeight + "px",
                overflow: "hidden",
                ...placementStyles,
              }}
            >
              <BtnGroup
                hideWhenNoResults={hideWhenNoResults}
                isReversed={isReversed}
                sizeChanged={(w, h) => this.sizeChanged(w, h)}
              />
            </div>
          </>
        )}
      </>
    );
  }
}

const LOADING = "...";

function BtnGroup(props: {
  hideWhenNoResults: boolean;
  isReversed: boolean;
  sizeChanged: (newWidth: number, newHeight: number) => void;
}) {
  const [reddit, setReddit] = useState({ text: LOADING } as ButtonResult);
  const [hn, setHn] = useState({ text: LOADING } as ButtonResult);
  const [redditLogo, setRedditLogo] = React.useState("");
  const [hnLogo, setHnLogo] = React.useState("");
  const [redditSubmitLink, setRedditSubmitLink] = React.useState("");
  const [hnSubmitLink, setHnSubmitLink] = React.useState("");

  const divRef = React.useRef<HTMLDivElement>();

  useEffect(() => {
    let mounted = true;
    // Listen For Events
    const unsubHn = cc.ListenResultsHn((res) => {
      mounted && setHn(res);
    });
    const unsubReddit = cc.ListenResultsReddit((res) => {
      mounted && setReddit(res);
    });
    cc.GetLogoUrls().then(({ reddit, hn }) => {
      mounted && setRedditLogo(reddit);
      mounted && setHnLogo(hn);
    });
    setHnSubmitLink(cc.GetHnSubmitLink());
    setRedditSubmitLink(cc.GetRedditSubmitLink());
    cc.SendCheckApiEvent();
    return () => {
      mounted = false;
      unsubHn();
      unsubReddit();
    };
  }, []);

  async function notifySizeChanged() {
    await setTimeoutAsyc(10);
    const width = divRef.current?.clientWidth;
    const height = divRef.current?.clientHeight;
    props.sizeChanged(width, height);
  }

  useEffect(() => {
    notifySizeChanged();
  }, [hn, reddit]);

  const onButtonSizeChanged = () => {
    notifySizeChanged();
  };

  const hasHn = !!hn.link;
  const hasReddit = !!reddit.link;

  const shouldShowHn = hasHn || !props.hideWhenNoResults;
  const shouldShowReddit = hasReddit || !props.hideWhenNoResults;

  return (
    <div
      style={{
        display: "flex",
        color: "white",
        flexDirection: "column",
        width: "min-content",
        alignItems: props.isReversed ? "flex-start" : "flex-end",
      }}
      ref={divRef}
    >
      {shouldShowReddit && (
        <div
          style={{
            backgroundColor: "#AAAAAA",
          }}
        >
          <BtnItem
            reverseLayout={props.isReversed}
            title="Reddit"
            logoUrl={redditLogo}
            submitLink={redditSubmitLink}
            result={reddit}
            sizeChanged={onButtonSizeChanged}
          />
        </div>
      )}
      {shouldShowHn && (
        <div
          style={{
            backgroundColor: "#FD6F1D",
          }}
        >
          <BtnItem
            reverseLayout={props.isReversed}
            title="Hacker News"
            logoUrl={hnLogo}
            submitLink={hnSubmitLink}
            result={hn}
            sizeChanged={onButtonSizeChanged}
          />
        </div>
      )}
    </div>
  );
}

const root = document.createElement("div");
root.id = 'newsit-extension';
document.body.appendChild(root);
const shadow = root.attachShadow({ mode: "closed" });
ReactDOM.render(<Container />, shadow);
