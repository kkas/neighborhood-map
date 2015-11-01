$(function() {
  'use strict';

  var CLIENT_ID = 'UIIR1040LGBT4NTI3IGTRUYQY5S5WTQ12CVTPP4YAQYGYAFC',
    //TODO: Replace this secret with something else!
    CLIENT_SECRET = 'DRK32O210T1JHBMFU1GF3PGI3GVYZXUIFADJP4NFC1JVWJXJ';

  /**
   * [initialLocation description]
   * @type {Object}
   */
  var initialLocation = {
    lat: 35.792621,
    lng: 139.806513
  };

  var foursquareSearchAPI = 'https://api.foursquare.com/v2/venues/search?' +
    'll=' + initialLocation.lat + ',' + initialLocation.lng +
    '&client_id=' + CLIENT_ID + '&client_secret=' +
    CLIENT_SECRET + '&v=20151030';

  /**
   * [Venue description]
   * @param {[type]} data [description]
   */
  var Venue = function(data) {
    var self = this;

    //TODO: need to find a better way for this.
    self.createContent = function() {
      var content = '<div class="content">',
        keys = [
          'name',
          'contact',
          'popular',
          'likes',
          'shortUrl'
        ];

      keys.forEach(function(key) {
        content += '<p>' + self[key] + '</p>';
      });

      content += '</div>';

      return content;
    };

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

    self.name = data.name || '';

    self.description = data.description || '';
    self.contact = self.createContact(data.contact) || '';
    self.popular = data.popular || '';
    self.likes = data.likes || '';
    self.shortUrl = data.shortUrl || '';

    self.position = new google.maps.LatLng(
      data.location.lat, data.location.lng);

    self.content = self.createContent(self);
  };

  /**
   * [ViewModel description]
   */
  var ViewModel = function() {
    var self = this;

    self.map = undefined;
    self.currentInfoWindow = undefined;
    self.isTimerSet = false;

    self.venueList = ko.observableArray([]);
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
        length = self.venueList().length,
        i,
        filteredList = [];

      // Return the full list when filterStr is empty (no filtering)
      if (!filterStr) {
        return self.venueList();
      }

      for (i = 0; i < length; i++) {
        if (filterRegExp.test(self.venueList()[i].name)) {
          filteredList.push(self.venueList()[i]);
        }
      }

      // Create new markers with the new list.
      // Avoid re-creating the same markers on each keystroke in the keyword
      // by setting the timer.
      if (!self.isTimerSet) {
        setTimeout(function() {
          self.isTimerSet = false;
          self.createMarkers();
        }, 1000);

        self.isTimerSet = true;
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
        self.venueList.push(new Venue(data));
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

        self.map = new google.maps.Map(canvas , mapOptions);
      });
    };

    /**
     * [createMarkers description]
     * @return {[type]}           [description]
     */
    self.createMarkers = function() {
      // Clear up the marker array before adding new ones.
      self.deleteAllMarkers();

      self.filteredVenueList().forEach(function(venue) {
        var marker = new google.maps.Marker({map: self.map, position: venue.position}),
          infoWindow = new google.maps.InfoWindow({
            content: venue.content
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
     * [getVenueList description]
     * @return {[type]} [description]
     */
    self.getVenueList = function() {
      console.log('getVenueList called');

      // Clean up the current venue list (this is mainly for the search more
      // than 2nd time)
      self.venueList.removeAll();

      $(function(){
        // Use the keyword if any for the search.
        if (self.keyword().length > 0) {
          foursquareSearchAPI += '&query=' + self.keyword();
        }

        $.getJSON(foursquareSearchAPI, function(data) {
          // When success
          // create and add venues to the list.
          self.addVenues(data.response.venues);

          // create markers on the map
          self.createMarkers();
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

      // Retrieve the venue list
      self.getVenueList();
    };

    // Call the initialization
    self.init();
  };

  ko.applyBindings(new ViewModel());
});
