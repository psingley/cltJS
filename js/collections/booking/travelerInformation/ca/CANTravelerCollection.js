// Filename: models/project
define([
    'underscore',
    'backbone',
    'models/booking/travelerInformation/TravelerModel',
    'models/booking/travelerInformation/AdditionalInfoModel',
    'models/booking/travelerInformation/ca/CANContactInfoModel',
    'app'
], function (_, Backbone, TravelerModel, AdditionalInfoModel, CANContactInfoModel, App) {
    var caTravellerCollection = Backbone.Collection.extend({
        defaults: {
            model: TravelerModel
        },
        setTravelers: function (travelers) {
            var outerScope = this;
            this.reset();
            _.each(travelers, function (traveler) {
                var travelerModel = new TravelerModel(traveler);
                var additionalInfo = new AdditionalInfoModel(traveler.additionalInfo);
                var contactInfo = new CANContactInfoModel(traveler.contactInfo);

                travelerModel.set({
                    additionalInfo: additionalInfo,
                    contactInfo: contactInfo
                });

                outerScope.add(travelerModel);
            });
        }
    });
    // Return the model for the module
    return caTravellerCollection;
});