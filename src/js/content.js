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

function removeStyle(el, cssProp) {
  let style = el.style
  if (!style)
    return
  style.removeProperty(cssProp);
}

function setImportant(el, cssProp, cssValue) {
  let style
  if (el.length)
    style = el[0].style
  else
    style = el.style;
  if (!style)
    return
  style.removeProperty(cssProp);
  style.setProperty(cssProp, cssValue, 'important');
}

function changeButtonSize(btnId, text) {
  const charWidth = $('#newsit_charTest').width();
  let textCount = text.length * charWidth + 10;
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
  let icon = getBtn(btnId).prev()
  icon.addClass('newsit_icon_hidden')
}

function showIconWidth(btnId) {
  let icon = getBtn(btnId).prev()
  icon.removeClass('newsit_icon_hidden')
  removeStyle(icon, 'width');
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
  let el = getBtn(btnId);
  setImportant(el, 'opacity', '1.0')
  showIconWidth(btnId);
  setButton(btnId, '...', 'Newsit is checking source...')
}

function makeButtonFailed(btnId, whichSource) {
  setTimeout(() => {
    setButton(btnId, '-', 'Newsit found nothing on ' + whichSource)
    let el = getBtn(btnId);
    setImportant(el, 'opacity', '0.4')
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

function runCheckApis(urlString) {
  addContainer();
  makeButtonWaiting('newsit_tdReddit');
  makeButtonWaiting('newsit_tdHNews');
  // resizeIconHeights();
  apis.findHn(urlString)
    .then((res) => makeButtonFound(btnIdHNews, res.link, res.comments, 'Hacker News'))
    .catch((err) => {
      console.log(err)
      makeButtonFailed(btnIdHNews, 'Hacker News')
    });
  apis.findReddit(urlString)
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
    let urlString = location.href;
    runCheckApis(urlString);
  });
}

function onMessageRecieved(request, sender, sendResponse) {
  // listen for messages sent from background.js
  if (request.action != 'check')
    return
  const urlString = request.url || location.href;
  console.debug('URL CHANGED: ' + urlString) // new url is now in content scripts!
  runCheckApis(urlString);
}

$(onPageLoad);
sys.storage.onChanged.addListener(onChangedBtnSize);
sys.storage.onChanged.addListener(onChangedBtnPlacement);
sys.runtime.onMessage.addListener(onMessageRecieved);

module.exports = {
  runCheckApis: runCheckApis
}