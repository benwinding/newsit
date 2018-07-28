var logger = (function() {
  function isProduction() {
    return core == null ? true : core.isProduction();
  }

  function convertToString(input) {
    if (typeof input == null)
      return "null";
    if (typeof input !== "object")
      return input;
    if (input.constructor.toString().includes('Error'))
      return input.toString();
    return JSON.stringify(input);
  }

  function log(context, input) {
    isProduction()
      .then((isProduction) => {
        if (isProduction)
          return
        const text = convertToString(input)
        console.log(`%c Newsit (${context}) ${text}`, "background-color:Orange");
      })
  }

  function err(context, input) {
    isProduction()
      .then((isProduction) => {
        if (isProduction)
          return
        const text = convertToString(input)
        console.log(`%c Newsit (${context}) ${text}`, "color:White; background-color:Red");
      })
  }

  return {
    logContent: (input) => log('content.js', input),
    errContent: (input) => err('content.js', input),
    logBackground: (input) => log('background.js', input),
    errBackground: (input) => err('background.js', input),
    logOptions: (input) => log('options.js', input),
    errOptions: (input) => err('options.js', input),
    logPopup: (input) => log('popup.js', input),
    errPopup: (input) => err('popup.js', input),
    logGui: (input) => log('gui-global.js', input),
    logMemory: (input) => log('content.js', input),
  }
}())