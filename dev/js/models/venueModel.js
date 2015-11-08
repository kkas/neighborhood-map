/**
 * This file contains a ViewModel that is related to venue info.
 */
// Global variable.
var myApp = myApp || {};

(function(app) {
  'use strict';

  /**
   * Size of an icon on the map.
   * According to the following document, the available sizes are 32, 44, 64,
   * and 88.
   * https://developer.foursquare.com/docs/responses/category
   * @type {String}
   */
  var ICON_SIZE = '32';

  /**
   * Model that contains venue infomation
   */
  app.VenueModel = function(data) {
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
      var infoWindowContentHTML = '<div class="content">';

      infoWindowContentHTML += self['name'] ?
        '<p class="name">' + self['name'] + '</p>' : '';
      infoWindowContentHTML += self['contactHTML'] ?
        '<p class="contact">' + self['contactHTML'] + '</p>' : '';
      infoWindowContentHTML += self['popular'] ?
        '<p class="popular">' + self['popular'] + '</p>' : '';
      infoWindowContentHTML += self['likes'] ?
        '<p class="likes">' + self['likes'] + '</p>' : '';
      infoWindowContentHTML += self['shortUrl'] ?
        '<p class="shortUrl">' + self['shortUrl'] + '</p>' : '';

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
      var contactHTML = '<ul class="contact-list">',
        key;

      for (key in contact) {
        if (contact[key]) {
          contactHTML += '<li>' + '<span class="contact-key">' + key +
          ': </span>' + contact[key] + '</li>';
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
    self.contact = data.contact || '';
    self.contactHTML = self.createContact(self.contact) || '';
    self.popular = data.popular || '';
    self.likes = data.likes || '';
    self.shortUrl = data.shortUrl || '';
    self.location = data.location || '';
    self.categories = data.categories || [];

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
      self.location.lat, self.location.lng);
    self.marker = undefined;
    self.infoWindowContent = self.createInfoWindowContent(self);

    /*
     * --------------------------------
     * Extra properties for display
     * --------------------------------
     */
    // Set false when you want not to show this item on the list.
    self.isVisible = ko.observable(true);

  }; // end of VenueModel
})(myApp);
