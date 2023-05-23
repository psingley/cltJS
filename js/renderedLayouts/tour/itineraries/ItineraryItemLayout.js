define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'views/tour/itineraries/ItineraryItemListView',
    'views/tour/itineraries/ItineraryItemBigListView',
    'text!templates/tour/itineraries/itineraryItemLayout.html'

], function ($, _, Backbone, Marionette, App, ItineraryItemListView, ItineraryItemBigListView, itineraryItemLayoutTemplate) {
    var ItineraryItemLayout = Backbone.Marionette.Layout.extend({
        template: Backbone.Marionette.TemplateCache.get(itineraryItemLayoutTemplate),
        regions: {
            defaultView: "#itineraryDefaultView",
            expandedView: "#itineraryExpandedView"
        },
        onShowCalled: function () {
            //hides itinerary section if empty
            if (this.collection == null || this.collection.length < 1) {
                $('#itinerary_section_container').hide();
                $('#itinerary_section_container').attr('shownondesktop', 'false');

            } else {
                this.defaultView.show(new ItineraryItemListView({ collection: this.collection }));
                this.expandedView.show(new ItineraryItemBigListView({ collection: this.collection }));
                $('#itinerary_section_container').show();
                $('#itinerary_section_container').attr('shownondesktop', 'true');
            }
        },
        events: {
            'click .itinerary_block': 'showExpandedItems',
            'click .view_details': 'viewDetails'
        },
        showExpandedItems: function (e) {
            e.preventDefault();
            var $this = $(e.currentTarget),
                $container = $this.closest('.container'),
                $expanded = $this.closest(".section").find(".expanded"),
                $child = $($this.attr('href')),
                $viewMoreBtn = $($this.closest(".container").find(".view_more")),
                $originalBtnText = $viewMoreBtn.attr("title"),
                $textTarget = $($viewMoreBtn.find("span")),
                $expandedItineraryDetails = $child.closest("tr").find(".expanded_itinerary_details"),
                $viewDetails = $child.closest("tr").find(".view_details"),
                $viewDetailsText = $child.closest("tr").find(".view_details > span");

            if (!$expanded.is(":visible")) {
                // Scroll to anchor id
                $('body, html').animate({scrollTop: $container.offset().top}, function () {
                    $expanded.slideDown(function () {
                        $('html, body').animate({scrollTop: $child.offset().top - 20});
                    });
                })
                // Simulate close button for opened expanded class
                $textTarget.text("Close");
                $viewMoreBtn.addClass("close");
                // Open itinerary details
                $expandedItineraryDetails.slideDown();
                $viewDetailsText.text("Hide Details");
                $viewDetails.addClass("hide");
            } else {
                $('html, body').animate({scrollTop: $child.offset().top - 20});
                $expandedItineraryDetails.slideDown();
                $viewDetailsText.text("Hide Details");
                $viewDetails.addClass("hide");
            }
        },
        // Tour Details - Itinerary Details show / hide (in expanded panel)
        viewDetails: function (e) {
            e.preventDefault();
            var $this = $(e.currentTarget);
            var textTarget = $this.find("span");
            var originalBtnText = $this.attr("title");

            if (!$this.hasClass("hide")) {
                textTarget.text("Hide Details");
            }
            else {
                textTarget.text(originalBtnText);
            }
            $this.siblings(".expanded_itinerary_details").slideToggle();
            $this.toggleClass("hide");

            return false;
        }

    });
    // Our module now returns our view
    return ItineraryItemLayout;
});