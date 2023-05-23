define([
    'jquery',
    'underscore',
    'backbone',
    'models/booking/tourCustomizations/BookingPackageUpgradeModel',
    'text!templates/booking/tourCustomizations/onTourChoiceTemplate.html',
    'app',
    'event.aggregator',
    'views/booking/tourCustomizations/BasePackageUpgradeView'
], function($, _, Backbone, PackageUpgradeModel, onTourChoiceTemplate, App, EventAggregator, BasePackageUpgradeView){
    var OnTourChoiceView = BasePackageUpgradeView.extend({
        model: PackageUpgradeModel,
        template: Backbone.Marionette.TemplateCache.get(onTourChoiceTemplate),
        tagName: 'div',
        className: 'input_row select_row',
        events: {
            'click .packageUpgrade_checkbox': 'togglePackageUpgrade'
        },
        togglePackageUpgrade: function(e){
            var $target = $(e.target);
            EventAggregator.trigger('togglePackageUpgrades', $target, this.model);
        },
        initialize: function(){
            this.constructor.__super__.initialize.apply(this);
        }
    });

    return OnTourChoiceView;
});