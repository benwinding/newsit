import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { MessageApi } from "./browser/messages";
import { FrontApi } from "./browser/front";
import { PlacementType } from "./browser/models";

const root = document.createElement("div");
document.body.appendChild(root);

ReactDOM.render(<Container />, root);

interface ButtonProps {
  text: string;
  link?: string;
}

const front = new FrontApi();

function Container() {
  const [location, setLocation] = useState(null as PlacementType);
  const [reddit, setReddit] = useState({ text: "..." } as ButtonProps);
  const [hn, setHn] = useState({ text: "..." } as ButtonProps);

  useEffect(() => {
    let mounted = true;
    console.log("content.tsx MOUNTED");
    front.getStorage({ placement: "br" }).then((res) => {
      if (mounted) {
        setLocation(res.placement);
      }
    });

    async function getHn() {
      return MessageApi.requestWithResponse<ButtonProps>("request_hn");
    }

    async function getReddit() {
      return MessageApi.requestWithResponse<ButtonProps>("request_reddit");
    }

    getHn().then((res) => {
      if (mounted) {
        console.log("getHn", { res });
        setHn(res);
      }
    }).catch(err => setHn({text: '-'}));
    getReddit().then((res) => {
      if (mounted) {
        console.log("getReddit", { res });
        setReddit(res);
      }
    }).catch(err => setReddit({text: '-'}));
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
  reddit: ButtonProps;
  hn: ButtonProps;
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
      <div id="newsit_charTest" className="newsit_btn">
        A
      </div>
    </div>
  );
}

// import React from "react";
// import { BackApi } from './browser/back';
// import { FrontApi, logger } from './browser/front';

// const logg = logger.MakeLogger("content.js");

// const front = new FrontApi();
// const back = new BackApi();

// const containerId = "newsit_container";

// function beforeCheck() {
//   const containerHtml = `
//     <div id='${containerId}'>
//       <table id='newsit_table'>
//         <tr>
//           <td class="newsit_r">
//             <img src="https://i.imgur.com/pXyqa4g.png" class="newsit_icon">
//             <a id='${btnIdReddit}' class='newsit_btn' target='_blank'>.</a>
//           </td>
//         </tr>
//         <tr>
//           <td class="newsit_r">
//             <img src="https://i.imgur.com/XFmNHss.gif" class="newsit_icon">
//             <a id='${btnIdHNews}' class='newsit_btn' target='_blank'>.</a>
//           </td>
//         </tr>
//       </table>
//       <div id="newsit_charTest" class="newsit_btn">A</div>
//     </div>
//     `;
//   $("body").append(containerHtml);

//   hlpr.addContainer();
//   hlpr.makeButtonWaiting("newsit_tdReddit");
//   hlpr.makeButtonWaiting("newsit_tdHNews");
//   hlpr.resizeIconHeights();
// }

// function setContainerPosition(placementString: string) {
//   const positionClass = `newsit_location_${placementString}`;
//   const c = $('#' + containerId);
//   c.attr('class', positionClass);
// }

// function getBtn(btnId: string) {
//   return $("#" + btnId);
// }

// function setButtonWaiting(btnId: string) {
//   let btn = getBtn(btnId);
//   btn.css("opacity", "1.0 !important");
//   btn.html('...');
//   btn.attr("title", "Newsit is checking source...");
//   let icon = btn.prev();
//   icon.removeClass("newsit_icon_hidden");
//   icon.removeAttr("width");
// }

// function afterCheck() {
//   hlpr.resizeIconHeights();
// }

// function makeButtonFailed(btnId: string, whichSource: string) {
//   const submitLink = getSubmitLink(whichSource);
//   let btn = getBtn(btnId);
//   btn.html('...');
//   btn.attr("title", "Newsit found nothing on " + whichSource);
//   btn.attr('href', submitLink);
//   btn.css("opacity", "1.0 !important");
//   let icon = btn.prev();
//   icon.addClass("newsit_icon_hidden");
// }

// function runCheckApis(urlString: string) {
//   beforeCheck();

//   apis
//     .findHn(urlString)
//     .then((res) =>
//       hlpr.makeButtonFound(
//         hlpr.btnIdHNews,
//         res.link,
//         res.comments,
//         "Hacker News"
//       )
//     )
//     .catch((err) => {
//       // logg.error(err);
//       hlpr.makeButtonFailed(hlpr.btnIdHNews, "Hacker News");
//     });
//   apis
//     .findReddit(urlString)
//     .then((res) =>
//       hlpr.makeButtonFound(hlpr.btnIdReddit, res.link, res.comments, "Reddit")
//     )
//     .catch((err) => {
//       // logg.error(err);
//       hlpr.makeButtonFailed(hlpr.btnIdReddit, "Reddit");
//     });
//   afterCheck();
// }

// // GUI LISTENERS

// function onChangedBtnSize(changes: { btnsize?: { newValue: any } }) {
//   var btnSizeChange = changes.btnsize;
//   if (btnSizeChange == undefined) return;
//   const btnSizeNew = btnSizeChange.newValue;
//   hlpr.setButtonSize(btnSizeNew);
// }

// function onChangedBtnPlacement(changes: { placement?: { newValue: any } }) {
//   var placementChange = changes.placement;
//   if (placementChange == undefined) return;
//   const placementNew = placementChange.newValue;
//   hlpr.setButtonPlacement(placementNew);
// }

// // EVENT LISTENERS

// function onPageLoad() {
//   let urlString = location.href;
//   logg.log("onPageLoad: " + urlString);
//   store
//     .isEnabled()
//     .then(() => store.isNotBlackListed(urlString))
//     .then(() => {
//       runCheckApis(urlString);
//       core.sendMessageIconEnabled(true);
//     })
//     .catch((err) => {
//       // logg.error(err);
//       core.sendMessageIconEnabled(false);
//     });
// }

// function onTabNowActive(request) {
//   if (request.action != "nowActive") return;
//   let urlString = location.href;
//   store
//     .isEnabled()
//     .then(() => store.isNotBlackListed(urlString))
//     .then(() => {
//       runCheckApis(urlString);
//     })
//     .catch((err) => {
//       // logg.error(err);
//       hlpr.removeContainer();
//     });
// }

// function onCheck(request) {
//   if (request.action != "check") return;
//   const urlString = request.url || location.href;
//   runCheckApis(urlString);
// }

// back.onStorageChanged() sys.storage.onChanged.addListener(onChangedBtnSize);
// sys.storage.onChanged.addListener(onChangedBtnPlacement);

// back.onMessage('tab_active', onTabNowActive);
// back.onMessage('check_active_tab', onTabNowActive);

// $(onPageLoad);
