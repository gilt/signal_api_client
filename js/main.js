(function() {
  /*
    For testing only. No need to do UMD syntax :)
  */
  var MODULE_NAME = require('./signal-api-client/signal_api_client');

  function init () {
    alert('signal-api-client');
  }

  if (document.addEventListener !== undefined) {
    document.addEventListener('DOMContentLoaded', init);
  }  else {
    window.attachEvent('onload', init);
  }

})();
