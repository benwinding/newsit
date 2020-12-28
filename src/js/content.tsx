import React, { CSSProperties, useEffect, useState } from "react";
import ReactDOM from "react-dom";

import { ButtonResult, PlacementType } from "./browser/models";
import { createContentController } from "./content.controller";

import { BtnItem } from "./shared/buttons";
import { IFrame } from "./shared/IFrame";

const root = document.createElement("div");
document.body.appendChild(root);

ReactDOM.render(<Container />, root);

const LOADING = "...";

const cc = createContentController();

function Container() {
  const [show, setShow] = useState(false);
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

    // Listen For Storage Changes
    cc.ListenPlacementChanged((v) => {
      mounted && setPlacement(v);
    });
    cc.ListenBtnSizeChanged((v) => {
      mounted && setSize(v);
    });
    cc.ListenBlackListedChanged((hosts) => {
      cc.GetIsCurrentUrlBlackListed().then((isBlackListed) => {
        const shouldShow = !isBlackListed;
        mounted && setShow(shouldShow);
      });
    });
    // Listen For Events
    cc.ListenResultsHn((res) => {
      mounted && setHn(res);
    });
    cc.ListenResultsReddit((res) => {
      mounted && setReddit(res);
    });
    cc.ListenTabChanged(() => {
      show && cc.SendCheckApiEvent();
    });

    function onStart() {
      cc.GetLogoUrls().then(({reddit, hn}) => {
        setRedditLogo(reddit);
        setHnLogo(hn);
      })
      cc.GetPlacement().then(placement => {
        mounted && setPlacement(placement);
      })
      cc.GetBtnSize().then(btnsize => {
        mounted && setSize(btnsize);
      })
      cc.GetIsCurrentUrlBlackListed().then(isBlackListed => {
        const shouldShow = !isBlackListed;
        mounted && setShow(shouldShow);
      })
    }

    onStart();
  
    return () => (mounted = false);
  }, []);

  React.useEffect(() => {
    show && cc.SendCheckApiEvent();
  }, [show])

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
      {show && (
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
      )}
    </>
  );
}
