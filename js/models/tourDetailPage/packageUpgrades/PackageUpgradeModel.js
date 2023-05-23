define([
    'jquery',
    'underscore',
    'backbone',
    'app'
], function ($, _, Backbone, App) {
    var PackageUpgradeModel = Backbone.Model.extend({
        defaults: {
            id: '',
            description: '',
            numberOfRooms: 0,
            price: 0,
            serviceDay: 0,
            title: '',
            selected: false,
            prices: [],
            quantity: 1,
            parentLayoutId: '',
            city: null,
            packagePrompt: null,
            contractName: '',
            neoId: 0,
            travelerIds: [],
            notes: '',
            comments: '',
            transportationIncluded: false
        },
        getLowestSinglePrice: function () {
            return this.getGuestConfigPrice(App.taxonomy.getId('guestConfigs', 'Single'));
        },
        getLowestDoublePrice: function () {
            return this.getGuestConfigPrice(App.taxonomy.getId('guestConfigs', 'Double'));
        },
        getGuestConfigPrice: function (guestConfigId) {
            var adultId = App.taxonomy.getId('passengerTypes', 'Adult'),
                prices = this.get('prices'),
                serviceTypeDetailId = this.get('serviceTypeDetail').id;

            var adultPrices =
                _.filter(prices, function (price) {
                    var isAdult = price.passengerType.id === adultId,
                        isCorrectGuestConfig = price.guestConfig.id === guestConfigId,
                        isSameServiceTypeDetail = price.serviceTypeDetail.id === serviceTypeDetailId;

                    return isAdult && isCorrectGuestConfig && isSameServiceTypeDetail;
                });

            if(adultPrices.length === 0){
                return 0;
            }

            var minPrice =
                _.min(adultPrices, function (price) {
                    return price.contractPrice;
                });

            return minPrice.contractPrice;
        }
    });
    return PackageUpgradeModel;
});