define([
    'knockout',
    'jquery',
], function (ko, $) {
    function TcrItineraryTimelineView(params) {
        let self = this;
        self.convert = function (rawData) {
            return rawData !== null && rawData !== undefined ? rawData : '';
        }

        self.data = params.data;
        self.index = ko.observable(0);

        self.model = ko.computed(function () {
            let dataSource = ko.unwrap(self.data);
            if (dataSource == null) return {};

            $("#tcr-itinerary-timeline").show();

            var tooltipIcons = $(".timeline-extension");
            if (tooltipIcons.length > 0) {
                tooltipIcons.hover(
                    function () {
                        $("#prePostTooltip").removeClass('tcr-tooltip-hide');
                        $("#prePostTooltip").addClass('tcr-tooltip');
                        if (this.style.left) {
                            let pos = $("#tcr-event-timeline")[0].style.transform
                                ? $("#tcr-event-timeline")[0].style.transform.replace('translateX(', '').replace('rem)', '')
                                : 0;

                            let timelinePosition = +(pos);
                            $("#prePostTooltip")[0].style.left = (+this.style.left.replace('rem', '') - Math.abs(timelinePosition)) + 'rem';
                        }
                    },
                    function () {
                        $("#prePostTooltip").removeClass('tcr-tooltip');
                        $("#prePostTooltip").addClass('tcr-tooltip-hide');
                    }
                );
            };

            self.index(ko.unwrap(params.index));
            return { ...dataSource, itineraryDay: dataSource.day };
        });

        self.destinationTile = ko.computed(function () {
            let header = self.model().heading && self.model().heading.split('-').length > 0 ? self.model().heading.split('-')[0] : '-';
            return (self.model().isPreTour || self.model().isPostTour || self.model().isPreNight || self.model().isPostNight)
                ? "Extension"
                : (self.model().supplier?.city || header);
        });

        self.itineraryDay = ko.computed(function () {
            return self.convert(self.model().itineraryDay);
        });

        self.itineraryId = ko.computed(function () {
            return 'tcr-timeline-point-' + self.index();
        });

        self.dayTitle = ko.computed(function () {
            if (self.model().isPreTour) return "*Pre-Tour";
            if (self.model().isPostTour) return "*Post-Tour";
            if (self.model().isPreNight) return "*Pre-Night";
            if (self.model().isPostNight) return "*Post-Tour";
            return `Day ${self.model().dayNumberDisplay}`;
        });

        self.isSelected = ko.computed(function () {
            return self.model().selectedDay == self.model().itineraryDay;
        });

        self.extensionStyleClass = ko.computed(function () {
            var styleClasses = 'timeline-point';
            if (self.model().isPreTour || self.model().isPostTour || self.model().isPreNight || self.model().isPostNight) styleClasses += " timeline-extension";
            if (self.model().isExtension) styleClasses += ' timeline-prepost';
            if (!self.model().isPreTour && !self.model().isPostTour
                && !self.model().isPreNight && !self.model().isPostNight
                && !self.model().isExtension) styleClasses += ' timeline-org';

            if (self.model().selectedDay == self.model().itineraryDay) styleClasses += ' selected';

            return styleClasses;
        });

        self.extensionType = ko.computed(function () {
            return self.model().isPreNight ? 'prenight' : (self.model().isPostNight ? 'postnight' : '');
        });

        self.expandWidth = ko.computed(function () {
            return ((self.index() * 2 + 1.3) * 5) + 'rem';
        });
    }
    return TcrItineraryTimelineView;
});
