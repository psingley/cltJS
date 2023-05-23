define([
    "app",
    'jquery',
    'underscore',
    'marionette',
    'backbone'

],
	function (App, $, _, Marionette, Backbone) {
	    App.module("Jump-Link", function () {

	        this.startWithParent = false;
	        this.addInitializer(function () {
	            $('.tour-detail-jump-link').tourDetailJumpLink();
	            $('.feefo-tour-detail-image a#tour-hero-feefo').tourDetailJumpLink();
	        });

	    });
	    /** * TOUR DETAIL JUMP LINKS* */
	    $.fn.tourDetailJumpLink = function () {
	        return this.each(function () {
	            var $link = $(this);
	            $link.on('click', scrollToLink);

	            function scrollToLink(e) {
	                try {
	                    var offset = 0;
	                    if ($(window).width() >= 768) {
	                        offset = $('#tour_detail_sub_nav').height();
	                        if ($('.sticky-h1').length > 0) {
	                            offset = $('#tour_detail_sub_nav').height();
	                            $('html, body').animate({
	                                scrollTop: $($link.attr('href')).offset().top - offset
	                            }, 500);
	                        }

	                        else {
	                            $('html, body').animate({
	                                scrollTop: $($link.attr('href')).offset().top 
	                            }, 500);

	                            window.setTimeout(function () {
	                                offset = $('#tour_detail_sub_nav').height();
	                                $('html, body').animate({
	                                    scrollTop: $($link.attr('href')).offset().top - offset
	                                }, 500);
	                            }, 500);
	                        }
	                    }
	                    else {
	                        $('html, body').animate({
	                            scrollTop: $($link.attr('href')).offset().top
	                        }, 500);
	                    }
	                    e.preventDefault();
	                    return false;

	                } catch (e) {
	                    console.log('Error on jump link ' + e);
	                }

	            }
	        });
	    }
	});


