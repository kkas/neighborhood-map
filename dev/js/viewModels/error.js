/**
 * This file contains a ViewModel that is related to errors.
 * This viewModel is a sub viewModel of the main viewModel.
 */
// Global variable.
var myApp = myApp || {};

(function(app) {
  'use strict';

  /**
   * ViewModel that is related to handling erros.
   * @return {undefined}
   */
  app.ErrorViewModel = function() {
    var self = this;

    self.error = ko.observable(false);
    self.errorMessage = 'Failed to get response from FourSquare Search';
  };

})(myApp);
