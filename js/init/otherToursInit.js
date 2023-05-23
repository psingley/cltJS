define([
    "app",
    'jquery',
    'underscore',
    'marionette',
    'backbone',
    'tiny-slider',
    'modernizr'

],
	function (App, $, _, Marionette, Backbone) {
	    App.module("Other-Tours-Carousel", function () {

	        this.startWithParent = false;
	    });

	    $.fn.otherToursCarousel = function () {
	        return this.each(function () {
	            var $ot = $(this);
	            var $carousel = $ot.find('.other-tours--carousel');
	            var $left = $ot.find('[data-slide="prev"]');
	            var $right = $ot.find('[data-slide="next"]');

	            var slider = tns({
	                container: $carousel[0],
	                items: 3,
	                nav: false,
	                controls: false,
	                responsive: {
	                    768: {
	                        items: 3
	                    },
	                    480: {
	                        items: 2
	                    },
	                    0: {
	                        items: 1
	                    }
	                }
	            });

	            $left.on('click', function (e) {
	                slider.goTo('prev');
	                e.preventDefault();
	            });

	            $right.on('click', function (e) {
	                slider.goTo('next');
	                e.preventDefault();
	            });
	        });
	    };

	    $('.otherToursCarousel').otherToursCarousel();
	   
	  //updateNewOtherToursHeight();

	   
	  
	  //  var resizeTimer;
	  //  $(window).on('resize', function (e) {
	  //      clearTimeout(resizeTimer);
	  //      resizeTimer = setTimeout(function () {
	  //         updateNewOtherToursHeight();
	  //      }, 250);
	  //  });

	    //function updateNewOtherToursHeight() {
	       // $("#tourDetailOtherTours").show();
	        // Tour Details - other tours
	        //if ($("#tour_detail_other_tours").length) {

	        //    var imgHeight = "215px";
	        //    //var maxHeightArr = [];
	        //    //var maxHeight;
	        //    //$('.other-tours-img').each(function () {
	        //    //    maxHeightArr.push($(this).height());
	        //    //});
	        //    //maxHeight = Math.min.apply(Math, maxHeightArr) + 'px';
	        //    $('.other-tours-img').each(function () {
	        //        $(this).css('max-height', imgHeight);
	        //    });
	        //}
	    //}
	});