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
  iframeWidth: number;
  placement: PlacementType;
  placementStyles: Partial<CSSProperties>;
}

class Container extends React.Component<{}, DbState> {
  state = {
    isBlackListed: false,
    isEnabled: false,
    shouldShow: false,
    size: 1,
    iframeWidth: 100,
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

  charCountChanged(count: number) {
    const widthChars = count * 7.8 + 31;
    this.setState({ iframeWidth: widthChars });
  }

  render() {
    const { iframeWidth, placement, placementStyles, shouldShow } = this.state;
    const isReversed = (placement + "").includes("l");

    return (
      <>
        {shouldShow && (
          <IFrame
            style={{
              zIndex: "999",
              position: "fixed",
              bottom: "0px",
              border: "0px",
              height: "48px",
              width: iframeWidth + "px",
              ...placementStyles,
            }}
            height="48px"
            width={iframeWidth + "px"}
          >
            <BtnGroup
              isReversed={isReversed}
              charCountChanged={(n) => this.charCountChanged(n)}
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
  charCountChanged: (chars: number) => void;
}) {
  const [reddit, setReddit] = useState({ text: LOADING } as ButtonResult);
  const [hn, setHn] = useState({ text: LOADING } as ButtonResult);
  const [redditLogo, setRedditLogo] = React.useState("");
  const [hnLogo, setHnLogo] = React.useState("");

  useEffect(() => {
    let mounted = true;
    // Listen For Events
    const subHn = cc.ListenResultsHn((res) => {
      mounted && setHn(res);
    });
    const subReddit = cc.ListenResultsReddit((res) => {
      mounted && setReddit(res);
    });
    cc.GetLogoUrls().then(({ reddit, hn }) => {
      mounted && setRedditLogo(reddit);
      mounted && setHnLogo(hn);
    });
    cc.SendCheckApiEvent();
    return () => {
      mounted = false;
      subHn();
      subReddit();
    };
  }, []);

  useEffect(() => {
    const width = len(reddit) > len(hn) ? len(reddit) : len(hn);
    props.charCountChanged(width);
  }, [hn, reddit]);

  return (
    <div
      style={{
        display: "flex",
        color: "white",
        flexDirection: "column",
      }}
    >
      <BtnItem
        reverseLayout={props.isReversed}
        logoUrl={redditLogo}
        link={reddit && reddit.link}
        text={reddit && reddit.text}
        bgColor={"#AAAAAA"}
      />
      <BtnItem
        reverseLayout={props.isReversed}
        logoUrl={hnLogo}
        link={hn && hn.link}
        text={hn && hn.text}
        bgColor={"#FD6F1D"}
      />
    </div>
  );
}

const root = document.createElement("div");
document.body.appendChild(root);

ReactDOM.render(<Container />, root);
