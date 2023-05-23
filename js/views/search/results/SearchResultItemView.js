/**
 * The base result view class for showing search results
 * @class ResultView
 * @extend Backbone.Marionette.ItemView
 */
define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'models/search/results/ResultModel',
	'util/objectUtil',
	'util/offersUtil',
	'util/animationUtil',
	'util/searchOptionsUtil',
	'text!templates/search/results/searchResultsTemplate.html',
	'text!templates/search/results/nonColletteSearchResultsTemplate.html',
	'text!templates/search/results/badgeTemplate.html',
	'app',
	'event.aggregator'
], function ($, _, Backbone, Marionette, ResultModel, ObjectUtil, OffersUtil, AnimationUtil, SearchOptionsUtil,
	resultItemTemplate, nonColletteSearchResultsTemplate, badgeTemplate, App, EventAggregator) {
	var SearchResultItemView = Backbone.Marionette.ItemView.extend({
			/*template: Backbone.Marionette.TemplateCache.get(resultItemTemplate),*/
			getTemplate: function () {
				if (App.isColletteSite) {
					return resultItemTemplate;
				} else {
					return nonColletteSearchResultsTemplate;
				}
			},
			model: ResultModel,
			tagName: 'div',
			className: function () {
				return 'tour-search-result';
			},
			TourDetailsLayout: null,//module that needs only for agents
			attributes: function () {
				var self = this;
				return {
					class: "tour-search-result",
					id: "tour-" + self.options.resultNumber,
					style: "display:none",
					"data-tourid": self.model.get("id"),
					"data-toururl" : self.model.get("tourDetailUrl")
				}
			},
			ui: {
				'$tags': '.tags',
				'$tourBody':'.tour-body',
				'$mainButtonsEl': 'nav.tour-main-nav a',
				'$extraButtonsEl': 'ul.list-simple a'
			},
			events: {
				'click nav.tour-main-nav a': 'optionClickedMainNav',
				'click ul.list-simple a': 'optionClickedSubNav',
				'click .call_now_button': 'openCallNowModal',
				'click .bookNowButton-xplor': 'openBookNowModal'
			},

			isAgent: function () {
				if ($('body').data('isagent') === undefined) {
					return false;
				} else {
					return ($('body').data('isagent').toLowerCase() === "true");
				}
			},
			
			initialize: function (options) {
				this.mainButtons = options.mainButtons;
				this.extraButtons = options.extraButtons;
				this.resultNumber = options.resultNumber;
				var self = this;

				if (self.isAgent()) {
					//load TourDetailsLayout if buttons is rendered
					require(['renderedLayouts/search/TourDetailsLayout'], function (tourDetailsLayoutModule) {
						self.TourDetailsLayout = tourDetailsLayoutModule;

					});
				}

				EventAggregator.on('showItineraryFromDepartures', function (params) {

					if (!self.TourDetailsLayout) {
						return;//if TourDetailsLayout module is not loaded
					}

					if (!self.regionSettings) {
						return;//if empty event
					}

					if (self.model.get("id") != params.tourId) {
						return;//check event for specific tour
					}

					self.regionSettings.itineraryId = params.itineraryId;
					self.regionSettings.itineraryNeoId = params.itineraryNeoId;
					self.regionSettings.viewType = "itinerary";
					new self.TourDetailsLayout(self.regionSettings);

					self.scrollTopTourDetails();
					EventAggregator.trigger('tourDetailOptionClicked', self.regionSettings.viewType, "DeparturesDetails");
				});

				EventAggregator.on('requestTourDetailsResultsComplete', function () {
					var tourDetails = App.TourDetails.TourResults;
					//save tour details to object
					if (tourDetails) {
						var count = tourDetails.length;
						for (var i = 0; i < count; i++) {
							if (tourDetails[i].tourId == self.model.get("itemId")) {
								self.tourDetails = tourDetails[i];
								break;
							}
						}
					}
					AnimationUtil.endItineraryAnimation();
					if (self.selectedButtonType != null) {
						self.showClickedTourData(self.selectedButtonType);
						self.selectedButtonType = null;
					}
				});
			},


			onShow: function () {
				this.showResults();
				var offers = this.model.get("offers");
				if (!ObjectUtil.isNullOrEmpty(offers) && offers.length > 0) {
					this.ui.$tourBody.addClass('has-offer');
				}
			},
			openCallNowModal: function (e) {
				$('#call-now-modal').modal('show');
			},
			openBookNowModal: function (e) {
				var bookNowUrl = this.model.attributes.bookingUrl;
				$("#book-now-button-continue").attr("href", bookNowUrl);
				$('#book-now-button').modal('show');
			},
			showResults: function () {
				var currentPage = App.Search.searchOptions.get('currentPage');
				this.$el.find('.tour-number').text(this.resultNumber);

				var resultsPerPage = App.Search.searchOptions.get('numberOfAdditionalResultsPerPage');
				var hideResultsAfter = (currentPage * resultsPerPage);

				if (App.isColletteSite) {
					if (currentPage === 1) {
						if (this.resultNumber <= 12) {
							this.$el.show();
						} else {
							this.$el.hide();
						}
					}
					else {
						if (this.resultNumber > (currentPage - 1) * 12 && this.resultNumber <= (currentPage * 12)) {
							this.$el.show();
							//console.log(this.resultNumber, currentPage * 12);
						} else {
							this.$el.hide();
							//console.log("hide" + this.resultNumber, (currentPage - 1) * 12);
						}
					}
				}
				else {
					if (this.resultNumber <= hideResultsAfter) {
						this.$el.show();
					} else {
						this.$el.hide();
					}
                }
			},
			optionClickedMainNav: function (buttonEvent) {
				buttonEvent.preventDefault();
				this.applyTourDetailOption(buttonEvent, "MainNavigation");
			},
			optionClickedSubNav: function (buttonEvent) {
				buttonEvent.preventDefault();
				this.applyTourDetailOption(buttonEvent, "SubNavigation");
			},

			applyTourDetailOption: function (buttonEvent, clickSource) {
				$(this.el).parent().addClass("tour-selected");
				$(this.el).siblings().removeClass("tour-active");
				$(this.el).addClass("tour-active");
				this.scrollTopTourDetails();

				var buttonType = $(buttonEvent.currentTarget).data("load");
				this.selectedButtonType = buttonType;//save clicked tour for work after data load 
				if (App.TourDetails && App.TourDetails.DetailsExist) {
					this.showClickedTourData(buttonType);
					this.selectedButtonType = null;
				} else {
					AnimationUtil.startItineraryAnimation();
				}

				var tourDetailsTourName = $('.tour-details-header .modal-title a');
				if (tourDetailsTourName.length) {
					var tourName = this.model.get('title');
					$(tourDetailsTourName).text(tourName);
				}
				EventAggregator.trigger('tourDetailOptionClicked', buttonType, clickSource);
			},
			scrollTopTourDetails: function () {
				var scrollValue = 0;
				$('.active-tour-details').find('.modal-body').scrollTop(scrollValue);
			},
			showClickedTourData: function (buttonType) {
				if (buttonType) {
					var tourUrl = this.model.get('bookingUrl');
					var isBookingAvailable = true;
					if (ObjectUtil.isNullOrEmpty(tourUrl)) {
						isBookingAvailable = false;
					}
					var bookingEnabled = App.siteSettings.isBookingEngineAvailable;
					if (ObjectUtil.isNullOrEmpty(bookingEnabled)) {
						isBookingAvailable = false;
					}
					var regionSettings = { el: $("#searchResultView .active-tour-details-container"), viewType: buttonType, tourUrl: tourUrl, isBookingAvailable: isBookingAvailable, data: this.tourDetails };
					this.regionSettings = regionSettings;
					new this.TourDetailsLayout(regionSettings);
				} else {
					console.log("no data for selected tour");
				}
			},
			templateHelpers: function () {
				var viewContext = this;
				var startFromText = App.dictionary.get('search.StartingPrice', 'Starting from');
				var disclaimerText = App.dictionary.get('search.Disclaimer');
				var badges = viewContext.model.get('badges');
				var styles = viewContext.model.get('styles');
				var ownerExclusive = viewContext.model.get('ownerExclusiveBadgeClass');
				var ownerExclusiveSeries = viewContext.model.get('ownerExclusiveSeries');
				var offers = viewContext.model.get("offers");
				var extensions = viewContext.model.get("extensions");
				var marriottChairman = viewContext.model.get("marriottChairman");
				return {
					resultNumber: viewContext.resultNumber,
					tourId: viewContext.model.get("id"),
                    hideBookNow: viewContext.model.get("hideBookNow"),
                    onlyCallforDetailDates: viewContext.model.get('onlyCallForDetailDates'),
                    onlySoldOutDates: viewContext.model.get('onlySoldOutDates'),
                    memberDiscountText: viewContext.model.get('memberDiscountText'),
					memberDiscountAmount: viewContext.model.get('memberDiscountAmount'),
					disclaimerText: disclaimerText,
					startFromText: startFromText,
					tourDetailsText: App.dictionary.get('search.TourDetails', 'Tour Details'),
					tourIdText: App.dictionary.get('search.TourId'),
					tooltipText: App.dictionary.get('search.TourId.HelpText'),
					bookNowText: App.dictionary.get('tourRelated.Buttons.BookNow', 'Book Now'),
					callNowText: App.dictionary.get('tourRelated.Buttons.CallNow', 'Call Now'),
					showCallToBook: App.siteSettings.showCallToBook,
					callToBookPhoneNumber: App.siteSettings.callToBookPhoneNumber,
					freeFormTextPP: App.dictionary.get('tourRelated.FreeFormText.PP', 'pp'),
					feefoRating: App.dictionary.get('tourRelated.FeefoReviews.FeefoProductRating'),
					saveUptoText: App.dictionary.get('tourRelated.FreeFormText.SaveUpTo'),
					currencySymbol: App.siteSettings.currencySymbol,
					alternativeStyle: App.isMarriottSite,
					isMobile: App.mobile,
					currencyDescription: App.dictionary.get('tourRelated.FreeFormText.VacationClubPoints', 'Vacation Club Points'),
					totalStars: App.dictionary.get('tourRelated.FeefoReviews.TotalStars', '5'),
					secondarySummary: viewContext.model.get('secondarySummary'),
					callToBookClass: function() {
						if (App.mobile && this.showRequestAQuote()) {
							return 'col-xs-12';
						}
						return 'col-xs-6';
					},
					callToBookColorClass: function() {

						return 'btn-secondary';
					},
					showSecondarySummary: function () {
						if (ObjectUtil.isNullOrEmpty(viewContext.model.get('secondarySummary'))) {
							return false;
						}
						return true;
					},
                    showBookNow: function () {
                        var onlyCallforDetailDates = viewContext.model.get('onlyCallForDetailDates');
                        var onlySoldOutDates = viewContext.model.get('onlySoldOutDates');

                        if (onlyCallforDetailDates || onlySoldOutDates) {
                            return false;
                        }

                        if (App.siteIds.Collette === App.siteSettings.siteId && App.siteSettings.siteLanguage === 'en-GB' && !this.isAgent()) {
                            return false;
                        }

						if (ObjectUtil.isNullOrEmpty(viewContext.model.get('bookingUrl'))) {
							return false;
						}

						var bookingEnabled = App.siteSettings.isBookingEngineAvailable;
						if (ObjectUtil.isNullOrEmpty(bookingEnabled) || !bookingEnabled) {
							return false;
						}

						if (viewContext.model.get("hideBookNow")) {
							return false;
						}

						return true;
                    },
					citiesCount: function () {
						var data = viewContext.model.get("destinations");
						if (data != null) {
							var destinations = $.parseJSON(data);
							return destinations.length; //should be equal to cities Count
						}
						return 0;
					},
					countriesCount: function () {
						var countryIds = viewContext.model.get("countryIds");
						var lng = countryIds == undefined ? 0 : viewContext.model.get("countryIds").length;
						return lng;
					},
					showRequestAQuote: function () {
						return !App.companyInfo.isCoBranding && App.siteSettings.isRequestAQuoteEnabled;
					},
					showDebugInfo: function () {
						if (App.config.DEBUG_MODE) {
							return '';
						}

						return 'searchDebug';
					},
					getScore: function () {
						var score = viewContext.model.get("score");
						if (score <= 0) {
							return 'N/A';
						}

						return score;
					},
					isAgent: function () {
						if ($('body').data('isagent') === undefined) {
							return false;
						} else {
							return ($('body').data('isagent').toLowerCase() === "true");
						}
					},
					getCleanId: function () {
						var cleanId = viewContext.model.get('id');
						cleanId = cleanId.replace('{', '');
						cleanId = cleanId.replace('}', '');

						return cleanId;
					},
                    minPrice: function () {
						var minPrice = viewContext.model.get("minPrice");

						if (parseInt(minPrice) <= 0) {
							return App.dictionary.get('tourRelated.Booking.TourCustomizations.TBD', 'TBD');
						}

						return minPrice.toString().formatPrice();
					},
					totalPrice: function () {
                        var minPriceOfferAmount = viewContext.model.get("minimumPriceOfferAmount");
						var price = viewContext.model.get("minPrice");
                        if (minPriceOfferAmount > 0) {
                            price = price + minPriceOfferAmount;
						}
						if(price > 0) {
							return price.toString().formatPrice();
						}
						return null;
					},
					showStrikeOutPrice: function() {
                        var minPriceOfferAmount = viewContext.model.get("minimumPriceOfferAmount");
                        if (minPriceOfferAmount > 0) {
							return true;
						}
						return false;
					},
					showReviews: function () {
						if (App.siteSettings.showFeefoReviews && !ObjectUtil.isNullOrEmpty(viewContext.model.get('feefoSearchImg')) && viewContext.model.get('feefoStars') > 0) {
							return true;
						}
						return false;
					},
					minPriceRawValue: function () {
						var minPrice = viewContext.model.get("minPrice");

						if (parseInt(minPrice) <= 0) {
							return App.dictionary.get('tourRelated.Booking.TourCustomizations.TBD', 'TBD');
						}

                        return minPrice.toString().formatPriceWithoutCurrency();
					},
					isClientBaseBooking: function () {
					    var clientBaseData = $('#isClientBaseSession').val();
					    if (!ObjectUtil.isNullOrEmpty(clientBaseData)) {
					        return true;
					    }
					    return false;
					},
					showOffers: function() {
						return offers != null && offers.length > 0;
					},
					maxOfferPrice: function() {
						if (offers != null && offers.length > 0) {
							offers.sort(function (a, b) { return b.rate - a.rate });
							var maxOffer = offers[0];
                            if (maxOffer.percentOff > 0) {
                                var amount = maxOffer.percentOff * 100;
                                return amount.toFixed() + '%';
							} else if (maxOffer.rate != null) {
								return maxOffer.rate.toString().formatPrice();
							}
						}
					},
					offerDescription: function() {
						if (offers != null && offers.length > 0) {
							offers.sort(function (a, b) { return b.rate - a.rate });

							var description = offers[0].offerDescription;
							return description;
						}
						return '';
					},
					showExtensions: function () {
						var exts = '';
						var extText = '';
						var i = 0;
						if (!ObjectUtil.isNullOrEmpty(extensions)) {
							extensions = extensions.sort().reverse();
							//extText = App.dictionary.get('tourRelated.FreeFormText.OptionalExtensions');
							//04.22.22 - TO DO figure out why new dictionary item note added to json dictionary
							extText = 'This tour has optional extensions -';
							_.each(extensions,
								function (ext) {
									exts += ext + '<br/>';
									i++;
								});
							if (i == 1) {
								extText = extText.replace('extensions', 'extension');
                            }
							//remove last comma and add on a period
							//exts = exts.trim().slice(0, -1) + '.';

						}
						var extTextAll = extText + ' ' + exts;
						return extTextAll.trim();
					},
					showTags: function () {
						var tags = [];
						if (!ObjectUtil.isNullOrEmpty(ownerExclusive)) {
							var title = App.dictionary.get("tourRelated.FreeFormText.OwnerExclusive");
							var badge = {
								title: title,
								cssClass: title.replace(' ', '').toLowerCase()
							};
							tags.push(badge);
						}
						if (!ObjectUtil.isNullOrEmpty(ownerExclusiveSeries)) {
							var series = {
								title: ownerExclusiveSeries,
								cssClass: ownerExclusiveSeries.replace(' ','').toLowerCase()
							}
							if (!ObjectUtil.isNullOrEmpty(series.cssClass)) {
								series.cssClass = series.cssClass.replace("'", "").toLowerCase();
							}
							tags.push(series);
						}
						if (badges != null && badges.length > 0) {
							_.each(badges,
								function(badge) {
									badge = $.parseJSON(badge);
									if (badge.title.toLowerCase() != "new tour") {
										tags.push(badge);
									}
								});
						}
						if(styles != null && styles.length > 0) {
							_.each(styles,
								function (style) {
									style = $.parseJSON(style);
									tags.push(style);
								});
						}
						return tags;
					},
					isExplorationsStyle: function () {
						if (styles != null && styles.length > 0) {

							for (var i = 0; i < styles.length; i++) {
								var style = $.parseJSON(styles[i]);
								if (style.title.toLowerCase() === "explorations") {
									return true;
								}
								break;
							}
						}
						return false;
					},
					isNewTour: function () {
						if (badges != null && badges.length > 0) {
							for (var i = 0; i < badges.length; i++) {
								badge = $.parseJSON(badges[i]);
								if (badge.title.toLowerCase() === "new tour") {
									return true;
								}

								break;
							}
						}
						return false;
					},
					getYearText: function () {
						var dates = viewContext.model.get('dates');
						if (dates === null) {
							return '';
						}
						var firstDate = new Date(dates[0]);
						var firstYear = firstDate.getFullYear();
						var lastDate = new Date(dates[dates.length - 1]);
						var lastYear = lastDate.getFullYear();

						if (firstYear === lastYear) {
							return firstYear;
						}
						return firstYear + '-' + lastYear;
					},
					getCities: function () { 
						var destinationsJson = viewContext.model.get('destinations');
						var destinations = $.parseJSON(destinationsJson);
						if (destinations !== null)
							var cities = [];
							_.each(destinations, function (dest) {
								var city = {
									title: dest.city
								};
								cities.push(city);
							});
							return cities;
					},
					getHighlights: function () {
						let vcm = viewContext.model.get('highlights');
						let highlights = [];
						if (vcm !== null)
							vcm.forEach((h) => {
								highlights.push(h);
							});
						return highlights;
                    },
					mainButtons: viewContext.mainButtons,
					extraButtons: viewContext.extraButtons 
			
				}
			}
		});
		// Our module now returns our view
		return SearchResultItemView;
	});