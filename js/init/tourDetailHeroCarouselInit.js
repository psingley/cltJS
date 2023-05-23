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
	    App.module("Tour-Detail-Hero-Carousel", function () {
	
	        this.startWithParent = false;

	        
	        var totalItems = $('.item.tc_item').length;
	        if (totalItems > 1) {
	            $(".tour-detail-hero--arrows").show();
	        }


	        this.addInitializer(function () {
	            $('.tour-detail-hero').tourDetailHero();
	            $("div.tour-detail-hero--inner").show();
	        });
	    });

	    $.fn.tourDetailHero = function () {
	        return this.each(function () {
	            var $hero = $(this);
	            var $slider = $hero.find('[class$="--inner"]');
	            var $left = $hero.find('[data-slide="prev"]');
	            var $right = $hero.find('[data-slide="next"]');
	            var $hasvideo = $hero.find('[class$="hasvideo"]');


	            //if there is video do not loop - do not autoplay
	            if ($hasvideo.length > 0) {
	                var slider = tns({
	                    container: $slider[0],
	                    items: 1,
	                    controls: false,
	                    autoplay: false,
                        lazyload: false,
                        speed: 100,
                        loop: false,
                        rewind: true
	                });

	                window._wq = window._wq || [];
	                _wq.push({
	                    id: "_all",
	                    onHasData: function (video) {
	                        video.bind("play", function () {
	                            slider.pause();
	                            slider.events.on('indexChanged',function () {
	                                video.pause();
	                            });
	                            return video.unbind;
	                        });
	                    }

	                });

	            }
                //carousel only contains images
	            else {
	                var slider = tns({
	                    container: $slider[0],
	                    items: 1,
	                    controls: false,
	                    autoplay: true,
	                    lazyload:true,
	                    autoplayTimeout: 10000
	                });
	            }
	           
		        $left.on('click', function (e) {
		            slider.goTo('prev');
		            e.preventDefault();
		        });

		        $right.on('click', function (e) {
		            slider.goTo('next');
		            e.preventDefault();
		        });

		        if ($hasvideo.length > 0) {
		            $('body').click(function () {
		                if ($(window).width() > 768) {
		                    window.setTimeout(function () {
		                        if ($('.wistia_placebo_close_button').position().top === 0) {
		                            slider.play();
		                        }
		                    }, 600);
		                }

		            });
		        }

	        });
		};
	});



