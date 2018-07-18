require('../css/content.css');
const core = require('./shared/core.js');
const apis = require('./shared/apis.js');
const sys = core.getBrowser();

const btnIdReddit = 'newsit_tdReddit'
const btnIdHNews = 'newsit_tdHNews'

function makeCommentString(count) {
  if (count == "1")
    return count + " Comment"
  else
    return count + " Comments"
}

function getBtn(btnId) {
  return $('#'+btnId);
}

function changeButtonSize(btnId, text) {
  const charWidth = $('#newsit_charTest').width();
  let textCount = text.length * charWidth;
  getBtn(btnId).width(textCount)
}

function resizeIconHeights() {
  const h = $('.newsit_r').height();
  $('.newsit_icon').height(h)
}

function hideIconWidth(btnId) {
  getBtn(btnId).prev().width(0)
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
  setButton(btnId, '...', 'Newsit is checking source...')
}

function makeButtonFailed(btnId, whichSource) {
  setTimeout(() => {
    setButton(btnId, '-', 'Newsit found nothing on ' + whichSource)
    getBtn(btnId).css('opacity', 0.4);
    hideIconWidth(btnId)
  }, 100)
}

function makeButtonFound(btnId, link, numComments, whichSource) {
  const commentString = makeCommentString(numComments)
  setButton(btnId, commentString, 'Newsit found a discussion at ' + whichSource, link);
}

function isContainerAdded() {
  return $('body').find('newsit_container').length != 0;
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
    $('.newsit_btn').css('font-size',items.btnsize+'em');
    makeButtonWaiting('newsit_tdReddit');
    makeButtonWaiting('newsit_tdHNews');
    resizeIconHeights();
  });
}

function runCheckApis() {
  addContainer();
  makeButtonWaiting('newsit_tdReddit');
  makeButtonWaiting('newsit_tdHNews');
  resizeIconHeights();
  apis.findHn(location)
    .then((res) => makeButtonFound(btnIdHNews, res.link, res.comments, 'Hacker News'))
    .catch(() => makeButtonFailed(btnIdHNews, 'Hacker News'));
  apis.findReddit(location)
    .then((res) => makeButtonFound(btnIdReddit, res.link, res.comments, 'Reddit'))
    .catch(() => makeButtonFailed(btnIdReddit, 'Reddit'));
}

function onChangedBtnSize(changes, namespace) {
  var btnSizeChange = changes['btnsize'];
  if (btnSizeChange == undefined)
    return
  const btnSizeNew = btnSizeChange.newValue;
  $('.newsit_btn').css('font-size', btnSizeNew+'em');
  $('.newsit_icon').height(0.1)
  $('.newsit_btn').map((index, domEl) => {
    let el = $(domEl)
    const text = el.text();
    const id = el.attr('id');
    changeButtonSize(id, text);
  })
  resizeIconHeights();
}

function onChangedBtnPlacement(changes, namespace) {
  var placementChange = changes['placement'];
  if (placementChange == undefined)
    return
  const placementNew = placementChange.newValue;
  $('#newsit_container').attr('class', `newsit_location_${placementNew}`)
}

function onClickCheckNow(changes, namespace) {
  var hasClickChange = changes['hasClickedCheckNow'];
  if (hasClickChange == undefined)
    return
  const hasClickNew = hasClickChange.newValue;
  if (hasClickNew == false)
    return
  runCheckApis();
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
sys.storage.onChanged.addListener(onClickCheckNow);
sys.storage.onChanged.addListener(onChangedBtnPlacement);
