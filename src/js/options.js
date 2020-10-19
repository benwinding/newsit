Vue.config.productionTip = false;
import { core, sys } from "./shared/core";
import { store } from "./shared/store";

const logg = core.logger.MakeLogger("content.js");

// store.getBlackListedHosts().then((hosts) => {
//   logg.log({hosts})
// });

core
  .getStorage({
    isEnabled: false,
    btnsize: 0.8,
    placement: "br",
  })
  .then((items) => createVueInstance(items));

function createVueInstance(items) {
  new Vue({
    el: "#app",
    data: {
      formBtnsEnabled: items.isEnabled,
      formBtnsSize: items.btnsize,
      formBtnsLocation: items.placement,
      options: {
        formBtnsLocation: [
          {
            value: "br",
            text: "Bottom Right",
          },
          {
            value: "bl",
            text: "Bottom Left",
          },
          {
            value: "tr",
            text: "Top Right",
          },
          {
            value: "tl",
            text: "Top Left",
          },
        ],
      },
      version: 0,
      hosts: [],
    },
    created: function () {
      store.getBlackListedHosts().then((hosts) => {
        this.hosts = hosts;
      });
      store.getVersion().then((version) => {
        this.version = version;
      });
    },
    computed: {
      btnSizePx: function () {
        const val = this.formBtnsSize;
        const max = 129;
        const min = 19;
        const scaled = (val - 0.2) * 38 + 2 * 14;
        return scaled;
      },
    },
    watch: {
      formBtnsEnabled: function (val, oldVal) {
        store.setEnabledAll(val);
      },
      formBtnsSize: function (val, oldVal) {
        store.setBtnSize(val);
        logg.log("formBtnsSize changed to: ", { val });
      },
      formBtnsLocation: function (val, oldVal) {
        store.setBtnPlacement(val);
        logg.log("formBtnsLocation changed to: ", { val });
      },
    },
    methods: {
      removeHost: function (host) {
        this.hosts = this.hosts.filter((e) => e !== host);
        store.removeHostFromBlackList(host);
      },
    },
  });
}