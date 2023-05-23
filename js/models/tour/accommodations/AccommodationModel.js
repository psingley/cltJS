// Filename: models/facetItems
define([
    'jquery',
    'underscore',
    'backbone',
    'models/general/MediaImageModel',
    'collections/tour/accommodations/AmenityCollection',
    'models/tour/accommodations/AmenityModel'
], function($,_, Backbone, MediaImageModel, AmenityCollection, AmenityModel) {
		var AccommodationModel = Backbone.Model.extend({
			defaults: {
				image: MediaImageModel,
				name: '',
				city: '',
				description: '',
				url: '',
				isHotel: false,
				isCruise: false,
           hotelAmenities: AmenityCollection,
           roomAmenities: AmenityCollection,
           vendorPropertyId: '',
           richMediaUrl: null
        },
        initialize: function () {
            this.hotelAmenities = new AmenityCollection();
            this.roomAmenities = new AmenityCollection();
            this.fetchCollections();
        },
        fetchCollections: function () {
            //when we call fetch for the model we want to fill its collections
            this.hotelAmenities.set(
                _(this.get("hotelAmenities")).map(function (amenity) {
                    return new AmenityModel(amenity);
                })
            );
            //when we call fetch for the model we want to fill its collections
            this.roomAmenities.set(
                _(this.get("roomAmenities")).map(function (amenity) {
                    return new AmenityModel(amenity);
                })
            );
        }
    });
    // Return the model for the module
    return AccommodationModel;
});/**
 * Created with JetBrains WebStorm.
 * User: ssinno
 * Date: 9/25/13
 * Time: 4:20 PM
 * To change this template use File | Settings | File Templates.
 */
