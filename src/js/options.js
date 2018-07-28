Vue.config.productionTip = false;

sys = core.getBrowser();

core.getStorage({
    isEnabled: true,
    btnsize: 0.8,
    placement: 'br',
  })
  .then((items) => {
    new Vue({
      el: '#app',
      data: {
        formBtnsEnabled: items.isEnabled,
        formBtnsSize: items.btnsize,
        formBtnsLocation: items.placement,
        options: {
          formBtnsLocation: [{
            value: 'br',
            text: 'Bottom Right'
          }, {
            value: 'bl',
            text: 'Bottom Left'
          }, {
            value: 'tr',
            text: 'Top Right'
          }, {
            value: 'tl',
            text: 'Top Left'
          }, ]
        },
        hosts: []
      },
      created: function() {
        store.getBlackListedHosts()
          .then((hosts) => {
            this.hosts = hosts;
          })
      },
      computed: {
        btnSizePx: function() {
          const val = this.formBtnsSize;
          const max = 129;
          const min = 19;
          const scaled = (val - 0.2) * 38 + 2 * 14;
          return scaled
        }
      },
      watch: {
        formBtnsEnabled: function(val, oldVal) {
          store.setEnabledAll(val);
        },
        formBtnsSize: function(val, oldVal) {
          store.setBtnSize(val);
          logger.log('formBtnsSize changed to: ', val);
        },
        formBtnsLocation: function(val, oldVal) {
          store.setBtnLocation(val);
          logger.log('formBtnsLocation changed to: ', val);
        }
      },
      methods: {
        removeHost: function(host) {
          this.hosts = this.hosts.filter(e => e !== host);
          store.removeHostFromBlackList(host)
        }
      }
    })
  });