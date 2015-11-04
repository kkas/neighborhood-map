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

    self.errorMessage = ko.observable('');

    self.displayErrorMessage = ko.computed(function() {
      return self.errorMessage ? true : false;
    });
  };

})(myApp);
