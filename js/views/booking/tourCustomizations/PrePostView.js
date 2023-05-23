define([
'jquery',
'underscore',
'backbone',
'models/booking/tourCustomizations/BookingPackageUpgradeModel',
'text!templates/booking/tourCustomizations/prePostTemplate.html',
'text!templates/booking/tourCustomizations/extensionPrePostTemplate.html',
'app',
'event.aggregator',
'util/taxonomy/taxonomyDomUtil',
'views/booking/tourCustomizations/BasePackageUpgradeView',
'util/objectUtil',
'util/dataLayerUtil',
'collections/booking/tourCustomizations/BookingPackageUpgradeCollection'
], function ($, _, Backbone, PackageUpgradeModel, prePostTemplate, extensionPrePostTemplate, App, EventAggregator, TaxonomyDomUtil, BasePackageUpgradeView, ObjectUtil, DataLayerUtil, PackageUpgradeCollection) {
	var PrePostView = BasePackageUpgradeView.extend({
		model: PackageUpgradeModel,
		tagName: 'div',
		className: 'select_row',
		events: {
			'click .packageUpgrade_checkbox': 'togglePackageUpgrade',
			'change .numberOfNights': 'updateDropDownQuantity'
		},
		initialize: function () {
			var outerScope = this;
			this.constructor.__super__.initialize.apply(this);

			var serviceType = this.model.get('serviceType');
			if (serviceType.id == App.taxonomy.getId('serviceTypes', 'Extension')) {
				this.template = Backbone.Marionette.TemplateCache.get(extensionPrePostTemplate);
			} else {
				this.template = Backbone.Marionette.TemplateCache.get(prePostTemplate);
			}

			EventAggregator.on('numberOfRoomsUpdate', function () {
				outerScope.updateNoOfRooms();
			});


			this.updateNoOfRooms();
		},
		onPackageUpgradeChanged: function (price) {
			this.setPrice(price);
			this.setTransferQuantity();
		},
		onShow: function () {
			this.setNumberOfNightsDropDown();

			//set up transfers and hotels
			if (this.model.get('serviceType').id == App.taxonomy.getId('serviceTypes', 'Transfer')) {
				this.$el.addClass('muted');
				this.$el.addClass('transferType');

				var $checkbox = this.$el.find('.packageUpgrade_checkbox');
				$checkbox.css('visibility', 'hidden');
				$checkbox.prop('disabled', true);
			} else if (this.model.get('serviceType').id === App.taxonomy.getId('serviceTypes', 'Hotel')) {
				this.$el.addClass('hotelType');
			}
		},
		setNumberOfNightsDropDown: function () {
			var numberOfNights = this.model.get('numberOfNights');
			var $numberOfNightsDD = this.$el.find('.numberOfNights');
			var serviceType = this.model.get('serviceType');

			if (serviceType.id === App.taxonomy.getId('serviceTypes', 'Extension') && serviceType.id === App.taxonomy.getId('serviceTypes', 'Transfer')) {
				return;
			}

			if (numberOfNights > 0) {
				for (var i = 1; i <= numberOfNights; i++) {
					$numberOfNightsDD.append('<option value="' + i + '">' + i + '</option>');
                }
			} else {
				TaxonomyDomUtil.setOptionsWithOutSelect('numberOfNights', $numberOfNightsDD);
            }

            
		},
		templateHelpers: function () {
			var outerScope = this;
			return {
				roomsText: function () {
					if (!App.Booking.rooms.length || App.Booking.rooms.length == 1) {
						return App.dictionary.get('tourRelated.Booking.RoomingTravelerInfo.Room');
					}
					return App.dictionary.get('tourRelated.Booking.TourCustomizations.Rooms');
				},
				noOfRooms: App.Booking.rooms.length,
				nightsIncludedText: App.dictionary.get('tourRelated.Booking.TourCustomizations.NightsIncluded'),
				isTransfer: function () {
					var serviceType = outerScope.model.get('serviceType');
					if (serviceType.id == App.taxonomy.getId('serviceTypes', 'Transfer')) {
						return true;
					}

					return false;
				},
				additionalFeesText: function () {
					var childPackageUpgrades = outerScope.model.get('childPackageUpgrades');
					if (!ObjectUtil.isNullOrEmpty(childPackageUpgrades) && childPackageUpgrades.length > 0) {
						for (var i = 0; i < childPackageUpgrades.length; i++) {
							if (childPackageUpgrades[i].serviceTypeDetail.id == App.taxonomy.getId('serviceTypeDetails', 'Internal') ||
								childPackageUpgrades[i].serviceTypeDetail.id == App.taxonomy.getId('serviceTypeDetails', 'Interflights')) {
								return 'Additonal Fees for Air';
							}
						}
					}
					return 'This tour may require additional flights, which will be purchased and booked later in the reservation process. Please note: in-tour and extension flight pricing is not included in the tour rate.';
				},
				currencySymbol: App.siteSettings.currencySymbol,
				titleText: function () {
					var serviceType = outerScope.model.get('serviceType');

					var result = serviceType.name + ' : ' + outerScope.model.get('contractName');

					if (serviceType.id === App.taxonomy.getId('serviceTypes', 'Hotel')) {
						result += ' - ' + outerScope.model.get('serviceTypeDetail').name;
					}
					return result;
				},
				getPrice: function () {
					var childPackageUpgrades = outerScope.model.get('childPackageUpgrades');
					var price = '';
					if (!ObjectUtil.isNullOrEmpty(childPackageUpgrades) && childPackageUpgrades.length > 0) {
						_.each(childPackageUpgrades,
							function(child) {
								if (child.serviceTypeDetail.name != 'Park Fees') {
									price = '$' + (child.prices[0].contractPrice * App.Booking.travelers.length);
								}
							});
					}
					return price;
				}
			}
		},
		togglePackageUpgrade: function (e) {
			var $target;
			var outerScope = this;
			if (e.target) {
				$target = $(e.target);
			} else {
				$target = e;
            }

            //Web-862-Begin
            var currentSelectedExtension = this.model.id;
            if (this.model.get('serviceType').name == "Extension") {
                var $getAllExtensions = this.$el.parent().find('.packageUpgrade_checkbox');
                _.each($getAllExtensions, function (extension) {
                    if (currentSelectedExtension != extension.dataset.id && ($target.is(':checked'))) {
                        extension.disabled = true;
                    }
                    else extension.disabled = false;
                });
                $getAllExtensions = null;
            }
            currentSelectedExtension = null;
            //Web-862-End

			EventAggregator.trigger('togglePackageUpgrades', $target, this.model);

			if (this.model.get('serviceType').id === App.taxonomy.getId('serviceTypes', 'Extension')) {
				EventAggregator.trigger('extensionChosen', $target, this.model);
			}

			if (this.model.get('serviceType').id === App.taxonomy.getId('serviceTypes', 'Hotel')) {
				this.hotelSelected();
			}
              
            DataLayerUtil.TourCustomizations(this.templateHelpers().titleText(), this.$el.find('.numberOfNights').find('option:selected').val(), $target.is(':checked'), this.$el.parent().parent().attr('id'));

        
			this.updatePackagePrompt();
		},
		hotelSelected: function () {
			var outerScope = this;
			var $parent = this.$el.parent();

			var $transfers = $parent.find('.transferType');
			var $transferCheckBoxes = $transfers.find('.packageUpgrade_checkbox');

			var transferIds = [];

			_.each($transferCheckBoxes, function (transferCheckBox) {
				var $transferCheckBox = $(transferCheckBox);
				transferIds.push($transferCheckBox.data('id'));
			});

			var transfer = null;
			var city = this.model.get('city');
			var $hotels = $parent.find('.hotelType');
			_.each(transferIds, function (transferId) {
				transfer = _.find(App.Booking.presAndPosts, function (packageUpgrade) {
					//make sure the city is not null
					if (ObjectUtil.isNullOrEmpty(packageUpgrade.city)) {
						return;
					}

					return transferId === packageUpgrade.id;
				});

				if (transfer !== undefined && (city.id === transfer.city.id || $hotels.length === 1)) {
					var transferCheckBox = _.find($transferCheckBoxes, function (checkBox) {
						var $checkBox = $(checkBox);
						return $checkBox.data('id') === transfer.id;
					});

					if (transferCheckBox !== undefined) {
						var $transferCheckBox = $(transferCheckBox);
						var $transfer = $transferCheckBox.closest('.transferType');

						if (outerScope.$checkbox.is(':checked')) {
							outerScope.showUpgrade($transferCheckBox, $transfer);
						} else {
							outerScope.hideUpgrade($transferCheckBox, $transfer, transfer);
						}
					}
				}
			});
		},
		updatePackagePrompt: function () {
			var outerScope = this;

			//get the current package upgrades package prompt
			var currentPackagePrompt = this.model.get('packagePrompt');
			if (ObjectUtil.isNullOrEmpty(currentPackagePrompt)) {
				return;
			}

			//get the current package upgrades id
			var currentId = this.model.get('id');

			//see if there is another upgrade with a package prompt
			var associatedPackageUpgrades =
			App.Booking.presAndPosts.filter(function (packageUpgrade) {
				var packagePrompt = packageUpgrade.packagePrompt;
				var id = packageUpgrade.id;

				if (ObjectUtil.isNullOrEmpty(packagePrompt)) {
					return;
				}

				var hasSamePackagePrompt = packagePrompt.id === currentPackagePrompt.id;
				var doesNotHaveSameId = id !== currentId;
				return hasSamePackagePrompt && doesNotHaveSameId;
			});

			if (!ObjectUtil.isNullOrEmpty(associatedPackageUpgrades) && associatedPackageUpgrades.length > 0) {
				//get the current package upgrades checkbox
				var $section = this.$el.closest('.section');
				var $sectionInputs = $section.find('input');

				_.each(associatedPackageUpgrades, function (packageUpgrade) {
					//get the check box of this package upgrade
					var associatedCheckBox = _.find($sectionInputs, function (input) {
						var $input = $(input);
						var id = $input.data('id');
						if (!ObjectUtil.isNullOrEmpty(id)) {
							return id === packageUpgrade.id;
						}

						return false;
					});

					//make sure we have a package upgrade element available
					if (associatedCheckBox === undefined) {
						return;
					}

					//get the associated upgrades check box and parent div to show/hide
					var $associatedCheckBox = $(associatedCheckBox);
					var $parentOfAssociatedPrompt = $associatedCheckBox.closest('.select_row');

					if (outerScope.$checkbox.is(':checked')) {
						outerScope.hideUpgrade($associatedCheckBox, $parentOfAssociatedPrompt, packageUpgrade);
					} else {
						outerScope.showUpgrade($associatedCheckBox, $parentOfAssociatedPrompt);
					}
				});
			}
		},
		updateNoOfNights: function (e) {
			var $target = $(e.target);
			var $selectedOption = $target.find('option:selected');

			if (!$selectedOption.isNullOrEmpty()) {
                var noOfNights = $selectedOption.val(); 
                this.model.set({ numberOfNights: noOfNights });
            }


		},
		updateNoOfRooms: function () {
			this.$el.find('.noOfRooms').text(App.Booking.rooms.length);
			this.model.set({ numberOfRooms: App.Booking.rooms.length });
        }
	});

	return PrePostView;
});