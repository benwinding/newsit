import axios from '../../../node_modules/axios/dist/axios.min.js'

function stripUrl(urlString) {
  const url = new URL(urlString);
  return url.host + url.pathname + url.search
}

function isMatchTwoUrls(url1, url2) {
  return (stripUrl(url1) == stripUrl(url2));
}

// Returns a promise of the links
function findReddit(urlString) {
  const location = new URL(urlString);
  const inithost = location.host;
  const omitlist = ["news.ycombinator.com", "reddit.com"];
  if (omitlist.indexOf(inithost) >= 0) {
    return Promise.reject('Reddit API: Not going to search Reddit on Reddit');
  }
  let initurl = location.href;
  let search_url = encodeURIComponent("url:"+initurl)
  let requestUrl = "https://www.reddit.com/search?q="+search_url

  return axios({
    url: requestUrl,
    method: 'GET',
    json: false
  })
  .then((response) => {
    let html = $($.parseHTML(response.data))
    let post = html.find('.Post')
    // let postContent = html.find("div[data-test-id='post-content']")
    if (post.length == 0) {
      return Promise.reject('Reddit API: No post found');
    }
    let commentIcon = post.find("i.icon.icon-comment");
    let commentTextArr = commentIcon.next().text().split(" ");
    let num_of_comments = commentTextArr.length > 1 ? commentTextArr[0] : 0;

    let postTitles = post.find('span')
    if (postTitles.length == 0) {
      return Promise.reject('Reddit API: Couldn\'t find postTitle');
    }
    let postLink = postTitles[0].firstChild
    postLink.hostname = 'reddit.com'
    return {link: postLink.href, comments: num_of_comments}
  }).catch((err) => {
    return Promise.reject(err);
  }) 
}

function findHn(urlString) {
  const location = new URL(urlString);
  const inithost = location.host;
  const omitlist = ['news.ycombinator.com'];
  if (omitlist.indexOf(inithost) >= 0) {
    return Promise.reject('Hacker News API: Not going to search domain: Hacker News');
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
      return Promise.reject('Hacker News API: No urls found');
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
      return Promise.reject('Hacker News API: No url matches found');
    }
    const linkUrl = `https://news.ycombinator.com/item?id=${result_id}`
    return {link: linkUrl, comments: num_of_comments}
  }).catch((err) => {
    return Promise.reject(err);
  })
}

export {
  findHn,
  findReddit
}