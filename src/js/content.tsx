import React, { CSSProperties, useEffect, useState } from "react";
import ReactDOM from "react-dom";

import { ButtonResult, PlacementType } from "./browser/models";
import { createContentController } from "./content.controller";

import { BtnItem } from "./shared/buttons";
import { IFrame } from "./shared/IFrame";
import { len, setTimeoutAsyc } from "./shared/utils";

const cc = createContentController();

interface DbState {
  isBlackListed: boolean;
  isEnabled: boolean;
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
      shouldShow,
      zindex,
    } = this.state;
    const isReversed = (placement + "").includes("l");

    return (
      <>
        {shouldShow && (
          <IFrame
            style={{
              zIndex: zindex,
              position: "fixed",
              bottom: "0px",
              border: "0px",
              width: iframeWidth + "px",
              height: iframeHeight + "px",
              ...placementStyles,
            }}
            height="48px"
            width={iframeWidth + "px"}
          >
            <BtnGroup
              isReversed={isReversed}
              sizeChanged={(w, h) => this.sizeChanged(w, h)}
            />
          </IFrame>
        )}
      </>
    );
  }
}

const LOADING = "...";

function BtnGroup(props: {
  isReversed: boolean;
  sizeChanged: (newWidth: number, newHeight: number) => void;
}) {
  const [reddit, setReddit] = useState({ text: LOADING } as ButtonResult);
  const [hn, setHn] = useState({ text: LOADING } as ButtonResult);
  const [redditLogo, setRedditLogo] = React.useState("");
  const [hnLogo, setHnLogo] = React.useState("");

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
    cc.SendCheckApiEvent();
    return () => {
      mounted = false;
      unsubHn();
      unsubReddit();
    };
  }, []);

  async function notifySizeChanged() {
    await setTimeoutAsyc(2);
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

  return (
    <div
      style={{
        display: "flex",
        color: "white",
        flexDirection: "column",
        width: "min-content",
      }}
      ref={divRef}
    >
      <div
        style={{
          backgroundColor: "#AAAAAA",
        }}
      >
        <BtnItem
          reverseLayout={props.isReversed}
          logoUrl={redditLogo}
          result={reddit}
          sizeChanged={onButtonSizeChanged}
        />
      </div>
      <div
        style={{
          backgroundColor: "#FD6F1D",
        }}
      >
        <BtnItem
          reverseLayout={props.isReversed}
          logoUrl={hnLogo}
          result={hn}
          sizeChanged={onButtonSizeChanged}
        />
      </div>
    </div>
  );
}

const root = document.createElement("div");
document.body.appendChild(root);

ReactDOM.render(<Container />, root);
