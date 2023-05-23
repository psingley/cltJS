define([
    'domReady!',
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'event.aggregator',
		'extensions/marionette/views/RenderedLayout'
], function (doc, $, _, Backbone, Marionette, EventAggregator, RenderedLayout) {
	var mapComponentLayout = RenderedLayout.extend({
		el: '#map-canvas',
		initialize: function () {
			var self = this;
			self.setEverythingOnMap();

			EventAggregator.on('highlightMarker', function(index) {
				google.maps.event.trigger(self.markers[index], 'click');
			});

		},
		markers: [],

		setEverythingOnMap: function () {
			var self = this;
			var map = new google.maps.Map(document.getElementById("map-canvas"), self.getMapOptions());
			var bounds = new google.maps.LatLngBounds();
			markers = self.getMarkersOnMap();
			var infoWindow = new google.maps.InfoWindow(),
				marker,
				i;
			var standardIcon = "/img/MapMarker_Icon.png";
			for (i = 0; i < markers.length; i++) {
				var position = new google.maps.LatLng(markers[i].latitude, markers[i].longitude);
				infowindow = new google.maps.InfoWindow({
					content: markers[i].title
				});

				bounds.extend(position);

				marker = new google.maps.Marker({
					position: position,
					map: map,
					title: markers[i].title,
					icon: standardIcon + "#" + i,
					labelContent: markers[i].title,
					labelAnchor: new google.maps.Point(-17, 19),
					labelStyle: { fontSize: "14px", fontWeight: 900 }
				});

				self.markers.push(marker);
				// Allow each marker to have an info window
				google.maps.event.addListener(marker, 'click', (function (marker, i) {
					return function () {
						infoWindow.setContent(markers[i].title);
						infoWindow.open(map, marker);
						EventAggregator.trigger('highlightStageContent', i);
					}
				})(marker, i));

				// Automatically center the map fitting all markers on the screen
				map.fitBounds(bounds);
			}
		},

		onMarkerClick : function() {
			
		},
		getMarkersOnMap: function() {
			return $.parseJSON($('#mapMarkers')[0].value);
		},

		getCenterOfMap: function () {
			return $.parseJSON($('#mapCenter')[0].value);
		},

		getMapOptions: function () {
			var self = this;
			var centerOfMap = self.getCenterOfMap();
			var mapOptions = {
				center: new google.maps.LatLng(centerOfMap.latitude, centerOfMap.longitude),
				zoomControl: true,
				panControl: false,
				streetViewControl: false,
				zoom: 4,
				mapTypeControl: false,
				scrollwheel: false,
				styles: [
					{
						"featureType": "water",
						"stylers": [
							{
								"visibility": "on"
							}, {
								"color": "#acbcc9"
							}
						]
					},
					{
						"featureType": "landscape",
						"stylers": [
							{
								"color": "#f2e5d4"
							}
						]
					},
					{
						"featureType": "road.highway",
						"elementType": "geometry",
						"stylers": [
							{
								"color": "#c5c6c6"
							}
						]
					},
					{
						"featureType": "road.arterial",
						"elementType": "geometry",
						"stylers": [
							{
								"color": "#e4d7c6"
							}
						]
					},
					{
						"featureType": "road.local",
						"elementType": "geometry",
						"stylers": [
							{
								"color": "#fbfaf7"
							}
						]
					},
					{
						"featureType": "poi.park",
						"elementType": "geometry",
						"stylers": [
							{
								"color": "#c5dac6"
							}
						]
					},
					{
						"featureType": "administrative",
						"stylers": [
							{
								"visibility": "on"
							},
							{
								"lightness": 33
							}
						]
					},
					{
						"featureType": "road"
					},
					{
						"featureType": "all",
						"elementType": "labels",
						"stylers": [
							{
								"visibility": "off"
							}
						]
					},
					{},
					{
						"featureType": "road",
						"stylers": [
							{
								"lightness": 20
							}
						]
					}
				]
			};
			return mapOptions;
		}

	});

			return mapComponentLayout;
});