define([
    'knockout',
    'jquery',
    'bootstrap',
],
    function (ko, $, Bootstrap) {
        function TourMediaGalleryModule() {
            var self = this;

            self.error = ko.observable();
            self.language = ko.observable();
            self.siteSettings = ko.observable();
            self.landingPageId = ko.observable();
            self.packageId = ko.observable();
            self.tourMediaGalleryItems = ko.observableArray([]);
            self.blogPosts = ko.observableArray([]);
            self.tourMediaCount = ko.observable('');
            self.tourVideos = ko.observableArray([]);

            var siteSettings = $('#siteSettings').val();
            self.siteSettings(siteSettings);
            self.language($.parseJSON(self.siteSettings()).language);
            self.landingPageId($('#landingPageId').val());
            self.packageId($('#packageNeoId').val());                

            self.getTourMediaGallery = function () {
                                
                if (self.tourMediaGalleryItems().length == 0) {
                    
                    console.log("Retrieving tour media gallery...");
                    console.log("packageId: " + self.packageId());
                    console.log("landingPageId: " + self.landingPageId());
                    console.log("language: " + self.language());

                    var parameters = { packageId: self.packageId(), landingPageId: self.landingPageId(), language: self.language() };

                    ajaxHelper('/api/services/TourDetailsService/GetTcrTourMediaGallery', 'POST', parameters).done(function (data, status, xhr) {

                        self.tourMediaGalleryItems(data.photoUrls);
                        self.tourMediaCount(data.photoCount);
                        self.blogPosts(data.blogPosts);
                        self.tourVideos(data.videos);

                        var photoSwiper = new Swiper(".myPhotosSwiper", {
                            loop: true,
                            spaceBetween: 20,
                            navigation: {
                                nextEl: ".sn3",
                                prevEl: ".sp3",
                            },
                            breakpoints: {
                                // when window width is >= 320px
                                320: {
                                    slidesPerView: 1
                                },

                                844: {
                                    slidesPerView: 1
                                },

                                1200: {
                                    slidesPerView: 3
                                }
                            }
                        });

                        var blogSwiper = new Swiper(".myBlogSwiper", {
                            loop: true,
                            navigation: {
                                nextEl: ".snb3",
                                prevEl: ".spb3",
                            },
                            breakpoints: {
                                // when window width is >= 320px
                                320: {
                                    slidesPerView: 1
                                },

                                844: {
                                    slidesPerView: 1
                                },

                                1200: {
                                    slidesPerView: 3
                                }
                            }
                        });

                        var videoSwiper = new Swiper(".mVideoSwiper", {
                            slidesPerView: 1,
                            loop: true,
                            navigation: {
                                nextEl: ".vsnb3",
                                prevEl: ".vspb3",
                            },
                        });
                    
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

            //self.getTourMediaGallery();

        }
        $(document).ready(function () {
            var vm = new TourMediaGalleryModule();
            console.log("Set the vm on tdpHero right now");
            ko.cleanNode($('#tdpHero'));
            ko.applyBindings(vm, $('#tdpHero')[0]);
            let button = document.querySelector(".view-all-button");
            button.setAttribute('data-bs-toggle', 'modal');
            button.disabled = false;
        })


    }
);