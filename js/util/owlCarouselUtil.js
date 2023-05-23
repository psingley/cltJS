define([
    'owl.carousel'
], function (owl) {
    var owlCarouselUtil = {
       tourPageCarousel: function(numberOfItemsPerPage, carouselItem){
           carouselItem.owlCarousel({
               loop: true,
               nav: true,
               responsive : {
                 0 : {
                    items : 1
                 },
                 400 : {
                    items : 2
                 },
                 580 : {
                    items : numberOfItemsPerPage
                 }
               }
           });
           carouselItem.show();
           var currentItemsPerPage = carouselItem.find('.owl-item:not(.cloned)').length;
           if (currentItemsPerPage <= numberOfItemsPerPage) {
               var owlControls = carouselItem.find('.owl-controls');
               $(owlControls).hide();
           }
       },

       owlAdjustSize: function () {
         // On mobile load, hide carousel sections after loading to allow Owl Carousel to calculate widths first
         if ($(window).width() < 767) {
           $('#hotels_section, #tour_extensions_section, #optional_excursions_section').hide();
         }

         // on window resize past mobile threshold, timer to allow Owl to calculate widths
         var resizeTimer;
         var prevWidth = $(window).width();

         $(window).on('resize', function(e) {
           clearTimeout(resizeTimer);
           resizeTimer = setTimeout(function() {
             var currWidth = $(window).width();
             if (prevWidth > 767 && currWidth <= 767) {
               $('#hotels_section, #tour_extensions_section, #optional_excursions_section').hide();
             }
             prevWidth = currWidth;
           }, 250);
         });
       }

    };

    return owlCarouselUtil;
});
