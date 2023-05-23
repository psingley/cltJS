define([
    'knockout',
    'jquery',
    'bootstrap',
],
    function (ko, $, Bootstrap) {
        function TourGettingPreparedModule() {
            var self = this;

            self.error = ko.observable();
            self.siteName = ko.observable();
            self.siteSettings = ko.observable();
            self.packageId = ko.observable();
            self.documentNotes = ko.observableArray([]);
            self.travelTips = ko.observableArray([]);
            
            var siteSettings = $('#siteSettings').val();
            self.siteSettings(siteSettings);
            self.siteName($.parseJSON(self.siteSettings()).siteName);
            self.packageId($('#packageNeoId').val());


            self.getGettingPreparedInfo = function () {

                console.log("Lets get prepared..");
                console.log("Cache busting version: ", Date.now());


                if (self.documentNotes().length == 0 && self.travelTips().length == 0) {

                    console.log("Retrieving getting prepared info...");
                    console.log("packageId: " + self.packageId());
                    console.log("siteName: " + self.siteName());

                    var parameters = { packageId: self.packageId(), siteName: self.siteName() };

                    ajaxHelper('/api/services/TourDetailsService/GetTcrGettingPrepared', 'POST', parameters).done(function (data, status, xhr) {

                        self.documentNotes(data.docNotes);
                        self.travelTips(data.travelTips);

                    });


                }

            }




            function ajaxHelper(uri, method, data) {


                self.error(''); // Clear error message
                return $.ajax({
                    type: method,
                    url: uri,
                    dataType: 'json',
                    contentType: 'application/json',
                    data: data ? JSON.stringify(data) : null
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    self.error(errorThrown);
                    console.log(self.error());
                });

            }

            
        }
        $(document).ready(function () {


            var vm = new TourGettingPreparedModule();
            console.log("Set the vm on pdp-getting-prepared right now");
            ko.cleanNode($('#pdp-getting-prepared'));
            ko.applyBindings(vm, $('#pdp-getting-prepared')[0]);
            console.log("vm applied to pdp-getting-prepared");
            let gpButton = document.querySelector(".btn-know");
            gpButton.setAttribute('data-bs-toggle', 'modal');
            gpButton.disabled = false;
        })


    }
);