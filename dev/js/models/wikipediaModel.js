// Global variable.
var myApp = myApp || {};

(function(app) {
  'use strict';

  /**
   * ViewModel that is related to wikipedia list.
   * @return {undefined}
   */
  app.WikipediaModel = function() {
    var self = this,
      pages;

    self.pageid = ko.observable('');
    self.content = ko.observable('');
    self.title = ko.observable('San Francisco');

    self.error = ko.observable(false);
    self.errorMsg = 'Currently Not Available. Try Again Later.';
    self.showError = ko.computed(function() {
      return self.error();
    });
  };

})(myApp);