/**
 * Tour upgrades section on the Tour Customizations step.
 * This is a nested view TourCustomizationsStepLayout -> TourUpgradeLayoutView
 *
 * @class TourUpgradeLayoutView
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'event.aggregator',
    'collections/booking/tourCustomizations/BookingPackageUpgradeCollection',
    'views/booking/tourCustomizations/UpgradeLayoutListView',
    'views/booking/tourCustomizations/UpgradeLayoutView',
    'text!templates/booking/tourCustomizations/tourUpgradeLayoutTemplate.html',
    'app',
    'util/ObjectUtil'
], function ($, _, Backbone, Marionette, EventAggregator, PackageUpgradeCollection, UpgradeLayoutListView, UpgradeLayoutView, tourUpgradeLayoutTemplate, App, ObjectUtil) {
    var TourUpgradeLayoutView = Backbone.Marionette.Layout.extend({
        template: Backbone.Marionette.TemplateCache.get(tourUpgradeLayoutTemplate),
        tagName: 'div',
        regions: {
            'roomUpgradesRegion': '.roomUpgrades',
            'cruiseUpgradesRegion': '.cruiseUpgrades'
        },
		onShow: function () {
			this.roomUpdradeView = new UpgradeLayoutListView({ collection: this.options.roomUpgradesGroup });
			if (this.options.roomUpgradesGroup.length !== 0) {
				this.roomUpgradesRegion.show(this.roomUpdradeView);
				this.hideByDefault(this.options.roomUpgradesGroup, this.roomUpgradesRegion);
			}

			this.cruiseUpgradeView = new UpgradeLayoutListView({ collection: this.options.cruiseUpgradesGroup });
			if (this.options.cruiseUpgradesGroup.length !== 0) {
				this.cruiseUpgradesRegion.show(this.cruiseUpgradeView);
				this.hideByDefault(this.options.cruiseUpgradesGroup, this.cruiseUpgradesRegion);
			}

			//if we don't have cruise upgrades and room upgrades don't show the region
			if (this.options.cruiseUpgradesGroup.length === 0 && this.options.roomUpgradesGroup.length === 0) {
				this.$el.closest('.section').hide();
			}
			else {
				//if we don't have cruise upgrades and room upgrades don't subscribe to 'extensionChosen' event
				this.showHideRegions();
			}
        },
        showHideRegions: function () {
            var outerScope = this;
            EventAggregator.on('extensionChosen', function ($target, model) {
                // Show TourUpgradeLayoutView is called at least two times: 1. on booking complete 2. on each room and travelers step complete.
                // It's needed to be done for resetting users choices on next steps in every time room configuration or travelers count are changed.
                // That's why method Show for this view is called several times. Regions are available only on the last shown view,
                // on others they would be undefined.
                if (outerScope.roomUpgradesRegion ) {
					outerScope.toggleUpgradeInRegion(outerScope.roomUpgradesRegion, model.get('tourLayoutId'), $target);
                }
                if (outerScope.cruiseUpgradesRegion) {
                	outerScope.toggleUpgradeInRegion(outerScope.cruiseUpgradesRegion, model.get('tourLayoutId'), $target);

                }
            });
        },
		toggleUpgradeInRegion: function(region, tourLauoutId, $target) {
			var upgradeView = region.$el.find('[data-id="' + tourLauoutId + '"]');
			if (!ObjectUtil.isNullOrEmpty(upgradeView)) {
				if ($target && $target[0] && $target[0].checked) {
					upgradeView.show();
				} else {
					upgradeView.hide();
				}
			}
		},
        hideByDefault: function(collection, region) {
        	_.each(collection.models, function(upgradesGroup) {
        		_.each(upgradesGroup.get('packageUpgrades').models, function(upgrade) {
			    	var parentTourLayoutId = upgrade.get('parentTourLayoutId');

				    //hide all connected to an extencion upgrades
				    if (!ObjectUtil.isNullOrEmpty(parentTourLayoutId)) {
					    var upgradeView = region.$el.find('[data-id="' + parentTourLayoutId + '"]');
					    if (!ObjectUtil.isNullOrEmpty(upgradeView)) {
						    upgradeView.hide();
					    }
				    }
			    });
		    });
	    }
    });
    return TourUpgradeLayoutView;
});