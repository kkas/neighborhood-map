$(function() {
  'use strict';

  var CLIENT_ID = 'UIIR1040LGBT4NTI3IGTRUYQY5S5WTQ12CVTPP4YAQYGYAFC',
    //TODO: Replace this secret with something else!
    CLIENT_SECRET = 'DRK32O210T1JHBMFU1GF3PGI3GVYZXUIFADJP4NFC1JVWJXJ';

  /**
   * [Venues description]
   * @param {[type]} data [description]
   */
  var Venues = function(data) {
    this.name = ko.observable(data.name);
  };

  /**
   * [initialLocation description]
   * @type {Object}
   */
  var initialLocation = {
    lat: 35.792621,
    lng: 139.806513
  };

  /**
   * [ViewModel description]
   */
  var ViewModel = function() {
    var self = this;

    self.venuesList = ko.observableArray([]);

    /**
     * [addVenues description]
     * @param {[type]} dataAry [description]
     */
    self.addVenues = function(dataAry) {
      dataAry.forEach(function(data) {
        // Create new venue object
        self.venuesList.push(new Venues(data));
      });
    };

    /**
     * [loadGoogleMap description]
     * @return {[type]} [description]
     */
    self.loadGoogleMap = function() {
      // Load after the DOM has been loaded completely.
      $(function(){
        var canvas = document.getElementById('map-canvas');

        //TODO: add dynamic lat and lng values
        var latlng = new google.maps.LatLng(
          initialLocation.lat, initialLocation.lng);

        var mapOptions = {
          zoom: 15,
          center: latlng,
        };

        var map = new google.maps.Map(canvas , mapOptions);
      });
    };

    /**
     * [getVenuesList description]
     * @return {[type]} [description]
     */
    self.getVenuesList = function() {
      $(function(){
        // Initial Search
        var foursquareSearchAPI = 'https://api.foursquare.com/v2/venues/search?' +
            'll=' + initialLocation.lat + ',' + initialLocation.lng +
            '&client_id=' + CLIENT_ID + '&client_secret=' +
            CLIENT_SECRET + '&v=20151030';

        $.getJSON(foursquareSearchAPI, function(data) {
          // When success, create and add venues to the list.
          self.addVenues(data.response.venues);
        }).fail(function() {
          console.log('fail');
          //TODO: add display err message to the user.
        });
      });
    };

    // Initial work
    self.init = function() {
      // Load the google map on the canvas
      self.loadGoogleMap();

      // Retrieve the venues list
      self.getVenuesList();
    };

    // Call the initialization
    self.init();
  };

  ko.applyBindings(new ViewModel());
});
