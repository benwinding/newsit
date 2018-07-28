var sys = core.getBrowser();

var store = (function() {

  // QUERIES

  function getBlackListedHosts() {
    return core.getStorage({
        blackListed: [],
      })
      .then((items) => items.blackListed)
  }

  function getCurrentTabUrl() {
    return new Promise((resolve, reject) => {
      sys.tabs.query({
        active: true,
        windowType: "normal",
        currentWindow: true
      }, (tabs) => {
        const thisTab = tabs[0];
        const thisUrl = thisTab.url;
        resolve(thisUrl);
      })
    })
  }

  function getCurrentTabId() {
    return new Promise((resolve, reject) => {
      sys.tabs.query({
        active: true,
        windowType: "normal",
        currentWindow: true
      }, (tabs) => {
        const thisTab = tabs[0];
        const thisId = thisTab.id;
        resolve(thisId);
      })
    })
  }

  function getTabUrl(tabId) {
    return new Promise((resolve, reject) => {
      sys.tabs.get(tabId, (tab) => {
        const thisUrl = tab.url;
        resolve(thisUrl);
      })
    })
  }

  function isEnabled() {
    return new Promise((resolve, reject) => {
      core.getStorage({
        isEnabled: true
      }).then((items) => {
        if (items.isEnabled)
          resolve();
        else
          reject('Not enabled on ALL sites');
      });
    });
  }

  function isNotBlackListed(urlString) {
    const host = new URL(urlString).host;
    return new Promise((resolve, reject) => {
      getBlackListedHosts()
        .then((hosts) => {
          if (!Array.isArray(hosts))
            hosts = []
          if (hosts.indexOf(host) > -1)
            reject('Not enabled on THIS site');
          else
            resolve();
        });
    })
  }

  // COMMANDS

  function setStorage(values) {
    return new Promise((resolve, reject) => {
      sys.storage.sync.set(values)
    });
  }

  function setEnabledAll(state) {
    logger.logMemory(`setEnabledAll: ${state}`)
    setStorage({
      isEnabled: state
    })
  }

  function setBtnSize(state) {
    logger.logMemory(`setBtnSize: ${state}`)
    setStorage({
      btnsize: state
    })
  }

  function setBtnPlacement(state) {
    logger.logMemory(`setBtnPlacement: ${state}`)
    setStorage({
      placement: state
    })
  }

  function getHostFromUrl(urlString) {
    let host;
    try {
      host = new URL(urlString).host;
    } catch (e) {
      host = urlString
    } 
    return host;
  }

  function setHost(urlString, isBlackListed) {
    const host = getHostFromUrl(urlString);
    store.getBlackListedHosts()
      .then((hosts) => {
        if (!Array.isArray(hosts))
          hosts = []
        if (isBlackListed) {
          if (!hosts.includes(host))
            hosts.push(host);
        }
        else
          hosts = hosts.filter(e => e !== host);
        setStorage({
          blackListed: hosts
        })
      })
  }

  function addHostToBlackList(urlString) {
    setHost(urlString, true)
  }

  function removeHostFromBlackList(urlString) {
    setHost(urlString, false)
  }

  return {
    getBlackListedHosts: getBlackListedHosts,
    getCurrentTabUrl: getCurrentTabUrl,
    getCurrentTabId: getCurrentTabId,
    getTabUrl: getTabUrl,
    isNotBlackListed: isNotBlackListed,
    isEnabled: isEnabled,
    addHostToBlackList: addHostToBlackList,
    removeHostFromBlackList: removeHostFromBlackList,
    setBtnPlacement: setBtnPlacement,
    setBtnSize: setBtnSize,
    setEnabledAll: setEnabledAll,
  }
}())