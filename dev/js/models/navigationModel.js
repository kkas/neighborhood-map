/**
 * This file contains a ViewModel that is related to the navigation menu.
 * This viewModel is a sub viewModel of the main viewModel.
 */
// This file depends on jQuery. So, load it beforehand.

// Global variable.
var myApp = myApp || {};

(function(app) {
  'use strict';

  /**
   * ViewModel that is related to Navigation menu on the left.
   * @return {undefined}
   */
  app.NavigationModel = function() {
    var self = this;

    self.menuShown = ko.observable(false);

    // Toggle the boolean value.
    self.toggleNavMenu = function() {
      // If the menu is shown
      if(self.menuShown()) {
        self.menuShown(false);
      } else {
        self.menuShown(true);
      }
    };
  };
})(myApp);
