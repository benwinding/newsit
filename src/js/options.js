Vue.config.productionTip = false;

sys = core.getBrowser();

sys.storage.sync.get({
  isEnabled: true,
  btnsize: 0.8,
  placement: 'br',
}, function(items) {
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
      }
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
        sys.storage.sync.set({
          isEnabled: val,
        });
        console.log('formBtnsEnabled changed to: ', val);
      },
      formBtnsSize: function(val, oldVal) {
        sys.storage.sync.set({
          btnsize: val,
        });
        console.log('formBtnsSize changed to: ', val);
      },
      formBtnsLocation: function(val, oldVal) {
        sys.storage.sync.set({
          placement: val,
        });
        console.log('formBtnsLocation changed to: ', val);
      }
    }
  })
});