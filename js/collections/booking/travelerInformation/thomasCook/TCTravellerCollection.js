// Filename: models/project
define([
    'underscore',
    'backbone',
    'models/booking/travelerInformation/thomasCook/TCTravellerModel',
    'models/booking/travelerInformation/AdditionalInfoModel',
    'models/booking/travelerInformation/uk/UKContactInfoModel',
    'app'
], function (_, Backbone, TCTravellerModel, AdditionalInfoModel, UKContactInfoModel, App) {
    var TCTravellerCollection = Backbone.Collection.extend({
        defaults: {
            model: TCTravellerModel
        },
        setTravelers: function (travelers) {
            var outerScope = this;
            this.reset();
            _.each(travelers, function (traveler) {
                var travelerModel = new TCTravellerModel(traveler);
                var additionalInfo = new AdditionalInfoModel(traveler.additionalInfo);
                var contactInfo = new UKContactInfoModel(traveler.contactInfo);

                travelerModel.set({
                    additionalInfo: additionalInfo,
                    contactInfo: contactInfo
                });

                outerScope.add(travelerModel);
            });
        }
    });
    // Return the model for the module
    return TCTravellerCollection;
});