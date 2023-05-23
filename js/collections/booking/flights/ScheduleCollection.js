/**
 * Created by ssinno on 10/23/13.
 */
// Filename: models/project
define([
    'underscore',
    'backbone',
    'models/booking/flights/ScheduleModel',
    'app'
], function (_, Backbone, ScheduleModel, App) {
        var ScheduleCollection = Backbone.Collection.extend({
            defaults: {
                model: ScheduleModel,
                sortField: '',
                sortFieldText:'',
                sortDirection: '',
                taxSortField:''
        },
        setFlightSchedules: function (schedules) {
            this.reset();
            var outerScope = this;
            _.each(schedules, function (schedule) {

                var scheduleModel = new ScheduleModel(schedule);

                outerScope.add(scheduleModel);
            });
        },
        setFlightSchedulesByExistingScheduleModels: function(scheduleModels) {
          this.reset();
          var outerScope = this;
          _.each(scheduleModels, function (scheduleModel) {
            outerScope.add(scheduleModel);
          });
        },
        initialize: function () {
            // Default sort field and direction
            this.sortField = "price";
            this.sortFieldText = App.dictionary.get('tourRelated.Booking.RoomingTravelerInfo.LandAndAirPrice');
            this.sortDirection = "ASC";
            this.taxSortField = "tax";
        },

        setSortField: function (field, direction, fieldText) {
            this.sortField = field;
            this.sortDirection = direction;
            this.sortFieldText = fieldText;
        },

        comparator: function (m) {
          var value;
          if (this.sortField === "price") {
          	value = m.get(this.sortField) + m.get(this.taxSortField);
        	}
        	else {
        		value = m.get(this.sortField);
          }
        	return value;
        },

        // Overriding sortBy (copied from underscore and just swapping left and right for reverse sort)
        sortBy: function (iterator, context) {
            var obj = this.models,
                direction = this.sortDirection;

            return _.pluck(_.map(obj,function (value, index, list) {
                return {
                    value: value,
                    index: index,
                    criteria: iterator.call(context, value, index, list)
                };
            }).sort(function (left, right) {
                    // swap a and b for reverse sort
                    var a = direction === "ASC" ? left.criteria : right.criteria,
                        b = direction === "ASC" ? right.criteria : left.criteria;

                    if (a !== b) {
                        if (a > b || a === void 0) return 1;
                        if (a < b || b === void 0) return -1;
                    }
                    return left.index < right.index ? -1 : 1;
                }), 'value');
        },

        filterByFairType: function (filterKey) {

            if (!filterKey || filterKey == '{46ECE1D0-DAE4-4371-B752-73C5D2A9C637}') {
                return this;
            }

            var isFlexibleAir = false;
            if (filterKey == '{45727323-710D-49BE-ABDB-615068F23C5A}') {
                isFlexibleAir = true;
            }
            var filteredSchedules = _.filter(this.models, function (schedule) {
                return schedule.get('isFlexibleAir') == isFlexibleAir;
            });
            var schedules = new ScheduleCollection();
            schedules.add(filteredSchedules);
            return schedules;
        }
    });
    // Return the model for the module
    return ScheduleCollection;
});