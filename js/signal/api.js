(function (root, factory) {

  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define('signalClient', [''], factory);

  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(require(''));

  }

} (this, function signalClient (moment) {

  'use strict';

  var
    EVENT_PREFIX = 'event:',
    params = {},
    initialized = false;

  /**
   * Initializes the Signal Direct API.
   *
   * @public
   * @method init
   *
   * @param  {Object} commonParams  Common parameters for every event on this page
   *
   * @return {Promise}  A promise indicating whether or not Signal Direct was actually initialized
   */
  function init (commonParams) {
    params = commonParams || {};
    initialized = true;

    /* We have to init signal, just in case someone else does not, since we
       are relying on its ready promise to resolve. Since the init method is
       _.once'd, it should be safe to init here as a safety precaution.
       I hate this dependency between the two modules, but can't see any way
       around it at this point. It's likely that signal_direct could remove
       all the script append code, now that signal is certain to do it; I'm
       going to leave the code here in the chance we come up with a better way
       to handle this dependency in the future. */
    signal.init();

    signal.ready.then(function () {
      if (!document.getElementById('signal-direct-script')) {
        appendScript();
      }
    });

    return when.resolve(true);
  }

  /**
   * Appends the script tag for both direct and client APIs
   *
   * @private
   * @method appendScript
   */
  function appendScript () {
    var
      script = document.createElement('script'),
      firstScript = document.getElementsByTagName('script')[0];

    script.id = 'signal-direct-script';
    script.async = true;
    script.defer = true;
    script.src = scriptUri + '#site=' + directSiteId + ',' + siteId;
    firstScript.parentNode.insertBefore(script, firstScript);
  }

  /**
   * Constructs the uri for the request to Signal.
   *
   * @private
   * @method buildUri
   *
   * @param {String} name  The name of the event to fire
   * @param {Object} data  The data to send, or empty object
   *
   * @return {String}  The string uri to request
   */
  function buildUri (name, data) {
    data = _.extend(data, {
      site: siteId,
      user_id: trackingMetadata.getVendorUserId(),
      is_logged_in: trackingMetadata.isLoggedIn(),
      has_purchased: trackingMetadata.hasPurchased(),
      target_experience: window.targetExperience || 'unknown' // Eventually put this in tracking_metadata
    });

    var uri = new Uri(endpoint);

    // Normalizes the keys to camelCase strings for the API call URI
    _.each(data, function (v, k, o) {
      var value = '';

      delete o[k];

      if (_.isObject(v)) {
        value = JSON.stringify(v);
      } else {
        value = v.toString();
      }

      o[stringUtils.underscoreCase(k.toString())] = encodeURIComponent(value);
    });

    data.referrer = EVENT_PREFIX + stringUtils.underscoreCase(name); // This is last because otherwise the ":" in the referrer would get uri encoded :(

    uri.params.set(data);

    return uri.toString();
  }


  /**
   * Fires an event to the Signal API, with optional data. Calling this
   * directly will make a request, but without any data set up in the
   * init method of signal_direct.js. So it is not advisable to use it
   * on its own.
   *
   * @protected
   * @method fireEvent
   *
   * @param  {String} name    The name of the event to fire
   * @param  {Object} [data]  Optional data associated with the event -- hashed guid will always be sent
   *
   * @return {Promise}  A promise to be resolved when the event successfully fires
   */
  function fireEvent (name, data) {

    data = data || {};

    var
      uri = buildUri(name, data),
      dfd = when.defer();

    request.post(uri, {}, {
      dataType: 'json'
    }).then(function (res) {
      dfd.resolve(uri, res);
    }).otherwise(function (e) {
      dfd.reject(uri, e);
    });

    return dfd.promise;
  }


  return {
    version: '0.0.1',
    fireEvent: fireEvent,
    init: _.once(init)
  };

}));
