define([
    'knockout',
    'jquery',
], function (ko, $) {
    function TcrMapView(params) {
        let self = this;
        self.data = params.data;
        
        self.model = ko.computed(function () {
            let dataSource = ko.unwrap(self.data);
            if (dataSource == null) return {};
            return dataSource;
        });

        self.mapImageUrl = ko.computed(function () {
            return self.model()
                ? self.model().mapImageUrl
                : '';
        });
    }
    return TcrMapView;
});
