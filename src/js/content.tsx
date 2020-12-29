import React, { CSSProperties, useEffect, useState } from "react";
import ReactDOM from "react-dom";

import { ButtonResult, PlacementType } from "./browser/models";
import { createContentController } from "./content.controller";

import { BtnItem } from "./shared/buttons";
import { IFrame } from "./shared/IFrame";
import { len, randomUuid, setTimeoutAsyc } from "./shared/utils";

const root = document.createElement("div");
document.body.appendChild(root);

ReactDOM.render(<Container />, root);

const cc = createContentController();

function DbContainer() {
  return 
}

function Container() {
  const [isBlackListed, setIsBlackListed] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isManualRequest, setIsManualRequest] = useState(null);

  const [shouldShow, setShouldShow] = useState(false);

  console.log("-> vals", { isBlackListed, isEnabled });

  const [size, setSize] = useState(1 as number);
  const [iframeWidth, setIframeWidth] = useState(100 as number);
  const [placement, setPlacement] = useState("br" as PlacementType);
  const [placementStyles, setPlacementStyles] = useState<
    Partial<CSSProperties>
  >({});

  useEffect(() => {
    const s = cc.CalculatePlacementStyles(size, placement);
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
    cc.ListenIsEnabledChanged((v) => {
      console.log("-> setIsEnabled", v);
      mounted && setIsEnabled(v);
    });
    cc.ListenIsTabBlackListedChanged((v) => {
      console.log("-> setIsBlackListed", v);
      mounted && setIsBlackListed(v);
      mounted && setIsManualRequest(null);
    });
    const unsubP = cc.ListenCheckPageTrigger(async () => {
      mounted && setIsManualRequest(randomUuid());
    });
    const unsubT = cc.ListenTabUrlChanged(async () => {
      mounted && setShouldShow(false);
      setTimeoutAsyc(10).then(() => {
        console.log("-> setShow", { isBlackListed, isEnabled });
        mounted && setShouldShow(isEnabled && !isBlackListed);
      });
    });

    return () => {
      mounted = false;
      unsubP();
      unsubT();
    };
  }, []);

  const isReversed = (placement + "").includes("l");

  useEffect(() => {
    let mounted = true;
    if (isManualRequest) {
      setShouldShow(false);
      setTimeoutAsyc(10).then(() => {
        mounted && setShouldShow(true);
      });
    } else {
      console.log("-> setShow watched", { isBlackListed, isEnabled });
      mounted && setShouldShow(isEnabled && !isBlackListed);
    }
    return () => (mounted = false);
  }, [isManualRequest, isEnabled, isBlackListed]);

  return (
    <>
      {shouldShow && (
        <IFrame
          style={{
            zIndex: "99",
            position: "fixed",
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
            charCountChanged={(count) => {
              const widthChars = count * 7.8 + 31;
              setIframeWidth(widthChars);
            }}
          />
        </IFrame>
      )}
    </>
  );
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
