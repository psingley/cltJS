define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'moment'
], function ($, _, Backbone, Marionette, App, moment) {
    var TwoTypesAvailableOffersLayout = Backbone.Marionette.Layout.extend({
        el: '#two_available_offers_section_container',
        ui: {
            hotDealsSection: "#hotDealsSection",
            specialOffersSection: "#specialOffersSection"
        },
        showDivider: false,
        daysThreshold: 14,
        showContent: false,
        initialize: function() {
            if (this.$el.data('ispageeditor') == 'True') {
                $(this.ui.hotDealsSection).show();
                $(this.ui.specialOffersSection).show();
                $('.offer-divider').show();
                this.showComponent();
            } else {
                if (this.collection != null && this.collection.length > 0) {
                    this.showSpecialOffer(this.collection);
                    this.showHotDeal(this.collection);
                    if (this.showDivider) {
                        $('.offer-divider').show();
                    }
                }
                this.hideOfferDetailsButtonIfNeeded();
            }
            this.showComponent();
        },
        showHotDeal: function (collection) {
            var offerType = this.$el.attr('data-hotDealType');
            if (offerType) {
                var hotDeals = collection.filterCurrentByOfferType(offerType);

                if (hotDeals.length > 0) {
                    this.replaceHotDealsTokens(hotDeals.first());
                    $(this.ui.hotDealsSection).show();
                    this.showContent = true;
                } else {
                    this.showDivider = false;
                }
            }
        },
        showSpecialOffer: function (collection) {
            var seasonalOfferType = this.$el.attr('data-seasonalType');
            var ebbOfferType = this.$el.attr('data-earlyBookingType');

            var seasonalOffers;
            var ebbOffers;

            if (seasonalOfferType) {
                seasonalOffers = collection.filterCurrentByOfferType(seasonalOfferType);
            }

            if (ebbOfferType) {
                ebbOffers = collection.filterCurrentByOfferType(ebbOfferType);
            }

            var biggestOffer = this.getBiggestSpecialOffer(ebbOffers, seasonalOffers);
            if (biggestOffer) {
                this.replaceSpecialTokens(biggestOffer);
                this.setDaysLeftText(biggestOffer);

                $(this.ui.specialOffersSection).show();
                this.showContent = true;
                this.showDivider = true;
            }
        },
        replaceSpecialTokens: function(offer) {
            var vanityCode = offer.vanityCode();
            if (vanityCode) {
                vanityCode = "\"" + vanityCode + "\" ";
            }

            var saveUpElement = $('.sp-save-up');
            var saveUpTemplate = saveUpElement.html();

            saveUpTemplate = saveUpTemplate.replace('$currency', App.siteSettings.currencySymbol);
            saveUpTemplate = saveUpTemplate.replace('$amount', offer.get('offerRate').toLocaleString());
            saveUpTemplate = saveUpTemplate.replace('$offerenddate', this.getExpireDate(offer));

            saveUpElement.html(saveUpTemplate);

            var useVanityElement = $('.vanity-code-text');
            if(useVanityElement){
                var useVanityTemplate = useVanityElement.html();
                useVanityTemplate = useVanityTemplate.replace('$offercode', vanityCode);
                useVanityElement.html(useVanityTemplate);
            }
        },
        replaceHotDealsTokens: function(offer) {
            var saveUpElement = $('.hd-save-up');
            var saveUpTemplate = saveUpElement.html();

            saveUpTemplate = saveUpTemplate.replace('$currency', App.siteSettings.currencySymbol);
            saveUpTemplate = saveUpTemplate.replace('$amount', offer.get('offerRate').toLocaleString());

            saveUpElement.html(saveUpTemplate);
        },
        setDaysLeftText: function(offer) {
            var endDate = moment(offer.vanityEndDate()).startOf('day');
            var currentDate = moment().startOf('day');
            var daysUntilExpire = endDate.diff(currentDate, 'day');

            var daysLeftElement = $('.offer .tag.deal');
            if (daysUntilExpire > this.daysThreshold) {
                daysLeftElement.hide();
            } else {
                if (parseInt(daysUntilExpire) > 0) {
                    daysLeftElement.html(daysUntilExpire + ' ' + App.dictionary.get('tourRelated.FreeFormText.DaysLeft'));
                }
            }
        },
        getExpireDate: function(offer) {
            var vanityEndDate = offer.vanityEndDate();
            return moment(vanityEndDate).format(App.siteSettings.dateFormat);
        },
        showComponent: function() {
            if (this.$el.data('ispageeditor') == 'True' || this.showContent) {
                this.$el.show();
            }
        },
        getBiggestSpecialOffer: function(ebbs, seasonals) {
            var seasonal;
            var ebb ;

            if (seasonals && seasonals.length > 0) {
                seasonal = seasonals.first();
            }
            if (ebbs && ebbs.length > 0) {
                ebb = ebbs.first();
            }

            if (!ebb) return seasonal;
            if (!seasonal) return ebb;

            if (ebb.get('offerRate') > seasonal.get('offerRate')) {
                return ebb;
            } else {
                return seasonal;
            }
        },
        hideOfferDetailsButtonIfNeeded: function() {
            var offerDetails = $('#offerDetails');
            if($('#special-offers-modal').length == 0 && offerDetails) {
                offerDetails.hide();
            }
        }
    });

    return TwoTypesAvailableOffersLayout;
});