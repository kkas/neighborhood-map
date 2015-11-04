// This file depends on jQuery. So, load it beforehand.

// Global variable.
var myApp = myApp || {};

/**
 * Main function of this application.
 * Called when the google map api is successfully load.
 * @return {undefined}
 */
myApp.main = function() {
  'use strict';

  var CLIENT_ID = 'UIIR1040LGBT4NTI3IGTRUYQY5S5WTQ12CVTPP4YAQYGYAFC',
    //TODO: Replace this secret with something else!
    CLIENT_SECRET = 'DRK32O210T1JHBMFU1GF3PGI3GVYZXUIFADJP4NFC1JVWJXJ',

    /**
     * Size of an icon on the map.
     * According to the following document, the available sizes are 32, 44, 64,
     * and 88.
     * https://developer.foursquare.com/docs/responses/category
     * @type {String}
     */
    ICON_SIZE = '32';

  /**
   * [initialLocation description]
   * @type {Object}
   */
  var initialLocation = {
    lat: 37.7749300,
    lng: -122.4194200
  };

  var foursquareSearchAPI = 'https://api.foursquare.com/v2/venues/search?' +
    'll=' + initialLocation.lat + ',' + initialLocation.lng +
    '&client_id=' + CLIENT_ID + '&client_secret=' +
    CLIENT_SECRET + '&v=20151030';

  var WIKIPEDIA_API_BASE ='https://en.wikipedia.org//w/api.php' +
      '?action=query&prop=extracts&format=json&exintro=' +
      '&titles=San%20Francisco&callback=?';

  /**
   * Model that contains things that are related to handling
   * errors. This is currently used for Foursquare Search API.
   */
  var ErrorModel = function() {
    var self = this;

    self.errorMessage = ko.observable('');

    self.displayErrorMessage = ko.computed(function() {
      return self.errorMessage ? true : false;
    }, self);
  };

  /**
   * Model that contains
   * @param {[type]} data [description]
   */
  var VenueModel = function(data) {
    var self = this,
    categories = data.categories,
    icon;

    /**
     * Creates a content that will be displayed in a
     * infoWindow.
     *
     * @return {String} string that contains the HTML to be
     * used in the infoWindow.
     */
    self.createInfoWindowContent = function() {
      var infoWindowContentHTML = '<div class="content">',
        keys = [
          'name',
          'contact',
          'popular',
          'likes',
          'shortUrl'
        ];

      keys.forEach(function(key) {
        infoWindowContentHTML += '<p>' + self[key] + '</p>';
      });

      infoWindowContentHTML += '</div>';

      return infoWindowContentHTML;
    };

    /**
     * Create a contact that will be displayed in a infoWindow.
     * @param  {Object} contact  Object that is returned from the API and
     * contains contact info
     * @return {String} string that contains the HTML to be used in the
     * infoWindow.
     */
    self.createContact = function(contact) {
      var contactHTML = '<ul class="list-inline">',
        key;

      for (key in contact) {
        if (contact[key]) {
          contactHTML += '<li>' + '<strong>' + key + ':</strong>' +
           contact[key] + '</li>';
        }
      }

      contactHTML += '</ul>';

      return contactHTML;
    };

    /*
     * -----------------------
     * Properties for venue
     * -----------------------
     */
    self.name = data.name || '';
    self.description = data.description || '';
    self.contact = self.createContact(data.contact) || '';
    self.popular = data.popular || '';
    self.likes = data.likes || '';
    self.shortUrl = data.shortUrl || '';

    /*
     * categories can be empty. See the doc for this for more info.
     * https://developer.foursquare.com/docs/responses/venue
     */
    if (categories.length > 0) {
      icon = categories[0].icon;
      self.icon = icon.prefix + 'bg_' + ICON_SIZE + icon.suffix;
    } else {
      // Use the default google map icon if the categories array is empty.
      self.icon = undefined;
    }

    /*
     * -----------------------
     * Properties for map
     * -----------------------
     */
    self.position = new google.maps.LatLng(
      data.location.lat, data.location.lng);
    self.marker = undefined;
    self.infoWindowContent = self.createInfoWindowContent(self);
  }; // end of VenueModel

  /**
   * ViewModel of this application.
   */
  var ViewModel = function() {
    var self = this;

    /*
     * Properties for error handling
     */
    self.errorHandler = ko.observable(new ErrorModel());

    /*
     * Properties for wikipedia section.
     */
    self.wikipedia = ko.observable(new myApp.WikipediaModel());

    /*
     * Properties for map.
     */
    self.map = undefined;
    self.currentInfoWindow = undefined;
    self.isTimerSet = false;
    self.curAnimatingMarker = undefined;

    // list that holds all the items (master list)
    self.venueList = ko.observableArray([]);
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

      /*
       * Create new markers with the new list.
       * Avoid re-creating the same markers on each keystroke in the keyword
       * by setting the timer.
       */
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
     * Add venues to the venueList.
     * This sets the master venue item list.
     * @param {[type]} venuesAry [description]
     * @return {undefined}
     */
    self.addVenues = function(venuesAry) {
      venuesAry.forEach(function(data) {
        // Create new venue object
        self.venueList.push(new VenueModel(data));
      });
    };

    /**
     * Load the map on the screen.
     * @return {undefined}
     */
    self.loadGoogleMap = function() {
      var canvas = document.getElementById('map-canvas');

      var latlng = new google.maps.LatLng(
        initialLocation.lat, initialLocation.lng);

      var mapOptions = {
        zoom: 18,
        center: latlng,
      };

      self.map = new google.maps.Map(canvas , mapOptions);
    };

    /**
     * Create makers on the map with infoWindows on each marker.
     * @return {undefined}
     */
    self.createMarkers = function() {

      // Remove all the markers before placing new ones.
      self.removeAllMarkers();

      // Create the markers based on the filtered list (not the master list).
      self.filteredVenueList().forEach(function(venue) {
        var marker = new google.maps.Marker(
          {
            map: self.map,
            position: venue.position,
            icon: venue.icon,
            animation: google.maps.Animation.DROP
          }),
          infoWindow = new google.maps.InfoWindow({
            content: venue.infoWindowContent
          });

          // Set the marker to the current venue object.
          venue.marker = marker;

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
     * Remove all the markers from the map.
     * @return {undefined}
     */
    self.removeAllMarkers = function() {
      var i,
        length = self.venueList().length,
        marker;

      /*
       * Use master list here so that we can remove all the markers even
       * after the search filtering is applied.
       */
      for (i = 0; i < length; i++) {
        marker = self.venueList()[i].marker;
        if (marker !== undefined) {
          self.venueList()[i].marker.setMap(null);
        }
      }
    };

    /**
     * Reset the list on the screen.
     * @return {undefined}
     */
    self.resetListView = function() {
      // Clean up all the items on the screen.
      self.venueList.removeAll();

      // Set an empty string to remove any error messages.
      self.errorHandler().errorMessage('');
    };

    /**
     * Call the API to retrieve items based on the keyword that is typed in
     * from the user.
     *
     * Currently, FourSquare Search API is used.
     * @return {undefined}
     */
    self.getVenueList = function() {
      // Clean up the current venue list (this is mainly for the search more
      // than 2nd time)
      self.resetListView();

      // Use the keyword if any for the search.
      if (self.keyword().length > 0) {
        foursquareSearchAPI += '&query=' + self.keyword();
      }

      $.getJSON(foursquareSearchAPI, function(data) {
        // create and add venues to the list.
        self.addVenues(data.response.venues);

        // create markers on the map
        self.createMarkers();
      }).fail(function() {
        var ERROR_MSG = 'Failed to get response from FourSquare Search';

        self.errorHandler().errorMessage(ERROR_MSG);
      });
    };

    /**
     * Set the bouncing animation to the marker that is clicked.
     * @param  {Observable} venue venue item on which the user just clicked.
     * @return {undefined}
     */
    self.animateClickedItem = function(venue) {
      // If any marker is animating, stop it first.
      if (self.curAnimatingMarker !== undefined) {
        self.curAnimatingMarker.setAnimation(null);
      }

      venue.marker.setAnimation(google.maps.Animation.BOUNCE);

      // Store the marker for the next round.
      self.curAnimatingMarker = venue.marker;
    };

    /**
     * Call the wikipedia API and set the content if success.
     * @return {undefined}
     */
    self.getWikipediaContent = function() {
      $.getJSON(WIKIPEDIA_API_BASE, function(data) {
        // Set the content
        self.setWikipediaResult(data);
      }).fail(function() {
        console.log('failed wikipedia');
        self.wikipedia().error(true);
      });
    };

    /**
     * Set the content for the wikipedia result.
     * @return {undefined}
     */
    self.setWikipediaResult = function(data) {
      var pages = data.query.pages,
        pageid = Object.keys(pages)[0];

      self.wikipedia().pageid(pageid);
      self.wikipedia().content(pages[pageid].extract);
      self.wikipedia().title(pages[pageid].title);
    };

    // Initial work
    self.init = function() {
      // Load the google map on the canvas
      self.loadGoogleMap();

      // Retrieve the wikipedia content
      self.getWikipediaContent();

      // Retrieve the venue list
      self.getVenueList();
    };

    // Call the initialization
    self.init();
  };

  ko.applyBindings(new ViewModel());
};
