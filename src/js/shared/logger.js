export const logger = {
  MakeLogger: (prefix) => MakeLogger(prefix),
};

function isProduction() {
  return process.env.IS_PRODUCTION;
}

function MakeLogger(prefixString) {
  function prefixString() {
    return `</> newsit: ${prefixString} `;
  }
  return {
    get log() {
      if (isProduction()) {
        return (...any) => {};
      }
      const boundLogFn = console.log.bind(console, prefixString());
      return boundLogFn;
    },
    get error() {
      const boundLogFn = console.error.bind(console, prefixString());
      return boundLogFn;
    },
    get warn() {
      const boundLogFn = console.warn.bind(console, prefixString());
      return boundLogFn;
    },
  }
};