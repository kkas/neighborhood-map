/**
 * This file contains the main ViewModel, "ViewModel".
 * 'myApp.main()' will be called from outside when the application is ready
 * to start.
 */
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

  var FOURSQUARE_EXPLORE_BASE = 'https://api.foursquare.com/v2/venues/explore';
  var WIKIPEDIA_BASE ='https://en.wikipedia.org//w/api.php?callback=?';

  /**
   * ViewModel of this application.
   */
  var ViewModel = function() {
    var self = this;

    /*
     * Properties for error handling
     */
    self.errorHandler = new myApp.ErrorViewModel();

    /*
     * Properties for wikipedia section.
     */
    self.wikipedia = new myApp.WikipediaViewModel();

    /*
     * Properties for navigation menu.
     */
    self.nav = new myApp.NavigationViewModel();

    /*
     * Properties for map.
     */
    self.map = undefined;
    self.currentInfoWindow = undefined;
    self.curAnimatingMarker = undefined;
    self.animationTimerID = undefined;

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
        self.venueList.push(new myApp.VenueViewModel(data.venue));
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
      // See the doc about 'window.innerWidth'
      // https://developer.mozilla.org/en-US/docs/Web/API/Window/innerWidth
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
     * Create parameters for querying Foursquare API.
     * @param  {Object} params Object that contains additional parameters.
     * @return {Object} a object that contains parameters.
     */
    self.createFoursquareAPIParams = function(params) {
      var tmp = {};

      // If any params are passed in, add them to the returned object.
      if(params) {
        for(var key in params) {
          tmp[key] = params[key];
        }
      }

      // parameters necessary for authentication
      tmp.client_id = config.CLIENT_ID;
      tmp.client_secret = config.CLIENT_SECRET;
      tmp.v = '20151030';

      return tmp;
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
      // Use keywords for query if any.
      var keywordQuery = self.keyword() ? {query: self.keyword()} : {},
          params;

      // Add more parameters and combine them with keyword queries.
      keywordQuery.ll = initialLocation.lat + ',' + initialLocation.lng;
      params = self.createFoursquareAPIParams(keywordQuery);

      // Clean up the current venue list.
      // Remove all the markers first, and the delete the items in the list.
      self.removeAllMarkers();
      self.resetListView();

      $.getJSON(FOURSQUARE_EXPLORE_BASE, params, function(data) {
        // create and add venues to the list.
        self.addVenues(data.response.groups[0].items);

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
      // Apply an animation onto the clicked item.
      // Do not stop the animation when the user clicks on the same item.
      if(self.curSelectedVenue !== venue) {
        self.animateClickedItem(venue);
      }
      self.curSelectedVenue = venue;

      // Close the list view. If the device is a large one, setting this value
      // to false should be ignored.
      self.nav.menuShown(false);

      // Pan to the associated marker.
      // https://developers.google.com/maps/documentation/javascript/examples/event-simple
      self.map.panTo(venue.marker.getPosition());
    };

    /**
     * Set the bouncing animation to the marker that is clicked.
     * Then open the associated infoWindow for the marker.
     * @param  {venueViewModel} venue venue item on which the user just clicked.
     * @return {undefined}
     */
    self.animateClickedItem = function(venue) {
      // If any marker is animating, stop it first.
      if (self.curAnimatingMarker) {
        self.curAnimatingMarker.setAnimation(null);
        self.curAnimatingMarker = null;

        // cancel the timer
        window.clearTimeout(self.animationTimerID);
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

      // Set a timer to stop the animation (after 3 sec)
      self.animationTimerID = window.setTimeout(function() {
        self.curAnimatingMarker.setAnimation(null);
        self.curAnimatingMarker = null;
      }, 3000);

      // Store the marker for the next round.
      self.curAnimatingMarker = venue.marker;
    };

    /**
     * Create parameters for querying Wikipedia API.
     * @param  {Object} params Object that contains additional parameters.
     * @return {Object} a object that contains parameters.
     */
    self.createWikipediaAPIParams = function(params) {
      var tmp = {};

      // If any params are passed in, add them to the returned object.
      if(params) {
        for(var key in params) {
          tmp[key] = params[key];
        }
      }

      // add necessary parameters
      tmp.action = 'query';
      tmp.prop = 'extracts';
      tmp.format = 'json';
      tmp.exintro = '';
      tmp.titles = 'San Francisco';

      return tmp;
    };

    /**
     * Call the wikipedia API and set the content if success.
     * @return {undefined}
     */
    self.getWikipediaContent = function() {
      // Add more parameters.
      var params = self.createWikipediaAPIParams({});

      $.getJSON(WIKIPEDIA_BASE, params, function(data) {
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
        self.venueList.push(new myApp.VenueViewModel({
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
          url: dataAry[i].url,
          hours: dataAry[i].hours,
          price: dataAry[i].price,
          rating: dataAry[i].rating
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
