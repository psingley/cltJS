define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'models/search/sortOptions/SortOptionModel',
    // Using the Require.js text! plugin, we are loaded raw text
    // which will be used as our views primary template
    'text!templates/search/sortOptions/sortOptionTemplate.html',
    'event.aggregator',
    'app'
], function ($, _, Backbone, Marionette, SortOptionModel, sortOptionTemplate, EventAggregator, App) {
    var SortOptionView = Backbone.Marionette.ItemView.extend({
        model: SortOptionModel,
        tagName: 'option',
        render: function(){
            this.$el.attr('data-sort-id', this.model.get('id'));
            this.$el.attr('data-sort-direction', this.model.get('sortDirection'));
            this.$el.text(this.model.get('name'));
            console.log(SortOptionView, "viewme");
        }
    });
// Our module now returns our view

    return SortOptionView;
});
