define([
		'jquery',
		'underscore',
		'backbone',
		'app',
		'util/objectUtil',
		'extensions/marionette/views/RenderedLayout'
	],
	function($, _, Backbone, App, ObjectUtil, RenderedLayout) {
		var BaseBrochureOrderLayout = RenderedLayout.extend({
			ui: {
				'$country': 'input#country',
				'$countryId': '.countryId',
				'$countryName': '#countryName',
				'$state': '.state',
				'$stateId': '.stateId',
				'$stateName': '#stateName',
				'$city': '#txtCity',
				'$address': '#txtAddress1',
				'$zip': '#txtZip',
				'$address2': '#txtAddress2',
				'$autoAddress': '#txtAddress',
				'$addressLoader': '.addressSearchLoader',
				'$experianDiv': '.experianAutocomplete',
				'$fullAddressForm': '.fullAddressForm'
			},
			autocompleteModeIsOn: false,
			setExperianAutocomplete: function(formId) {
				var outerScope = this;
				if (App.siteSettings.isAddressAutocompleteEnabled &&
					!ObjectUtil.isNullOrEmpty(App.siteSettings.defaultCountryId)) {
					require(['experian'],
						function() {
							$.when(App.locations.getLocations())
								.done(function() {
                                    var address = $('#' + formId + ' input[name="address"]')
										.address({
											token: App.siteSettings.experianToken,
											searchClientOptions: {
												restUrl: "https://api.edq.com/capture/address/v2"
											},
											searchCountry: function() {
												return App.locations.getLocationItemById(App.siteSettings.defaultCountryId).isoCode3;
											},
											resultMappings: [
												{
                                                    selector: '#' + formId + ' input[name="address"]',
													format: '{{addressLine1}} {{addressLine2}} {{addressLine3}}, {{locality}} {{province}} {{postalCode}}'
												}, {
                                                    selector: '#' + formId + ' input[name="address1"]',
													format: '{{addressLine1}}'
												}, {
                                                    selector: '#' + formId + ' input[name="address2"]',
													format: '{{addressLine2}}, {{addressLine3}}'
												}, {
                                                    selector: '#' + formId + ' input[name="city"]',
													format: '{{locality}}'
												}, {
                                                    selector: '#' + formId + ' input[name="state"]',
													format: '{{province}}'
												}, {
                                                    selector: '#' + formId + ' input[name="zipcode"]',
													format: '{{postalCode}}'
												}
											]
										});

									outerScope.autocompleteModeIsOn = true;

									address.on("addressbeforecreatepicklist",
										function(event, items) {
											if ($(".xpn-address-picklist-item-override").length == 0) {
												$(".xpn-address-picklist")
													.after('<div id="manual" class="xpn-address-picklist-item xpn-address-picklist-item-override">Click here to enter manually.</div>');
												$(".xpn-address-picklist-item-override").click(function () {
														$(outerScope.ui.$experianDiv).hide();
														$(outerScope.ui.$fullAddressForm).show();
														outerScope.autocompleteModeIsOn = false;
													});
											}
										});

									address.on('addressaftermap',
										function () {
											if (!App.isUKSite && !App.isThomasCookSite) {
												outerScope.setStateFromAutocompleteResult(outerScope.states,
												$(outerScope.ui.$state),
												$(outerScope.ui.$stateId));
											}
										});
								});
						});
				}
			},
			setStateFromAutocompleteResult: function(states, $stateName, $stateId) {
				var provinceObject = this.ui.$state.val();
				if (states && states.length > 0 && provinceObject) {
					var currentStateItem = _.find(states,
						function(stateItem) {
							return stateItem.abbreviation === provinceObject;
						});

					if (currentStateItem) {
						$stateName.val(currentStateItem.name);
						$stateId.val(currentStateItem.id);
					}
				}
			}
		});
		return BaseBrochureOrderLayout;
	});