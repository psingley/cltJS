define([
		'jquery',
		'backbone',
		'marionette',
		'app',
		'extensions/marionette/views/RenderedLayout'
], function ($, Backbone, Marionette, App, RenderedLayout) {

    var backToTopLayout = RenderedLayout.extend({
        initialize: function () {
            var stickyNav, offset;
                stickyNav = $("header");
            offset = stickyNav.offset().top;

            var userScroll = true;

            $(window).scroll(function () {
                if ($(this).scrollTop() >= offset && userScroll) {        // If page is scrolled more than offset
                    $('.back-to-top').fadeIn(200);    // Fade in the arrow
                } else {
                    $('.back-to-top').fadeOut(500);   // Else fade out the arrow
                }
            });


            // If we are on the search page, add class to button for unique CSS
            // that hides button below 480px
            if ($('.search-filter-modal-trigger').length) {
                $('.back-to-top').addClass('hasFiltersBtn');
            }



            $('.back-to-top').click(function () {
                userScroll = false;
                $('.back-to-top').fadeOut(450);
                $('body,html').animate({
                    scrollTop: 0                       // Scroll to top of body
                }, 600);
                setTimeout(function () {
                    userScroll = true;
                }, 601);
            });
        }
    });

    return backToTopLayout;
});
