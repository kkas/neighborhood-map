/**
 * This file contains a ViewModel that is related to errors.
 */

// Global variable.
var myApp = myApp || {};

(function(app) {
  'use strict';

  /**
   * ViewModel that is related to handling erros.
   * @return {undefined}
   */
  app.ErrorModel = function() {
    var self = this;

    self.error = ko.observable(false);
    self.errorMessage = 'Failed to get response from FourSquare Search';
    self.displayErrorMessage = ko.computed(function() {
      return self.error();
    });
  };

})(myApp);
