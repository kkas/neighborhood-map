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
      //
      // This will also prevent not showing correct items when typing too fast.
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

      // Use master list here so that we can remove all the markers even
      // after the search filtering is applied.
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
        self.errorHandler.error(true);
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
        // Call the API for the items
        self.getVenueList();
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
