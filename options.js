function setIsEnabled(isEnabled) {
  chrome.storage.sync.set({
    isEnabled: isEnabled
  })
  const iconPath = isEnabled ? 'images/icon.png' : 'images/icon-grey.png';
  chrome.browserAction.setIcon({
    path: iconPath
  }); 
}

// Saves options to chrome.storage
function save_options() {
  let placementValue = $('#placement').val();
  let sizeValue = $('#size').val();
  let isEnabledValue = $('#isEnabled').val() == 1;
  setIsEnabled(isEnabledValue)
  chrome.storage.sync.set({
    placement: placementValue,
    btnsize: sizeValue,
    isEnabled: isEnabledValue
  }, function() {
    // Update status to let user know options were saved.
    $('#status').fadeIn()
    setTimeout(function() {
      $('#status').fadeOut()
    }, 2000);
  });
}

function setSliderOutput(val) {
  var output = document.querySelectorAll('output')[0];
  output.innerHTML = "Size: " + val;
  const max = 129;
  const min = 19;
  const scaled = (val-0.2)*38 + 2*14;
  // var output2 = document.querySelectorAll('output')[1];
  // output2.innerHTML = "Btn Height: " + scaled;
  $('#btnsPreview').css('height', scaled);
}
// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    placement: 'br',
    btnsize: '1',
    isEnabled: true,
  }, function(items) {
    $('#placement').val(items.placement);
    $('#size').val(items.btnsize).change();
    $('#isEnabled').val(items.isEnabled).change();
    setIsEnabled(isEnabled)
    setSliderOutput(items.btnsize);
  });
}
document.addEventListener('DOMContentLoaded', () => {
  restore_options()
  $('#size').rangeslider({
    polyfill: false
  })
  $('#isEnabled').rangeslider({
    polyfill: false
  })
  $(document).on('input', '#size', function(e) {
    setSliderOutput(e.currentTarget.value);
  });
});
document.getElementById('save').addEventListener('click', save_options);
