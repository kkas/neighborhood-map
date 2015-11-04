// Global variable.
var myApp = myApp || {};

(function(app) {
  'use strict';

  /**
   * Model that contains things that are related to handling
   * errors. This is currently used for Foursquare Search API.
   */
  app.ErrorModel = function() {
    var self = this;

    self.errorMessage = ko.observable('');

    self.displayErrorMessage = ko.computed(function() {
      return self.errorMessage ? true : false;
    }, self);
  };

})(myApp);
