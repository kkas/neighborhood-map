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
      var infoWindowContentHTML = '<div class="content">',
          // name uses a different format.
          NAME_TMPL = '<p class="name">%%data%%</p>',
          BASE_TMPL = '<p><span class="content-label">%%label%%' +
            '</span>%%data%%</p>',
          URL_TMPL = BASE_TMPL.replace(/%%label%%/, 'URL: ').
            replace(/%%data%%/, '<a href="%%data%%">%%data%%</a>'),
          CONTACT_TMPL = BASE_TMPL.replace(/%%label%%/, 'Contact: ').
            replace(/%%data%%/, '<ul class="contact-list">%%data%%</ul>'),
          HOURS_TMPL = BASE_TMPL.replace(/%%label%%/, 'Hours: '),
          PRICE_TMPL = BASE_TMPL.replace(/%%label%%/, 'Price: '),
          RATING_TMPL = BASE_TMPL.replace(/%%label%%/, 'Rating: ');

      infoWindowContentHTML += self['name'] ?
        NAME_TMPL.replace(/%%data%%/, self['name']) : '';
      infoWindowContentHTML += self['contactHTML'] ?
        CONTACT_TMPL.replace(/%%data%%/, self['contactHTML']) : '';
      infoWindowContentHTML += self['url'] ?
        URL_TMPL.replace(/%%data%%/g, self['url']) : '';
      infoWindowContentHTML += self['hours'] && self['hours'].status ?
        HOURS_TMPL.replace(/%%data%%/, self['hours'].status) : '';
      infoWindowContentHTML += self['price'] ?
        PRICE_TMPL.replace(/%%data%%/, self['price'].message) : '';
      infoWindowContentHTML += self['rating'] ?
        RATING_TMPL.replace(/%%data%%/, self['rating']) : '';

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
      var contactHTML = '',
          BASE_TMPL = '<li><span class="content-label">%%label%%: </span>' +
            '%%data%%</li>',
          TWITTER_TMPL = BASE_TMPL.replace(/%%label%%/, "Twitter"),
          FORMATTED_PHONE_TMPL = BASE_TMPL.replace(/%%label%%/, "Phone");

      contactHTML += contact.twitter ? TWITTER_TMPL.replace(
          /%%data%%/, '@' + contact.twitter) : '';
      contactHTML += contact.formattedPhone ? FORMATTED_PHONE_TMPL.replace(
          /%%data%%/, contact.formattedPhone) : '';

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
    self.url = data.url || '';
    self.hours = data.hours || '';
    self.price = data.price || '';
    self.rating = data.rating || '';

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
