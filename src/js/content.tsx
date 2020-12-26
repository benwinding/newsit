import React, { CSSProperties, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { MessageApi } from "./browser/messages";
import { front } from "./browser/front";
import { ButtonResult, PlacementType } from "./browser/models";
import { BtnItem } from "./shared/buttons";
import { IFrame } from "./shared/IFrame";
import { checkIsBlackListed } from "./shared/utils";

const root = document.createElement("div");
document.body.appendChild(root);

const url = location.href;
checkIsBlackListed(url).then((isBlackListed) => {
  const iconEnabled = !isBlackListed;
  MessageApi.emitEvent("change_icon_enable", iconEnabled);
  if (!isBlackListed) {
    ReactDOM.render(<Container />, root);
  }
})

const LOADING = '...';

function Container() {
  const [size, setSize] = useState(1 as number);
  const [iframeWidth, setIframeWidth] = useState(100 as number);
  const [placement, setPlacement] = useState("br" as PlacementType);
  const [placementStyles, setPlacementStyles] = useState<
    Partial<CSSProperties>
  >({});
  const [reddit, setReddit] = useState({ text: LOADING } as ButtonResult);
  const [hn, setHn] = useState({ text: LOADING } as ButtonResult);
  const [redditLogo, setRedditLogo] = React.useState("");
  const [hnLogo, setHnLogo] = React.useState("");

  React.useEffect(() => {
    const s: Partial<CSSProperties> = {};
    s.transform = `scale(${size})`;
    switch (placement) {
      case "bl":
        s.bottom = 0;
        s.left = 0;
        s.transformOrigin = "bottom left";
        break;
      case "br":
        s.bottom = 0;
        s.right = 0;
        s.transformOrigin = "bottom right";
        break;
      case "tl":
        s.top = 0;
        s.left = 0;
        s.transformOrigin = "top left";
        break;
      case "tr":
        s.top = 0;
        s.right = 0;
        s.transformOrigin = "top right";
        break;
    }
    setPlacementStyles(s);
  }, [placement, size]);

  useEffect(() => {
    let mounted = true;

    setRedditLogo(front.getLocalAssetUrl("./img/reddit.png"));
    setHnLogo(front.getLocalAssetUrl("./img/hn.png"));

    // Initialize from storage
    front.getStorage({ placement: "br" }).then((res) => {
      mounted && setPlacement(res.placement);
    });
    front.getStorage({ btnsize: 1 }).then((res) => {
      mounted && setSize(res.btnsize);
    });

    // Subscriptions
    MessageApi.onStorageChanged("placement", (v: PlacementType) => {
      mounted && setPlacement(v);
    });
    MessageApi.onStorageChanged("btnsize", (v: number) => {
      console.log("btnsize changed", v);
      mounted && setSize(v);
    });
    MessageApi.onEvent<ButtonResult>("result_from_hn", (res) => {
      console.log("onEvent() hn", { res });
      mounted && setHn(res);
    });
    MessageApi.onEvent<ButtonResult>("result_from_reddit", (res) => {
      console.log("onEvent() reddit", { res });
      mounted && setReddit(res);
    });

    // Page Loaded Trigger
    MessageApi.emitEvent("request_hn");
    MessageApi.emitEvent("request_reddit");

    return () => (mounted = false);
  }, []);

  React.useEffect(() => {
    function len(res: ButtonResult) {
      if (!res || !res.text) {
        return 0;
      }
      return res.text.length;
    }

    const width = len(reddit) > len(hn) ? len(reddit) : len(hn);
    const widthChars = width * 7.8 + 31;
    setIframeWidth(widthChars);
  }, [hn, reddit]);

  const isReversed = (placement + "").includes("l");

  return (
    <>
      <IFrame
        style={{
          // zoom: size,
          zIndex: "10000",
          position: "fixed",
          border: "0px",
          ...placementStyles,
        }}
        height="48px"
        width={iframeWidth + "px"}
      >
        <div
          style={{
            display: "flex",
            color: "white",
            flexDirection: "column",
          }}
        >
          <BtnItem
            reverseLayout={isReversed}
            logoUrl={redditLogo}
            link={reddit && reddit.link}
            text={reddit && reddit.text}
            bgColor={"#AAAAAA"}
          />
          <BtnItem
            reverseLayout={isReversed}
            logoUrl={hnLogo}
            link={hn && hn.link}
            text={hn && hn.text}
            bgColor={"#FD6F1D"}
          />
        </div>
      </IFrame>
    </>
  );
}
