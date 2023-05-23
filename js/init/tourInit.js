define([
	'jquery',
	'bootstrap',
	'app',
	'event.aggregator',
	'routers/tourRouter',
	'controllers/tourController',
	'services/tourService',
	'util/objectUtil',
	'util/seoTaggingUtil',
	'renderedLayouts/tour/shareEmail/ShareEmailLayout',
	'renderedLayouts/tour/tourExtensions/ExtensionNotesLayout',
    'util/TourDetailUtil',
	'util/owlCarouselUtil',
    'cookie'
],
function ($, Bootstrap, App, EventAggregator, TourRouter, TourController, TourService, ObjectUtil, SeoTaggingUtil, ShareEmailLayout, ExtensionNotesLayout,TourDetailUtil, OwlCarouselUtil,cookie) {
	App.module("Tour", function (Tour) {
		var outerScope = this;
		this.startWithParent = false;

		/**
		* Instantiates the controller and starts the app.
		*
		* @method startTourApp
		*/
		var startTourApp = function () {
			$.when(App.dictionary.getDictionaries()).done(function () {
				if (ObjectUtil.isNullOrEmpty(App.Tour.settings)) {
					throw new Error("Tour settings object is undefined! This method can only be called once the tour settings have been defined.")
				}

				//we can set up multiple dependencies here, when will wait for all fetches to finish.
				outerScope.appRouter = new TourRouter({
					controller: new TourController()
				});

				var shareEmailLayout = new ShareEmailLayout();

			    var extensionNotesLayout = new ExtensionNotesLayout();

			    //Set up AddThis config and Twitter button link
			    if (!ObjectUtil.isNullOrEmpty(addthis_config)) {
			        var addthis_config = { data_track_addressbar: false, data_track_clickback: false, pubid: 'ra-50bcb9321a0ad93f' };
			        addthis.toolbox('.addthis_toolbox', null, addthis_share);
			    }

			    //$(".inpage_social").append(
				//'<div id="_atssh" style="visibility: hidden; height: 1px; width: 1px; position: absolute; z-index: 100000;">' +
				//'<iframe id="_atssh981" title="AddThis utility frame" style="height: 1px; width: 1px; position: absolute; z-index: 100000; border: 0px; left: 0px; top: 0px;" src="//s7.addthis.com/static/r07/sh149.html#iit=1392714360138&amp;tmr=load%3D1392714359942%26core%3D1392714360063%26main%3D1392714360133%26ifr%3D1392714360141&amp;cb=0&amp;cdn=0&amp;chr=UTF-8&amp;kw=&amp;ab=-&amp;dh=local.gocollette.com&amp;dr=&amp;du=http%3A%2F%2Flocal.gocollette.com%2FHtml%2FSprint1%2Ftour-details.shtml&amp;dt=&amp;dbg=0&amp;md=0&amp;cap=tc%3D0%26ab%3D1&amp;inst=1&amp;vcl=1&amp;jsl=1&amp;prod=undefined&amp;lng=ru&amp;ogt=&amp;pc=men&amp;pub=ra-50bcb9321a0ad93f&amp;ssl=0&amp;sid=5303227883c24022&amp;srpl=1&amp;srcs=1&amp;srd=1&amp;srf=1&amp;srx=1&amp;ver=300&amp;xck=0&amp;xtr=0&amp;og=&amp;aa=0&amp;rev=126596&amp;ct=1&amp;xld=1&amp;xd=1&amp;fcu=UwMiePl_ug8"></iframe>' +
				//'</div>');

				//var $inpageSocial = $('.inpage_social');
				//var twitterText = $inpageSocial.data('twitter-text');
				//var currentTourLink = $inpageSocial.data('current-tour-link');
				//var addVia = $inpageSocial.data('add-via');
				//var viaTxt = $inpageSocial.data('via');
				//var hashTags = $inpageSocial.data('hash-tags');

				//var addthis_share = addthis_share || {};
				//addthis_share = {
				//	passthrough: {
				//		twitter: {
				//			text: twitterText,
				//			url: currentTourLink,
				//			hashtags: hashTags
				//		}
				//	}
				//};

				//if (addVia === true) {
				//	addthis_share.passthrough.twitter.via = viaTxt;
				//} else if ('via' in addthis_share.passthrough.twitter) {
				//	delete addthis_share.passthrough.twitter.via;
				//}

			    //start the app
				App.start();

				OwlCarouselUtil.owlAdjustSize();
				// Show phone number for Marriott itinerary print and pdf
				if (App.isMarriottSite) {
					$('.itinerary-contact').show();
				}
			});
		};

		this.addInitializer(function () {
			//Organize Application into regions corresponding to DOM elements
			//Regions can contain views, Layouts, or subregions nested as necessary
			App.addRegions({
				descriptionRegion: "#slider_section",
				routeRegion: "#yourRoute",
				tourDatesRegion: "#tourDates",
				itineraryRegion: "#yourItinerary",
				accommodationsRegion: "#accommodations",
				travelTipsRegion: "#travelTips",
				travelTipGroupsRegion: "#travelTipsFull",
				activityLevelRegion: "#activityLevel",
				guidedTravelPerksRegion: "#guidedTravelPerks",
				otherToursRegion: "#otherTours",
				tourDetailOtherToursRegion: "#tourDetailOtherTours",
				availableOffersRegion: "#tourOffers"
			});



			EventAggregator.on('getTourDatesSettingsComplete', function() {
				startTourApp();
			});

			TourService.getTourDatesSettings();
		});
	});
});
