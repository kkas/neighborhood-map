// Global variable.
var myApp = myApp || {};

(function(app) {
  'use strict';

  /*
   * Holds configurations of the entire app.
   */
  app.config = {
    CLIENT_ID: 'UIIR1040LGBT4NTI3IGTRUYQY5S5WTQ12CVTPP4YAQYGYAFC',
    //TODO: Replace this secret with something else!
    CLIENT_SECRET: 'DRK32O210T1JHBMFU1GF3PGI3GVYZXUIFADJP4NFC1JVWJXJ',

    localStorageItem: 'my-neighborhood-app',

    // Target device width of tablet size devices. This is used to indicate
    // whether the user is using a small device or not.
    // e.g. if the current viewport size is equals to or less than this value
    // the user is working on a 'small' size device.
    SMALL_DEVICE_WIDTH: 768
  };

})(myApp);
