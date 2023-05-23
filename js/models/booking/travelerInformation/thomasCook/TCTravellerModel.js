define([
    'jquery',
    'underscore',
    'backbone',
    'app',
    'util/objectUtil',
    'models/booking/travelerInformation/ContactInfoModel',
    'models/booking/travelerInformation/AdditionalInfoModel',
    'models/booking/travelerInformation/TravelerModel'
], function ($, _, Backbone, App, ObjectUtil, ContactInfoModel, AdditionalInfoModel, TravelerModel) {
    var TCTravellerModel = TravelerModel.extend({

    });

    return TCTravellerModel;
});