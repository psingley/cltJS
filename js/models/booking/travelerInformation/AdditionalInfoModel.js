define([
    'jquery',
    'underscore',
    'backbone',
    'models/booking/travelerInformation/PassportInfoModel',
    'models/booking/travelerInformation/AirPreferencesModel',
    'models/booking/travelerInformation/MembershipModel'

], function ($, _, Backbone, PassportInfoModel, AirPreferencesModel, MembershipModel) {
    var AdditionalInfoModel = Backbone.Model.extend({
        defaults: {
            passportInfo: new PassportInfoModel,
            emergencyContactName: '',
            emergencyContactPhone: '',
            membership: new MembershipModel,
            airPreferences: new AirPreferencesModel,
            medicalInfo: '',
            dietaryRestrictions: '',
            roomRequests: []
        }
    });
    return AdditionalInfoModel;
});