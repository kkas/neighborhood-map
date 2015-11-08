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

  var config = myApp.config;

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
    '&client_id=' + config.CLIENT_ID + '&client_secret=' +
    config.CLIENT_SECRET + '&v=20151030';

  var WIKIPEDIA_API_BASE ='https://en.wikipedia.org//w/api.php' +
      '?action=query&prop=extracts&format=json&exintro=' +
      '&titles=San%20Francisco&callback=?';

  /**
   * ViewModel of this application.
   */
  var ViewModel = function() {
    var self = this;

    /*
     * Properties for error handling
     */
    self.errorHandler = new myApp.ErrorModel();

    /*
     * Properties for wikipedia section.
     */
    self.wikipedia = new myApp.WikipediaModel();

    /*
     * Properties for navigation menu.
     */
    self.nav = new myApp.NavigationModel();

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
    self.curSelectedVenue = undefined;

    /**
     * Function that handles the filtering when the user type in
     * keywords for filtering.
     *
     * This function will be called whenever the keyword is changed.
     *
     * @param  {String} filterStr keyword string used for filtering
     * (this is what the user typed in)
     * @return {undefined}
     */
    self.applyFilter = function(filterStr) {
      var filterRegExp = new RegExp(filterStr, 'i'),
        length = self.venueList().length,
        i;

      // Close the current opened infoWindow if any.
      if (self.currentInfoWindow !== undefined) {
        self.currentInfoWindow.close();
      }

      for (i = 0; i < length; i++) {
        if (filterRegExp.test(self.venueList()[i].name)) {
          // When the examined item is matched, show the item
          self.venueList()[i].marker.setVisible(true);
          self.venueList()[i].isVisible(true);
          continue;
        }

        // If the examined item is filtered, make the item hidden.
        self.venueList()[i].isVisible(false);
        self.venueList()[i].marker.setVisible(false);
      }
    };
    // Subscribe the change of the 'keyword'. When changed, call the
    // function.
    self.keyword.subscribe(self.applyFilter);

    /**
     * Add venues to the venueList.
     * This sets the master venue item list.
     *
     * Then, save all the items into the local storage.
     * @param {Array} venuesAry array that contains venue data.
     * @return {undefined}
     */
    self.addVenues = function(venuesAry) {
      venuesAry.forEach(function(data) {
        // Create new venue object
        self.venueList.push(new myApp.VenueModel(data));
      });

      // Save the new list to the local storage
      window.localStorage.setItem(config.localStorageItem,
        ko.toJSON(self.venueList));
    };

    /**
     * Return a zoom level for the map. The level will be determined by the
     * viewport width. If the device is small, it will return a smaller number,
     * which will give broader map view.
     * @return {Number} a number for a zoom level of the map
     */
    self.getZoomLevel = function() {
      var viewportWidth = window.innerWidth;

      // If the device size is small, set the zoom level to a little broader
      return viewportWidth < myApp.config.SMALL_DEVICE_WIDTH ? 13 : 18;
    };

    /**
     * Load the map on the screen.
     * @return {undefined}
     */
    self.loadGoogleMap = function() {
      var canvas = document.getElementById('map-canvas'),
          zoomLevel = self.getZoomLevel();

      var latlng = new google.maps.LatLng(
        initialLocation.lat, initialLocation.lng);

      var mapOptions = {
        zoom: zoomLevel,
        center: latlng,
      };

      self.map = new google.maps.Map(canvas , mapOptions);
    };

    /**
     * Attach an infoWindow to a marker.
     * Add the click event listener that opens the infoWindow.
     *
     * The infoWindow will keep the content that is associated with the
     * marker.
     *
     * Inspired by:
     * https://developers.google.com/maps/documentation/javascript/events#EventClosures
     *
     * @param  {google.maps.Marker} marker      a marker object to which the
     * event listener will be attached
     * @param  {String} contentHTML String that contains the content of the
     * infoWindow
     * @return {undefined}
     */
    self.attachInfoWindow = function(marker, contentHTML) {
      var infoWindow = new google.maps.InfoWindow({
        content: contentHTML
      });

      // Add a click event listener
      marker.addListener('click', function() {
        infoWindow.open(marker.get('map'), marker);

        // Only one infoWindow can be open at once.
        // If the current InfoWindow and infoWindow are the same,
        // meaning the same marker is clicked in a row, do not close it.
        if (self.currentInfoWindow !== infoWindow &&
          self.currentInfoWindow !== undefined) {
          self.currentInfoWindow.close();
        }

        self.currentInfoWindow = infoWindow;
      });
    };

    /**
     * Create makers on the map with the infoWindows.
     * @return {undefined}
     */
    self.createMarkers = function() {
      // Iterate through each item and create a marker for it.
      self.venueList().forEach(function(venue) {
        var marker = new google.maps.Marker(
          {
            map: self.map,
            position: venue.position,
            icon: venue.icon,
          });

          // Set the marker to the current venue object.
          venue.marker = marker;

          // Attach the marker and a infoWindow with the content stored in the
          // venue object.
          self.attachInfoWindow(marker, venue.infoWindowContent);
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

      // Remove all the markers from the map.
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

      // Reset the error flag.
      self.errorHandler.error(false);
    };

    /**
     * Call the API to retrieve items based on the keyword that is typed in
     * from the user.
     * Currently, FourSquare Search API is used.
     *
     * Create a new list with the item retrieved from the API call.
     *
     * @return {undefined}
     */
    self.createNewList = function() {
      var query = foursquareSearchAPI;

      // Clean up the current venue list.
      // Remove all the markers first, and the delete the items in the list.
      self.removeAllMarkers();
      self.resetListView();

      // Use the keyword if any for the search.
      if (self.keyword().length > 0) {
        query += '&query=' + self.keyword();
      }

      $.getJSON(query, function(data) {
        // create and add venues to the list.
        self.addVenues(data.response.venues);

        // create markers on the map
        self.createMarkers();
      }).fail(function() {
        self.errorHandler.error(true);
      });
    };

    /**
     * Handle a click event of an item in the list view.
     * @param  {venueViewModel} venue venue item on which the user just clicked.
     * @return {undefined}
     */
    self.handleItemClick = function(venue) {
      // Indicate whether the user is using a small device or not.
      // See the doc about 'window.innerWidth'
      // https://developer.mozilla.org/en-US/docs/Web/API/Window/innerWidth
      var isDeviceSmall = window.innerWidth <= config.SMALL_DEVICE_WIDTH;

      // Hide the list view if the device is small.
      if(isDeviceSmall) {
        self.nav.menuShown(false);
      }

      // Apply an animation onto the clicked item.
      // Do not stop the animation when the user clicks on the same item.
      if(self.curSelectedVenue !== venue) {
        self.animateClickedItem(venue);
      }
      self.curSelectedVenue = venue;

      // Close the list view.
      self.nav.menuShown(false);
    };

    /**
     * Set the bouncing animation to the marker that is clicked.
     * Then open the associated infoWindow for the marker.
     * @param  {venueViewModel} venue venue item on which the user just clicked.
     * @return {undefined}
     */
    self.animateClickedItem = function(venue) {
      // If any marker is animating, stop it first.
      if (self.curAnimatingMarker !== undefined) {
        self.curAnimatingMarker.setAnimation(null);
      }

      // If any infoWindow is opened, close it.
      if(self.currentInfoWindow !== undefined) {
        self.currentInfoWindow.close();
      }

      // Recreate the infoWindow based on the info stored in the clicked object.
      self.currentInfoWindow = new google.maps.InfoWindow({
        content: venue.infoWindowContent
      });

      // Open the newly created infoWindow.
      self.currentInfoWindow.open(venue.marker.get('map'), venue.marker);

      // Set the animation onto the associated marker.
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
        self.wikipedia.error(true);
      });
    };

    /**
     * Set the content for the wikipedia result.
     * @return {undefined}
     */
    self.setWikipediaResult = function(data) {
      var pages = data.query.pages,
        pageid = Object.keys(pages)[0];

      self.wikipedia.pageid(pageid);
      self.wikipedia.content(pages[pageid].extract);
      self.wikipedia.title(pages[pageid].title);
    };

    /**
     * Restore the saved data into the master list.
     * @param {Array} dataAry an array that contains saved data
     * @return {undefined}
     */
    self.restoreSavedData = function(dataAry) {
      var i, length = dataAry.length;

      for (i = 0; i < length; i++) {
        self.venueList.push(new myApp.VenueModel({
          name: dataAry[i].name,
          description: dataAry[i].description,
          contact: dataAry[i].contact,
          popular: dataAry[i].popular,
          likes: dataAry[i].likes,
          shortUrl: dataAry[i].shortUrl,
          location: dataAry[i].location,
          icon: dataAry[i].icon,
          position: dataAry[i].position,
          // marker: dataAry[i].marker,
          infoWindowContent: dataAry[i].infoWindowContent,
          categories: dataAry[i].categories,
        }));
      }
    };

    /**
     * Initialize the item list.
     * If saved data is found in the local storage, restore them.
     * Otherwise, make the API call and create the list.
     * @return {undefined}
     */
    self.initializeList = function() {
      // contains null when the data has not been found.
      var storedData = window.localStorage.getItem(config.localStorageItem);

      if(storedData === null) {
        // Call the API for the items and create a new list.
        self.createNewList();
        return;
      }

      // Restore the saved data
      self.restoreSavedData(JSON.parse(storedData));

      // Create markers
      self.createMarkers();
    };

    // Initial work
    self.init = function() {
      // Load the google map on the canvas
      self.loadGoogleMap();

      // Retrieve the wikipedia content
      self.getWikipediaContent();

      // Initialize the venue list
      self.initializeList();
    };

    // Call the initialization
    self.init();
  };

  // Start
  ko.applyBindings(new ViewModel());
};
