// Filename: models/project
define([
    'underscore',
    'backbone',
    'models/booking/rooms/RoomModel'
], function(_, Backbone, RoomModel){
    var RoomCollection = Backbone.Collection.extend({
        defaults: {
            model: RoomModel
        },
        setRooms: function(rooms){
            var outerScope = this;
            this.reset();
            _.each(rooms, function (room) {
                var roomModel = new RoomModel(room);
                outerScope.add(roomModel);
            });
        }
    });
    // Return the model for the module
    return RoomCollection;
});