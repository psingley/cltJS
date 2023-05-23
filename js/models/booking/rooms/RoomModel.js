define([
    'jquery',
    'underscore',
    'backbone',
    'models/booking/rooms/PriceModel'
], function ($, _, Backbone, PriceModel) {
    var RoomModel = Backbone.Model.extend({
        defaults: {
            id: null,
            guestConfig: {},
            travelerIds: [],
            travelerCids: [],
            adultPrice: PriceModel,
            childPrice: PriceModel
        },
        isValid: function(){
            if(this.get('guestConfig') == null){
                return false;
            }

            return true;
        }
    });
    return RoomModel;
});