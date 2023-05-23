define([
    'domReady!',
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
	'extensions/marionette/views/RenderedLayout',
    'views/regionsLanding/LinkListView',
    'collections/regionsLanding/LinkCollection',
    'models/regionsLanding/LinkModel',
], function (doc, $, _, Backbone, Marionette, App, RenderedLayout, LinkListView, LinkCollection, LinkModel) {
    var regionsLandingLayout = RenderedLayout.extend({
        el: '#regions-landing-intro',
        regions: {
            navigation : "#region-navbar"
        },
        events: {
            'click .scroll-to': 'scrollToClick'
        },
        initialize: function () {
            this.setViewportResize();

            this.addLinks();
            this.trackImages();
            this.initStickyNavBar();
        },

        setViewportResize: function () {
            var viewport = $(window);
            this.phoneWidth = 480;
            this.tabletWidth = 767;
            this.desktopWidth = 960;

            viewport.smartresize();

            this.viewport = viewport;
        },

        addLinks: function() {
            var items = $("section.anchor-section");
            if (items.length > 0) {
                var collection = new LinkCollection();
                collection.set(
                    $.map(items, function(item){
                        return new LinkModel(item);
                    })
                );
                this.navigation.show(new LinkListView({collection: collection}));
            }
            $('body').scrollspy({ offset: 85, target: '.navbar-sticky' });
        },

        trackImages: function () {
            var outerScope = this;
            var imgCycles = $(".js_img-cycle-trigger"), imgCycleInterval;

            imgCycles.each(function () {
                $(this).find(".js_img-cycle").attr("data-count", 0);
            });

            imgCycles.hover(
                function () {
                    if (outerScope.viewport.width() > outerScope.tabletWidth) {
                        var img = $(this).find(".js_img-cycle"),
                            imgSet = img.data("img-set");
                        if (imgSet != undefined) {
                            var imgCount = imgSet.length,
                            count = img.attr("data-count");

	                        var func = function() {
		                        img.attr("src", imgSet[count % imgCount]);
		                        count++;
		                        img.attr("data-count", count);
	                        };
                          imgCycleInterval = setInterval(func, 800);
                        }
                    }
                },
                function () {
                    if (outerScope.viewport.width() > outerScope.tabletWidth) {
                        clearInterval(imgCycleInterval);
                    }
                });
        },

        initStickyNavBar: function() {
            var outerScope = this;
            var stickyNav = $(".js_sticky-nav");
            if(stickyNav.length) {
                var navContainer = stickyNav.children(".container"),
                    navHeader = stickyNav.find(".navbar-header"),
                    navItems = stickyNav.find(".navbar-nav"),
                    navWidth,
                    navHeaderWidth,
                    navItemsWidth,
                    navOffset,
                    navSpacer = 50;

                this.viewport.resize(function() {

                    // Detect top offset automatically

                    navOffset = stickyNav.offset();
                    stickyNav.attr("data-offset-top", navOffset.top);

                    // Add class to nav when nav title and nav items are about to be to wide for the container

                    if(outerScope.viewport.width() > outerScope.tabletWidth) {
                        navWidth = navContainer.width();
                        navHeaderWidth = navHeader.width();
                        navItemsWidth = navItems.width();

                        if((navHeaderWidth + navSpacer + navItemsWidth) >= navWidth) {
                            stickyNav.addClass("show-mobile-nav");
                        } else {
                            stickyNav.removeClass("show-mobile-nav");
                        }
                    } else {
                        stickyNav.removeClass("show-mobile-nav");
                    }

                }).resize();
            }
        },

        scrollToClick: function (e) {
            if (location.pathname.replace(/^\//, '') === window.location.pathname.replace(/^\//, '') && location.hostname === window.location.hostname) {
                var target = e.currentTarget.hash,
                    offset;
                if ($(e.currentTarget).attr("data_offset")) {
                    offset = $(e.currentTarget).attr("data_offset");
                } else {
                    offset = 0;
                }
                target = target.length ? target : $('[name=' + target.slice(1) + ']');
                if (target.length) {
                    $('html,body').animate({
                        scrollTop: $(target).offset().top - offset
                    }, 750);
                    return false;
                }
            }
        }
    });
    return regionsLandingLayout;
},

function ($, sr) {

    // debouncing function from John Hann
    // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
    var debounce = function (func, threshold, execAsap) {
        var timeout;

        return function debounced() {
            var obj = this, args = arguments;
            function delayed() {
                if (!execAsap)
                    func.apply(obj, args);
                timeout = null;
            }

            if (timeout)
                clearTimeout(timeout);
            else if (execAsap)
                func.apply(obj, args);

            timeout = setTimeout(delayed, threshold || 100);
        };
    };
    // smartresize 
    jQuery.fn[sr] = function (fn) { return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };

}(jQuery, 'smartresize')
);