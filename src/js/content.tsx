import React from 'react';
import ReactDOM from 'react-dom';

const root = document.createElement('div')
document.appendChild(root)

ReactDOM.render(
  <h1>Hello, world!</h1>,
  root
);


// import React from "react";
// import { BackApi } from './browser/back';
// import { FrontApi, logger } from './browser/front';

// const logg = logger.MakeLogger("content.js");

// const front = new FrontApi();
// const back = new BackApi();

// const containerId = "newsit_container";
// const btnIdReddit = "newsit_tdReddit";
// const btnIdHNews = "newsit_tdHNews";

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

// function getSubmitLink(whichSource: string) {
//   const title = encodeURI(document.title);
//   const link = encodeURI(document.location.href);
//   if (whichSource.includes("eddit")) {
//     return `https://reddit.com/submit?title=${title}&url=${link}`;
//   } else {
//     return `https://news.ycombinator.com/submitlink?t=${title}&u=${link}`;
//   }
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
