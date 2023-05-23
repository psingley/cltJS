define([
    'jquery',
    'underscore',
    'models/taxonomy/TaxonomiesModel',
    'models/taxonomy/LocationsModel',
    'event.aggregator',
    'util/objectUtil'
], function ($, _, TaxonomiesModel, LocationsModel, EventAggregator, ObjectUtil) {
    var taxonomyUtil = (function () {

        //constructor
        var constructor = function () {
            //private instance variables.
            var _taxonomies = new TaxonomiesModel();

            var deferred =  $.Deferred(function(defer){
                _taxonomies.fetch({
                    type: "GET",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (response) {
                        defer.resolve();
                    },
                    error: function (errorResponse) {
                        console.log("Inside Failure");
                        console.log(errorResponse.responseText);
                        defer.reject();
                    }
                });
            });

            //public instance variable
            this.getTaxonomyTypes = function(){
                return deferred.promise();
            };

            var getTaxonomy = function (type, key) {
                if (_taxonomies != null) {

                    var taxonomyType = _taxonomies.get(type);

                    if (ObjectUtil.isNullOrEmpty(taxonomyType)) {
                        console.log('could not find the taxonomy type ' + type);
                        return '';
                    }

                    var taxonomy =
                        _.filter(taxonomyType, function (taxonomy) {
                            return taxonomy.name.toLowerCase() === key.toLowerCase();
                        });

                    if (taxonomy.length > 1) {
                        console.log('taxonomy key returned too many results');
                        return '';
                    }

                    if (taxonomy.length == 0) {
                        console.log('could not find the taxonomy ' + type);
                        return '';
                    }

                    return taxonomy[0];
                }

                console.log('taxonomies are still null');
                return '';
            };

            this.getTaxonomyItemById = function(id){
                var allTaxonomies = [];
                for(var taxonomyType in _taxonomies.attributes){
                    var taxonomyTypeObject = _taxonomies.attributes[taxonomyType];
                    for(var taxonomy in taxonomyTypeObject){
                        allTaxonomies.push(taxonomyTypeObject[taxonomy]);
                    }
                }

                var taxonomyObject = _.find(allTaxonomies, function(taxonomy){
                   return taxonomy.id === id;
                });

                if(taxonomyObject != undefined){
                    return taxonomyObject;
                }

                console.log('could not find taxonomy for id ' + id);
                return null;
            };

            //public method
            this.getId = function (type, key) {
                var taxonomy = getTaxonomy(type, key);

                if (!ObjectUtil.isNullOrEmpty(taxonomy)) {
                    return taxonomy.id;
                }

                return null;
            };

            this.getTaxonomyItem = function (type, key) {
                var taxonomy = getTaxonomy(type, key);

                if (!ObjectUtil.isNullOrEmpty(taxonomy)) {
                    return taxonomy;
                }

                return null;
            };

            this.getTaxonomyTypeList = function(type){
                var taxonomyTypeList = _taxonomies.get(type);

                if(ObjectUtil.isNullOrEmpty(taxonomyTypeList)){
                    console.log('could not find the taxonomy type ' + type);
                    return null;
                }

                if(taxonomyTypeList.length == 0){
                    console.log('there were no taxonomies returned for type ' + type);
                    return null;
                }

                return taxonomyTypeList;
            }
        };

        return constructor;
    })();

    return taxonomyUtil;
});