// This file depends on jQuery. So, load it beforehand.

// Global variable.
var myApp = myApp || {};

(function(app) {
  'use strict';

  var URL = 'https://maps.googleapis.com/maps/api/js?callback=myApp.executeApp';

  /**
   * Success callback function for the google map api loading.
   * This calls the main applicaiton.
   * @return {undefined}
   */
  app.executeApp = function() {
    // Call the main application
    this.main();
  };

  // Call the google map API async.
  // Documentation: https://api.jquery.com/jquery.getscript/
  $.getScript(URL)
    .fail(function() {
      var ERR_MSG = 'Failed to load the map.';

      // This turn on the error message in the view.
      // The reason that I use jQuery, instead of knockoutjs, is that
      // the main application is not yet executed at this point so that I can't
      // refer to the view in knockoutjs.
      $('.error').removeClass('hidden');
      $('#err-msg').text(ERR_MSG);
    });
})(myApp);
