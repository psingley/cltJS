/**
 * App is a singleton class defined globally for the site and should be requested
 * on every page load.
 *
 * @type {Marionette.Application}
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'util/dictionaryUtil',
    'util/taxonomy/taxonomyUtil',
    'util/locationsUtil',
		'util/locationsOnAddressesUtil',
    'config'
], function ($, _, Backbone, Marionette, DictionaryUtil, TaxonomyUtil, LocationsUtil, LocationsOnAddressesUtil,Config) {
    var App = new Backbone.Marionette.Application();

    /**
     * Returns true if the user is in a mobile view
     *
     * @method isMobile
     * @returns {boolean}
     */
    var isMobile = function () {
        var userAgent = navigator.userAgent || navigator.vendor || window.opera;
        return ((/iPhone|iPod|Android|BlackBerry|Opera Mini|IEMobile/).test(userAgent)) || $(window).width() <= 480;
    };

    var companyData = function () {
    	var company = $("body").data("company");
	    return company;
    };
	App.addInitializer(function () {
		var result = Backbone.history.start();
		if (!result) {
			console.log("If no defined route matches the current URL");
		}
	});

    //lets set the config to the app so it can be used globally
	App.config = Config;

	App.companyInfo = companyData();

    //site setting ids to identify sites
    App.siteIds = {
        Collette: '{D0821DAF-8C62-4B2A-8044-90075E0EF971}',
        ThomasCook: '{F16A3B7D-7FFC-40D9-A19E-BAC06E9A25BD}',
        AAA: '{E941CD4D-BD90-42C6-BF56-D41C1A4F8537}',
        Marriott: '{CEBBA75A-206B-45EC-B942-F2FA66D192E2}',
        Interval: '{E554D582-82CC-40A5-BCF9-AB8A04B650EA}'
    };

    App.mobile = isMobile();

    //search facets should be defined globally since they can appear on multiple pages
    //(home page for example)
    App.regionFacet = 'regionnames';
    App.countryFacet = 'countrynames';
    App.continentFacet = 'continentnames';
    App.startDateFacet = 'start';
    App.endDateFacet = 'end';
    App.priceFacet = 'price';
    App.sortByFacet = 'sortBy';
    App.showFacetBar = 'showFacetBar';
    App.sortDirectionFacet = 'sortDirection';
    App.tourFeaturesFacet = 'features';
    App.dayLengthFacet = 'daylength';
    App.activityLevelFacet = 'activitylevel';
    App.styleFacet = 'stylenames';
    App.badges = 'badgenames';
    App.cities = 'cities';
    App.ownerExclusives = 'ownerexclusiveseries';
    App.offerTypes = 'offertype';
    App.caresDate = 'caresdate';
    App.parent = 'parent';
    App.postDate = 'postfulldate';
    App.content = 'content';
    App.tourLengthDescriptionFacet = "tourlength_description";
    //App.highlights = 'highlights'
    App.tourLengthDescriptionResults = "";

    App.dictionary = new DictionaryUtil();
    App.dictionary.getDictionaries();

    App.taxonomy = new TaxonomyUtil();
    App.taxonomy.getTaxonomyTypes();

    App.locations = new LocationsUtil();
    App.locations.getLocations();

    App.locationsOnAddresses = new LocationsOnAddressesUtil();
		App.locationsOnAddresses.getLocations();

    App.requestAQuoteModalLayout = null;
    App.feedbackModalLayout = null;

    return App;
});
