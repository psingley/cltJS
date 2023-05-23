/**
* @class Site
*/
define([
		'app',
		'jquery',
		'jquery.unveil',
		'bootstrap',
		'backbone',
		'marionette',
		'event.aggregator',
		'domReady',
		'ieCompatibility',
		'renderedLayouts/search/SearchTextLayout',
		'util/responsiveUtil',
		'util/cookieMessageUtil',
		'renderedLayouts/site/menu/GetInspiredLayout',
		'renderedLayouts/agentFinder/AgentFinderLayout',
		'renderedLayouts/dsmLocator/DistrictSaleManagerLocatorLayout',
		'renderedLayouts/instantChat/InstantChatLayout',
		'util/performanceUtil',
		'util/seoTaggingUtil',
		'util/idleVisitorChatUtil',
		'services/marketingCenterService',
		'cookie',
		'util/bingTrackingUtils',
		'services/siteLanguageService',
		'util/uriUtil'
	],
	function(App,
		$,
		Unveil,
		Bootstrap,
		Backbone,
		Marionette,
		EventAggregator,
		domReady,
		IE,
		SearchTextLayout,
		ResponsiveUtil,
		CookieMessageUtil,
		GetInspiredLayout,
		AgentFinderLayout,
		DistrictSaleManagerLocatorLayout,
		InstantChatLayout,
		PerformanceUtil,
		SeoTaggingUtil,
		IdleVisitorChatUtil,
		MarketingCenterService,
		cookie,
		BingTrackingUtils,
		siteLanguageService,
		uriUtil) {
		$(window)
			.load(function() {
				window.loaded = true;
			});

		//one more comment
		//just an anonymous function that gets called immediately on page load
		$(document)
			.ready(function() {
				//turn on/off logging based on environment
				if (!App.config.DEBUG_MODE) {
					if (window.console) {
						console.log = function() {};
					}
				}
			
				(function() {
					var btn, sectionLoaderID, sectionLoader, sectionLoaderContainer;

					$.fn.sectionLoaderInit = function() {
						btn = $(this),
							sectionLoaderID = btn.attr("data-target"),
							sectionLoader = $(sectionLoaderID),
							sectionLoaderContainer = sectionLoader.parent(".section-loader-container");
					};

					$(".js_section-loader-dismiss")
						.click(function() {
							$(this).sectionLoaderInit();
							sectionLoader.fadeOut();
							sectionLoaderContainer.removeClass("loading");
						});

					$(".js_section-loader-trigger")
						.click(function() {
							$(this).sectionLoaderInit();
							sectionLoader.fadeIn();
							sectionLoaderContainer.addClass("loading");
						});
				}());

				//define site-wide includes here
				require([
						'cookie', 'jquery.confirmon', 'jquery.bindfirst', 'jquery.unveil', 'bootstrap',
						'extensions/objects/arrayExtensions', 'extensions/jquery/jqueryExtensions', 'jquery.ui', 'selectivizr', 'respond',
						'brightcove', 'videos', 'extensions/stringExtensions', 'util/seoTaggingUtil'
					],
					function() {

						//adding try catch here in case body element isn't parsed in time
						try {
							//make sure we show the loader immediately if it is a SPA
							switch ($('body').data('template')) {
							case '{8047C140-5752-486C-8D78-959E8B1FA17B}':
							case '{6308F77F-B718-42EF-B7B7-79B4A1AC9144}':
								//$("#progress").progressbar({ value: false });
								break;
							default:
								break;
							}
						} catch (ex) {
							if (window.console) {
								console.log(ex);
							}
						}

						//set up deferred object for getting site settings
						var getSiteSettings = $.Deferred(function(defer) {
							//global variables should be defined here
							var $siteSettings = $('#siteSettings');
							if ($siteSettings.length === 0) {
								if (window.console) {
									console.log('could not find site settings element');
								}
								defer.reject();
								return;
							}

							var siteSettings = $siteSettings.val();
							App.siteSettings = $.parseJSON(siteSettings);
							defer.resolve();
						});

						$.when(getSiteSettings)
							.done(function() {
								onSiteSettingsLoad();
							})
							.fail(function() {
								var $body = $('body');

								if ($body.length == 0 && window.console) {
									console.log('could not find body element');
								}
								var currentItemId = $body.data('current-item-id');

								$.ajax({
										type: "POST",
										contentType: "application/json; charset=utf-8",
										dataType: "json",
										url: '/Services/SiteSettings/SiteSettingsService.asmx/GetSiteSettings',
										data: JSON.stringify({ "currentItemId": currentItemId }),
										error: function(errorResponse) {
											if (window.console) {
												console.log("Inside Failure");
												console.log(errorResponse.responseText);
											}
										}
									})
									.done(function(response) {
										App.siteSettings = JSON.parse(response.d);
										onSiteSettingsLoad();
									});
							});

					});

				/**
				 * Contains logic for starting modules
				 *
				 * @method startModules
				 */
				var startModules = function() {
					//Site Selector Layout which prevents un-necessary 404 page hits
					require(['init/siteSelectorInit'],
						function() {
							App.module('Site-Selector-Layout').start();
						});

					if ($('.login-logout-button').length > 0) {
						require(['init/general/loginLogoutInit'],
							function() {
								App.module('loginLogout').start();
							});
					}

					if ($('#brochure-order-form').length > 0) {
						//If there is a brochure form component on the page, open it
						require(['init/brochuresInit'],
							function() {
								App.module('Brochures').start();
							});
					}

					if ($('#primary-sticky-nav').length > 0) {
						//If there is a component carousel component on page start this
						require(['init/separateStickyNavInit'],
							function() {
								App.module('Separate-Nav-Component').start();
							});
					}

					if ($('.tour-details-2017').length > 0) {

						App.isNewTourDetailPage = true;
						require([
								'init/tourDetailHeaderInit', 'init/tourDetailHeroCarouselInit',
								'init/jumpLinkInit', 'init/ActivityLevelInit', 'init/tourDetailStickyNavInit', 'init/tourPrePostAccordianInit',
                            'init/riverCruisesInit', 'init/otherToursInit','init/needMoreInfoFormInit'
							],
							function() {
								App.module('Tour-Detail-Header').start();
								App.module('Tour-Detail-Hero-Carousel').start();
								App.module('Jump-Link').start();
								//App.module('activityLevelModal').start();
								App.module('Tour-Detail-Sticky-Nav').start();
								App.module('Pre-Post-Accordion').start();
								App.module('RiverCruisesCarousel').start();
                                App.module('Other-Tours-Carousel').start();
                                App.module('Need-More-Info').start();
							}
						);
					}

					if ($('.video-carousel').length > 0 || $('.full-width-carousel').length > 0) {
						//If there is a video carousel component on the page, start this module
						require(['init/videoFilterInit', 'init/videoCarouselInit', 'init/videoPlaylistInit', 'init/videoPlayerInit'],
							function() {
								App.module('Video-Carousel').start();
							});
					}

					if ($('.multipleCarousel').length > 0) {
						//If there is a multiple carousel component on page start this
						require(['init/multipleHeroCarouselInit'],
							function() {
								App.module('Multiple-Hero-Carousel').start();
							});
					}

					if ($('.carousel-generic').length > 0) {
						//If there is a component carousel component on page start this
						require(['init/componentCarouselInit'],
							function() {
								App.module('Carousel-Generic').start();
							});
					}

					if ($('.back-to-top').length > 0) {
						require(['init/backToTopInit'],
							function() {
								App.module('Back-To-Top').start();
							});
					}

					if ($('.video-filter').length > 0) {
						require(['init/videoFilterInit'],
							function() {
								//If there is a video filter component on the page, start this module
								App.module('Video-Filter').start();
							});
					}

					if ($('#dropDownRegion').length > 0) {
						require(['init/destinationDropdownInit'],
							function() {
								//If there is a destination Dropdown component on the page, start this module
								App.module('DestinationDropdown').start();
							});
					}

					if ($('#video-playlist').length > 0) {
						require([
								'init/videoFilterInit', 'init/videoPlaylistInit', 'init/videoPlaylistInit', 'init/pageStickyNavInit',
								'init/videoPlayerInit'
							],
							function() {
								//If there is a video playlist component on the page, start this module
								App.module('Video-Playlist').start();
							});
					}


					if ($('.page-sticky-nav').length > 0) {
						require(['init/pageStickyNavInit'],
							function() {
								App.module('Page-Sticky-Nav').start();
							});
					}

					if ($('#video-frame').length > 0) {
						require([
								'init/videoFilterInit', 'init/videoPlaylistInit', 'init/videoPlaylistInit', 'init/pageStickyNavInit',
								'init/videoPlayerInit'
							],
							function() {
								//If there is a video on the page, start this module
								App.module('Video-Player').start();
							});
					}


					if ($('.section-unsubscribe').length > 0) {
						require(['init/emailUnsubscribeInit'],
							function() {
								//If there is an unsubscribe component on the page, start this module
								App.module('Email-Unsubscribe').start();
							});
					}

					if ($('.iframe-component').length > 0) {
						require(['init/iFrameInit'],
							function() {
								App.module('IFrame-Component').start();
							});
					}

					if ($('.section-questionnaire').length > 0) {
						require(['init/questionnaireInit'],
							function() {
								//If there is an question component on the page, start this module
								App.module('Questionnaire').start();
							});
					}

					if ($('.contact-us-form').length > 0) {
						App.module('Cares-ContactUsForm').start();
					}

					if ($('.contact-us-form').length > 0) {
						//If there is a cares contact us form component on the page, start this module
						require(['init/caresContactUsForm'],
							function() {
								App.module('Cares-ContactUsForm').start();
							});
					}

					if ($(".staticResultsDataView").length > 0) {
						require(['init/searchInit', 'init/searchStaticInit'],
							function() {
								App.module('SearchStaticView').start();
							});
					}

					if ($('#region-intro').length > 0) {
						require(['init/regionPageIntroComponentInit'],
							function() {
								App.module('Region-PageIntro-Component').start();
							});
					}

					if ($('.synced-carousel').length > 0) {
						require(['init/syncCarouselInit'],
							function() {
								App.module('SyncCarousel').start();
							});
					}

					if ($('#region-photos').length > 0) {
						require(['init/regionPhotosInit'],
							function() {
								App.module('Region-Photos').start();
							});
					}

					if ($('#region-destinations').length > 0) {
						require(['init/regionDestinationsComponentInit', 'init/mapComponentInit'],
							function() {
								App.module('Region-Destinations-Component').start();
								if ($('#map-canvas').length > 0) {
									App.module('Map-Component').start();
								}
							});
					}

					if ($('#region-brochures').length > 0) {
						require(['init/regionBrochuresComponentInit'],
							function() {
								App.module('Region-Brochures-Component').start();
							});
					}

					if ($('#region-tours').length > 0) {
						require(['init/toursComponentInit'],
							function() {
								App.module('Tours-Component').start();
							});
					}

					if ($('#regions-landing-intro').length > 0) {
						require(['init/regionsLandingPageInit'],
							function() {
								App.module('RegionsLanding-Component').start();
							});
					}

					if ($('#agent-brochure-page').length > 0) {
						require(['init/agentBrochuresInit'],
							function() {
								App.module('Agent-Brochures').start();
							});
					}

					if ($('.cares-archive-dates').length > 0) {
						require(['init/caresArchiveDatesInit'],
							function() {
								App.module('Cares-Archive-Dates').start();
							});
					}

					if ($('#mobile-offscreen-menu').length > 0) {
						require(['init/offscreenHeaderInit'],
							function() {
								App.module('Mobile-Offscreen-Menu').start();
							});
					}

					if ($('#mobile-nav-content-cover').length > 0) {
						require(['init/mobileNavContentCoverInit'],
							function() {
								App.module('Mobile-Nav-Content-Cover').start();
							});
					}

					if ($('#request-quote-modal').length > 0) {
						require(['init/requestAQuoteInit'],
							function() {
								App.module('requestAQuoteModule').start();
							});
					}

					if ($('.agent_finder').length > 0) {
						require(['init/agentFinderInit'],
							function() {
								App.module('agentFinderModule').start();
							});
					}

					if ($('.talk_expert_button').length > 0) {
						require(['init/talkToAnExpertInit'],
							function() {
								App.module('talkToAnExpertModule').start();
							});
					}

					if ($('.instant_chat').length > 0) {
						require(['init/instantChatInit'],
							function() {
							});
					}

					if ($('.newsletter-signup-modal').length > 0) {
						require(['init/newsletterSignUpModalInit'],
							function() {
								App.module('newletterSignUpModule').start();
							});
					}

					//if ($('.reviews').length > 0 || $('#tourdetailsreviews').length > 0) {
						require(['init/feefoReviewsInit'],
							function() {
								App.module('Reviews').start();
							});
					//}

					if ($('.sticky').length > 0) {
						require(['init/stickyHeaderInit'],
							function() {
								App.module('Sticky').start();
							});
					}

					if ($('.category-nav').length > 0) {
						require(['init/categoryInit'],
							function() {
								App.module('CategoryNav').start();
							});
					}

					if ($('.textboxWithButtons').length > 0) {
						require(['init/textboxWithButtonsInit'],
							function() {
								App.module('TextboxWithButtons').start();
							});
					}

					if ($('#blogBreadcrumb').length > 0) {
						require(['init/blogBreadcrumbInit'],
							function() {
								App.module('BlogBreadcrumb').start();
							});
					}

					if ($('.newblog').length > 0) {
					    require(['init/blogInit'],
							function () {
							    App.module('NewBlog').start();
							});
					}

					if ($("#tp-company-search-section").length > 0) {
						require(['init/general/createAccountInit'],
							function() {
								App.module('CreateAccount').start();
							});
					}

					if ($("#forgot-password-section").length > 0) {
						require(['init/general/forgotPasswordInit'],
							function() {
								App.module('ForgotPassword').start();
							});
					}

					if ($("#reset-password-section").length > 0) {
						require(['init/general/resetPasswordInit'],
							function() {
								App.module('ResetPassword').start();
							});
					}

					if ($("#tp-register-for-access-section").length > 0) {
						require(['init/general/registerForAccessInit'],
							function() {
								App.module('RegisterForAccess').start();
							});
					}

					if ($("#frmContactUs").length > 0) {
						require(['init/contactInit'],
							function() {
								App.module('Contact').start();
							});
					}

				    if (App.isIntervalSite) {
				        $(".wrapper-pad.bg-white:contains('Brochures')").hide();
				    }

			if ($('#clientBase').length > 0) {
				var clientBase = $('#clientBase');
				var x = clientBase[0].innerHTML.replace(/&lt;/g, '<');
				var y = x.replace(/&gt;/g, '>');
				clientBase[0].innerHTML = y.replace(/&quot;/g, '"');
					}

					//home hero search
					if ($('.home-search-hero-form').length > 0) {

						require(['knockout', 'app-home-hero-search'], function (ko, apphomeherosearch) {
							ko.applyBindings(new apphomeherosearch());
						});

					}
										
					//Homepage Featured tours container
					if ($('.featured-tours').length > 0) {
						var featuredToursLabel = $('.featured-tours__filters label');

						$(featuredToursLabel[0]).addClass('active');
						var firstId = $(featuredToursLabel[0])[0].id
						$('.slide-' + firstId).css('display', 'block');

						$('.featured-tours__filters label').click(function (e) {
							featuredToursLabel.each(function () {
								$(this).removeClass('active');
								var slideId = this.id;
								$('.slide-' + slideId).css('display', 'none');
							});
							$(e.currentTarget).addClass('active');
							$('.slide-' + e.currentTarget.id).css('display','block');
						});
					}

					if ($('.deals-signup').length > 0) {
						$('.input #email-f94c6588-2eaf-4369-bd74-e5214fbb255a').click(function () {
							console.log("clicked");
							$($('.hs_submit .actions input.hs-button')[0]).click();
							return false;
						});
					}

					//air sale landing page
					if ($('.itinerarymodal').length > 0) {
						
						require(['knockout','app-itinerary'], function (ko,appitinerary) {
							ko.applyBindings(new appitinerary());
						});

						//departure date panel functionality
						$('.panel-collapse').on('show.bs.collapse', function () {
							$(this).siblings('.panel-heading').addClass('active');
						});

						$('.panel-collapse').on('hide.bs.collapse', function () {
							$(this).siblings('.panel-heading').removeClass('active');
						});
					}

					if ($('.itinerarymodal').length > 0) {
						require(['init/itineraryModalInit'],
							function () {
								App.module('ItineraryModal').start();
							});
					}

					if ($('.surveyModal').length > 0) {
						require(['init/surveyModalInit'],
							function() {
								App.module('SurveyModal').start();
							});
					}

					if ($('.destinations-carousel').length > 0) {
						require(['init/destinationsCarouselInit'],
							function() {
								App.module('DestinationsCarousel').start();
							});
					}
					//TODO: Remove this snippet if the footer phone number discrepancy issue doesnt occur.
					// 176641 : during investigation we noticed the discrepancy was not reproducable
					// hence commented the code below (hack) used to remove discrepancy
					//if ($('.change-phone-number').length > 0) {
					//	require(['init/phoneNumberInit'], function () {
					//		App.module('PhoneNumber').start();
					//    });
					//}

					if ($('.hubspot-form-container').length > 0) {
						require(['init/hubspotFormInit'],
							function() {
								App.module('HubspotForm').start();
							});
					}

					//If there is an search  component on the page, start this module
					switch ($('body').data('template')) {
					case '{8047C140-5752-486C-8D78-959E8B1FA17B}':
						require(['init/regionsLandingPageInit', 'init/searchInit'],
							function() {
								App.module('Search').start();
								App.isSearch = true;
								
								//load static search only if required
								if ($(".staticResultsDataView").length > 0) {
									require(['init/searchStaticInit'],
										function() {
											App.module('SearchStaticView').start();
										});
								}
							});
						break;
					case '{6308F77F-B718-42EF-B7B7-79B4A1AC9144}':
						require(['init/toursComponentInit'],
							function() {
								App.module('Tour').start();
								App.isTour = true;
							});
						break;
					//login page
					case '{6651FD09-4B06-4355-8256-8784F8D3DB91}':
						require(['collette.security'],
							function() {
								App.module('Security').start();
							});
						break;

					case '{F35CAD78-3454-4822-A089-72192A742857}':
						//bookingInit comes from server. page init.
						App.module('Booking').start();
						App.isBooking = true;
						break;
					case '{8A9FF1BC-0025-4B58-A229-056B14A6E075}':
					case '{A024648B-44F9-437B-B0D8-7C35D201DD8F}':
						require(['init/homeInit'],
							function() {
								App.module('Home').start();
								App.isHome = true;
							});
						break;
					//module was not aviable at list- check do we need it
					case '{C8257F87-B7C4-446A-BD81-E25D4004F1AB}':
						require(['init/agentBrochuresInit'],
							function() {
								App.module('agentFinderModule').start();
							});
						break;
					case '{BB7698F9-93EA-42C9-9811-370E499AC792}':
					case '{57C9869C-6ED8-493B-BEB8-2874930B7053}':
						require(['init/famFormInit'],
							function() {
								App.module('FamForm').start();
							});
						break;
					case '{D8754F09-ADA9-4B7C-B330-5BCB7E2BBC25}':
					case '{4E671689-66E4-4482-888B-D66BDEB575A0}':
						require(['init/brochuresInit'],
							function() {
								App.module('Brochures').start();
							});
						break;
					default:
						//If there is a brochure form component on the page, open it
						if ($('#brochure-order-form').length > 0) {
							require(['init/brochuresInit'],
								function() {
									App.module('Brochures').start();
								});
							break;
						}

						if ($('#main.partners').length > 0) {
							require(['init/partnerPageInit'],
								function() {
									App.module('PartnerPage').start();
								});
							break;
						}


						if ($('.search-filter-modal').length > 0 ||
							$('.tour-search-results').length > 0 ||
							$('#searchResultView').length ||
							$('.posts-grid').length > 0 ||
							$('.post-single').length > 0) {
							require(['init/regionsLandingPageInit', 'init/searchInit'],
								function() {

									if ($('.blogPosts').length > 0 || $('.post-single').length > 0) {
										App.isBlogSearch = true;
									} else {
										App.isSearch = true;
									}

									App.module('Search').start();

									require(['knockout', 'app-search-hero'], function (ko, appSearchHero) {
										ko.applyBindings(new appSearchHero());
									});

									//load static search only if required
									if ($(".staticResultsDataView").length > 0) {
										require(['init/searchStaticInit'],
											function() {
												App.module('SearchStaticView').start();
											});
									}
								});
							break;
							}

							require(['knockout', 'app-search-hero'], function (ko, appSearchHero) {
								ko.applyBindings(new appSearchHero());
							});

						App.start();
					} //switch

					//always start the newsletter module
					require(['init/newsletterInit'],
						function() {
							App.module('Newsletter').start();
						});
				}; //startModules


				/**
				* Binds all of the modules finalizers to the window
				* unload event.
				*
				* @method bindModuleFinalizers
				*/
				var bindModuleFinalizers = function() {
					$(window)
						.unload(function() {
							_.each(App.submodules,
								function(module) {
									module.stop();
								});
						});
				};


				var isColletteSite = function() {
					return (App.siteIds.Collette == App.siteSettings.siteId);
				};

				/**
				* Returns true if current site is Thomas Cook
				*
				* @method isThomasCookSite
				* @returns {boolean}
				*/
				var isThomasCookSite = function() {
					return (App.siteIds.ThomasCook == App.siteSettings.siteId);
				};

				/**
				* Returns true if the current site is AAA
				*
				* @method isAAASite
				* @returns {boolean}
				*/
				var isAAASite = function() {
					return App.siteIds.AAA === App.siteSettings.siteId;
				};

				/**
				* Returns true if current site is Marriott Vacation Club
				*
				* @method isMarriottSite
				* @returns {boolean}
				*/
				var isMarriottSite = function() {
					return (App.siteIds.Marriott == App.siteSettings.siteId);
				};

				var isIntervalSite = function () {
				    return (App.siteIds.Interval == App.siteSettings.siteId);
				};
				/**
				* Returns true if the current site is US. Sitename is "collette-us"
				*
				* @method isUSSite
				* @returns {boolean}
				*/
				var isUSSite = function() {
					return $('body').data('site') === "collette-us" || window.location.href.indexOf('sc_site=collette-us') > 0; // IE :\
				};

				var isUKSite = function() {
					return $('body').data('site') === "collette-uk" || window.location.href.indexOf('sc_site=collette-uk') > 0;
				};
			
			var isCASite = function () {
				return $('body').data('site') === 'collette-ca';
			};
			
			var isAUSite = function () {
				return $('body').data('site') === 'collette-au';
			};
    
				/**
				* Returns true if it is the HomePage
				*
				* @method isHomePage
				* @returns {boolean}
				*/
				var isHomePage = function() {
					return ($('body').data('template') === '{A024648B-44F9-437B-B0D8-7C35D201DD8F}');
				};

				/**
				* Creates the prototype function formatPrice
				* on the String object to be used with the site
				* settings currency symbol
				*
				* @method setFormatPriceFunction
				*/
				var setFormatPriceFunction = function() {
					String.prototype.formatPriceWithoutCurrency = function() {
						var price = this;
						return String(price)
							.split("")
							.reverse()
							.join("")
							.replace(/(\d{3}\B)/g, "$1,")
							.split("")
							.reverse()
							.join("");
					};

					String.prototype.formatPrice = function() {

						var price = this.formatPriceWithoutCurrency();
						var formattedPrice = App.siteSettings.currencySymbol + price;
						if (App.siteSettings.toursUsePointsSystem) {

							formattedPrice = price + " " + App.siteSettings.pricePointSymbol;
						}

						return formattedPrice;
                    };

                    String.prototype.formatPriceTourOptions = function () {

                        var price = this.formatPriceWithoutCurrency();
                        var formattedPrice = App.siteSettings.currencySymbol + price;
                        if (App.siteSettings.toursUsePointsSystem) {

                            formattedPrice = "$" + price;
                        }

                        return formattedPrice;
                    };
				};

				//var getParameterByName = function(name, url) {
				//	name = name.replace(/[\[\]]/g, "\\$&");
				//	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
				//		results = regex.exec(url);
				//	if (!results) return null;
				//	if (!results[2]) return '';
				//	return decodeURIComponent(results[2].replace(/\+/g, " "));
				//};

				//var bookingTrackingScripts = function(item) {
				//	if (App.isUKSite || App.isThomasCookSite) {
				//		var url = window.location.href;
				//		var startDate = getParameterByName('startDate', url);
				//		var endDate = getParameterByName('endDate', url);
				//		var totalPax = getParameterByName('totalPax', url);

				//		SeoTaggingUtil.addDataLayerTags(item.data('booking-id'),
				//			item.data('pricelocal'),
				//			startDate,
				//			endDate,
				//			item.data('tour-name'),
				//			item.data('name'),
				//			item.data('continent'),
				//			totalPax);
				//	} else {
				//		//track facebook for all sites except TCT and UK
				//		//fbq it is global function come from FB see FacebookTrackingPixel.cshtml
				//		var _fbq = window._fbq || (window._fbq = []);
				//		//_fbq.push('track', 'Purchase', { value: item.data('pricelocal'), currency: App.siteSettings.currencyCode });
				//	}
				//};
				//var bookingTrackingScripts = function (item) {
				//	var _fbq = window._fbq || (window._fbq = []);
				//	_fbq.push('track', 'Purchase', { value: item.data('pricelocal'), currency: App.siteSettings.currencyCode });
				//}
				//var bookingCompletedSuccessfullyTracking = function(item) {
				//	if (window.loaded) {
				//		bookingTrackingScripts(item);
				//	} else {
				//		window.addEventListener('load',
				//			function() {
				//				bookingTrackingScripts(item);
				//			});
				//	}
				//};

				// set booking session cookie as expired only for current booking
				var bookingThankYouAndErrorPage = function () {
					if ($('.step7').length > 0) {
						var bookingDataObject;
						var bindEventName = "";
						var thankYouPage = $('#booking-completed-main-info');
						if (thankYouPage.length > 0) {
							bookingDataObject = thankYouPage;
							bindEventName = 'Success';
						}

						var errorPage = $('#booking-error-info');
						if (errorPage.length > 0) {
							bookingDataObject = errorPage;
							bindEventName = 'Error';
							require(['init/errorPaymentFormInit'],
								function () {
									App.module('Error-Payment-Form').start();
								});
							
						}

						if (bookingDataObject) {
							var bookingEngineId = bookingDataObject.data('booking-engine-id');

							var bookingId = bookingDataObject.data("bookingId");
							var isWaitList = bookingDataObject.data("waitlist");
							if (isWaitList) {
								bindEventName = 'Waitlist';
							}
							BingTrackingUtils.trackBingView('Booking', bindEventName, bookingId, '1');

							var domain = '.' + window.location.host,
								expDate = new Date();
							expDate.setMinutes(expDate.getMinutes() - 50);
							cookie.set('bookingSession' + bookingEngineId, null, { domain: domain, expires: expDate });
						}
					}
				};


				/**
				* Called once site settings have been loaded
				*
				* @method onSiteSettingsLoad
				*/
				var onSiteSettingsLoad = function() {
					//trying to get rid of these..
					App.isSearch = false;
					App.isTour = false;
					App.isBooking = false;
					App.isHome = false;
					App.isNewTourDetailPage = false;
					App.isThomasCookSite = isThomasCookSite();
					App.isIntervalSite = isIntervalSite();
					App.isAAASite = isAAASite();
					App.isMarriottSite = isMarriottSite();
					App.isColletteSite = isColletteSite();
					App.isUKSite = isUKSite();
					App.isUSSite = isUSSite();
				    App.isCASite = isCASite();
				    App.isAUSite = isAUSite();
					setFormatPriceFunction();
					var currentItemId = $('body').data('current-item-id');
			
					//set unveil on images so they are wired to show as the page scrolls
					$("img").unveil();

					$("a.dropdown")
						.hover(
							function() {
								//get child with this class
								var image = $(this).siblings('.dropdown_menu').find('img');
								var datasrc = $(image).attr('data-src');
								var src = $(image).attr('src');

								if (src !== datasrc) {
									$(image).attr('src', datasrc);
								}
							}
						);

					SeoTaggingUtil.pushGoogleAnalytics();
					startModules();
					bindModuleFinalizers();
					bookingThankYouAndErrorPage();

					if (!CookieMessageUtil.IsMessageCookieSet()) {
						$('.cookieMessage').show();
					} else {
						$('.cookieMessage').hide();
					}
					//Cookie Message
					$('.cookieMessage a.close')
						.on('click',
							function(e) {
								e.preventDefault();

								CookieMessageUtil.SetMessageCookieValue();
								$('.cookieMessage').hide();
							}
						);

					//instantiate renderedLayouts/views that are rendered servers side
					var searchTextLayout = new SearchTextLayout();
					var getInspiredLayout = new GetInspiredLayout();

					// var instantChatLayout = new InstantChatLayout();
					var responsiveUtil = new ResponsiveUtil();
					responsiveUtil.setViewPorts();
					responsiveUtil.setScreenSizeCookie();

					if ($('body').data('template') == '{C8257F87-B7C4-446A-BD81-E25D4004F1AB}') {
						var districtSaleManagerLocatorLayout = new DistrictSaleManagerLocatorLayout();
					}

					$('a.up-vote')
						.click(function(e) {
							e.preventDefault();
							var currentItemId = $('body').data('current-item-id');
							var datasourceId = $(this).data('id');
							var completeImgSrc = $(this).data('completed-src');

							var img = $(this).find('img');
							var parentDiv = $(this).parent();

							parentDiv.html('');
							img.appendTo(parentDiv);
							$(parentDiv).find('img').attr('src', completeImgSrc);

							MarketingCenterService.upvote(currentItemId, datasourceId);
						});

					//pretty select should always run after everything is set
					$('select').not("[data-bindoption]").prettySelect();

					$(".terms_conditions")
						.on("click",
							function(e) {
								e.preventDefault();
								$(".terms_conditions_modal")
									.dialog({
										modal: true,
										title: "Terms and Conditions",
										draggable: false,
										resizable: false,
										dialogClass: 'fixed-dialog',
										width: 750,
										height: 550
									});
								$(".ui-widget-overlay")
									.click(function() {
										$(".terms_conditions_modal").dialog("close");
									});
							});

					//Tour Details unbind click events to the ff buttons
					$(".tourbookingpageurl").unbind();
					$(".button_col a").unbind();


					// Tour Details - View More Slide up/down
					$(".view_more")
						.on('click',
							function(e) {
								e.preventDefault();
								var $this = $(this),
									$textTarget = $this.find("span"),
									originalBtnText = $this.attr("title"),
									$container = $this.closest('.container'),
									$details = $this.siblings(".section").find(".expanded");
								$this.toggleClass("close");
								if ($this.hasClass("close")) {
									$textTarget.text("Close");
									$('body, html')
										.animate({ scrollTop: $container.offset().top },
											function() {
												$details.slideDown();
											});
								} else {
									$textTarget.text(originalBtnText);
									$('body, html')
										.animate({ scrollTop: $container.offset().top },
											function() {
												$details.slideUp();
											});
								}
							});
					// Sidebar Search Results expand/hide
					$("#sidebar .block.arrow.close .content").hide();
					$("#sidebar .block.arrow > .header")
						.on('click',
							function(e) {

								var $this = $(this),
									$content = $this.closest(".block").find(".content");
								$this.closest(".block").toggleClass("close");
								$content.slideToggle();
							});

					// Sidebar Activity-Level Checkboxes
					$("#sidebar .checkbox_controls a")
						.on('click',
							function(e) {
								e.preventDefault();

								var $this = $(this),
									$checkbox = $this.closest(".content").find("table.activity_level input:checkbox");

								if ($this.attr("class") === 'clear_all') {
									$checkbox.prop('checked', false);
								} else if ($this.attr('class') === 'check_all') {
									$checkbox.prop('checked', true);
								}
							});

					// Why Travel with Collette - show / hide more details
					$("#primary.why_guided_travel a.arrow_down")
						.on("click",
							function(e) {
								e.preventDefault();
								var $this = $(this),
									$expanded = $this.closest(".sub_section").find(".expanded"),
									$header = $this.closest(".sub_section"),
									$original_text = $this.attr("title");

								if ($expanded.is(":visible")) {
									$expanded.slideUp();
									$this.addClass("closed");
									$this.text($original_text);
								} else {
									$expanded.slideDown();
									$this.removeClass("closed");
									$this.text("Hide More Details");
								}
							});

					// FAQ page - show / hide answers
					$("#primary.faq a.arrow_down")
						.on("click",
							function(e) {
								e.preventDefault();
								var $this = $(this),
									$expanded = $this.closest(".sub_section").find(".expanded"),
									$header = $this.closest(".sub_section");

								if ($expanded.is(":visible")) {
									$expanded.slideUp();
									$this.addClass("closed");
								} else {
									$expanded.slideDown();
									$this.removeClass("closed");
								}
							});

					/* ******************************************************** */
					// Guided travel pages need help with their page-nav to
					// see how many items are in there then attach appropriate
					// class
					function adjustPageNav() {
						var items = $(".page_nav li").length;
						switch (items) {
						case 1:
							$(".page_nav").addClass("one");
							break;
						case 2:
							$(".page_nav").addClass("two");
							break;
						case 3:
							$(".page_nav").addClass("three");
							break;
						case 4:
							$(".page_nav").addClass("four");
							break;
						default:
							// console.log('Iam 5');
						}
					}

					if ($(".guided_travel").length) {
						adjustPageNav();
					}

					// Our Team - Read more Slide up/down
					$(".team_bio .read_more")
						.on('click',
							function(e) {
								e.preventDefault();

								var $this = $(this),
									originalBtnText = $this.data("read-more"),
									newBtnText = $this.data("read-less"),
									$container = $this.parents('.team_bio'),
									$more = $this.parents('.team_bio').find(".expanded");
								$this.toggleClass("close");
								if ($this.hasClass("close")) {
									$this.text(newBtnText);
									$('body, html')
										.animate({ scrollTop: $container.offset().top },
											function() {
												$more.slideDown();
											});
								} else {
									$this.text(originalBtnText);
									$('body, html')
										.animate({ scrollTop: $container.offset().top },
											function() {
												$more.slideUp();
											});
								}
							});

					// Mute row input
					$("table.calendar tr.muted").find("input[type='radio']").attr("disabled", true);

					//Videos page init
					if ($("#primary.videos").length) {
						$("#primary.videos").bcVideos();
					}

					//Video page dropdown change event
					$('.video_filter select')
						.change(function() {
							var id = $(this).val();

							var url = window.location.href;
							url = url.substring(0, url.indexOf('?'));

							if (id != '') {
								url = url + "?topic=" + id;
							}

							window.location.href = url;
						});

					//The following is used on the Brochure Order form component.
					//It will filter the state drop-down according to the country selection
					$(".countryOnAddresses_filter select")
						.change(function() {
							var countryText = $(".countryOnAddresses_filter select option:selected").text();
							var countryId = App.locationsOnAddresses.getLocationId('countries', countryText);
							$('.countryId').val(countryId);
							var states = [];
							App.locationsOnAddresses.getStatesForAddressesLocation(countryId)
								.complete(function(response) {
									states = $.parseJSON(response.responseJSON.d);
									if (states.length > 0) {
										$('.stateOnAddresses_filter').show();
										var firstOption = states[0].name;
										var stateId = App.locationsOnAddresses.getLocationId('states', firstOption);
										$('.stateId').val(firstOption);
										$('.stateOnAddresses_filter select').empty();
										$('.stateOnAddresses_filter ul').empty();
										$(".stateOnAddresses_filter .current a").text(firstOption);
									} else {
										$('.stateOnAddresses_filter').hide();
										$('.stateId').val("");
									}

									$.each(states,
										function(index, value) {
											$('.stateOnAddresses_filter ul')
												.append("<li value='" + value.name + "' data-value='" + value.name + "'>" + value.name + "</li>");
											$('.stateOnAddresses_filter select')
												.append("<option value='" + value.name + "' data-value='" + value.name + "'>" + value.name + "</option>");
										});
								});
						});

					$(".stateOnAddresses_filter select")
						.change(function() {
							var selectedState = $(".stateOnAddresses_filter select option:selected").text();
							var stateId = App.locationsOnAddresses.getLocationId('states', selectedState);
							$('.stateId').val(stateId);
							$(".stateOnAddresses_filter .current a").text(selectedState);
						});


					//all elements that open model forms that initiate ajax calls
					$(".request_quote_button, .newsletter-signup-modal, .talk_expert_button, .email, .primary-brochure-button, .agent_finder")
						.on('click',
							function() {
								//take care of language cookie prior to ajax requests
								siteLanguageService.setLanguageCookie(App.siteSettings.siteName, App.siteSettings.siteLanguage)
									.done(function(response) {
										console.log("Site language cookie set: " + response.d)
									});
							});

					//request quote button within search results item
					$("div[data-searchPanel]")
						.on("click",
							"button.request_quote_button",
							function() {
								//take care of language cookie prior to ajax requests
								siteLanguageService.setLanguageCookie(App.siteSettings.siteName, App.siteSettings.siteLanguage)
									.done(function(response) {
										console.log("Site language cookie set: " + response.d)
									});
							});

					if (isUSSite()) {
						$('#OptInEmailValue').attr('checked', true);
					}

					$(".digest_signup_button")
						.on("click",
							function(e) {
								$('#digest-modal').modal('show');
							});

					$(".call_now_button")
						.on("click",
							function(e) {
								$('#call-now-modal').modal('show');
							});

					IdleVisitorChatUtil.start();
					
					
				};
			});
	});
function toggleMenu(event) {
	event.preventDefault()
	var x = document.getElementByClassName("sub-items");
	if (x.style.display === "none") {
		x.style.display = "block";
	} else {
		x.style.display = "none";
	}
}