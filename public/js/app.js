var myApp=myApp||{};myApp.main=function(){"use strict";var infoWindow,config=myApp.config,ViewModel=function(){var self=this;self.wikipedia=new myApp.WikipediaViewModel,self.menuShown=ko.observable(!1),self.toggleNavMenu=function(){self.menuShown()?self.menuShown(!1):self.menuShown(!0)},self.map=void 0,self.curAnimatingMarker=void 0,self.animationTimerID=void 0,self.venueList=ko.observableArray([]),self.keyword=ko.observable(""),self.curSelectedVenue=void 0,self.listAPIError=ko.observable(!1),self.listAPIErrorMessage="Failed to get response from FourSquare Search",self.applyFilter=function(filterStr){var i,filterRegExp=new RegExp(filterStr,"i"),length=self.venueList().length;for(void 0!==infoWindow&&infoWindow.close(),i=0;length>i;i++)filterRegExp.test(self.venueList()[i].name)?(self.venueList()[i].marker.setVisible(!0),self.venueList()[i].isVisible(!0)):(self.venueList()[i].isVisible(!1),self.venueList()[i].marker.setVisible(!1))},self.keyword.subscribe(self.applyFilter),self.addVenues=function(venuesAry){venuesAry.forEach(function(data){self.venueList.push(new myApp.VenueViewModel(data.venue))}),window.localStorage.setItem(config.localStorageItem,ko.toJSON(self.venueList))},self.getZoomLevel=function(){var viewportWidth=window.innerWidth;return viewportWidth<myApp.config.SMALL_DEVICE_WIDTH?13:15},self.loadGoogleMap=function(){var canvas=document.getElementById("map-canvas"),zoomLevel=self.getZoomLevel(),latlng=new google.maps.LatLng(config.initialLocation.lat,config.initialLocation.lng),mapOptions={zoom:zoomLevel,center:latlng};self.map=new google.maps.Map(canvas,mapOptions)},self.createMarkers=function(){self.venueList().forEach(function(venue){var marker=new google.maps.Marker({map:self.map,position:venue.position,icon:venue.icon});venue.marker=marker,marker.addListener("click",function(){self.handleItemClick(venue)})})},self.removeAllMarkers=function(){var i,marker,length=self.venueList().length;for(i=0;length>i;i++)marker=self.venueList()[i].marker,void 0!==marker&&self.venueList()[i].marker.setMap(null)},self.resetListView=function(){self.venueList.removeAll(),self.listAPIError(!1)},self.createFoursquareAPIParams=function(params){var tmp={};if(params)for(var key in params)tmp[key]=params[key];return tmp.client_id=config.CLIENT_ID,tmp.client_secret=config.CLIENT_SECRET,tmp.v="20151030",tmp},self.createNewList=function(){var params,keywordQuery=self.keyword()?{query:self.keyword()}:{};keywordQuery.ll=config.initialLocation.lat+","+config.initialLocation.lng,params=self.createFoursquareAPIParams(keywordQuery),self.removeAllMarkers(),self.resetListView(),self.keyword(""),$.getJSON(config.FOURSQUARE_EXPLORE_BASE,params,function(data){self.addVenues(data.response.groups[0].items),self.createMarkers()}).fail(function(){self.listAPIError(!0)})},self.handleItemClick=function(venue){self.curSelectedVenue!==venue&&self.animateClickedItem(venue),self.curSelectedVenue=venue,self.createInfoWindow(venue.infoWindowContent,venue.marker),self.menuShown(!1),self.map.panTo(venue.marker.getPosition())},self.createInfoWindow=function(content,marker){void 0!==infoWindow&&infoWindow.close(),infoWindow=new google.maps.InfoWindow({content:content}),infoWindow.open(marker.get("map"),marker)},self.animateClickedItem=function(venue){self.curAnimatingMarker&&(self.curAnimatingMarker.setAnimation(null),self.curAnimatingMarker=null,window.clearTimeout(self.animationTimerID)),venue.marker.setAnimation(google.maps.Animation.BOUNCE),self.animationTimerID=window.setTimeout(function(){self.curAnimatingMarker.setAnimation(null),self.curAnimatingMarker=null},3e3),self.curAnimatingMarker=venue.marker},self.createWikipediaAPIParams=function(params){var tmp={};if(params)for(var key in params)tmp[key]=params[key];return tmp.action="query",tmp.prop="extracts",tmp.format="json",tmp.exintro="",tmp.titles="San Francisco",tmp},self.getWikipediaContent=function(){var params=self.createWikipediaAPIParams({});$.getJSON(config.WIKIPEDIA_BASE,params,function(data){self.setWikipediaResult(data)}).fail(function(){console.log("failed wikipedia"),self.wikipedia.error(!0)})},self.setWikipediaResult=function(data){var pages=data.query.pages,pageid=Object.keys(pages)[0];self.wikipedia.pageid(pageid),self.wikipedia.content(pages[pageid].extract),self.wikipedia.title(pages[pageid].title)},self.restoreSavedData=function(dataAry){var i,length=dataAry.length;for(i=0;length>i;i++)self.venueList.push(new myApp.VenueViewModel({name:dataAry[i].name,description:dataAry[i].description,contact:dataAry[i].contact,popular:dataAry[i].popular,likes:dataAry[i].likes,shortUrl:dataAry[i].shortUrl,location:dataAry[i].location,icon:dataAry[i].icon,position:dataAry[i].position,infoWindowContent:dataAry[i].infoWindowContent,categories:dataAry[i].categories,url:dataAry[i].url,hours:dataAry[i].hours,price:dataAry[i].price,rating:dataAry[i].rating}))},self.initializeList=function(){var storedData=window.localStorage.getItem(config.localStorageItem);return null===storedData?void self.createNewList():(self.restoreSavedData(JSON.parse(storedData)),void self.createMarkers())},self.init=function(){self.loadGoogleMap(),self.getWikipediaContent(),self.initializeList()},self.init()};ko.applyBindings(new ViewModel)};