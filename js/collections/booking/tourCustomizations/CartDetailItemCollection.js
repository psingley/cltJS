// Filename: models/project
define([
    'underscore',
    'backbone',
    'models/booking/tourCustomizations/CartDetailItemModel'
], function (_, Backbone, CartDetailItemModel) {
    var CartDetailItemCollection = Backbone.Collection.extend({
        defaults: {
            model: CartDetailItemModel
        },
        setCartDetailItems: function(cartDetailItems){
            var outerScope= this;
            this.reset();
            _.each(cartDetailItems, function (cartDetailItem) {
                var cartDetailItemModel = new CartDetailItemModel();
                cartDetailItemModel.set({
                    id: cartDetailItem.id,
                    packageItemId: cartDetailItem.neoId,
                    offerId: cartDetailItem.offerId,
                    price: cartDetailItem.price,
                    title: cartDetailItem.title,
                    quantity: cartDetailItem.quantity,
                    total: cartDetailItem.total,
                    passengerTypeName: cartDetailItem.passengerTypeName,
                    formattedServiceDate: cartDetailItem.formattedServiceDate,
                    serviceDate: cartDetailItem.serviceDate,
                    commission: cartDetailItem.commission,
                    serviceType: cartDetailItem.serviceType,
                    serviceOrder: cartDetailItem.serviceOrder,
					serviceTypeDetail: cartDetailItem.serviceTypeDetail,
                    unit: cartDetailItem.unit,
                    totalCommission: cartDetailItem.totalCommission
                });
                outerScope.add(cartDetailItemModel);
            });
        }
    });
    // Return the model for the module
    return CartDetailItemCollection;
});