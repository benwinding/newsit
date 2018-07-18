const axios = require('axios');
var $ = require("jquery");

function stripUrl(urlString) {
  const url = new URL(urlString);
  return url.host + url.pathname + url.search
}

function isMatchTwoUrls(url1, url2) {
  return (stripUrl(url1) == stripUrl(url2));
}

// Returns a promise of the links
function findReddit(location) {
  const inithost = location.host;
  const omitlist = ["news.ycombinator.com"];
  if (omitlist.indexOf(inithost) >= 0) {
    return Promise.reject('Not going to search Reddit on Reddit');
  }
  let initurl = location.href;
  let search_url = stripUrl(initurl)
  let requestUrl = "https://reddit.com/" + search_url

  return axios({
    url: requestUrl,
    method: 'GET',
    json: false
  })
  .then((response) => {
    let html = $($.parseHTML(response.data))
    let postContent = html.find("div[data-test-id='post-content']")
    if (postContent.length == 0) {
      return Promise.reject('No post found');
    }
    let commentIcon = postContent.find("i.icon.icon-comment");
    let commentTextArr = commentIcon.next().text().split(" ");
    let num_of_comments = commentTextArr.length == 2 ? commentTextArr[0] : 0;
    return {link: requestUrl, comments: num_of_comments}
  }).catch((err) => {
    return Promise.reject(err);
  }) 
}

function findHn(location) {
  const inithost = location.host;
  const omitlist = ["news.ycombinator.com"];
  if (omitlist.indexOf(inithost) >= 0) {
    return Promise.reject('Not going to search Hacker News on Hacker News');
  }
  let initurl = location.href;
  let search_url = stripUrl(initurl)

  let requestUrl = "https://hn.algolia.com/api/v1/search?query=" + search_url + "&restrictSearchableAttributes=url"
  return axios({
    url: requestUrl,
    method: 'GET',
    json: true
  }).then((response) => {
    let data = response.data
    if (data["nbHits"] == 0) {
      return Promise.reject('No urls found');
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
    if (result_id == null) {
      return Promise.reject('No url matches found');
    }
    const linkUrl = `https://news.ycombinator.com/item?id=${result_id}`
    return {link: linkUrl, comments: num_of_comments}
  }).catch((err) => {
    return Promise.reject(err);
  })
}

module.exports = {
  findHn: findHn,
  findReddit: findReddit
}