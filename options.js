// Saves options to chrome.storage
function save_options() {
  let placementValue = $('#placement').val();
  let sizeValue = $('#size').val();
  chrome.storage.sync.set({
    placement: placementValue,
    btnsize: sizeValue
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
    btnsize: '1'
  }, function(items) {
    $('#placement').val(items.placement);
    $('#size').val(items.btnsize).change();
    setSliderOutput(items.btnsize);
    // $('#size').val(this.value);
  });
}
document.addEventListener('DOMContentLoaded', () => {
  restore_options()
  $('#size').rangeslider({
    polyfill: false
  })

  const h = $('.newsit_r').height();
  $('.newsit_icon').height(h)
  $(document).on('input', 'input[type="range"]', function(e) {
    setSliderOutput(e.currentTarget.value);
  });
});
document.getElementById('save').addEventListener('click',
    save_options);
