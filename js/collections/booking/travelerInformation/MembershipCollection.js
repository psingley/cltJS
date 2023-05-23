// Filename: models/project
define([
    'underscore',
    'backbone',
    'models/booking/travelerInformation/MembershipModel'
], function(_, Backbone, MembershipModel){
    var RoomRequestCollection = Backbone.Collection.extend({
        defaults: {
            model: MembershipModel
        }
    });
    // Return the model for the module
    return RoomRequestCollection;
});