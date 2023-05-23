/**
 * Parent view for everything on the rooming and travelers step
 *
 * @class RoomsStepLayout
 * @extends BaseStepLayout
 */

define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'event.aggregator',
    'app',
    'util/objectUtil',
    'util/seoTaggingUtil',
    'util/dateUtil',
    'collections/booking/rooms/RoomCollection',
    'views/booking/rooms/RoomListView',
    'models/booking/rooms/RoomModel',
    'models/booking/travelerInformation/TravelerModel',
    'models/booking/travelerInformation/ContactInfoModel',
    'models/booking/travelerInformation/AdditionalInfoModel',
    'models/booking/travelerInformation/MembershipModel',
    'models/booking/travelerInformation/PassportInfoModel',
    'services/bookingService',
    'util/booking/bookingUtil',
    'views/validation/ErrorView',
    'views/booking/rooms/OrphanedTravelerListView',
    'views/booking/rooms/TravelerSmallRoomView',
    'renderedLayouts/booking/steps/BaseStepLayout',
    'collections/booking/travelerInformation/TravelerCollection',
    'collections/booking/tourCustomizations/BookingPackageUpgradeCollection',
    'util/prettySelectUtil',
    'views/booking/tourCustomizations/TourAdditionalFeesListView',
    'util/travelerUtil',
    'util/dataLayerUtil',
    'goalsUtil'
],
    function ($,
        _,
        Backbone,
        Marionette,
        EventAggregator,
        App,
        ObjectUtil,
        SeoTaggingUtil,
        DateUtil,
        RoomCollection,
        RoomListView,
        RoomModel,
        TravelerModel,
        ContactInfoModel,
        AdditionalInfoModel,
        MembershipModel,
        PassportInfoModel,
        BookingService,
        BookingUtil,
        ErrorView,
        OrphanedTravelerListView,
        TravelerSmallRoomView,
        BaseStepLayout,
        TravelerCollection,
        PackageUpgradeCollection,
        PrettySelectUtil,
        TourAdditionalFeesListView,
        TravelerUtil,
        DataLayerUtil,
        goalsUtil) {
        var RoomsStepLayout = BaseStepLayout.extend({
			/**
			* Specifies the element associated with this view
			*
			* @property el
			*/
            el: "#numberOfRoomsRegion",
			/**
			* Binds all of the events for this view
			*
			* @property events
			*/
            events: {
                'change #roomsDropDown': 'toggleRooms',
                'click .removeRoom': 'removeRoom',
                'click .button_next': 'submitStep'
            },
			/**
			* Object literal that defines the events
			* associated with the orphaned travelers collection
			*
			* @property orphanedTravelersEvents
			*/
            orphanedTravelersEvents: {
                'remove': 'checkUnassignedTravelers'
            },
			/**
			* Object literal that defines the events
			* associated with the room collection
			*
			* @property roomCollectionEvents
			*/
            roomCollectionEvents: {
                'remove': 'updateRoomDropDownValue updateSubmissionStatus',
                'add': 'updateSubmissionStatus'
            },
			/**
			* Object literal that defines the events
			* associated with the traveler collection
			*
			* @property travelerCollectionEvents
			*/
            travelerCollectionEvents: {
                'add': 'updateSubmissionStatus',
                'remove': 'updateSubmissionStatus'
            },
			/**
			* Binds all of the events to methods defined in this view
			* for the collections
			*
			* @method bindCollectionEvents
			*/
            bindCollectionEvents: function () {
                Marionette.bindEntityEvents(this, App.Booking.orphanedTravelers, this.orphanedTravelersEvents);
                Marionette.bindEntityEvents(this, App.Booking.rooms, this.roomCollectionEvents);
                Marionette.bindEntityEvents(this, App.Booking.travelers, this.travelerCollectionEvents);
            },
			/**
			* Extends the base regions property
			*
			* @method regions
			* @returns {*}
			*/
            regions: function () {
                var baseStepRegions = RoomsStepLayout.__super__.regions;

                var roomLayoutRegions = {
                    roomsRegion: "#roomsListContent",
                    orphanedTravelersRegion: "#orphanedTravelers",
                    additionalFeesRegion: '#additionalFeesRegion'
                };

                return _.extend(baseStepRegions, roomLayoutRegions);
            },
            initialize: function () {
                this.constructor.__super__.initialize.apply(this);
                this.roomsNumberHasChanged = false;
                var outerScope = this;
                var datalayer;
                EventAggregator.on('showAdditionalFeesRegion', function () {
                    outerScope.showAdditionalFees();
                });

                EventAggregator.on('numberOfRoomsUpdate', function () {
                    outerScope.roomsNumberHasChanged = true;
                });



                EventAggregator.on('getBookingComplete', function (booking) {

                    outerScope.tourAdditionalFees = booking.tourAdditionalFees;
                    if (outerScope.tourAdditionalFees.length > 0) {
                        outerScope.showAdditionalFees();
                    }

                    // if nothing in booking default to 1 double room
                    var setDefaultTravelers = false;
                    if (App.Booking.rooms.length === 0 &&
                        App.Booking.travelers.length === 0 &&
                        App.Booking.orphanedTravelers.length === 0) {
                        var room = new RoomModel();
                        App.Booking.rooms.add(room);
                        setDefaultTravelers = true;
                    }
                    //make sure orphaned travelers is set to display none
                    var $orphanedTravelers = $(outerScope.orphanedTravelersRegion.el);

                    //set the orphaned travelers and then show the list view if there any there
                    outerScope.setOrphanedTravelers();
                    if (App.Booking.orphanedTravelers.length > 0) {
                        $orphanedTravelers.show();
                        outerScope.orphanedTravelersRegion.show(new OrphanedTravelerListView({ collection: App.Booking.orphanedTravelers }));
                    } else {
                        $orphanedTravelers.hide();
                    }
                    //render the rooms
                    outerScope.roomsRegion.show(new RoomListView({ collection: App.Booking.rooms }));
                    if (setDefaultTravelers) {
                        EventAggregator.trigger('setDefaultTravelers');
                    }

                    var $roomsDropDown = outerScope.$el.find('#roomsDropDown');
                    if ($roomsDropDown[0].options.length < 4) {
                        for (var i = $roomsDropDown[0].options.length; i < 4; i++) {
                            PrettySelectUtil.addOption(i, $roomsDropDown);
                        }
                    }

                    //set the value of the rooms drop down
                    outerScope.updateRoomDropDownValue();

                    BookingService.getMaxNumberOfRooms(App.Booking.packageDateId)
                        .done(function (response) {
                            //make sure dropdown gives options according to total number of rooms available
                            var roomNum = JSON.parse(response.d);
                            var $roomsDropDown = outerScope.$el.find('#roomsDropDown');
                            var i = 0;
                            while (i < $roomsDropDown[0].options.length) {
                                if ($roomsDropDown[0].options[i].value > roomNum) {
                                    PrettySelectUtil.removeOption(i, $roomsDropDown);
                                } else {
                                    i++;
                                }
                            }
                        });
                   
                    //SmarterHQ Implementation
                    var date = new Date(booking.get('startDate'));
                    var tourNeoId = $('#tourNeoId').val();
                    var startDate = DateUtil.getMMDDYYYY(date);

                    //SmarterHq Pixel - push tp dataLAyer
                    if (SeoTaggingUtil.useExternalScripts()) {
                        dataLayer.push({
                            'productId': tourNeoId + '_' + startDate
                        });
                    } else {
                        console.log('SmarterHQ Pixel');
                        console.log('ProductID: ' + tourNeoId + '_' + startDate);
                    }

                    DataLayerUtil.PushTourDate();


                });

                //bind all of the events for the collections
                this.bindCollectionEvents();

                $(".removeRoomModal").dialog({
                    autoOpen: false,
                    modal: true, // do not delete
                    title: 'Remove a room',
                    draggable: false, // do not delete
                    resizable: false, // do not delete
                    dialogClass: 'fixed-dialog', // do not delete
                    width: 300, // specify appropriate width
                    height: 200 // specify appropriate height
                });
            },

            /**
             * Maps the additional fees and shows them on
             * the front end
             *
             * @method showAdditionalFees
             */
            showAdditionalFees: function () {
                var outerScope = this;
                this.additionalParkFees = 0;
                var parkFees = 0;
                this.additionalFeesText = this.$el.find('#additionalFees');
                if (this.tourAdditionalFees.length > 0) {
                    //set up event for tracking quantity of additional fees
                    EventAggregator.on('getRoomTypeComplete', function () {
                        outerScope.tourAdditionalFees.each(function (additionalFee) {
                            additionalFee.set({ quantity: App.Booking.travelers.length });
                        });
                    });

                    //make sure we add this to the tour additional fees
                    this.tourAdditionalFees.each(function (tourAdditionalFee) {
                        var serviceTypeDetail = tourAdditionalFee.get('serviceTypeDetail');

                        if (!ObjectUtil.isNullOrEmpty(serviceTypeDetail) && (serviceTypeDetail.neoId == '9')) {
                            parkFees += tourAdditionalFee.attributes.prices[0].contractPrice;
                        }
                        if (!ObjectUtil.isNullOrEmpty(serviceTypeDetail) && !(serviceTypeDetail.neoId == '299')) {
                            App.Booking.assignedPackageUpgrades.add(tourAdditionalFee);
                        }
                    });

                    this.additionalParkFees = parkFees;
                    this.additionalFeesRegion.show(new TourAdditionalFeesListView({ collection: this.tourAdditionalFees }));
                    $(this.additionalFeesRegion.el).parent().parent().show();
                    //hack for remove unnecessary div at table                
                    var html = $("#additionalFeesRegion div").html();
                    $("#additionalFeesRegion").html(html);
                }
            },
            /**
             * Checks to see if there are any unassigned travelers
             * if there are not any the region is closed.
             *
             * @method checkUnassignedTravelers
             */
            checkUnassignedTravelers: function () {
                if (App.Booking.orphanedTravelers.length === 0) {
                    var $orphanedTravelers = $(this.orphanedTravelersRegion.el);
                    this.orphanedTravelersRegion.close();
                    $orphanedTravelers.hide();
                }
            },
            /**
             * Fist checks to see if there are any orphaned travelers
             * then maps the orphaned travelers to a backbone collection
             *
             * @method setOrphanedTravelers
             */
            setOrphanedTravelers: function () {
                //get all of the orphaned travelers after get booking complete if there is any
                var travelerIds = App.Booking.travelers.pluck('id');
                var roomsTravelerIds = [];

                if ((travelerIds.length < 1)
                    || (_.every(travelerIds, function (id) { return ObjectUtil.isNullOrEmpty(id); }))) {
                    return;
                }

                App.Booking.rooms.each(function (room) {
                    var roomTravelerIds = room.get('travelerIds');
                    roomsTravelerIds = roomsTravelerIds.concat(roomTravelerIds);
                });

                var orphanedTravelersIds = travelerIds.diff(roomsTravelerIds);
                _.each(orphanedTravelersIds, function (id) {
                    var orphanedTraveler = App.Booking.travelers.find(function (traveler) {
                        return traveler.id === id;
                    });

                    App.Booking.orphanedTravelers.add(orphanedTraveler);
                });
            },
            /**
             * Updates the pretty select list with the new
             * value of rooms
             *
             * @method updateRoomDropDownValue
             */
            updateRoomDropDownValue: function () {
                var $roomsDropDown = this.$el.find('#roomsDropDown');
                PrettySelectUtil.setValue(App.Booking.rooms.length, $roomsDropDown);
            },
            /**
             * Toggles the number of rooms based on user input
             *
             * @method toggleRooms
             * @param e
             */
            toggleRooms: function (e) {
                var roomsNum = $(e.target).val();

                var numberToIncrement = roomsNum - App.Booking.rooms.length;
                //adding rooms
                if (numberToIncrement > 0) {
                    for (var i = 0; i < numberToIncrement; i++) {
                        var room = new RoomModel();
                        App.Booking.rooms.add(room);
                    }
                    if (document.querySelector('.messages')) {
                        document.querySelector('.messages').scrollIntoView({
                            behavior: 'smooth'
                        })
                    }
                }
                else {
                    //remove rooms
                    if (Number(e.currentTarget.value) !== App.Booking.rooms.length) {
                        document.querySelectorAll('.removeRoom')[e.currentTarget.value].click();
                       
                    }
                    if (document.querySelector('.messages')) {
                        document.querySelector('.messages').scrollIntoView({
                            behavior: 'smooth'
                        })
                        setTimeout(function () {
                            document.querySelector('.booking_engine_head').click();
                        }, 500);
                    }
                }
                //calls the modal 
                //this.removeRoomModal();

                //if additional fees are available lets hide and show them
                //based on whether or not the user has selected a number of rooms
                if (!ObjectUtil.isNullOrEmpty(this.additionalFeesText)) {
                    if (App.Booking.rooms.length > 0) {
                        this.additionalFeesText.show();
                    } else {
                        this.additionalFeesText.hide();
                    }
                }

                //the number of rooms needs to be updated across the other forms
                EventAggregator.trigger('numberOfRoomsUpdate');

            },
            removeRoom: function (e) {
                e.preventDefault();

                var $target = $(e.target);
                var orphanedTravelersCids = [];

                var roomModel = App.Booking.rooms.get($target.data('cid'));
                if (!_.isEmpty(roomModel)) {
                    //append the traveler cids to the orphaned travelers list
                    orphanedTravelersCids = orphanedTravelersCids.concat(roomModel.get('travelerCids'));
                    App.Booking.rooms.remove(roomModel);
                    this.$el.find('#roomsDropDown').val(App.Booking.rooms.length);
                }

               //remove all orphaned travelers on room removal
                if (App.Booking.rooms.length > 0) {
                    _.each(orphanedTravelersCids, function (cid) {
                        App.Booking.travelers.remove(cid);
                    });
                }

                //code to keep orphaned travlers - removed per Digital Marketing - DL
                 //if there are still rooms left lets keep the travelers
                //    App.Booking.travelers.each(function (traveler) {
                //        if ($.inArray(traveler.cid, orphanedTravelersCids) > -1) {
                //            App.Booking.orphanedTravelers.add(traveler);
                //        }
                //    });

                //    var $orphanedTravelers = $(this.orphanedTravelersRegion.el);
                //    if (App.Booking.orphanedTravelers.length > 0) {
                //        //make sure orphaned travelers is set to display none
                //        $orphanedTravelers.show();

                //        this.roomsRegion.show(new RoomListView({ collection: App.Booking.rooms }));
                //        this.orphanedTravelersRegion.show(new OrphanedTravelerListView({ collection: App.Booking.orphanedTravelers }));
                //    } else {
                //        $orphanedTravelers.hide();
                //    }

                //} else {
                    //delete all of the travelers
             

                    //this.orphanedTravelersRegion.close();
              

                //make sure we always calculate the step price
                this.calculateStepPrice();

                //the number of rooms needs to be updated across the other forms
                EventAggregator.trigger('numberOfRoomsUpdate');
            },
            removeRoomModal: function () {
                $(".removeRoomModal").dialog("open");

                $(".ui-widget-overlay").click(function () {
                    $(".removeRoomModal").dialog("close");
                });

                this.updateRoomDropDownValue();
            },
            traceRoomsModelsChanges: function () {
                if (App.Booking.rooms) {
                    return _.some(App.Booking.rooms.models, function (model) {
                        if (!$.isEmptyObject(model.changed)) {
                            return true;
                        }
                    }) || this.roomsNumberHasChanged;
                }
            },
            /**
             * Submits the Rooming and Travelers Step
             *
             * @method submitStep
             * @param e
             */
            submitStep: function (e) {
                e.preventDefault();
                var outerScope = this;
                //if new fields in step 2 are populated correctly
              
                console.log(App.Booking.travelers);
                if (TravelerUtil.ValidateSubmit()) {
                    if (this.validateStep()) {
                        //update dataLayer with newContacts from step 2
                        try {
                            
                            TravelerUtil.AddNewContacts('.aTraveler', 'input.firstTravelerName', 'input.lastTravelerName', 'input.emailTravelerName');
                        } catch (error) {
                            'new contact error', DataLayerUtil.ErrorMessages("datalayer error", JSON.stringify(error));

                        }

                        BookingService.roomingAndTravelerInfoForm_Complete()
                            .done(function (response) {
                                var booking = JSON.parse(response.d);

                                /*web-792 - CJ pixel code*/

                                //clear all the cookies assuming they are present.
                                document.cookie = "cjDiscountRate=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                                document.cookie = "cjVanityCode=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                                document.cookie = "cjTourPrice=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

                                var totalTourCartDetailItemsValue = 0;

                                if (!ObjectUtil.isNullOrEmpty(booking.cartDetailItems) && booking.cartDetailItems.length > 0) {

                                    _.each(booking.cartDetailItems, function (cartDetail) {
                                        if (cartDetail.serviceType.id == App.taxonomy.getId('serviceTypes', 'Package')) {
                                            totalTourCartDetailItemsValue += cartDetail.total;
                                        }
                                    });

                                    if (totalTourCartDetailItemsValue > 0) {
                                        var cjnow = new Date();
                                        var cjtime = cjnow.getTime();
                                        var cjexpTime = cjtime + 1000 * 3600;
                                        cjnow.setTime(cjexpTime);
                                        document.cookie = "cjTourPrice=" + totalTourCartDetailItemsValue + ";expires=" + cjnow.toGMTString() + ";path=/";
                                        console.log("cjTourPrice is added - " + document.cookie);
                                    }

                                }

                                //WEB-792 Write the applied offer discount to a cookie and get that as part of CJevent pixel.
                                // we require offer rate , and offer code (discount - vanity code if exists)
                                // Hot deals are not part of this.
                                // cookie will be set for 2 hours not more than that.
                                if (!ObjectUtil.isNullOrEmpty(App.Booking.discount)) {
                                    var discountRespone = App.Booking.discount;
                                    var cjnow = new Date();
                                    var cjtime = cjnow.getTime();
                                    var cjexpTime = cjtime + 1000 * 3600;
                                    cjnow.setTime(cjexpTime);

                                    var discountRate = 0;
                                    if (!ObjectUtil.isNullOrEmpty(discountRespone)) {

                                        if (discountRespone.percentOff > 0) {
                                            discountRate += Math.round(discountRespone.percentOff * totalTourCartDetailItemsValue);
                                        }
                                        else if (discountRespone.rate > 0) {
                                            discountRate += discountRespone.rate * App.Booking.travelers.length;
                                        }
                                    }

                                    if (!ObjectUtil.isNullOrEmpty(discountRate)) {
                                        document.cookie = "cjDiscountRate=" + discountRate + ";expires=" + cjnow.toGMTString() + ";path=/";
                                        console.log("cjDiscountRate is added - " + document.cookie);
                                    }
                                    if (!ObjectUtil.isNullOrEmpty(discountRespone.offerWebsiteType.vanityCodeRequired) && discountRespone.offerWebsiteType.vanityCodeRequired) {
                                        if (!ObjectUtil.isNullOrEmpty(discountRespone.vanityCodes) && !ObjectUtil.isNullOrEmpty(discountRespone.vanityCodes[0])) {
                                            document.cookie = "cjVanityCode=" + discountRespone.vanityCodes[0].vanityCode + ";expires=" + cjnow.toGMTString() + ";path=/";
                                            console.log("cjVanityCode is added - " + document.cookie);
                                        }
                                    }
                                }

                                /*web-792 - CJ pixel code*/





                                //lets apply the discount if there is one
                                outerScope.applyDiscount(App.Booking);

                                //suhbmit goal rooming and traveler info completed
                                //goalsUtil.bookingEngineAddTravelerInfo();
                                goalsUtil.bookingEngineAddRooming();

                                //check to make sure we are getting travelers back from the web service
                                if (!ObjectUtil.isNullOrEmpty(booking.travelers) && booking.travelers.length > 0) {
                                    //check if models changed, so we will know in future do we need reset customizations step or not
                                    outerScope.modelsChanged = outerScope.traceRoomsModelsChanges();
                                    if (outerScope.modelsChanged || outerScope.modelsChanged === undefined) {
                                        //reassign the rooms
                                        App.Booking.rooms.setRooms(booking.rooms);
                                        //set the new travelers
                                        var clientBaseData = $('#clientBaseData').val();
                                        if (!ObjectUtil.isNullOrEmpty(clientBaseData)) {
                                            outerScope.setClientBaseTravelerInfo(clientBaseData, booking.travelers);
                                        } else {
                                            App.Booking.travelers.setTravelers(booking.travelers);
                                        }

                                        //show the rooms region
                                        outerScope.roomsRegion.show(new RoomListView({ collection: App.Booking.rooms }));

                                        if (booking.passengerWasAutoInit) {
                                            App.Booking.passengerAutoInit = true;
                                        }
                                    } else {
                                        console.log('booking service came back with no travelers when there are travelers set');
                                    }

                                    BookingUtil.getAirDefaults();
                                    EventAggregator.trigger('roomingAndTravelersStepComplete');

                                    outerScope.removeFurtherSelections();
                                    //reset roomsChanged property, since we are going to the next step
                                    outerScope.roomsNumberHasChanged = false;

                                    BookingService.flightsForm_GetInTourFlights()
                                        .done(function (response) {
                                            var inTourFlights = JSON.parse(response.d);
                                            EventAggregator.trigger('getInTourFlightsComplete', inTourFlights);
                                        })
                                        .fail(function (response) {
                                            console.log(response.responseText);
                                            console.log('there was an issue getting in tour flights');
                                        });

                                    //make sure submisstion status is set to true
                                    outerScope.submitted = true;

                                    //calculate flight and upgrade steps because those prices should change now
                                    App.Booking.Steps['flightStep'].calculateStepPrice();
                                    App.Booking.Steps['upgradesStep'].calculateStepPrice();



                                    BookingUtil.goToNextStep(e);
                                    DataLayerUtil.PaymentDataLayer('Form Info Complete');
                                }
                            })
                            .fail(function (response) {
                                console.log('there was an issue creating the rooms');
                                console.log(response.responseText);
                                var submissionErrorText =
                                    App.dictionary.get('tourRelated.Booking.RoomingTravelerInfo.Validation.Submission Error');
                                var errorView = new ErrorView([submissionErrorText]);
                                outerScope.messagesRegion.show(errorView);
                            });
                    }
                }
            },
            removeFurtherSelections: function () {
                if (this.modelsChanged || this.modelsChanged === undefined) {
                    App.Booking.assignedPackageUpgrades = new PackageUpgradeCollection();
                    App.Booking.Steps['upgradesStep'].initViews();
                }
                App.Booking.Steps['flightStep'].initInTourTransfers();
                App.Booking.Steps['flightStep'].travelProtection.removeInsurance();
                App.Booking.Steps['summaryStep'].hidePrice();
            },
			/**
			* Applies the discount promo code
			*
			* @method applyDiscount
			* @param booking
			*/
            applyDiscount: function (booking) {
                var outerScope = this;

                //if it is aaa lets add the promo code only once
                var aaaDiscount = booking.aaaDiscount;
                var discount = booking.discount;
                /*var hotDeal = booking.hotDeal;
                var ebb = booking.earlyBookingBonus;
                var seasonal = booking.seasonalOffer;
                var percentageOffer = booking.percentageOffer;*/

                //if we have no cart id then don't apply promo code
                if (App.Booking.cartId == 0) {
                    return;
                }

                //apply a discount only if it is the aaa site
                if (App.isAAASite
                    && !ObjectUtil.isNullOrEmpty(aaaDiscount)
                    && !ObjectUtil.isNullOrEmpty(App.config.AAA_PROMO_CODE)) {

                    outerScope._tryToApplyOffer(aaaDiscount);
                }

                if (!ObjectUtil.isNullOrEmpty(discount)) {
                    outerScope._tryToApplyOffer(discount);
                }

                /*//if we have a hot deal then apply that one
                if (!ObjectUtil.isNullOrEmpty(hotDeal)) {
                    outerScope._tryToApplyOffer(hotDeal);
                }
                //if we have a seasonal offer and do not have a hot deal
                else if (!ObjectUtil.isNullOrEmpty(seasonal)) {
                    outerScope._tryToApplyOffer(seasonal);
                }
                //if we have a early booking bonus and do not have a hot deal/seasonal
                else if (!ObjectUtil.isNullOrEmpty(ebb)) { 
                    outerScope._tryToApplyOffer(ebb);
                }
                //if we have percent offer
                else if (!ObjectUtil.isNullOrEmpty(percentageOffer)){
                    outerScope._tryToApplyOffer(percentageOffer);
                }*/

                return;
            },
            _tryToApplyOffer: function (offer) {
                var outerScope = this;
                if (!ObjectUtil.isNullOrEmpty(offer.neoId)) {
                    outerScope._call_RoomingAndTravelers_ApplyOffer(offer);
                }
            },
            _call_RoomingAndTravelers_ApplyOffer: function (offer) {
                BookingService.roomingAndTravelers_ApplyOffer(offer.neoId)
                    .done(function (response) {
                        console.log('applying offer');
                        console.log(response);
                    })
                    .fail(function (response) {
                        console.log('issue applying early booking bonus');
                        console.log(response.responseText);
                    });
            },
            /**
             * Calculates the price for this specific step
             *
             * @method calculateStepPrice
             */
            calculateStepPrice: function (d) {
               
                var outerScope = this;
                if (!ObjectUtil.isNullOrEmpty(App.Booking.travelers)) {
                    var prices = App.Booking.travelers.pluck("price");
                    var fees = [];
                    var interAirPrices = 0;
                    var groundOperatorPrice = 0;
                    this.tourAdditionalFees.each(function (fee) {
                        if (outerScope.isInternalAir(fee)) {
                            interAirPrices = interAirPrices + (fee.get('price') * App.Booking.travelers.length);
                        } else if (outerScope.isGroundOperatorAir(fee)) {
                            // don't need to multiply travelers, as it stores the total value
                            groundOperatorPrice = parseInt(fee.get('price'));
                            interAirPrices = interAirPrices + groundOperatorPrice;
                        }
                        else {
                            fees.push(fee.get('price'));
                        }
                    });
                    var total = 0;
                    _.each(fees, function (fee) {
                        //if there are any additional fees for the tour they should be shown on the summary view as we cannot make the SUM of cartdetailitems there. 
                        //So we are handling them through having seperate global variable.
                        total += parseFloat(fee);
                        prices.push(fee);
                    });

                    if (total > 0) {
                        App.Booking.tourAdditionalFeesPrice = total;
                    }

                    total = 0;
                    _.each(prices, function (price) {

                        total += parseFloat(price);
                    });
                    this.stepLandOnlyPrice = total;

                    var smarterPrice = 0;
                    var smarterTotalPrice = 0;

                    for (var i = 0; i < App.Booking.travelers.length; i++) {
                        smarterPrice = prices[0];
                        smarterTotalPrice += prices[i];
                    }

                    if (smarterTotalPrice != 0 && SeoTaggingUtil.useExternalScripts()) {
                        window._adftrack = window._adftrack || [];
                        if (window._adftrack[0] != undefined && window._adftrack[0].order != undefined && window._adftrack[0].order.svn1 != undefined) {
                            window._adftrack[0].order.svn1 = smarterPrice + (!ObjectUtil.isNullOrEmpty(this.additionalParkFees) ? this.additionalParkFees : 0);
                        }
                    }

                    if (SeoTaggingUtil.useExternalScripts()) {
                        dataLayer.push({
                            'price': smarterPrice,
                            'total': smarterTotalPrice,
                            'qty': App.Booking.travelers.length
                        });
                    }
                    else {
                        console.log('SmarterHQ - Price');
                        console.log('Base Price: ' + smarterPrice);
                        console.log('Total Price: ' + smarterTotalPrice);
                        console.log('Quantity: ' + App.Booking.travelers.length);

                    }

                    //if (App.siteSettings.includeInterAirPrice) {
                    //	_.each(interAirPrices,
                    //		function(price) {
                    //			prices.push(price);
                    prices.push(interAirPrices);
                    total += parseFloat(interAirPrices);
                    //});
                    //}
                    this.stepPrice = total;

                    //if we have price set for flights let's use the combined price
                    if (App.Booking.Steps['flightStep'].stepPrice > 0) {
                        console.log("Rooming showing combined price:");
                        App.Booking.Steps['flightStep'].calculateStepPrice();

                    } else {
                        console.log("Rooming showing default price:" + this.stepPrice);

                        var totalPassengers = App.Booking.travelers.length;

                        BookingUtil.adjustStepPrice(this.getStepDiv(), prices);
                        BookingUtil.adjustGrandTotal();
                    }

                }
            },

         

            // 2 combinations - Internal Air or Ground Operator Air
            isInternalAir: function (model) {
                var serviceTypeDetail = model.get('serviceTypeDetail');
                var serviceType = model.get('serviceType');
                // to check for internal flights OR ST-9 and STF-299 
                if (serviceType.id == App.taxonomy.getId('serviceTypes', 'Air') &&
                    serviceTypeDetail.id == App.taxonomy.getId('serviceTypeDetails', 'Internal')) {
                    return true;
                }
                return false;
            },

            isGroundOperatorAir: function (model) {
                var serviceTypeDetail = model.get('serviceTypeDetail');
                var serviceType = model.get('serviceType');
                //ground operator flights - ST-5 and STD-157 
                if (serviceType.id == App.taxonomy.getId('serviceTypes', 'Miscellaneous') &&
                    serviceTypeDetail.id == App.taxonomy.getId('serviceTypeDetails', 'Interflights')) {
                    return true;
                }
                return false;
            },

            setClientBaseTravelerInfo: function (clientBaseData, travelers) {
                console.log("SETTING CLIENT BASE INFO");
                var outerScope = this;
                var prices = App.Booking.travelers.pluck('price');
                App.Booking.travelers = new TravelerCollection();
                var adultPassengerType = App.taxonomy.getTaxonomyItem('passengerTypes', 'Adult');

                var defaultPaxList = JSON.parse(clientBaseData);
                //if there are any travelers removed from booking, we need to remove it from paxList
                var paxList = _.filter(defaultPaxList, function (paxObject) {
                    return _.findWhere(travelers, { firstName: paxObject.FirstName });
                });

                //if there are any travelers manually added by user on this step
                var counter = paxList.length;
                _.each(travelers, function (traveler) {
                    if (!_.findWhere(defaultPaxList, { FirstName: traveler.firstName })) {
                        var newTraveler = new TravelerModel({
                            firstName: traveler.firstName,
                            lastName: traveler.lastName,
                            passengerType: adultPassengerType
                        });
                        newTraveler.set({ price: prices[counter] });
                        newTraveler.set({ id: traveler.id });

                        App.Booking.travelers.add(newTraveler);
                        console.log(JSON.stringify(newTraveler));
                        counter++;
                    }
                });

                for (var pax = 0; pax < paxList.length; pax++) {
                    var paxObject = paxList[pax];
                    var travelerProcessed = false;
                    var currentTravelerNumber = 0;

                    while (!travelerProcessed && currentTravelerNumber < travelers.length) {
                        var currentTraveler = travelers[currentTravelerNumber];

                        if (!_.findWhere(App.Booking.travelers.models, { id: currentTraveler.id })) {
                            if (paxObject.FirstName == currentTraveler.firstName) {
                                outerScope._addTraveler(currentTraveler, paxObject, prices[pax], adultPassengerType);
                                //now we added traveler and need to stop current loop
                                travelerProcessed = true;
                            }
                        }
                        currentTravelerNumber++;
                    }
                }
            },
            _addTraveler: function (currentTraveler, paxObject, price, passengerType) {
                var outerScope = this;

                var dateOfBirth = outerScope._getDate(paxObject.DOB);
                var traveler = new TravelerModel({
                    firstName: paxObject.FirstName,
                    middleInitial: paxObject.MiddleName,
                    lastName: paxObject.LastName,

                    passengerType: passengerType,

                    day: dateOfBirth.getUTCDate(),
                    month: dateOfBirth.getUTCMonth(),
                    year: dateOfBirth.getFullYear(),
                    dateOfBirth: dateOfBirth,

                    price: price,

                    contactInfo: new ContactInfoModel({
                        phone: paxObject.PhoneNumber,
                        address1: paxObject.PaxAddress.AddressLine1,
                        address2: paxObject.PaxAddress.AddressLine2,
                        city: paxObject.PaxAddress.City,
                        zipCode: paxObject.PaxAddress.Zip,
                        email: paxObject.Email,
                        confirmEmail: paxObject.Email
                    }),

                    additionalInfo: new AdditionalInfoModel({
                        passportInfo: new PassportInfoModel({
                            expirationDate: outerScope._getDate(paxObject.PassportInformation.ExpirationDate),
                            issueDate: outerScope._getDate(paxObject.PassportInformation.IssueDate),
                            countryOfCitizenship: paxObject.PassportInformation.Citizenship
                        })
                    })
                });


       

                //set gender
                var gender = outerScope._getGender(paxObject.Gender);
                traveler.set({ gender: gender });

                //set salutation 
                var salutation = outerScope._getTravelerSalutation(paxObject.Title);
                if (salutation) {
                    traveler.set({ salutation: salutation });
                }

                traveler.set({ id: currentTraveler.id });
                App.Booking.travelers.add(traveler);
           
            },
            _getGender: function (paxGenger) {
                var genderMale = App.taxonomy.getTaxonomyItem('genders', 'M');
                var genderFemale = App.taxonomy.getTaxonomyItem('genders', 'F');
                if (paxGenger === "M") {
                    return genderMale;
                } else {
                    return genderFemale;
                }
            },
            _getDate: function (dateString) {
                var day = dateString.substring(2, 4);
                var month = dateString.substring(0, 2);
                var year = dateString.substring(4);

                return new Date(Date.UTC(year, month, day));
            },
            _getTravelerSalutation: function (paxTitle) {
                var title = paxTitle.split(/[ .]+/).join('').toUpperCase();
                var salutations = App.taxonomy.getTaxonomyTypeList('salutations');

                var salutation = _.find(salutations, function (sal) {
                    var name = sal.name.split(/[ .]+/).join('').toUpperCase();
                    return name === title;
                });
                return salutation;
            }
        });
       
        return RoomsStepLayout;
    });