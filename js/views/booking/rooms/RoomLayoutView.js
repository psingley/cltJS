define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'event.aggregator',
    'services/bookingService',
    'models/booking/rooms/RoomModel',
    'text!templates/booking/rooms/roomTemplate.html',
    'app',
    'models/booking/travelerInformation/TravelerModel',
    'views/booking/rooms/TravelerSmallRoomListView',
    'collections/booking/travelerInformation/TravelerCollection',
    'collections/booking/rooms/RoomCollection',
    'views/booking/travelerInformation/TravelerListView',
    'util/timeoutUtil',
    'views/validation/ErrorView',
    'views/validation/ErrorViewWithButton',
    'views/validation/SuccessView',
    'views/validation/WarningView',
    'util/objectUtil',
    'util/PrettySelectUtil',
    'util/travelerUtil'
], function ($, _, Backbone, Marionette, EventAggregator, BookingService, RoomModel, roomTemplate,
    App, TravelerModel, TravelerSmallRoomListView, TravelerCollection, RoomCollection, TravelerListView,
    TimeoutUtil, ErrorView, ErrorViewWithButton, SuccessView, WarningView, ObjectUtil, PrettySelectUtil, TravelerUtil) {
    var RoomLayoutView = Backbone.Marionette.Layout.extend({
        model: RoomModel,
        regions: {
            travelersSmallRegion: '.travelersListContent',
            messagesRegion: '.messages'
        },
        events: {
            'change .adultsDropDown': 'addTravelers',
            'change .childrenDropDown': 'addTravelers'
        },
        assignedTravelersEvents: {
            'add': 'assignedTravelerAdded',
            'remove': 'assignedTravelerRemoved'
        },
        template: Backbone.Marionette.TemplateCache.get(roomTemplate),
        selectors: function () {
            var outerScope = this;
            return {
                adultsDropDown: outerScope.$el.find(".adultsDropDown"),
                childrenDropDown: outerScope.$el.find(".childrenDropDown")
            }
        },
        initialize: function () {
            var outerScope = this;
            App.Booking.roomsForCheck = new RoomCollection();
            App.Booking.roomsConfirmed = new RoomCollection();

            //create instance timeout utils
            this.addedTravelerTimeoutUtil = new TimeoutUtil();
            this.removedTravelerTimeoutUtil = new TimeoutUtil();

            var travelerIds = this.model.get('travelerIds');
            var travelerCids = this.model.get('travelerCids');

            //get the lists of assigned travelers
            this.assignedTravelers = new TravelerCollection();
            this.assignedAdults = new TravelerCollection();
            this.assignedChildren = new TravelerCollection();

            //bind the collections events to this view
            Marionette.bindEntityEvents(this, this.assignedTravelers, this.assignedTravelersEvents);

            //if there are traveler ids get a list of traveler models
            if (travelerIds.length > 0 || travelerCids.length > 0) {
                var travelers = App.Booking.travelers.filter(function (traveler) {
                    return $.inArray(traveler.id, travelerIds) > -1 || $.inArray(traveler.cid, travelerCids) > -1;
                });

                _.each(travelers, function (traveler) {
                    outerScope.assignedTravelers.add(traveler);
                });
            }

            EventAggregator.on('roomTravelerAssigned:' + this.options.roomIndex, function (traveler) {
                outerScope.assignedTravelers.add(traveler);
                outerScope.setAssignedAdultsAndChildren();
                outerScope.setOrderingForTravelerNames();
                //check if room type is valid
                outerScope.getRoomType(outerScope.assignedAdults.length, outerScope.assignedChildren.length);

                PrettySelectUtil.setValue(outerScope.assignedAdults.length, outerScope.selectors().adultsDropDown);
                PrettySelectUtil.setValue(outerScope.assignedChildren.length, outerScope.selectors().childrenDropDown);
            });

            EventAggregator.on('noTravelersAssignedNotificationTriggered', function (room) {
                var outerScope = this;
                if (outerScope.model === room) {
                    outerScope.messagesRegion.reset();
                }
            });

            //wait for the get room type call to complete and then add the passenger
            EventAggregator.on('getRoomTypeComplete:' + this.options.roomIndex, function (roomType) {

                if (!ObjectUtil.isNullOrEmpty(roomType)) {

                    var adultPrice = roomType.adultPrice.landPrice;
                    var childPrice = roomType.childPrice.landPrice;

                    if (!ObjectUtil.isNullOrEmpty(App.Booking.discount) && App.Booking.discount.rate > 0) {
                        if (App.Booking.discount.doublePercentRate > 0) {
                            adultPrice = Math.round(adultPrice - (adultPrice * App.Booking.discount.percentOff));
                            childPrice = Math.round(childPrice - (childPrice * App.Booking.discount.percentOff));
                        } else {
                            adultPrice -= App.Booking.discount.rate;
                            childPrice -= App.Booking.discount.rate;
                        }
                    }

                    //always want to apply hot deal before anything else
                    /*if (!ObjectUtil.isNullOrEmpty(App.Booking.hotDeal))
                    {
                        adultPrice -= App.Booking.hotDeal.rate;
                        childPrice -= App.Booking.hotDeal.rate;
                    }
                    else if (!ObjectUtil.isNullOrEmpty(App.Booking.earlyBookingBonus))
                    {
                        adultPrice -= App.Booking.earlyBookingBonus.rate;
                        childPrice -= App.Booking.earlyBookingBonus.rate;
                    }
                    else if (!ObjectUtil.isNullOrEmpty(App.Booking.seasonalOffer))
                    {
                        adultPrice -= App.Booking.seasonalOffer.rate;
                        childPrice -= App.Booking.seasonalOffer.rate;
                    }
                    else if (!ObjectUtil.isNullOrEmpty(App.Booking.percentageOffer)) {
                        adultPrice = Math.round(adultPrice - (adultPrice * App.Booking.percentageOffer.percentOff));
                        childPrice = Math.round(childPrice - (childPrice * App.Booking.percentageOffer.percentOff));
                    }*/

                    if (!ObjectUtil.isNullOrEmpty(App.Booking.aaaDiscount) && App.isAAASite) {
                        var $discount = $('#savings');
                        //if we have a discount show it

                        if ($discount.length > 0) {
                            var totalSavings = App.Booking.aaaDiscount.rate * App.Booking.travelers.length;
                            $discount.text(totalSavings.toString().formatPrice());
                        }

                        adultPrice -= App.Booking.aaaDiscount.rate;
                        childPrice -= App.Booking.aaaDiscount.rate;
                    }

                    //adjust all adult prices
                    _.each(outerScope.assignedAdults, function (adult) {
                        adult.set({ price: adultPrice, interAirPrice: roomType.adultPrice.interAirPrice, cid: adult.cid });
                    });

                    //adjust all child prices
                    _.each(outerScope.assignedChildren, function (child) {
                        child.set({ price: childPrice, interAirPrice: roomType.childPrice.interAirPrice, cid: child.cid });
                    });
                }

                App.Booking.Steps['travelerStep'].renderTravellerList();
                App.Booking.Steps['summaryStep'].paymentForm.setTravelersDropDown();

                //populate step 2 if applicable
                TravelerUtil.FillPartialContact();
                //set required attribute and remove asterisks where needed
                TravelerUtil.SetRequired();

            });

            EventAggregator.on('setDefaultTravelers', function () {
                outerScope.selectors().adultsDropDown.val(2);
                outerScope.addTravelers(false);
            });
        },
        onShow: function () {
            //get the list of assigned travelers and render them
            this.travelersSmallRegion.show(new TravelerSmallRoomListView({ collection: this.assignedTravelers }));

            if (this.assignedTravelers.length == 0) {
                var addTravelersText = App.dictionary.get('tourRelated.Booking.RoomingTravelerInfo.Validation.AddTravelers');
                this.messagesRegion.show(new WarningView([addTravelersText]));
            }

            this.setPrettySelectLists();
        },
        templateHelpers: function () {
            var outerScope = this;
            var childText = (App.Booking.isFamilyTour == true) ? App.dictionary.get('tourRelated.Booking.RoomingTravelerInfo.ChildAgeFamily') : App.dictionary.get('tourRelated.Booking.RoomingTravelerInfo.ChildAge');
            return {
                roomText: App.dictionary.get('tourRelated.Booking.RoomingTravelerInfo.Room'),
                adultText: App.dictionary.get('tourRelated.Booking.RoomingTravelerInfo.AdultAge'),
                childText: childText,
                roomTypeText: App.dictionary.get('tourRelated.Booking.RoomingTravelerInfo.RoomType'),
                cid: this.model.cid,
                roomIndex: this.options.roomIndex,
                getAdultsList: function () {
                    //this will be returned to the view as a list of options
                    var html = "";
                    var adultsBookingList = App.dictionary.get('adultsList');

                    $.each(adultsBookingList, function (number) {
                        var selected = ((number == outerScope.assignedAdults.length) ? " selected='selected'" : "");
                        html += "<option" + selected + ">" + number + "</option>";
                    });

                    return html;
                },
                getChildrenList: function () {
                    //this will be returned to the view as a list of options
                    var html = "";
                    var childList = App.dictionary.get('childrenList');

                    //match the number in the child list with the number of children passengers passed back from the service
                    $.each(childList, function (number) {
                        var selected = ((number === outerScope.assignedChildren.length) ? " selected='selected'" : "");
                        html += "<option" + selected + ">" + number + "</option>";
                    });
                    return html;
                }
            }
        },
        setPrettySelectLists: function () {
            var $dropDownLists = this.$el.find('select');
            $dropDownLists.prettySelect();
        },
        assignedTravelerAdded: function (traveler) {
            var outerScope = this;
            //set the name to default to Guest # if a name isn't already set
            var travelerName = traveler.get('firstName');
            if (ObjectUtil.isNullOrEmpty(travelerName)) {
                var index = App.Booking.travelers.length + 1;
                var firstName = 'Guest ' + index;
                traveler.set({ firstName: firstName });
            }

            if (App.Booking.travelers.get(traveler) != null && App.Booking.roomsForCheck.get(outerScope.model) == null) {
                App.Booking.roomsForCheck.add(outerScope.model);
            }
            else {
                //add the traveler
                App.Booking.travelers.add(traveler);
            }

            //to make sure they have ASC default names
            outerScope.setOrderingForTravelerNames();

            //ensure firstnames from form are saved 
            _.each(_.filter(App.Booking.travelers.models, function (e) {
                if (e.get('firstName')) {
                    return e;
                }
            }), function (e, i) {
                if (JSON.parse(localStorage.getItem("newContacts"))) {
                    let f = JSON.parse(localStorage.getItem("newContacts"));
                    if (f[i]) {
                        let newFirstname = f[i].Firstname;
                        e.set({ firstName: newFirstname });
                        let newLastname = f[i].Lastname;
                        e.set({ lastName: newLastname });
                    }
                }
            });

            //set up the delayed operation
            this.addedTravelerTimeoutUtil.suspendOperation(300,
                function () {
                    outerScope.setAssignedAdultsAndChildren();
                    outerScope.getRoomType(outerScope.assignedAdults.length, outerScope.assignedChildren.length);
                });

        },
        assignedTravelerRemoved: function (traveler) {
            var outerScope = this;

            //make sure the traveler gets removed
            App.Booking.travelers.remove(traveler.cid);
            //to set remaining traveler's default names in ASC order without gaps
            outerScope.setOrderingForTravelerNames();

            //set up delayed operation
            this.removedTravelerTimeoutUtil.suspendOperation(300,
                function () {
                    //update the assigned adults and children collections
                    outerScope.setAssignedAdultsAndChildren();
                    outerScope.getRoomType(outerScope.assignedAdults.length, outerScope.assignedChildren.length);
                });
        },
        setOrderingForTravelerNames: function () {
            //for all travelers with default names
            _.each(_.filter(App.Booking.travelers.models, function (e) {
                if (e.get('firstName').search(/(Guest\s\d+)/) > -1) {
                    return e;
                }
            }), function (e, i) {
                e.set('firstName', 'Guest ' + (i + 1));
            });
        },
        setAssignedAdultsAndChildren: function () {
            //get the adult travelers assigned to this room
            this.assignedAdults = this.assignedTravelers.filter(function (traveler) {
                return traveler.get("passengerType").id == App.taxonomy.getId('passengerTypes', 'Adult');
            });

            //get the children assigned to this room
            this.assignedChildren = this.assignedTravelers.filter(function (traveler) {
                return traveler.get("passengerType").id == App.taxonomy.getId('passengerTypes', 'Child');
            });

            //reset traveler ids for the model and then get the new ones
            this.model.set({ travelerIds: [] });
            var travelerIds = _.pluck(this.assignedAdults, 'id');
            travelerIds = travelerIds.concat(_.pluck(this.assignedChildren, 'id'));
            //remove all null values
            travelerIds.remove(null);
            this.model.set({ travelerIds: travelerIds });

            //reset traveler cids and get new ones
            this.model.set({ travelerCids: [] });
            var travelerCids = _.pluck(this.assignedAdults, 'cid');
            travelerCids = travelerCids.concat(_.pluck(this.assignedChildren, 'cid'));
            this.model.set({ travelerCids: travelerCids });

            //check to see if all travelers were assigned to a passenger type.
            if (this.assignedTravelers.length != (this.assignedAdults.length + this.assignedChildren.length)) {
                console.log('There were travelers returned without a passenger type');
                return;
            }

            //set the value of the drop down lists
            this.selectors().adultsDropDown.val(this.assignedAdults.length);
            this.selectors().childrenDropDown.val(this.assignedChildren.length);
        },
        addTravelers: function (isModalAvailable) {
            var outerScope = this;

            //get the number of travelers
            var adultsNum = this.selectors().adultsDropDown.val();
            var childrenNum = this.selectors().childrenDropDown.val();


            var numberOfTravelersToCreate = adultsNum - outerScope.assignedAdults.length;
            //if number of assignedAdults is less than the number is the drop down list
            if (outerScope.assignedAdults.length < adultsNum) {
                while (numberOfTravelersToCreate > 0) {
                    //add a new traveler with an id of null (this is already set in the defaults)
                    var adultPassengerType = App.taxonomy.getTaxonomyItem('passengerTypes', 'Adult');
                    var travelerModel = new TravelerModel({ passengerType: adultPassengerType });

                    outerScope.assignedTravelers.add(travelerModel);
                    numberOfTravelersToCreate--;
                }
            } else if (isModalAvailable) {
                //outerScope.removeTravelersModal();
                outerScope.removeTravelers(isModalAvailable);
            }

            numberOfTravelersToCreate = childrenNum - outerScope.assignedChildren.length;
            //if number of children is less than the number is the drop down list
            if (outerScope.assignedChildren.length < childrenNum) {
                while (numberOfTravelersToCreate > 0) {
                    //add a new traveler with an id of null (this is already set in the defaults)
                    var childPassengerType = App.taxonomy.getTaxonomyItem('passengerTypes', 'Child');
                    outerScope.assignedTravelers.add(new TravelerModel({ passengerType: childPassengerType }));
                    numberOfTravelersToCreate--;
                }
            } else if (isModalAvailable) {
                //outerScope.removeTravelersModal();
            }

            $('.searchAirMessagesRegion').hide();
        },
        _getNoGuestConfigText: function () {
            var noGuestConfigText = App.dictionary.get('tourRelated.Booking.RoomingTravelerInfo.NoGuestConfig');

            var companyInfo = $("body").data("company");
            if (companyInfo) {
                if (companyInfo.callCenterPhoneNumber) {
                    return noGuestConfigText.replace("#phone#", '<a href=\'tel:' + companyInfo.callCenterPhoneNumber + '\'>' + companyInfo.callCenterPhoneNumber + '</a>');
                }
            }
            return noGuestConfigText;
        },
        getRoomTypeFailed: function (response, numOfAdults, numOfChildren) {
            console.log('there was an issue getting the room type for ' + numOfAdults + ' adults and ' + numOfChildren + ' children');

            if (!ObjectUtil.isNullOrEmpty(response) && !ObjectUtil.isNullOrEmpty(response.responseText)) {
                console.log(response.responseText);
            }

            //set this models guest config attribute
            this.model.set("guestConfig", null);

            //set the guest config in the view
            var $roomGuestConfigSelector = this.$el.find('.roomGuestConfig');
            $roomGuestConfigSelector.data('id', '');
            $roomGuestConfigSelector.text('');

            var noGuestConfigText = this._getNoGuestConfigText();

            var errors = [noGuestConfigText];

            if (!ObjectUtil.isNullOrEmpty(this.messagesRegion)) {
                this.messagesRegion.show(new ErrorViewWithButton(errors));
            }
            $('html, body').animate({ scrollTop: $('#numberOfRoomsRegion').offset().top }, 'fast');
        },
        getRoomType: function (numOfAdults, numOfChildren) {
            var outerScope = this;

            var setChildAndAdultDropDowns = function () {
                PrettySelectUtil.setValue(outerScope.assignedAdults.length, outerScope.selectors().adultsDropDown);
                PrettySelectUtil.setValue(outerScope.assignedChildren.length, outerScope.selectors().childrenDropDown);
            };

            //make sure we have at least one adult or one child before trying to get a room type
            if (numOfAdults != 0 || numOfChildren != 0) {

                App.Booking.roomsConfirmed.remove(outerScope.model);
                //get the room type
                BookingService.getRoomType(numOfAdults, numOfChildren, App.Booking.packageDateId)
                    .done(function (response) {
                        //parse the JSON into a javascript object
                        var roomType = JSON.parse(response.d);

                        if (roomType != null) {
                            //set this models guest config attribute
                            outerScope.model.set("guestConfig", roomType.guestConfig);

                            //set the guest config in the view
                            var $roomGuestConfigSelector = outerScope.$el.find('.roomGuestConfig');
                            $roomGuestConfigSelector.data('id', roomType.guestConfig.id);
                            $roomGuestConfigSelector.text(roomType.guestConfig.name);

                            App.Booking.roomsConfirmed.add(outerScope.model);
                            EventAggregator.trigger('getRoomTypeComplete:' + outerScope.options.roomIndex, roomType);

                            //if we are calling getRoomType from the context of RoomLayoutView
                            if (!outerScope.isClosed) {
                                var successMessageText = App.dictionary.get('tourRelated.Booking.RoomingTravelerInfo.Validation.SuccessGetRoom');
                                var messages = [successMessageText];
                                outerScope.messagesRegion.show(new SuccessView(messages));
                            }

                            App.Booking.Steps['roomsStep'].calculateStepPrice();
                        } else {
                            outerScope.getRoomTypeFailed(response, numOfAdults, numOfChildren);
                        }
                    })
                    .fail(function (response) {
                        outerScope.getRoomTypeFailed(response, numOfAdults, numOfChildren);
                    })
                    .complete(function () {
                        EventAggregator.trigger('getRoomTypeComplete:' + outerScope.options.roomIndex);
                        EventAggregator.trigger('getRoomTypeComplete');
                        EventAggregator.trigger('showAdditionalFeesRegion');
                        setChildAndAdultDropDowns();
                    });
            } else {
                //room type should be set to nothing
                this.model.set("guestConfig", null);

                //set the guest config in the view
                var $roomGuestConfigSelector = this.$el.find('.roomGuestConfig');
                $roomGuestConfigSelector.data('id', '');
                $roomGuestConfigSelector.text('');

                setChildAndAdultDropDowns();
                EventAggregator.trigger('getRoomTypeComplete:' + outerScope.options.roomIndex);
                EventAggregator.trigger('getRoomTypeComplete');
                EventAggregator.trigger('showAdditionalFeesRegion');
                this.messagesRegion.show(new ErrorView([App.dictionary.get('tourRelated.Booking.RoomingTravelerInfo.NoTravelersAssigned')]));
            }
        },
        removeTravelersModal: function () {
            $(".removeTravelersModal").dialog({
                modal: true, // do not delete
                title: App.Booking.sections.roomingAndTravelers.modalTitle,
                draggable: false, // do not delete
                resizable: false, // do not delete
                dialogClass: 'fixed-dialog', // do not delete
                width: 300, // specify appropriate width
                height: 200 // specify appropriate height
            });

            $(".ui-widget-overlay").click(function () {
                $(".removeTravelersModal").dialog("close");
            });

            this.selectors().adultsDropDown.val(this.assignedAdults.length);
            this.selectors().childrenDropDown.val(this.assignedChildren.length);
        },
        removeTravelers: function (e) {
            if (JSON.stringify(e) !== undefined) {
                let number = e.target.value;
                let selector = e.handleObj.selector.replace('"', '');
                if (document.querySelectorAll('.Adult').length === Number(number) || document.querySelectorAll('.Adult').length === Number(number)) {
                    console.log("Added traveler");
                }
                else {
                    switch (selector) {
                        case '.adultsDropDown':
                            if (document.querySelectorAll('.Adult').length > 0) {
                                if (e.target.value !== document.querySelectorAll('.Adult').length) {
                                    console.log(document.querySelectorAll('.Adult'));
                                    document.querySelectorAll('.Adult')[number].parentElement.querySelector('.delete').click();
                                }
                            }
                            break;
                        case '.childrenDropDown':
                            console.log(e.target.value + " : " + document.querySelectorAll('.Child').length);
                         
                            if (document.querySelectorAll('.Child').length > 0) {
                                if (e.target.value !== document.querySelectorAll('.Child').length) {
                                    document.querySelectorAll('.Child')[number].parentElement.querySelector('.delete').click();
                                }
                            }
                            break;
                        default:
                            console.log(selector);
                            break;
                    }
                }
            }
        }
    });

    return RoomLayoutView;
});