import Vue from 'vue'
import '../img/favicon-128x128.png'
import '../img/favicon-32x32.png'
import '../img/icon.svg'

const shared = require('./shared/shared.js')

require('../css/options.scss');

Vue.config.productionTip = false;

shared.getBrowser().storage.sync.get({
  isEnabled: true,
  btnsize: 1,
  placement: '',
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
        shared.getBrowser().storage.sync.set({
          isEnabled: val,
        });
        console.log('formBtnsEnabled changed to: ', val);
      },
      formBtnsSize: function(val, oldVal) {
        shared.getBrowser().storage.sync.set({
          btnsize: val,
        });
        console.log('formBtnsSize changed to: ', val);
      },
      formBtnsLocation: function(val, oldVal) {
        shared.getBrowser().storage.sync.set({
          placement: val,
        });
        console.log('formBtnsLocation changed to: ', val);
      }
    }
  })
});