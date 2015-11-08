/**
 * This file contains a ViewModel that is related to the Wikipedia.
 * This viewModel is a sub viewModel of the main viewModel.
 */
// Global variable.
var myApp = myApp || {};

(function(app) {
  'use strict';

  /**
   * ViewModel that is related to wikipedia list.
   * @return {undefined}
   */
  app.WikipediaViewModel = function() {
    var self = this,
      pages;

    self.pageid = ko.observable('');
    self.content = ko.observable('');
    self.title = ko.observable('San Francisco');

    self.error = ko.observable(false);
    self.errorMsg = 'Wikipedia is currently not available. Try again later.';
  };

})(myApp);
