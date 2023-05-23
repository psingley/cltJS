define([
		'jquery',
		'underscore',
		'backbone',
		'marionette',
        'app',
		'extensions/marionette/views/RenderedLayout'
],


    function ($, _, Backbone, Marionette, App, RenderedLayout) {
        var itemCount;
        var matrixwebkit = "matrix(1, 0, 0, 1, 0, 0)";
        var matrixIE = "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)";
        var syncCarousel = RenderedLayout.extend({

            el: ".synced-carousel",
            events: {
                "click .owl-item": "ClickedOnThumb"
            },
            ui: {
                '$CarouselThumbs': '#destination-carousel-thumbs',
                '$CarouselID': '#CarouselID'
            },
            initialize: function (e) {

                var destinationCarouselThumbs = this.ui.$CarouselThumbs,
                    carouselId = "#" + this.ui.$CarouselID.val();
                var slideInterval = this.el.attributes[1].value;
                var autoplay = true;
                var isLooped = true;
                var itemCount = $('.owlItem').length;
                if (slideInterval === "0" || slideInterval == "false") {
                    autoplay = false;
                }
                var destinatinationCarouselSlides = $(carouselId);

       

                function callback(event) {
                    if ($('.owl-stage').width() > 900) {
                        if (event.item.count < 6) {
                            $('.owl-stage').css('margin', '0 auto').css('width', $('.owl-carousel').width());
                            $('#destination-carousel-thumbs').addClass('add_margin_bottom_to_owlItem');
                        }
                    }
                   
                }

                //center vertically
                function centerNav() {
                    $('div.owl-nav').css('top', $("#destination-carousel-thumbs").height() / 2 - 25 + "px");
                }

                function resized(event) {
                    centerNav();
                }

                require(['owl.carousel_new'], function () {
                    destinationCarouselThumbs.owlCarouselNew({
                        loop: isLooped,
                        margin: 0,
                        nav: true,
                        navText: [
                                '<i class="fa fa-chevron-left"></i>',
                                '<i class="fa fa-chevron-right"></i>'
                        ],
                        responsiveClass: true,
                        lazyLoad: true,
                        onChange: callback,
                        onResized: resized,
                        autoplay: autoplay,
                        autoplayHoverPause: autoplay,
                        autoplaySpeed: slideInterval,
                        responsive: {
                            0: {
                                items: 1
                            },
                            840: {
                                items: 2,
                                nav: (itemCount > 2) ? true : false,
                                loop: (itemCount > 2) ? true : false,
                                center: (itemCount > 2) ? true : false
                            },
                            1120: {
                                items: 5,
                                nav: (itemCount > 4) ? true : false,
                                loop: (itemCount > 4) ? true : false,
                                center: (itemCount > 4) ? true : false
                            },
                            1680: {
                                items: 6,
                                nav: (itemCount > 5) ? true : false,
                                center: (itemCount > 5) ? true : false,
                                loop: (itemCount > 5) ? true : false,
                                
                            }
                        }
                    });

                    destinationCarouselThumbs.on('changed.owl.carousel', function (e) {
                        destinatinationCarouselSlides.carousel(e.page.index);
                        if (destinatinationCarouselSlides.carousel(e.item.count) < 2) {
                            $('div.owl-item.active.center').removeClass('center');
                        }

                    });

                    destinationCarouselThumbs.show();
                    centerNav();
                    //if center is false add green bar on first active item
                    if ($('.owl-stage').css('transform') == matrixwebkit || $('.owl-stage').css('transform') == matrixIE) {
                        $(".owl-item.active").first().addClass("center");
                    }
                });
            },

            ClickedOnThumb: function (e) {
                e.preventDefault();
                var item = $(e.currentTarget);
                var itemIndex = item.index() - (this.ui.$CarouselThumbs.find(".cloned").length / 2);
                this.ui.$CarouselThumbs.trigger("to.owl.carousel", [itemIndex, 200, true]);
                if ($('.owl-stage').css('transform') == matrixwebkit || $('.owl-stage').css('transform') == matrixIE) {
                    $('.active').removeClass('center');
                    item.addClass('center');
                }
            }

        });
        return syncCarousel;
    });