var myApp=myApp||{};!function(app){"use strict";app.ErrorViewModel=function(){var self=this;self.error=ko.observable(!1),self.errorMessage="Failed to get response from FourSquare Search",self.displayErrorMessage=ko.computed(function(){return self.error()})}}(myApp);