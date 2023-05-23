/**
 * @class BookingModule
 */
define([
		"app",
		"routers/bookingRouter",
		"controllers/bookingController",
		'collections/booking/travelerInformation/TravelerCollection',
		'collections/booking/rooms/RoomCollection',
		'collections/booking/tourCustomizations/BookingPackageUpgradeCollection',
        'collections/booking/tourCustomizations/CartDetailItemCollection',
		'event.aggregator',
		'services/bookingService',
		'util/taxonomy/taxonomyUtil',
		'util/locationsUtil',
		'util/uriUtil',
		'util/objectUtil',
		'collections/booking/flights/ScheduleCollection',
		'cookie',
		'models/booking/rooms/RoomModel',
		'models/booking/travelerInformation/TravelerModel',
		'models/booking/travelerInformation/ContactInfoModel'
	],
	function(App,
		BookingRouter,
		BookingController,
		TravelerCollection,
		RoomCollection,
		PackageUpgradeCollection,
        CartDetailItemCollection,
		EventAggregator,
		BookingService,
		TaxonomyUtil,
		LocationsUtil,
		UriUtil,
		ObjectUtil,
		ScheduleCollection,
		cookie,
		RoomModel,
		TravelerModel,
		ContactInfoModel) {
		App.module("Booking",
			function() {
				var outerScope = this;
				this.startWithParent = false;

				/**
				* The currentItemId for the booking page
				*
				* @type {*|jQuery}
				*/
				var currentItemId = $('body').data('current-item-id');

				/**
				* Checks if agent
				*
				* @method getCookies
				*/
				var isAgent = function() {
					if ($('body').data('isagent') === undefined) {
						return false;
					} else {
						return ($('body').data('isagent').toLowerCase() === "true");
					}
				};


				/**
				* Sets the cookies for booking engine
				*
				* @method setCookies
				*/
				var setCookies = function() {
					//if the session has been closed lets set the chatSessionCookie cookie to null
					if (ObjectUtil.isNullOrEmpty(App.Booking.packageDateId) ||
						App.Booking.cartId === 0 ||
						ObjectUtil.isNullOrEmpty(currentItemId)) {
                    // As per js-Cookie we are using, to remove cookie it is important to pass the Domain and Path attributes. 
                    // Read more at https://github.com/js-cookie/js-cookie
						cookie.remove(App.Booking.bookingCookieName);
					} else {
						//make it expire in 15 minutes
						var expDate = new Date();
						expDate.setMinutes(expDate.getMinutes() + 15);

						var data = {
							packageDateId: App.Booking.packageDateId,
							cartId: App.Booking.cartId,
							currentItemId: currentItemId,
							passengerAutoInit: (!ObjectUtil.isNullOrEmpty(App.Booking.passengerAutoInit) && App.Booking.passengerAutoInit),
							isAgent: isAgent()
						};

						var domain = window.location.host;
						cookie.set(App.Booking.bookingCookieName, JSON.stringify(data), { domain: domain, expires: expDate });
					}
				};

				/**
				* Gets the booking related cookies if they exist
				*
				* @method getCookies
				*/
				var getCookies = function () {

					var bookingSessionCookie = cookie.get(App.Booking.bookingCookieName);
					var bookingSession = bookingSessionCookie ? $.parseJSON(bookingSessionCookie) : undefined;
				
					//console.log(bookingSessionCookie);
					if (ObjectUtil.isNullOrEmpty(bookingSession)) {
						$('html, body').animate({ scrollTop: 0 }, 'fast');
						return;
					}

					if (bookingSession.currentItemId === currentItemId && bookingSession.isAgent === isAgent()) {
						console.log('Current Item Id matches');
						App.Booking.cookie = bookingSession;
						App.Booking.passengerAutoInit = bookingSession.passengerAutoInit;
					}
				};

				/**
				* Checks to see if there is a cart id set in the cookie
				* if not returns 0
				*
				* @method getCartId
				* @returns {*}
				*/
				var getCartId = function() {
					if (!ObjectUtil.isNullOrEmpty(App.Booking.cookie)) {
						return App.Booking.cookie.cartId;
					}

					return 0;
				};

				

				/**
				* Checks to see if we are on the booking
				* login page
				*
				* @method isLoginPage
				* @returns {boolean}
				*/
				var isLoginPage = function() {
					var isLoginPage = UriUtil.getParameterByName('b');
					if (ObjectUtil.isNullOrEmpty(isLoginPage)) {
						return true;
					}
					return false;
				};

				//here we add travellers to booking from clientbase
				var setClientBaseData = function (clientBaseData) {
					var paxList = JSON.parse(clientBaseData);
					if (ObjectUtil.isNullOrEmpty(paxList)) {
						return;
					}
					var adultPassengerType = App.taxonomy.getTaxonomyItem('passengerTypes', 'Adult');

					for (var pax = 0; pax < paxList.length; pax++) {
						var paxObject = paxList[pax];
						var traveler = new TravelerModel({
							firstName: paxObject.FirstName,
							lastName: paxObject.LastName,
							passengerType: adultPassengerType
						});

						App.Booking.travelers.add(traveler);
					}

					var rooms = 1;
					var numberOfTravelers = App.Booking.travelers.length;
					if (numberOfTravelers > 2) {
						//Default all travelers to Adult and every 2 adults given  a double room
						if (numberOfTravelers % 2 == 0) {
							rooms = numberOfTravelers / 2;
						} else {
							rooms = parseInt((numberOfTravelers / 2) + 1);
						}
					}

					var travelerCid = 0;
					for (var number = 0; number < rooms; number++) {
						var paxRoom = new RoomModel();
						var cids = [];
						for (var i = 0; i < 2; i++) {
							var id = travelerCid++;
							if (!ObjectUtil.isNullOrEmpty(App.Booking.travelers.models[id])) {
								cids.push(App.Booking.travelers.models[id].cid);
							}
						}
						paxRoom.set({ travelerCids: cids });
						App.Booking.rooms.add(paxRoom);
					}
				};

				this.addInitializer(function() {
                    App.Booking.bookingCookieName = 'bookingSession' + $('body').data('current-item-id');
					App.Booking.intervalMembershipID = 'referralid'

                    if (!ObjectUtil.isNullOrEmpty(UriUtil.getParameterByName("packagedate"))) {
                        App.Booking.bookingCookieName = App.Booking.bookingCookieName + UriUtil.getParameterByName("packagedate");
                    }
					getCookies();
					//set up all global variables for this app
					//we need the number of itinerary days for rendering components
					App.Booking.numberOfItineraryDays = 0;
					//we need total number of itinerary days (includes offset days too)
					App.Booking.totalNumberOfItineraryDays = 0;
					//is true if the tour product line is a family tour
					App.Booking.isFamilyTour = false;
					//is true if the tour is AAA Vacations exclusive
					App.Booking.isAAAVacationsTour = false;
					//need to keep track of all of the travelers here
					App.Booking.travelers = new TravelerCollection();
					//all of the travelers not assigned to a room
					App.Booking.orphanedTravelers = new Backbone.Collection();
					//selected package upgrades
					App.Booking.assignedPackageUpgrades = new PackageUpgradeCollection();
					//need to keep track of the rooms
					App.Booking.rooms = new RoomCollection();
					//need to keep track of all of the flights
					App.Booking.flightSchedules = new ScheduleCollection();
					//cart detail items
					App.Booking.cartDetailItems = new CartDetailItemCollection();
					//used to determine if we should default the schedule
					App.Booking.scheduleDefault = false;
					//show or hide flight schedule
					App.Booking.hideFlightSchedule = false;
					//place to store the deposit amount
					App.Booking.depositAmount = 0;
					//check to see if we have a cart id
                    App.Booking.cartId = getCartId();

                    App.Booking.ExtensionFees = [];

					App.Booking.tourDateOffset = 0;
					App.Booking.tourDateReturnOffset = 0;
					App.Booking.hasDifferentStartAndDepartureDate = false;
					App.Booking.hasDifferentEndAndArrivalDate = false;
					if (isLoginPage()) {
						App.module('Security').start();
					}

					var clientBaseData = $('#clientBaseData').val();
					if (!ObjectUtil.isNullOrEmpty(clientBaseData)) {
						setClientBaseData(clientBaseData);
					}

					//we can set up multiple dependencies here, when will wait for all fetches to finish.
					$.when(BookingService.getSectionsContent(),
							App.locations.getLocations(),
							App.dictionary.getDictionaries(),
							App.taxonomy.getTaxonomyTypes())
						.done(function(sections) {
							App.Booking.sections = JSON.parse(sections[0].d);

							outerScope.appRouter = new BookingRouter({
								controller: new BookingController()
							});

							//google tag manager logging for completing step 5 and moving onto summary step
							$('.nextStep6').click(function() {
								try {
									var numTravelers = $('#travelerInformationContent section').length;
									var price = Number($('#grandTotal').text().replace(/[^0-9\.]+/g, ""));
									dataLayer.push({
										'event': 'gaEvent',
										'eventCategory': 'Traveler Information',
										'eventAction': 'Booking',
										'eventLabel': 'Continue booking with flights - ' + numTravelers,
										'eventValue': price
									});
								} catch (ex) {
									console.log(ex);
								}
							});
							//start the app
							App.start();
						});
				});

				this.addFinalizer(function() {
					setCookies();
				});
			});
	});