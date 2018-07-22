require('../css/content.css');
const core = require('./shared/core.js');
const apis = require('./shared/apis.js');
const sys = core.getBrowser();

const btnIdReddit = 'newsit_tdReddit'
const btnIdHNews = 'newsit_tdHNews'

function makeCommentString(count) {
  let countNum = parseInt(count)
  if (!countNum)
    countNum = 0;
  if (countNum == 1)
    return countNum + " Comment"
  else
    return countNum + " Comments"
}

function getBtn(btnId) {
  return $('#'+btnId);
}

function setImportant(el, cssProp, cssValue) {
  let style = el.style
  if (!style)
    return
  style.removeProperty(cssProp);
  style.setProperty(cssProp, cssValue, 'important');
}

function changeButtonSize(btnId, text) {
  const charWidth = $('#newsit_charTest').width();
  let textCount = text.length * charWidth;
  getBtn(btnId).each((index, el) => {
    setImportant(el, 'width', textCount+'px')
  })
}

function resizeIconHeights() {
  const h = $('.newsit_r').height();
  $('.newsit_icon').each((index, el) => {
    setImportant(el, 'height', h+'px')
  })
}

function hideIconWidth(btnId) {
  let el = getBtn(btnId).prev()
  setImportant(el, 'width', 0)
}

function showIconWidth(btnId) {
  let el = getBtn(btnId).prev()
  el.css('width', 'unset');
}

function setButton(btnId, text, tooltip, href) {
  getBtn(btnId).html(text);
  changeButtonSize(btnId, text)
  getBtn(btnId).attr('title', tooltip);
  getBtn(btnId).attr('href', href);
  if (href)
    getBtn(btnId).addClass('newsit_btnlink');
  else 
    getBtn(btnId).removeClass('newsit_btnlink');
}

function makeButtonWaiting(btnId) {
  getBtn(btnId).css('opacity', "1 !important");
  showIconWidth(btnId);
  setButton(btnId, '...', 'Newsit is checking source...')
}

function makeButtonFailed(btnId, whichSource) {
  setTimeout(() => {
    setButton(btnId, '-', 'Newsit found nothing on ' + whichSource)
    getBtn(btnId).css('opacity', "0.4 !important");
    hideIconWidth(btnId)
  }, 100)
}

function makeButtonFound(btnId, link, numComments, whichSource) {
  const commentString = makeCommentString(numComments)
  setButton(btnId, commentString, 'Newsit found a discussion at ' + whichSource, link);
}

function isContainerAdded() {
  return $('body').find('#newsit_container').length != 0;
}

function addContainer() {
  if (isContainerAdded())
    return;
  sys.storage.sync.get({
    placement: 'br',
    btnsize: '1'
  }, function(items) {
    const containerHtml = `
      <div id='newsit_container' class='newsit_location_${items.placement}'>
        <table id='newsit_table'>
          <tr><td class="newsit_r">
            <img src="https://i.imgur.com/pXyqa4g.png" class="newsit_icon">
            <a id='${btnIdReddit}' class='newsit_btn' target='_blank'></a>
          </td></tr>
          <tr><td class="newsit_r">
            <img src="https://i.imgur.com/XFmNHss.gif" class="newsit_icon">
            <a id='${btnIdHNews}' class='newsit_btn' target='_blank'></a>
          </td></tr>
        </table>
        <div id="newsit_charTest" class="newsit_btn">A</div>
      </div>
    `
    $('body').append(containerHtml);
    $('.newsit_btn').css('font-size',items.btnsize+'em !important');
    makeButtonWaiting('newsit_tdReddit');
    makeButtonWaiting('newsit_tdHNews');
    resizeIconHeights();
  });
}

function runCheckApis() {
  addContainer();
  makeButtonWaiting('newsit_tdReddit');
  makeButtonWaiting('newsit_tdHNews');
  // resizeIconHeights();
  apis.findHn(location)
    .then((res) => makeButtonFound(btnIdHNews, res.link, res.comments, 'Hacker News'))
    .catch((err) => {
      console.log(err)
      makeButtonFailed(btnIdHNews, 'Hacker News')
    });
  apis.findReddit(location)
    .then((res) => makeButtonFound(btnIdReddit, res.link, res.comments, 'Reddit'))
    .catch((err) => {
      console.log(err)
      makeButtonFailed(btnIdReddit, 'Reddit')
    });
  resizeIconHeights();
}

function onChangedBtnSize(changes, namespace) {
  var btnSizeChange = changes['btnsize'];
  if (btnSizeChange == undefined)
    return
  const btnSizeNew = btnSizeChange.newValue;
  $('.newsit_icon').height(1)
  $('.newsit_btn').css('font-size', btnSizeNew+'em !important');
  $('.newsit_btn').map((index, domEl) => {
    let el = $(domEl)
    const text = el.text();
    const id = el.attr('id');
    changeButtonSize(id, text);
  })
  setTimeout(() => {
    resizeIconHeights();
  }, 200)
}

function onChangedBtnPlacement(changes, namespace) {
  var placementChange = changes['placement'];
  if (placementChange == undefined)
    return
  const placementNew = placementChange.newValue;
  $('#newsit_container').attr('class', `newsit_location_${placementNew}`)
}

function onPageLoad() {
  sys.storage.sync.get({
    isEnabled: true,
  }, (items) => {
    if (items.isEnabled != true)
      return;
    runCheckApis();
  });
}

$(onPageLoad);
sys.storage.onChanged.addListener(onChangedBtnSize);
sys.storage.onChanged.addListener(onChangedBtnPlacement);

module.exports = {
  runCheckApis: runCheckApis
}