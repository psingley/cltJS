/**
 * Created by ssinno on 12/7/13.
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'event.aggregator',
    'util/ObjectUtil',
    'util/dataLayerUtil',
    'views/booking/travelerInformation/TravelerSmallListView',
], function ($, _, Backbone, Marionette, App, EventAggregator, ObjectUtil, DataLayerUtil,TravelerSmallListView) {
var BasePackageUpgradeView = Backbone.Marionette.Layout.extend({
        assignedUpgradesEvents: {
            'remove': 'checkCartDetailRemoved parentLayoutUnselected',
            'add': 'parentLayoutSelected'
        },
        initialize: function () {
            var outerScope = this;
            Marionette.bindEntityEvents(this, App.Booking.assignedPackageUpgrades, this.assignedUpgradesEvents);

            this.hideChildTourLayouts();
            EventAggregator.on('packageUpgrade:' + this.model.get('id') + ':changed', function (price) {
                outerScope.onPackageUpgradeChanged(price);
            });

            //get model taxonomies
            this.getServiceType();
            this.getServiceTypeDetail();
        },
        setIsSelected: function () {
            if (this.model.get('selected') === true) {
                this.getCheckBox().prop('checked', true);
                EventAggregator.trigger('togglePackageUpgrades', this.getCheckBox(), this.model);
            }
        },
        onPackageUpgradeChanged: function (price) {
            this.setPrice(price);
        },
        setTransferQuantity: function () {
            var serviceType = this.model.get('serviceType');
            if (serviceType.id === App.taxonomy.getId('serviceTypes', 'Transfer')) {
                var numOfTravelers = App.Booking.travelers.length;
                if (numOfTravelers > 0) {
                    this.model.set({quantity: numOfTravelers});
                }
            }
        },
        onRender: function () {
            this.getCheckBox();
            this.getNumberOfNightsDD();
            this.setDefaultOptional();
            this.setNumberOfNights();
            this.setIsSelected();
        },
        updateDropDownQuantity: function (e) {
            var $target = $(e.target);
            if ($target.prop('type') === 'select') {
                return;
            }

            var $selectedOption = $target.find('option:selected');
            if ($selectedOption.length > 0) {
                this.model.set({quantity: $target.val()});
                App.Booking.Steps['upgradesStep'].calculateStepPrice();
                DataLayerUtil.TourCustomizations("Nights : ", $target.val(), "", $selectedOption.parent().parent().parent().parent().parent().attr('id'));
            }
        },
        setPrice: function (price) {
            var $priceCol = this.$el.find('.price_col');

            var layoutType = this.model.get('layoutType');
            var serviceType = this.model.get('serviceType');
            var serviceOrder = this.model.get('serviceOrder');
            var includedText = App.dictionary.get('tourRelated.Booking.TourCustomizations.Included');
            var TBDText = App.dictionary.get('tourRelated.Booking.TourCustomizations.TBD');
        	// DELETE @Info WHERE ISNULL(Price,0) = 0 AND layout_type_id IN (1,3) AND service_order_id <> 2 AND service_type_id <> 2
            if ((price == 0) &&
				(layoutType.neoId == 1 || layoutType.neoId == 3)
				&& (serviceType.neoId != 2) && (serviceOrder.neoId != 2)) {
	        	//hide option - Not Available state
		        this.$el.hide();
	        } else {
	        	this.$el.show();
	        }

	        if (price > 0) {
                $priceCol.text(price.toString().formatPrice());
            }
            else if (serviceType.id == App.taxonomy.getId('serviceTypes', 'Transfer') && (price == 0 || price == '')) {
                $priceCol.html('<span style="font-weight:bold">' + includedText + '</span>');
            }
            else if (layoutType.id == App.taxonomy.getId('layoutTypes', 'Optional')) {
                $priceCol.html('<span style="font-weight:bold">' + includedText + '</span>');
            }
            else if (layoutType.id == App.taxonomy.getId('layoutTypes', 'Default Optional')) {
                $priceCol.html('<span style="font-weight:bold">' + includedText + '</span>');
            }
            else {
                $priceCol.html('<span style="color:red;font-weight:bold">' + TBDText + '</span>');
            }
        },
        getCheckBox: function () {
            if (ObjectUtil.isNullOrEmpty(this.$checkbox)) {
                this.$checkbox = this.$el.find('.packageUpgrade_checkbox');
            }

            return this.$checkbox;
        },
        getServiceType: function () {
            if (ObjectUtil.isNullOrEmpty(this.serviceType)) {
                this.serviceType = this.model.get('serviceType');
            }

            return this.serviceType;
        },
        getServiceTypeDetail: function () {
            if (ObjectUtil.isNullOrEmpty(this.serviceTypeDetail)) {
                this.serviceTypeDetail = this.model.get('serviceTypeDetail');
            }

            return this.serviceTypeDetail;
        },
        isDefaultOptional: function () {
            var layoutType = this.model.get('layoutType');
            return layoutType.id === App.taxonomy.getId('layoutTypes', 'Default Optional');
        },
        setDefaultOptional: function () {
            if (this.isDefaultOptional() && this.getCheckBox().prop('type') === 'radio') {
                this.getCheckBox().prop('checked', true);
                EventAggregator.trigger('togglePackageUpgrades', this.getCheckBox(), this.model);
            }
        },
        getNumberOfNightsDD: function () {
            if (ObjectUtil.isNullOrEmpty(this.$numberOfNightsDD)) {
                this.$numberOfNightsDD = this.$el.find('.numberOfNights');
            }

            return this.$numberOfNightsDD;
        },
        setNumberOfNights: function () {
            if (this.$numberOfNightsDD.length > 0) {
                var quantity = this.model.get('quantity');
                this.$numberOfNightsDD.val(quantity);
            } else {
                console.log('could not find number of nights drop down');
            }
        },
        hideChildTourLayouts: function () {
            var parentTourLayoutId = this.model.get('parentTourLayoutId');
            var outerScope = this;

            if (!ObjectUtil.isNullOrEmpty(parentTourLayoutId)) {
                var parentPackageUpgrade =
                    App.Booking.assignedPackageUpgrades.find(function (upgrade) {
                        return upgrade.get('tourLayoutId') === outerScope.model.get('parentTourLayoutId');
                    });

                if (parentPackageUpgrade == undefined) {
                    this.$el.hide();
                } else {
                    this.$el.show();
                }
            }
        },
        parentLayoutSelected: function (addedModel) {
            if (this.model.get('parentTourLayoutId') === addedModel.get('tourLayoutId')) {
                this.$el.show();
				this.togglePackageUpgrade(new Object({target : this.getCheckBox()}));
            }
        },
        //see if the package upgrade that was removed was the parent item of this one
        parentLayoutUnselected: function (unassignedModel) {
            if (this.model.get('parentTourLayoutId') == unassignedModel.get('tourLayoutId')) {
                this.$el.hide();
                this.getCheckBox().prop('checked', false);
				this.togglePackageUpgrade(new Object({target : this.getCheckBox()}));
            }
        },
		togglePackageUpgrade: function (e) {
			var $target = $(e.target);
	
			this.toggleTravelers($target);
			EventAggregator.trigger('togglePackageUpgrades', $target, this.model);
	
			this.optionSelected();
		},
        //see if the cart detail item that was removed is this package upgrade
        checkCartDetailRemoved: function (unassignedModel) {
            var modelId = this.model.get('id');
            var unassignedModelId = unassignedModel.get('id');
            if (modelId == unassignedModelId && this.getCheckBox().is(':checked')) {
                this.getCheckBox().prop('checked', false);
                var serviseType = this.model.get('serviceType');
                if (serviseType.id == App.taxonomy.getId('serviceTypes', 'Transfer')) {
                    var travelersDiv = $(this.getCheckBox()).parents('.inTourTransfer').find('.travelerCheckBoxes > div');
                        travelersDiv.remove();
                }
				this.toggleTravelers(this.getCheckBox());
            }
        },
        setTravelerIds: function () {
            var travelerIds = [];
            var $travelerCheckBoxes = this.$el.find('input[name=traveler]:checked');
            _.each($travelerCheckBoxes, function (travelerCheckBox) {
                var $travelerCheckBox = $(travelerCheckBox);
                var travelerId = $travelerCheckBox.val();
                travelerIds.push(travelerId);
            });

            this.model.set({travelerIds: travelerIds});
        },
        updateCheckboxQuantity: function (e) {
            var $target = $(e.target);
            if ($target.prop('type') === 'checkbox') {
                var $travelers = this.$el.find('input[name=traveler]:checked');
                this.model.set({quantity: $travelers.length});
                this.setTravelerIds();
                App.Booking.Steps['upgradesStep'].calculateStepPrice();
                App.Booking.Steps['flightStep'].calculateStepPrice();
                if($travelers.length === 0) {
                     this.$checkbox.prop('checked', false);
                     EventAggregator.trigger('togglePackageUpgrades', this.$checkbox, this.model);
                     this.travelersRegion.close();
                }
            }
        },
        toggleTravelers: function ($target) {
            if ($target.is(':checked')) {
                this.travelersRegion.show(new TravelerSmallListView({collection: App.Booking.travelers, type: 'checkbox'}));
                var $checkboxes = this.$el.find('input[name=traveler]:checked');
                if ($checkboxes.length > 0) {
                    this.model.set({quantity: $checkboxes.length});
                    this.setTravelerIds();
                }
            } else {
                this.model.set({ travelerIds: [] });
                if (!ObjectUtil.isNullOrEmpty(this.travelersRegion)) {
                    this.travelersRegion.close();
                }
            }
        },
        showUpgrade: function ($associatedCheckBox, $associatedParentDiv) {
            $associatedParentDiv.removeClass('muted');
            $associatedCheckBox.css('visibility', 'visible');
            $associatedCheckBox.prop('disabled', false);
        },
        hideUpgrade: function ($associatedCheckBox, $associatedParentDiv, packageUpgrade) {
            $associatedParentDiv.addClass('muted');
            $associatedCheckBox.css('visibility', 'hidden');
            $associatedCheckBox.prop('disabled', true);

            //if a package upgrade was passed in lets update the assigned package upgrades
            if ($associatedCheckBox.is(':checked')) {
                $associatedCheckBox.prop('checked', false);
                EventAggregator.trigger('togglePackageUpgrades', $associatedCheckBox, packageUpgrade);
            }
        }
    });
    return BasePackageUpgradeView;
});