define([
    'knockout',
    'jquery',
], function (ko, $) {

    function TcrItineraryToolbarView(params) {
        const reg = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        let self = this;
        self.data = params.data;
        self.isCopied = ko.observable(false);
        self.isEmailSent = ko.observable(false);
        self.isInvalidSharedInfo = ko.observable(false);
        self.receiverEmail = ko.observable('');
        self.receiverName = ko.observable('');
        self.senderName = ko.observable('');

        self.sharedURL = document.location.href;
        self.isSubmitting = ko.observable(false);

        self.model = ko.computed(function () {
            let dataSource = ko.unwrap(self.data);
            if (dataSource == null) return;
            $("#showExtension").addClass("show");
            $(".navigation-btn").removeClass("selected");
            switch (dataSource.mode) {
                case 'extension':
                    $("#btnExtension").addClass("selected");
                    break;
                case 'map':
                    $("#btnMap").addClass("selected");
                    break;
                default:
                    $("#btnTimeline").addClass("selected");
                    break;
            }

            return dataSource;
        });

        self.showExtension = function (data) {
            params.showExtension(data);
        }

        self.toggleExtensionList = function (evt) {
            $(".extension-arrow").removeClass("show");

            if ($("#btnExtension").attr("data-mode") == 'show') {
                $("#btnExtension").attr("data-mode", "hide");
                $("#showExtension").addClass("show");
                $("#hideExtension").removeClass("show");
                $("#extensions-list").hide();
            }
            else {
                $("#btnExtension").attr("data-mode", "show");
                $("#hideExtension").addClass("show");
                $("#showExtension").removeClass("show");
                $("#extensions-list").show();
            }
        };

        self.coverImageUrl = ko.computed(function () {
            return self.model().coverImageUrl;
        });

        self.extensions = ko.computed(function () {
            var extensionList = [];
            if (self.model().hasPreTour) extensionList.push({ id: 'pretour', label: 'Pre-Tour' });
            if (self.model().hasPostTour) extensionList.push({ id: 'posttour', label: 'Post-Tour' });
            if (self.model().hasPreNight) extensionList.push({ id: 'prenight', label: 'Pre-Night' });
            if (self.model().hasPostNight) extensionList.push({ id: 'postnight', label: 'Post-Night' });
            if (extensionList.length <= 0 && self.model() && self.model().mode == 'main') {
                $(".navigation-btn.start").addClass("selected");
            }
            return extensionList;
        });

        self.packageDate = ko.computed(function () {
            return self.model().packageDate || '';
        })

        self.showPrintModal = function () {
            $("#print_itinerary_modal")[0].style.display = 'block';
        };

        self.printTour = function () {
            window.print();
        };

        printPage = function () {
            //var imgsrc = document.querySelector("#tdpHero section").style.backgroundImage.slice(4, -1).replace(/"/g, "");
            //document.getElementById("printThis").innerHTML = `<img src=${imgsrc} />`;
            //printJS('printThis', 'html');
            //document.getElementById("printThis").innerHTML = "";
            //printJS({ printable: 'thepage', type: 'html' });
            window.print();
        };
        printItinerary = function () {
            document.getElementById("printThis").innerHTML = document.getElementById("tcr-print-itinerary").innerHTML;
            printJS('printThis', 'html');
            document.getElementById("printThis").innerHTML = "";
        };

        self.showShareModal = function () {
            if (!!addthis) {
                addthis.init();
            }
            $("#share_itinerary_modal")[0].style.display = 'block';
        }

        self.hideModal = function () {
            for (let idx = 0; idx < $(".tcr-itinerary-modal").length; idx++) {
                $(".tcr-itinerary-modal")[idx].style.display = 'none';
            }
        };

        self.isValid = function () {
            if (!!self.receiverEmail() && self.receiverEmail().toLowerCase().match(reg) &&
                !!self.senderName() &&
                !!self.receiverName()
            ) {
                return true;
            }

            self.isSubmitting(false);
            return false;
        }

        self.shareViaEmail = function () {
            self.isInvalidSharedInfo(false);
            let currentItemId = $("body")[0].dataset['currentItemId'];
            let packageDateId = "";
            self.isSubmitting(true);

            try {
                if (!self.isValid()) {
                    self.isInvalidSharedInfo(true);
                    return;
                }

                $.ajax({
                    type: "POST",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: JSON.stringify({
                        receiverEmail: self.receiverEmail(),
                        receiverName: self.receiverName(),
                        senderName: self.senderName(),
                        currentItemId, packageDateId
                    }),
                    url: '/api/services/TourDetailsService/ShareTourViaEmail',
                    error: function (errorResponse) {
                        console.log(errorResponse.responseText);
                        self.isSubmitting(false);
                    },
                    success: function (result) {
                        self.isSubmitting(false);
                        if (!self.isEmailSent()) {
                            self.isEmailSent(true);
                            setTimeout(() => { self.isEmailSent(false); }, 2000);
                        }
                    }
                });
            }
            catch (ex) {
                self.isSubmitting(false);
            }
        }
    }

    return TcrItineraryToolbarView;
});
