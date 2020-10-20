import * as core from "./core";


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

function makeCommentString(count: string) {
  let countNum = parseInt(count);
  if (!countNum) countNum = 0;
  if (countNum == 1) return countNum + " Comment";
  else return countNum + " Comments";
}


function setImportant(
  el: JQuery<HTMLElement>,
  cssProp: string,
  cssValue: string
) {
  el.attr(cssProp, cssValue + " !important");
}

function changeButtonSize(btnId: string, text: string) {
  const charWidth = $("#newsit_charTest").width();
  let textCount = text.length * charWidth;
  getBtn(btnId).each((index, el) => {
    setImportant($(el), "width", textCount + "px");
  });
}

function resizeIconHeights() {
  const h = $(".newsit_r").height();
  $(".newsit_icon").each((index, el) => {
    setImportant($(el), "height", h + "px");
  });
}

function hideIconWidth(btnId: string) {
  let icon = getBtn(btnId).prev();
  icon.addClass("newsit_icon_hidden");
}

function showIconWidth(btnId: string) {
  let icon = getBtn(btnId).prev();
  icon.removeClass("newsit_icon_hidden");
  icon.removeAttr("width");
}


function makeButtonFailed(btnId: string, whichSource: string) {
  setTimeout(() => {
    const submitLink = getSubmitLink(whichSource);
    setButton(btnId, "+", "Newsit found nothing on " + whichSource, submitLink);
    let el = getBtn(btnId);
    setImportant(el, "opacity", "1.0");
    hideIconWidth(btnId);
  }, 100);
}

function makeButtonFound(
  btnId: string,
  link: string,
  numComments: string,
  whichSource: string
) {
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

function setButtonSize(btnSize: any) {
  const container = $("#newsit_container");
  setImportant(container, "transform", `scale(${btnSize})`);
}

function setButtonPlacement(btnPlacement: any) {
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

async function addContainer() {
  if (isContainerAdded()) return;
  const items = await core.getStorage({
    placement: "br",
    btnsize: "1",
  });

  setButtonSize(items.btnsize);
  setButtonPlacement(items.placement);
  makeButtonWaiting("newsit_tdReddit");
  makeButtonWaiting("newsit_tdHNews");
  resizeIconHeights();
}
