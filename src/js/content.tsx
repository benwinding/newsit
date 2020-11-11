import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { MessageApi } from "./browser/messages";
import { FrontApi } from "./browser/front";
import { ButtonResult, PlacementType } from "./browser/models";
import { system } from "./browser/browser";

const root = document.createElement("div");
document.body.appendChild(root);

ReactDOM.render(<Container />, root);

const front = new FrontApi();

function Container() {
  const [location, setLocation] = useState(null as PlacementType);
  const [reddit, setReddit] = useState({ text: "..." } as ButtonResult);
  const [hn, setHn] = useState({ text: "..." } as ButtonResult);

  useEffect(() => {
    let mounted = true;
    console.log("content.tsx MOUNTED");
    front.getStorage({ placement: "br" }).then((res) => {
      if (mounted) {
        setLocation(res.placement);
      }
    });

    MessageApi.onEvent<ButtonResult>("result_from_hn", (res) => {
      console.log("onEvent() hn", { res });
      mounted && setHn(res);
    });
    MessageApi.emitEvent("request_hn");

    MessageApi.onEvent<ButtonResult>("result_from_reddit", (res) => {
      console.log("onEvent() reddit", { res });
      mounted && setReddit(res);
    });
    MessageApi.emitEvent("request_reddit");

    return () => (mounted = false);
  }, []);

  return (
    <>
      <Btns location={location} reddit={reddit} hn={hn} />
    </>
  );
}

function Btns(props: {
  location: string;
  reddit: ButtonResult;
  hn: ButtonResult;
}) {
  const { reddit, hn } = props;
  return (
    <div id="newsit_container" className={"newsit_location_" + props.location}>
      <table id="newsit_table">
        <tr>
          <td className="newsit_r">
            <img
              src="https://i.imgur.com/pXyqa4g.png"
              className="newsit_icon"
            />
            <a
              id="newsit_tdReddit"
              className="newsit_btn"
              target="_blank"
              href={reddit && reddit.link}
            >
              {reddit && reddit.text}
            </a>
          </td>
        </tr>
        <tr>
          <td className="newsit_r">
            <img
              src="https://i.imgur.com/XFmNHss.gif"
              className="newsit_icon"
            />
            <a
              id="newsit_tdHNews"
              className="newsit_btn"
              target="_blank"
              href={hn && hn.link}
            >
              {hn && hn.text}
            </a>
          </td>
        </tr>
      </table>
    </div>
  );
}
