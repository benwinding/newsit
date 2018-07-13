function stripUrl(urlString) {
  const url = new URL(urlString);
  return url.host + url.pathname + url.search
}

function isMatchTwoUrls(url1, url2) {
  return (stripUrl(url1) == stripUrl(url2));
}

function makeCommentString(count) {
  if (count == "1")
    return count + " Comment"
  else
    return count + " Comments"
}

function changeButtonSize(btnEl, text) {
  const charWidth = $('#newsit_charTest').width();
  let textCount = text.length * charWidth;
  $(btnEl).width(textCount)
}

function resizeIconHeights() {
  const h = $('.newsit_r').height();
  $('.newsit_icon').height(h)
}

function hideIconWidth(btnId) {
  $(btnId).prev().width(0)
}

function setButton(btnEl, text, tooltip, href) {
  $(btnEl).html(text);
  changeButtonSize(btnEl, text)
  $(btnEl).attr('title', tooltip);
  $(btnEl).attr('href', href);
  if (href)
    $(btnEl).addClass('newsit_btnlink');
  else 
    $(btnEl).removeClass('newsit_btnlink');
}

function makeButtonWaiting(btnEl) {
  setButton(btnEl, '...', 'Newsit is checking source...')
}

function makeButtonFailed(btnEl, linkName) {
  setTimeout(() => {
    setButton(btnEl, '-', 'Newsit found nothing on ' + linkName)
    $(btnEl).css('opacity', 0.4);
    hideIconWidth(btnEl)
  }, 100)
}

function findHn(location) {
  const inithost = location.host;
  const btnEl = '#newsit_tdHNews';
  const omitlist = ["news.ycombinator.com"];
  const linkName = 'Hacker News'
  if (omitlist.indexOf(inithost) >= 0) {
    makeButtonFailed(btnEl, linkName);
    return;
  }
  let initurl = location.href;
  let search_url = stripUrl(initurl)

  let request = new XMLHttpRequest();
  let requestUrl = "https://hn.algolia.com/api/v1/search?query=" + search_url + "&restrictSearchableAttributes=url"
  request.responseType = 'json'
  request.open('GET', requestUrl, true);
  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      // Success!
      let data = request.response
      if (data["nbHits"] == 0) {
        makeButtonFailed(btnEl, linkName);
        return;
      }
      let allhits = data["hits"];
      let num_of_comments = 0;
      let result_id = null;
      for (let hit of allhits) {
        if (isMatchTwoUrls(hit["url"], initurl) && hit["num_comments"] >= num_of_comments) {
          num_of_comments = hit["num_comments"];
          result_id = hit["objectID"];
        }
      }
      //Add button here
      if (result_id == null) {
        makeButtonFailed(btnEl, linkName);
        return;
      }

      const commentString = makeCommentString(num_of_comments);
      const linkUrl = `https://news.ycombinator.com/item?id=${result_id}`
      const tooltip = 'Newsit found a Hacker News discussion!'
      setButton(btnEl, commentString, tooltip, linkUrl)
    } else {
      // We reached our target server, but it returned an error
      makeButtonFailed(btnEl, linkName);
    }
  };

  request.onerror = function() {
    // There was a connection error of some sort
    makeButtonFailed(btnEl, linkName);
  };

  request.send();
}

function findReddit(location) {
  const btnEl = '#newsit_tdReddit';
  const inithost = location.host;
  const omitlist = ["news.ycombinator.com"];
  const linkName = 'Reddit';
  if (omitlist.indexOf(inithost) >= 0) {
    makeButtonFailed(btnEl, linkName);
    return;
  }
  let initurl = location.href;
  let search_url = stripUrl(initurl)
  let request = new XMLHttpRequest();
  let requestUrl = "https://reddit.com/" + search_url

  request.open('GET', requestUrl, true);
  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      // Success!
      let html = $($.parseHTML(request.response))
      let postContent = html.find("div[data-test-id='post-content']")
      if (postContent.length == 0) {
        makeButtonFailed(btnEl, linkName);
        return
      }
      let commentIcon = postContent.find("i.icon.icon-comment");
      let commentTextArr = commentIcon.next().text().split(" ");
      let num_of_comments = commentTextArr.length == 2 ? commentTextArr[0] : 0;
  
      const commentString = makeCommentString(num_of_comments);
      const tooltip = 'Newsit found a Reddit discussion!';
      setButton(btnEl, commentString, tooltip, requestUrl)
    } else {
      // We reached our target server, but it returned an error
      makeButtonFailed(btnEl, linkName);
    }
  };

  request.onerror = function() {
    // There was a connection error of some sort
    makeButtonFailed(btnEl, linkName);
  };

  request.send();
}

function addContainer() {
  chrome.storage.sync.get({
    placement: 'br',
    btnsize: '1'
  }, function(items) {
    const containerHtml = `
      <div id='newsit_container' class='newsit_location_${items.placement}'>
        <table id='newsit_table'>
          <tr><td class="newsit_r">
            <img src="https://i.imgur.com/pXyqa4g.png" class="newsit_icon">
            <a id='newsit_tdReddit' class='newsit_btn' target='_blank'></a>
          </td></tr>
          <tr><td class="newsit_r">
            <img src="https://i.imgur.com/XFmNHss.gif" class="newsit_icon">
            <a id='newsit_tdHNews' class='newsit_btn' target='_blank'></a>
          </td></tr>
        </table>
        <div id="newsit_charTest" class="newsit_btn">A</div>
      </div>
    `
    $('body').append(containerHtml);
    $('.newsit_btn').css('font-size',items.btnsize+'em');
    makeButtonWaiting('#newsit_tdReddit');
    makeButtonWaiting('#newsit_tdHNews');
    resizeIconHeights();
  });
}

$(() => {
  chrome.storage.sync.get({
    isEnabled: true,
  }, function(items) {
    if (items.isEnabled != true)
      return;
    addContainer();
    findHn(location);
    findReddit(location);
  });
});
