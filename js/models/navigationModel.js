// This file depends on jQuery. So, load it beforehand.

// Global variable.
var myApp = myApp || {};

(function(app) {
  'use strict';

  //TODO: change the name.
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
