const btnIdReddit = "newsit_tdReddit";
const btnIdHNews = "newsit_tdHNews";

export const hlpr = {
  addContainer: addContainer,
  removeContainer: removeContainer,
  makeButtonWaiting: makeButtonWaiting,
  makeButtonFound: makeButtonFound,
  makeButtonFailed: makeButtonFailed,
  resizeIconHeights: resizeIconHeights,
  setButtonSize: setButtonSize,
  setButtonPlacement: setButtonPlacement,
  btnIdReddit: btnIdReddit,
  btnIdHNews: btnIdHNews,
};

function makeCommentString(count) {
  let countNum = parseInt(count);
  if (!countNum) countNum = 0;
  if (countNum == 1) return countNum + " Comment";
  else return countNum + " Comments";
}

function getBtn(btnId) {
  return $("#" + btnId);
}

function removeStyle(el, cssProp) {
  let style = el.style;
  if (!style) return;
  style.removeProperty(cssProp);
}

function setImportant(el, cssProp, cssValue) {
  let style;
  if (el.length) style = el[0].style;
  else style = el.style;
  if (!style) return;
  style.removeProperty(cssProp);
  style.setProperty(cssProp, cssValue, "important");
}

function changeButtonSize(btnId, text) {
  const charWidth = $("#newsit_charTest").width();
  let textCount = text.length * charWidth;
  getBtn(btnId).each((index, el) => {
    setImportant(el, "width", textCount + "px");
  });
}

function resizeIconHeights() {
  const h = $(".newsit_r").height();
  $(".newsit_icon").each((index, el) => {
    setImportant(el, "height", h + "px");
  });
}

function hideIconWidth(btnId) {
  let icon = getBtn(btnId).prev();
  icon.addClass("newsit_icon_hidden");
}

function showIconWidth(btnId) {
  let icon = getBtn(btnId).prev();
  icon.removeClass("newsit_icon_hidden");
  removeStyle(icon, "width");
}

function setButton(btnId, text, tooltip, href) {
  getBtn(btnId).html(text);
  changeButtonSize(btnId, text);
  getBtn(btnId).attr("title", tooltip);
  getBtn(btnId).attr("href", href);
  if (href) getBtn(btnId).addClass("newsit_btnlink");
  else getBtn(btnId).removeClass("newsit_btnlink");
}

function makeButtonWaiting(btnId) {
  let el = getBtn(btnId);
  setImportant(el, "opacity", "1.0");
  showIconWidth(btnId);
  setButton(btnId, "...", "Newsit is checking source...");
}

function makeButtonFailed(btnId, whichSource) {
  setTimeout(() => {
    const submitLink = getSubmitLink(whichSource);
    setButton(btnId, "+", "Newsit found nothing on " + whichSource, submitLink);
    let el = getBtn(btnId);
    setImportant(el, "opacity", "1.0");
    hideIconWidth(btnId);
  }, 100);
}

function getSubmitLink(whichSource) {
  const title = encodeURI(document.title);
  const link = encodeURI(document.location.href);
  if (whichSource.includes("eddit")) {
    return `https://reddit.com/submit?title=${title}&url=${link}`;
  } else {
    return `https://news.ycombinator.com/submitlink?t=${title}&u=${link}`;
  }
}

function makeButtonFound(btnId, link, numComments, whichSource) {
  const commentString = makeCommentString(numComments);
  setButton(
    btnId,
    commentString,
    "Newsit found a discussion at " + whichSource,
    link
  );
}

function isContainerAdded() {
  return $("body").find("#newsit_container").length != 0;
}

function setButtonSize(btnSize) {
  const container = $("#newsit_container");
  setImportant(container, "transform", `scale(${btnSize})`);
}

function setButtonPlacement(btnPlacement) {
  const container = $("#newsit_container");
  let placementOrigin = "";
  switch (btnPlacement) {
    case "br":
      placementOrigin = "100% 100%";
      break;
    case "bl":
      placementOrigin = "0% 100%";
      break;
    case "tr":
      placementOrigin = "100% 0%";
      break;
    case "tl":
      placementOrigin = "0% 0%";
      break;
  }
  setImportant(container, "transform-origin", placementOrigin);
  container.attr("class", `newsit_location_${btnPlacement}`);
}

function removeContainer() {
  $("#newsit_container").remove();
}

function addContainer() {
  if (isContainerAdded()) return;
  core
    .getStorage({
      placement: "br",
      btnsize: "1",
    })
    .then((items) => {
      const containerHtml = `
    <div id='newsit_container' class='newsit_location_${items.placement}'>
      <table id='newsit_table'>
        <tr><td class="newsit_r">
          <img src="https://i.imgur.com/pXyqa4g.png" class="newsit_icon">
          <a id='${btnIdReddit}' class='newsit_btn' target='_blank'>.</a>
        </td></tr>
        <tr><td class="newsit_r">
          <img src="https://i.imgur.com/XFmNHss.gif" class="newsit_icon">
          <a id='${btnIdHNews}' class='newsit_btn' target='_blank'>.</a>
        </td></tr>
      </table>
      <div id="newsit_charTest" class="newsit_btn">A</div>
    </div>
  `;
      $("body").append(containerHtml);
      setButtonSize(items.btnsize);
      setButtonPlacement(items.placement);
      makeButtonWaiting("newsit_tdReddit");
      makeButtonWaiting("newsit_tdHNews");
      resizeIconHeights();
    });
}
