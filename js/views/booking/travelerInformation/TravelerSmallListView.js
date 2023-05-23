define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'views/booking/travelerInformation/TravelerSmallView',
    'app',
    'collections/booking/travelerInformation/TravelerCollection'
], function ($, _, Backbone, Marionette, TravelerSmallView, App, TravelerCollection) {
    var TravelerSmallListView = Backbone.Marionette.CollectionView.extend({
        collection: TravelerCollection,
        itemView: TravelerSmallView,
        itemViewOptions: function (model, index) {
            var outerScope = this;
            return {
                travelerNumber: index + 1,
                type: outerScope.options.type,
                index: index
            }
        },
        tagName: function () {
            if (this.options.type == 'dropdown') {
                return "select";
            }

            return 'div';
        }
    });
    // Our module now returns our view
    return TravelerSmallListView;
});
/**
 * Created by ssinno on 11/18/13.
 */
