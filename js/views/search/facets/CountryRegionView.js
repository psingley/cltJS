
define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    // Using the Require.js text! plugin, we are loaded raw text
    // which will be used as our views primary template
    'text!templates/search/facets/countryRegionTemplate.html',
    'app',
    'models/search/facets/CountryRegionModel',
    'event.aggregator'
], function ($, _, Backbone, Marionnette, countryRegionTemplate, App, CountryRegionModel, EventAggregator) {
    var CountryRegionView = Backbone.Marionette.ItemView.extend({
        model: CountryRegionModel,
        template: Backbone.Marionette.TemplateCache.get(countryRegionTemplate),
        tagName: 'li',
        onRender: function () {
            this.$el.attr('data-field', this.model.get('dataField'));
        },
        events: {
            'click': 'removeItem'
        },
        removeItem: function(){
            //get the name of the region/country
            var id = $(this.$el.children('a')[0]).data('id');

            //remove the element first!
            this.$el.remove();

            var countryRegionModel =App.Search.countryRegionCollection.get(id);
           App.Search.countryRegionCollection.remove(countryRegionModel);
            EventAggregator.trigger('toggleSearchOption');

            //since this is a click on a link we have to return false;
            return false;
        }
    });
    // Our module now returns our view
    return CountryRegionView;
});
