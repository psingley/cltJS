define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'util/dateUtil',
    'util/objectUtil',
    'util/uriUtil',
    'services/bookingErrorService'

], function ($, _, Backbone, Marionette, App, DateUtil, ObjectUtil, UrilUtil, BookingErrorService) {
    var dataLayerUtil = {
        EventTag: function () {
            let t = 'dataLayerPush';
            return t;
        },
        IsAgent: function () {
            var d = document.querySelector('body').getAttribute('data-isagent');
            if (d === null || d === 'undefined') {
                d = false;
            }
            return d;
            

        },
        //if startdate is before June 1 - Product Year is previous year
        GetProductYear: function (startdate) {
            let month = startdate.getMonth() + 1;
            let year = startdate.getFullYear();
            let productyear;
            if (month < 6) {
                productyear = startdate.getFullYear() - 1;
            } else {
                productyear = year;
            }
            return productyear;
        },
        FormatDate: function (date) {
            let thedate = new Date(date);
            let formatted_date = thedate.getMonth() + 1 + "-" + thedate.getDate() + "-" + thedate.getFullYear();
            return formatted_date;
        },
        //format dates and create Package Date with start and end dates
        ReformatTourDate: function (startdate, enddate) {
            let dates = [];
            let startdatetime = new Date(startdate);
            let formatted_startdate = startdatetime.getMonth() + 1 + "-" + startdatetime.getDate() + "-" + startdatetime.getFullYear();
            dates.push(formatted_startdate);
            let enddatetime = new Date(enddate);
            let formatted_enddate = enddatetime.getMonth() + 1 + "-" + enddatetime.getDate() + "-" + enddatetime.getFullYear();
            dates.push(formatted_enddate);
            let formatted_packagedate = formatted_startdate + " - " + formatted_enddate;
            dates.push(formatted_packagedate);

            return dates;
        },
        GetStepNameNumber: function (m) {
            var message = !ObjectUtil.isNullOrEmpty(m) ? m = " - " + m : m = "";
            var lastStep = document.querySelectorAll('.stepNav:not(#bookingNavTitle)').length;
            var currentStep = document.getElementById('step_navigation').querySelector(".selected").getAttribute('data-step');
            var currentStepNumber = "Step " + currentStep + " of " + lastStep;
            var currentStepName = document.getElementById('step_navigation').querySelector(".selected a span").nextSibling.textContent.trim() + m;
            var currentStepObj = { "currentStepName": currentStepName, "currentStepNumber": currentStepNumber };
            return currentStepObj;
        },
        TourDetailPageData: function (al, pst) {
            var newTourDetails = document.getElementById('newTourDetails');
            window.dataLayer = window.dataLayer || [];
            var py_startdate = new Date(newTourDetails.getAttribute('data-startdate'));
            var productyear = this.GetProductYear(py_startdate);
            var tourstyle = document.querySelector(".tour-style a strong").textContent;
            var savings = document.querySelector('.the-offer');
            var toursavings = !ObjectUtil.isNullOrEmpty(savings) ? savings.textContent : "Not Applicable";
            let tourprice = ObjectUtil.isNullOrEmpty(document.querySelector(".the-price")) ? "" : document.querySelector(".the-price").textContent.replace(/,/g, "").replace(/\$/g, '');
            if (tourprice !== "") {
                tourprice = Number(tourprice).toFixed(2);
            }

            let dates = [];
            dates = this.ReformatTourDate(newTourDetails.getAttribute('data-startdate'), newTourDetails.getAttribute('data-enddate'));

            dataLayer.push({
                'ProductId': newTourDetails.getAttribute('data-tourseriesid'),
                'ProductName': newTourDetails.getAttribute('data-tourtitle'),
                'ProductYear': productyear,
                'TourSubtitle': pst,
                'PackageId': newTourDetails.getAttribute('data-packageid'),
                'PackageDate': dates[2],
                'PackageDates': {
                    "startdate": dates[0],
                    "enddate": dates[1]
                },
                'PackageDateId': newTourDetails.getAttribute('data-packagedateid'),
                'TourStyle': tourstyle,
                'ActivityLevel': al,
                'TotalDays': newTourDetails.getAttribute('data-totaldays'),
                'TourPrice': tourprice,
                'TourSavings': toursavings,
                'Action': newTourDetails.getAttribute('data-action'),
                'IsAgent': this.IsAgent(),
                'event': this.EventTag()
            });

            localStorage.activityLevel = al;
            localStorage.tourStyle = tourstyle;
        },
        //fires on landing on step 1 Tour Date of the booking process
        //fires on Continue to Step 2 or Selecting a radio button associated with -
        //a date which takes the user to step 2 Rooming & Travelers
        PushTourDate: function (m) {
            if (document.querySelector('input[name="date"]:checked')) {

                let selectedDatex = document.querySelector('input[name="date"]:checked').parentNode.nextElementSibling.querySelector('.date').textContent;
                let selectedDtSplit = selectedDatex.split(' - ');
                var dates = this.ReformatTourDate(selectedDtSplit[0], selectedDtSplit[1]);
                var newTourDetails = document.getElementById('newTourDetails');
                var selectedDate = $('.bookingTourDates').find('input[name=date]:checked');
                var startdate = new Date(DateUtil.getMomentDateType(selectedDate[0].getAttribute('startdate')));
                var productyear = this.GetProductYear(startdate);
                let al = localStorage.getItem('activityLevel') ? localStorage.getItem('activityLevel') : newTourDetails.getAttribute('data-activity-level');
                let style = localStorage.getItem('tourStyle') ? localStorage.getItem('tourStyle') : newTourDetails.getAttribute('data-styles');
                if (localStorage.getItem('activityLevel') === null) { localStorage.activityLevel = al; }
                if (localStorage.getItem('tourStyle') === null) { localStorage.tourStyle = style; }

                window.dataLayer = window.dataLayer || [];
                dataLayer.push({
                    'ProductId': $('#tourNeoId').val(),
                    'ProductName': newTourDetails.getAttribute('data-tourtitle'),
                    'ProductYear': productyear,
                    'TourStyle': style,
                    'ActivityLevel': al,
                    'TotalDays': App.Booking.totalNumberOfItineraryDays,
                    'PackageId': selectedDate.data('package-neoid'),
                    'PackageDateId': newTourDetails.getAttribute('data-packagedateid'),
                    'PackageDate': dates[2],
                    'PackageDates': {
                        "startdate": dates[0],
                        "enddate": dates[1]
                    },
                    'CartId': App.Booking.cartId,
                    'Quantity': App.Booking.travelers.length,
                    'CurrentStep': this.GetStepNameNumber(m),
                    'IsAgent': this.IsAgent(),
                    'event': this.EventTag()
                });
            }
        },
        //fires on landing on Step 3, Step 4, Step 5, and Step 6 or removing insurance on tour items on Step 6 -
        //any time financial or registration data updates
        PaymentDataLayer: function (m) {
            let rt = document.querySelector('li.stepNav[data-step="2"] a span.currency');
            let tc = document.querySelector('li.stepNav[data-step="3"] a span.currency');
            let fp = document.querySelector('li.stepNav[data-step="4"] a span.transferProtection');

            let selector1 = rt ? rt.textContent.replace(/,/g, "").replace(/\$/g, '') : "";
            let selector2 = tc ? tc.textContent.replace(/,/g, "").replace(/\$/g, ''): "";
            let selector3 = fp ? fp.textContent.replace(/,/g, "").replace(/\$/g, '') : "";

            var unitPrice = {
                "Rooming_Travelers": selector1,
                "Tour_Customizations": selector2,
                "Flight_Protection": selector3
            };

            unitPrice = JSON.stringify(unitPrice);
            localStorage.unitPrice = unitPrice;


            var Registrants = [];
            let nContacts =  localStorage.getItem('newContacts');
            App.Booking.travelers.each(function (traveler, index) {
                {
                    var contactinfo = traveler.get('contactInfo');
                    var state = contactinfo.get('state');
                    state = !ObjectUtil.isNullOrEmpty(state) ? state.code : "";
                    var country = contactinfo.get('country');
                    country = !ObjectUtil.isNullOrEmpty(country) ? country.isoCode3 : "";
                    Registrants.push({
                        email: contactinfo.get('email') === '' ? JSON.parse(nContacts)[index].Email: contactinfo.get('email'),
                        firstName: traveler.get('firstName') === 'Guest ' + (index + 1) && JSON.parse(nContacts)[index].Firstname !== ''
                            ? JSON.parse(nContacts)[index].Firstname : traveler.get('firstName'),
                        lastName: traveler.get('lastName') === '' ?  JSON.parse(nContacts)[index].Lastname :traveler.get('lastName'),
                        city: contactinfo.get('city'),
                        state: state,
                        country: country,
                        postalCode: contactinfo.get('zipCode')
                    });
                }
            });

            var Travelers = JSON.stringify(Registrants);
            Travelers = JSON.parse(Travelers);

            var startdate = new Date(document.getElementById('startDate').textContent);
            var productyear = this.GetProductYear(startdate);
            let selectedDatex = document.querySelector('input[name="date"]:checked').parentNode.nextElementSibling.querySelector('.date').textContent;
            let selectedDtSplit = selectedDatex.split(' - ');

            let beforeTourHotel = !ObjectUtil.isNullOrEmpty(localStorage.getItem('beforeTourHotel')) ? JSON.parse(localStorage.getItem('beforeTourHotel')) : "";
            let beforeTourTransfer = !ObjectUtil.isNullOrEmpty(localStorage.getItem('beforeTourTransfer')) ? localStorage.getItem('beforeTourTransfer') : "";
            let afterTourHotel = !ObjectUtil.isNullOrEmpty(localStorage.getItem('afterTourHotel')) ? JSON.parse(localStorage.getItem('afterTourHotel')) : "";
            let afterTourTransfer = !ObjectUtil.isNullOrEmpty(localStorage.getItem('afterTourTransfer')) ? localStorage.getItem('afterTourTransfer') : "";

            var dates = this.ReformatTourDate(selectedDtSplit[0], selectedDtSplit[1]);
            var selectedDate = $('.bookingTourDates').find('input[name=date]:checked');
            let totalprice = ObjectUtil.isNullOrEmpty(document.getElementById("grandTotal")) ? "0" : document.getElementById("grandTotal").textContent.replace(/\$/g, '').replace(/,/g, "");
            let flight_info = this.SaveAirlineInfo();
            let transfers;
            transfers = 'none';
            let thetransfers = [];

            let packageUpgrade = document.getElementById('inTourTransfersList');
            if (packageUpgrade) {
                let cbox = document.querySelectorAll('.inTourTransfer .tourOptionDescription');
                try {
                    cbox.forEach(function (c) {
                        if (c.previousElementSibling.querySelector('.packageUpgrade_checkbox').checked) {
                            thetransfers.push({ 'inTourTransferInfo': c.innerText });
                        }
                    });
                } catch (error) {
                    console.error(error);
                }
            }

            let inTourTransfer = thetransfers.length === 0 ? "" : thetransfers;
            let loyaltyNumber = document.querySelector('input[name="loyaltyNumber"]') ? document.querySelector('input[name="loyaltyNumber"]').value : "";

            let depositDate, depositAmount, depositDue;

            let depoDate = document.getElementById('depositDate');
            let depoAmount = document.getElementById('depositAmount');
            let depoDue = document.getElementById('finalPaymentDue');

            depositDate = !ObjectUtil.isNullOrEmpty(depoDate) ? this.FormatDate(depoDate.textContent) : "";
            depositAmount = !ObjectUtil.isNullOrEmpty(depoAmount) ? depoAmount.textContent.replace(/\$/g, '').replace(/,/g, "") : "";
            depositDue = !ObjectUtil.isNullOrEmpty(depoDue) ? this.FormatDate(depoDue.textContent) : "";

            localStorage.depositAmount = depositAmount;
            localStorage.depositDate = depositDate;
            localStorage.depositDue = depositDue


            localStorage.depositAmount = depositAmount;
            localStorage.depositDate = depositDate;
            localStorage.depositDue = depositDue;

            localStorage.travelers = JSON.stringify(Travelers);

            dataLayer.push({

                'ProductId': $('#tourNeoId').val(),
                'ProductName': newTourDetails.getAttribute('data-tourtitle'),
                'ProductYear': productyear,
                'TourStyle': localStorage.getItem('tourStyle'),
                'ActivityLevel': localStorage.getItem('activityLevel'),
                'TotalDays': App.Booking.totalNumberOfItineraryDays,
                'PackageId': selectedDate.data('package-neoid'),
                'PackageDates': {
                    "startdate": dates[0], "enddate": dates[1]
                },
                'PackageDate': dates[2],
                'Rooms': App.Booking.rooms.length,
                'Quantity': App.Booking.travelers.length,
                'UnitPrice': JSON.parse(unitPrice),
                'TotalPrice': totalprice,
                'CartId': App.Booking.cartId,
                'Registrants': Travelers,
                'LoyaltyNumber': loyaltyNumber,
                'CurrentStep': this.GetStepNameNumber(m),
                'BeforeTourHotel': {
                    'hotelInfo': beforeTourHotel,
                    'transferInfo': beforeTourTransfer
                },
                'AfterTourHotel': {
                    'hotelInfo': afterTourHotel,
                    'transferInfo': afterTourTransfer
                },
                'InTourTransfers': inTourTransfer,
                'FlightInfo': flight_info,
                'DepositInfo': {
                    'depositDate': depositDate,
                    'depositAmount': depositAmount,
                    'depositDue': depositDue
                },
                'IsAgent': this.IsAgent(),
                'event': this.EventTag()
            });
        },
        CreateFilteredSearchLayer: function () {
            if (document.getElementById('total-active-results') !== null) {
                try { //total-active-results

                    let searchstring = location.hash.slice(location.hash.indexOf('#q/') + 3).split('&').length;
                    if (searchstring > 1) {
                        let count = document.getElementById('total-active-results').innerText.replace(' results', '');
                        if (count.length > 3) {
                            count = 0;
                        }
                        let str = UrilUtil.getUrlVars();
                        // additions for hpr-425
                        let popular = "";
                        let sortBy = "";
                        let where = "";
                        let when = "";
                        let pricerange = "";
                        let tourlength_description = "";
                        let start = "";
                        let end = "";
                        Object.keys(str).forEach(key => {
                            switch (str[key]) {
                                case 'New Tour':
                                case 'Special Offer':
                                case 'Explorations':
                                    popular += str[key] + " | ";
                                    break;
                            }
                            if (key === "sortBy") { sortBy = str[key]; }
                            if (key === 'countrynames' || key === 'continentnames' || key === 'cities') { where = str[key] }
                            if (key === "tourlength_description") { tourlength_description = str[key]; }
                            if (key === "start") { start = str[key]; }
                            if (key === "end") { end = str[key]; }
                        });


                        window.dataLayer = window.dataLayer || [];
                        window.dataLayer.push({
                            'Filters': str,
                            'ResultCount': Number(count),
                            'searchSortBy': sortBy,
                            'searchPopular': popular,
                            'searchWhere': where,
                            'searchTourLength': tourlength_description,
                            'searchPriceRange': pricerange,
                            'searchWhen': start + " - " + end,
                            'IsAgent': this.IsAgent(),
                            'event': this.EventTag()
                        });
                    }
                }
                catch (error) {
                    console.error(error);
                }
            }
        },
        PredictiveSearchLayer: function (term, action) {
            localStorage.SearchTerm = term;
            localStorage.Action = action;
        },
        PredictiveSearchLayerPush: function (count) {
            let results;
            if (ObjectUtil.isNullOrEmpty(count)) {
                results = "1";
            }
            else {
                results = count;
            }
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                'SearchTerm': localStorage.SearchTerm,
                'headerSearchBarContent': localStorage.SearchTerm,
                'SearchTrigger': localStorage.Action,
                'ResultCount': results,
                'IsAgent': this.IsAgent(),
                'event': this.EventTag()
            });
            localStorage.removeItem("SearchTerm");
            localStorage.removeItem("Action");

        },

        TourCustomizations: function (a, b, c, d) {
            let splitA = [];
            if (a !== undefined) {
                splitA = a.split(' : ');
                if (splitA[0] === 'Hotel' && c === true) {
                    if (d === "beforeTour") {
                        let beforeTourHotel = { 'name': splitA[1], 'nights': b };
                        localStorage.beforeTourHotel = JSON.stringify(beforeTourHotel);
                    }
                    if (d === "afterTour") {
                        let afterTourHotel = { 'name': splitA[1], 'nights': b };
                        localStorage.afterTourHotel = JSON.stringify(afterTourHotel);
                    }
                }

                if (splitA[0] === 'Hotel' && c === false) {
                    if (d === "beforeTour") {
                        localStorage.removeItem("beforeTourHotel");
                        if (localStorage.beforeTourTransfer) { localStorage.removeItem("beforeTourTransfer"); }
                    }
                    if (d === "afterTour") {
                        localStorage.removeItem("afterTourHotel");
                        if (localStorage.afterTourTransfer) { localStorage.removeItem("afterTourTransfer"); }
                    }

                }

                if (splitA[0] === 'Transfer' && c === true) {
                    if (d === "afterTour") {
                        localStorage.afterTourTransfer = splitA[1];
                    }
                    if (d === "beforeTour") {
                        localStorage.beforeTourTransfer = splitA[1];
                    }
                }
                if (splitA[0] === 'Transfer' && c === false) {
                    if (d === "beforeTour") {
                        localStorage.removeItem("beforeTourTransfer");
                    }
                    if (d === "afterTour") {
                        localStorage.removeItem("afterTourTransfer");
                    }
                }
                if (splitA[0] === 'Nights' && (localStorage.beforeTourHotel || localStorage.afterTourHotel)) {
                    if (d === "beforeTour") {
                        let h = JSON.parse(localStorage.beforeTourHotel);
                        if (h['nights'] !== b) {
                            let beforeTourHotel = { 'name': h['name'], 'nights': b };
                            localStorage.beforeTourHotel = JSON.stringify(beforeTourHotel);
                        }
                    }
                    if (d === "afterTour") {
                        let h = localStorage.afterTourHotel;
                        if (h['nights'] !== b) {
                            let afterTourHotel = { 'name': h['name'], 'nights': b };
                            localStorage.afterTourHotel = JSON.stringify(afterTourHotel);
                        }
                    }

                }

            }
        },
        SaveAirlineInfo: function () {
            let dCity = document.querySelector('.flight .active span.airportCode');
            let dDate = !ObjectUtil.isNullOrEmpty(document.querySelector('.flight .active .dateText')) ? document.querySelector('.flight .active .dateText').textContent.replace('Leave ', "") : "";
            let departureCity = !ObjectUtil.isNullOrEmpty(dCity) ? dCity.title : "";
            let departureDate = !ObjectUtil.isNullOrEmpty(dDate) ? this.FormatDate(dDate) : "";
            let dAirline = document.querySelector('.flight .active .airline');
            let departureAirline = !ObjectUtil.isNullOrEmpty(dAirline) ? dAirline.textContent.substring(0, dAirline.textContent.indexOf("Flight")) : "";
            let departureFlightNumber = !ObjectUtil.isNullOrEmpty(dAirline) ? dAirline.textContent.split('#  ').pop() : "";

            let rCity = !ObjectUtil.isNullOrEmpty(document.querySelector('.flight .active hr')) ? document.querySelector('.flight .active hr').nextElementSibling.nextElementSibling.querySelector('.airportCode') : "";
            let rDate = !ObjectUtil.isNullOrEmpty(document.querySelector('.flight .active hr')) ? document.querySelector('.flight .active hr').nextElementSibling.nextElementSibling.querySelector('.dateText').textContent.replace('Leave ', "") : "";
            let returnCity = !ObjectUtil.isNullOrEmpty(rCity) ? rCity.title : "";
            let returnDate = !ObjectUtil.isNullOrEmpty(rDate) ? this.FormatDate(rDate) : "";
            let rAirline = !ObjectUtil.isNullOrEmpty(document.querySelector('.flight .active hr')) ? document.querySelector('.flight .active hr').nextElementSibling.nextElementSibling.querySelector('.airline') : "";
            let returnAirline = !ObjectUtil.isNullOrEmpty(rAirline) ? rAirline.textContent.substring(0, rAirline.textContent.indexOf("Flight")) : "";
            let returnFlightNumber = !ObjectUtil.isNullOrEmpty(rAirline) ? rAirline.textContent.split('#  ').pop() : "";

            let airSearch = localStorage.getItem('airsearch');
            let airResponsable = document.getElementById("airSearch") ? document.querySelectorAll('input[name="air"]')[1].checked : document.querySelectorAll('input[name="air"]')[0].checked
            let airContactMe = document.getElementById("airSearch") ? document.querySelectorAll('input[name="air"]')[2].checked : document.querySelectorAll('input[name="air"]')[1].checked;
            let protection = !ObjectUtil.isNullOrEmpty(document.querySelectorAll('input[name="protection"]')[0]);
            let travelProtection;
            if (protection) { travelProtection = document.querySelectorAll('input[name="protection"]')[0].checked ? true : false; }

            let airlineInfo = {
                departureCity: departureCity,
                departureDate: departureDate,
                departureAirline: departureAirline,
                departureFlightNumber: departureFlightNumber,
                returnCity: returnCity,
                returnDate: returnDate,
                returnAirline: returnAirline,
                returnFlightNumber: returnFlightNumber,
                airSearch: airSearch,
                airResponsable: airResponsable,
                airContactMe: airContactMe,
                travetravelProtection: travelProtection

            };
            airlineinfo = JSON.stringify(airlineInfo);
            return airlineInfo;
        },

        SearchForFlights: function (cabinname) {
            let departureCity, cabin, passengerCount, nonStop, airline, departureDate, returnDate;
            departureCity = document.getElementById('departure_city') ? document.getElementById('departure_city').value : "";
            cabin = cabinname;
            passengerCount = document.getElementById('flightTravelerCount') ? document.getElementById('flightTravelerCount').value : 0;
            airline = !ObjectUtil.isNullOrEmpty(document.getElementById('airlines').value) ? document.getElementById('airlines').value : 'All Airlines';
            nonStop = document.getElementById('nonstop_checkbox') ? document.getElementById('nonstop_checkbox').checked : null;
            departureDate = document.querySelector('input.depart') ? document.querySelector('input.depart').value.replace("/", "-").replace("/", "-") : "";
            returnDate = document.querySelector('input.return') ? document.querySelector('input.return').value.replace("/", "-").replace("/", "-") : "";

            let flightSearch = {
                departureCity: departureCity,
                cabin: cabin,
                passengerCount: passengerCount,
                nonStop: nonStop,
                airline: airline,
                departureDate: departureDate,
                returnDate: returnDate
            };

            flightSearch = JSON.stringify(flightSearch);
            window.dataLayer = window.dataLayer || [];
            dataLayer.push({
                'FlightSearch': JSON.parse(flightSearch),
                'IsAgent': this.IsAgent(),
                'event': this.EventTag()
            });

        },
        SpecialOffers: function () {
            let referral_method, offerCode, benefitCode;
            referral_method = document.querySelector(".new_select.x_large .selected").dataset.value;
            offerCode = document.getElementById('txtPromotionCode').textContent;
            benefitCode = document.getElementById('txtMemberBenefitCode').textContent;
            window.dataLayer = window.dataLayer || [];
            dataLayer.push({
                'Referral_Method': referral_method,
                'OfferCode': offerCode,
                'BenefitCode': benefitCode,
                'IsAgent': this.IsAgent(),
                'event': this.EventTag()
            });

        },
        GetBrochureData: function (el, type, href) {
            let brochureObj = {
                'name': el.textContent,
                'type': type,
                'href': href
            }
            localStorage.brochure = JSON.stringify(brochureObj);
        },
        HubSpotFormPush: function (form) {
            let formData = {};
            formData["Type"] = "Hubspot";
            formData["Id"] = form.id;
            formData["Location"] = window.location.href;

            //Create Form Name
            let mform = form.parentElement.parentElement.parentElement;
            let modalform = mform.classList.contains('modal-content');

            let contactform = form.parentElement.parentElement.classList.contains('hubspot-form');
            let datasetform = form.parentElement.dataset.name;
            let needinfoform = form.parentElement.id === 'hbspt-form-more-info';

            if (datasetform) { formData['Name'] = datasetform; }
            else if (contactform) { formData['Name'] = form.parentElement.parentElement.dataset.name; }
            else if (modalform) { formData['Name'] = mform.parentElement.parentElement.id; }
            else if (needinfoform) { formData['Name'] = 'Need More Information'; }
            else { formData['Name'] = 'No Form Name'; }

            if (document.getElementById('pkg_title') && needinfoform) {
                formData['Tour Name'] = document.getElementById('pkg_title').textContent;
            }

            if (localStorage.getItem('brochure')) {
                formData['Brochure Data'] = JSON.parse(localStorage.getItem('brochure'));
            }
            localStorage.removeItem('brochure');

            Array.from(form.elements).forEach((input) => {
                switch (input.type) {
                    case 'text':
                        input.name === "confirm_email" ? "" : formData[input.name] = input.value;
                        break;
                    case 'email':
                    case 'tel':
                        formData[input.name] = input.value;
                        break;
                    case 'checkbox':
                        if (input.checked) {
                            formData[input.name.replace(/_/g, " ")] = input.value;
                        }
                        break;
                    case 'radio':
                        formData[input.name] = input.value;
                        break;
                    default:
                        break;
                }
            });
            window.dataLayer = window.dataLayer || [];
            dataLayer.push({
                'event': 'dataLayerPush',
                'IsAgent': this.IsAgent(),
                'Form Data': formData
            });
            sessionStorage.dataLayerPush = JSON.stringify(formData);
        },

        SitecoreFormPush: function (formData) {
            window.dataLayer = window.dataLayer || [];
            dataLayer.push({
                'event': 'dataLayerPush',
                'IsAgent': this.IsAgent(),
                'Form Data': formData
            });
            sessionStorage.dataLayerPush = JSON.stringify(formData);

        },
        LoginForm: function (username,message) {
            window.dataLayer = window.dataLayer || [];
            dataLayer.push({
                'event': 'dataLayerPush',
                'action': 'Site-Login',
                'userName': username,
                'message': message
            });

        },

        ErrorMessages: function (errortype, errormessage) {
            window.dataLayer = window.dataLayer || [];
            let aRay = new Array({ "message": "error message was null" });
            let em = errormessage ? JSON.parse(JSON.stringify(errormessage)) : aRay;
           
            if (errortype === "Client-side validation") {
                em.forEach(function (element) {
                    delete element.className;
                });
            }
            try {
                em.forEach(function (element) {
                    let x = element.message;
                    if (x === undefined) x = element;
                    BookingErrorService.logClientMessages(errortype, JSON.stringify(x), document.querySelector('.stepNav.selected .number').textContent);
                });
            
            }
            catch (e) { console.log(JSON.stringify(e));}

            dataLayer.push({
                'ErrorType': errortype,
                'ErrorMessage': em,
                'IsAgent': this.IsAgent(),
                'event': this.EventTag()
            });


        }
    };
    return dataLayerUtil;
});