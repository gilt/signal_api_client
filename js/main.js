(function() {
  /*
    For testing only. No need to do UMD syntax :)
  */
  var signalApiClient = require('./signal_api_client/signal_api_client');

  function init () {
    alert('signal_api_client');
  }

  if (document.addEventListener !== undefined) {
    document.addEventListener('DOMContentLoaded', init);
  }  else {
    window.attachEvent('onload', init);
  }

})();
