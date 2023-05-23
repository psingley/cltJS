define([
        "app",
        'jquery',
        'underscore',
        'marionette',
        'backbone',
        'tiny-slider'
    ],
    function (App, $, _, Marionette, Backbone) {
        App.module("DestinationsCarousel", function () {
            this.startWithParent = true;

            this.addInitializer(function () {
                $('.destinations-carousel').destinationsCarousel();
                App.start();
            });

            $.fn.destinationsCarousel = function() {
                return this.each(function(){

                    var $carousel = $(this);
                    var $slider = $carousel.find('.slider');
                    var $imgs = $slider.find('.img-wrap');
                    var $left = $carousel.find('.left');
                    var $right = $carousel.find('.right');
                    var $descriptions = $carousel.find('.destination-descriptions');
                    var $desc = $descriptions.find('.desc-wrap');
                    var imgIndex = 0;
                    var timer;
                    var intervalTime = 10000;

                    $carousel.addClass('is-active');
                    $desc.eq(imgIndex).addClass('is-visible');

                    var slider = tns({
                        container: $slider[0],
                        items: $imgs.length >= 4 ?  4 : $imgs.length,
                        controls: false,
                        nav:false,
                        loop: false,
                        gutter: 2
                    });

                    // slider.events.on('transitionEnd', function(info){
                    //   console.log('transition end', info);
                    // });

                    $left.on('click', function(e){
                        prev();
                        e.preventDefault();
                    });

                    $right.on('click', function(e){
                        next();
                        e.preventDefault();
                    });

                    $slider.on('click', '.img-wrap', function(){
                        var $this = $(this);
                        jumpTo($this.index());
                    });

                    function startTimer() {
                        $imgs.eq(imgIndex).addClass('is-timer');
                        timer = setTimeout(next, intervalTime);
                        updateCopy();
                    }

                    function jumpTo(index) {
                        clearTimeout(timer);
                        var info = slider.getInfo();
                        $imgs.eq(imgIndex).removeClass('is-timer');
                        $imgs.eq(imgIndex)[0].clientHeight;
                        imgIndex = index;
                        startTimer();
                    }

                    function next() {
                        clearTimeout(timer);
                        var info = slider.getInfo();
                        if(imgIndex + 1 < info.slideCount) {
                            $imgs.eq(imgIndex).removeClass('is-timer');
                            $imgs.eq(imgIndex)[0].clientHeight;
                            imgIndex++;
                            if(imgIndex === info.index + info.items &&
                                info.index + info.items < info.slideCount) {
                                slider.goTo('next');
                            }
                            startTimer();
                        }
                    }

                    function prev(){
                        var info = slider.getInfo();
                        if(imgIndex > 0) {
                            clearTimeout(timer);
                            $imgs.eq(imgIndex).removeClass('is-timer');
                            $imgs.eq(imgIndex)[0].clientHeight;
                            imgIndex--;
                            if(imgIndex < info.index) {
                                slider.goTo('prev');
                            }
                            startTimer();
                        }
                    }

                    function updateCopy() {
                        $descriptions.find('.is-visible').removeClass('is-visible');
                        $desc.eq(imgIndex).addClass('is-visible');
                    }

                    startTimer();

                });
            };
        });
    });