// Include Desktop Specific JavaScript files here (or inside of your Desktop Controller, or differentiate based off App.mobile === false)
define([
    "app",
    "renderedLayouts/home/HomePageFiltersLayout",
    'domReady'
],
    function (App, HomePageFiltersLayout, domReady) {
        App.module("Home", function () {
            var outerScope = this;
            this.startWithParent = false;

            this.addInitializer(function () {
                domReady(function () {
                    //instantiate views/renderedLayouts for server side rendered components
                	var homePageFiltersLayout = new HomePageFiltersLayout();
                	var numberOfItemsPerPage = 3;
                	require(['owl.carousel'], function () {
                		var currentCarousel = $('#otherTours');
                		currentCarousel.owlCarousel({
											loop: true,
											items: numberOfItemsPerPage,
                			nav: true
                		});
                		currentCarousel.show();
                		var currentItemsPerPage = currentCarousel.find('.owl-item').length;
                		if (currentItemsPerPage <= numberOfItemsPerPage) {
                			var owlControls = currentCarousel.find('.owl-controls');
                			$(owlControls).hide();
                		}
                	});

                });

                App.start();
            });
        });
    });