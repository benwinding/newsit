export const logger = {
  MakeLogger: (prefix) => MakeLogger(prefix),
};

function isProduction() {
  return process.env.IS_PRODUCTION;
}

function MakeLogger(prefixStr) {
  function getPrefixString() {
    return `> newsit: ${prefixStr} `;
  }
  return {
    get log() {
      // if (isProduction()) {
      //   return (...any) => {};
      // }
      const boundLogFn = console.log.bind(console, getPrefixString());
      return boundLogFn;
    },
    get error() {
      const boundLogFn = console.error.bind(console, getPrefixString());
      return boundLogFn;
    },
    get warn() {
      const boundLogFn = console.warn.bind(console, getPrefixString());
      return boundLogFn;
    },
  }
};