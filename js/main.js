// Filename: main.js

// Require.js allows us to configure shortcut alias
// There usage will become more apparent further along in the tutorial.
require.config({
	waitSeconds: 200,
	shim: {
		underscore: {
			exports: '_'
		},
		'backbone.babysitter': {
			deps: ['backbone', 'underscore']
		},
		backbone: {
			deps: ["underscore", "jquery"],
			exports: "Backbone"
		},
		marionette: {
			deps: ['jquery', 'underscore', 'backbone', 'backbone.babysitter'],
			exports: ['Marionette']
		},
		'jquery.cycle': {
			deps: ['jquery']
		},
		'plugins': {
			deps: ['jquery']
		},
		'jquery.ui': {
			deps: ['jquery']
		},
		site: {
			deps: ['ieCompatibility', 'jquery', 'chosen']
		},
		moment: {
			deps: ['jquery']
		},
		'carousel': {
			deps: ['jquery', 'jquery.ui']
		},
		'videos': {
			deps: ['jquery', 'jquery.ui']
		},
		'jquery.confirmon': {
			deps: ['jquery']
		},
		'jquery.bindfirst': {
			deps: ['jquery']
		},
		'jquery.titlealert': {
			deps: ['jquery']
		},
		'jquery.unveil': {
			deps: ['jquery']
		},
		'selectivizr': {
			deps: ['jquery']
		},
		'owl.carousel': {
			deps: ['jquery']
		},
		'chosen': {
			deps: ['jquery']
		},
		'bootstrap': {
			deps: ['jquery']
		},
		'gallery-carousel': {
			deps: ['jquery']
		},
		'chosen.jquery': {
			deps: ['jquery']
		},
		'isotope': {
			deps: ['jquery', 'jquery.bridget']
		},
		'packery-mode': {
			deps: ['jquery', 'isotope']
		},
		'jquery.bridget': {
			deps: ['jquery']
		},
		'waitForImages': {
			deps: ['jquery']
		},
		'jquery.hideseek': {
			deps: ['jquery']
		},
		'bootstrap.tour': {
			deps: ['bootstrap']
		},
		'stickyfill': {
			deps: ['jquery']
		},
		'mobileEvents': {
			deps: ['jquery']
		},
		'ekko.lightbox': {
			deps: ['bootstrap']
		},
		'experian': {
			deps: ['jquery']
		},
		'tiny-slider': {
			deps: ['jquery']
		},
		'owl.carousel_new': {
			deps: ['jquery']
        },
        'jquery_validate': {
            deps: ['jquery']
		},
		'knockout': {
			deps: ['jquery']
		}

	},
	baseUrl: '/js',
	paths: {
		jquery: 'libs/jquery/jquery-1.10.2',
		bootstrap: 'libs/bootstrap/bootstrap.min',
		'bootstrap.tour': 'libs/bootstrap-tour/bootstrap-tour.min',
		underscore: 'libs/underscore/underscore',
		backbone: 'libs/backbone/backbone',
		'backbone.pager': 'libs/backbone/backbone.pager',
		marionette: 'libs/backbone/backbone.marionette',
		'backbone.wreqr': 'libs/backbone/backbone.wreqr',
		'backbone.babysitter': 'libs/backbone/backbone.babysitter',
		modernizr: 'libs/modernizr/modernizr.custom.30952',
		domReady: 'libs/require/domReady',
		moment: 'libs/moment/moment',
		templates: 'templates',
		collections: 'collections',
		models: 'models',
		views: 'views',
		controllers: 'controllers',
		routers: 'routers',
		init: 'init',
		'event.aggregator': 'eventAggregator',
		util: 'util',
		events: 'events,',
		'jquery.cycle': 'plugins/jquery.cycle2.min',
		'jquery.titlealert': 'plugins/jquery.titlealert',
		'jquery.ui': 'libs/jquery/jquery-ui-1.10.3.custom',
		'jquery.unveil': 'libs/jquery/jquery.unveil',
		'plugins': 'plugins/plugins',
		selectivizr: 'libs/selectivizr/selectivizr-min',
		'jRespond': 'libs/jRespond/jRespond',
		respond: 'libs/respond/respond',
		'text': 'libs/require/text',
		'cookie': 'libs/cookies/js.cookie',
		'collette.promotions': 'collette/promotions/Collette.Promotions',
		'collette.security': 'collette/security/Collette.Security',
		'carousel': 'plugins/carousel',
		'brightcove': 'libs/brightcove/BrightcoveExperiences',
		'videos': 'plugins/videos',
		extensions: 'extensions',
		placeholders: 'libs/placeholders/placeholders',
		'jquery.confirmon': 'libs/jquery/jquery.confirmon',
		'jquery.bindfirst': 'libs/jquery/jquery.bindfirst',
		'search.init': 'init/searchInit',
		'booking.init': 'init/bookingInit',
		'tour.init': 'init/tourInit',
		'home.init': 'init/homeInit',
		'experience.init': 'init/experienceInit',
		'owl.carousel': 'plugins/owl.carousel',
		'phoneUtil': 'plugins/libphonenumber',
		'chosen': 'plugins/chosen.jquery',
		'rendered.layout': 'extensions/marionette/views/RenderedLayout',
		'goalsUtil': 'util/goalsUtil',
		'gallery-carousel': 'plugins/gallery-carousel',
		'chosen.jquery': 'libs/jquery/chosen.jquery.min',
		'isotope': 'libs/isotope/isotope.pkgd.min',
		'packery-mode': 'libs/isotope/packery-mode.pkgd.min',
		'jquery.bridget': 'libs/jquery/jquery.bridget',
		'waitForImages': 'libs/jquery/jquery.waitforimages.min',
		'hideseek': 'libs/jquery/jquery.hideseek.min',
		'nouislider': 'libs/nouislider/nouislider.min',
		ieCompatibility: 'ieCompatibility',
		stickyfill: 'libs/bower/stickyfill.min',
		mobileEvents: 'libs/touchEvent/mobileEvents.min',
		'ekko.lightbox': 'libs/ekko-lightbox/ekko-lightbox.min',
		'experian': 'libs/experian/edq-validate-ui',
		'tiny-slider': 'libs/tiny-slider/tiny-slider',
		'owl.carousel_new': 'libs/owl/owl.carousel_new',
		'monthpicker': 'libs/jquery-ui-monthpicker/monthpicker',
        'maskedinput': 'libs/maskedinput/maskedinput',
		'jquery_validate': 'libs/jquery/jquery.validate',
		'knockout': 'libs/knockout/knockout-3.5.1',
		'tourTcrItineraryInit.init': 'init/tourTcrItineraryInit',
		'tourTcrPackageDatesInit.init': 'init/tourTcrPackageDatesInit',
		'tourTcrTourMediaGalleryInit.init': 'init/tourTcrTourMediaGalleryInit',
		'tourTcrGettingPreparedInit.init': 'init/tourTcrGettingPreparedInit'
	}
});


console.log("Cache busting version: ", Date.now());
//this is where all of the magic happens
require(['site']);
