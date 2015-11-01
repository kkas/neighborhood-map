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
    this.name = data.name;
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
    var self = this,
      map,
      currentInfoWindow;

    self.venuesList = ko.observableArray([]);
    //TODO: check if this need to be observable.
    self.markers = ko.observableArray([]);
    self.infoWindows = ko.observableArray([]);

    self.curVenue = ko.observable({});

    self.keyword = ko.observable('');

    /**
     * Filtered list of venues. Computed observable.
     *
     * This list is actually bound to the list shown in the view.
     * The filter is the text that is typed in the filter input in the view.
     * The filter will be applied only if the filter is not empty.
     * The filter works by case-insensitive.
     *
     * @param  {function} function
     * @return {Array} an array list of venues that contains ones that contain
     * the string of filtering word. If no filter is applied, it simply returns
     * the list with all the items.
     */
    self.filteredVenueList = ko.computed(function() {
      var filterStr = self.keyword(),
        filterRegExp = new RegExp(filterStr, 'i'),
        length = self.venuesList().length,
        i,
        filteredList = [];

      // Return the full list when filterStr is empty (no filtering)
      if (!filterStr) {
        return self.venuesList();
      }

      for (i = 0; i < length; i++) {
        if (filterRegExp.test(self.venuesList()[i].name)) {
          filteredList.push(self.venuesList()[i]);
        }
      }

      return filteredList;
    }, self);

    /**
     * [addVenues description]
     * @param {[type]} venuesAry [description]
     */
    self.addVenues = function(venuesAry) {
      venuesAry.forEach(function(data) {
        // Create new venue object
        self.venuesList.push(new Venues(data));
      });

      // self.createMarkers(venuesAry);
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

        self.map = new google.maps.Map(canvas , mapOptions);
      });
    };

    /**
     * [createMarkers description]
     * @param  {[type]} venuesAry [description]
     * @return {[type]}           [description]
     */
    self.createMarkers = function(venuesAry) {

      // Clear up the marker array before adding new ones.
      self.deleteAllMarkers();

      venuesAry.forEach(function(venue) {
        var location = venue.location,
          position = new google.maps.LatLng(location.lat, location.lng),
          marker = new google.maps.Marker({map: self.map, position: position}),
          infoWindow = new google.maps.InfoWindow({
            content: self.createContent(venue)
          });

        // Add the marker.
        self.markers.push(marker);

        // Open the infoWindow when the marker is clicked
        marker.addListener('click', function(e) {

          infoWindow.open(self.map, marker);

          // Only one infoWindow can be open at once.
          if (self.currentInfoWindow !== undefined) {
            self.currentInfoWindow.close();
          }

          self.currentInfoWindow = infoWindow;
        });
      });
    };

    /**
     * [deleteAllMarkers description]
     * @return {[type]} [description]
     */
    self.deleteAllMarkers = function() {
      var i,
        length = self.markers().length;

      // Before deleting delete the marker from the map.
      for (i = 0; i < length; i++) {
        self.markers()[i].setMap(null);
      }

      // Remove everything in the array list.
      self.markers.removeAll();
    };

    /**
     * [createContent description]
     * @param  {[type]} venue [description]
     * @return {[type]}       [description]
     */
    //TODO: need to change?
    self.createContent = function(venue) {
      var venueInfo = {
        name: venue.name || '',
        description: venue.description || '',
        contact: self.createContact(venue.contact) || '',
        popular: venue.popular || '',
        likes: venue.likes || '',
        shortUrl: venue.shortUrl || '',
      },
      content = '<div class="content">',
      key;

      for (key in venueInfo) {
        if (venueInfo) {
          content += '<p>' + venueInfo[key] + '</p>';
        }
      }
      content += '</div>';

      return content;
    };

    /**
     * [createContact description]
     * @param  {[type]} contact [description]
     * @return {[type]}         [description]
     */
    self.createContact = function(contact) {
      var contactString = '<ul class="list-inline">',
        key;

      for (key in contact) {
        if (contact[key]) {
          contactString += '<li>' + '<strong>' + key + ':</strong>' +
           contact[key] + '</li>';
        }
      }

      contactString += '</ul>';

      return contactString;
    };

    /**
     * [getVenuesList description]
     * @return {[type]} [description]
     */
    self.getVenuesList = function() {
      console.log('getVenuesList called');

      // Clean up the current venue list (this is mainly for the search more
      // than 2nd time)
      self.venuesList.removeAll();

      $(function(){
        // Initial Search
        var foursquareSearchAPI = 'https://api.foursquare.com/v2/venues/search?' +
            'll=' + initialLocation.lat + ',' + initialLocation.lng +
            '&client_id=' + CLIENT_ID + '&client_secret=' +
            CLIENT_SECRET + '&v=20151030';

        // Use the keyword if any for the search.
        if (self.keyword().length > 0) {
          foursquareSearchAPI += '&query=' + self.keyword();
        }

        $.getJSON(foursquareSearchAPI, function(data) {
          // When success
          // create and add venues to the list.
          self.addVenues(data.response.venues);

          // create markers for the map according to the the response
          self.createMarkers(data.response.venues);
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
