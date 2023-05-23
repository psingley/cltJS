define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'util/objectUtil'
], function ($, _, Backbone, Marionette, App, ObjectUtil) {
    var taxonomyDomUtil = {
        setAutocomplete: function (source, $selector, $idSelector, $appendTo) {
            $("#InvalidStateWarning").hide();
            if ($selector.length === 0) {
                return;
            }

            if ($idSelector.length === 0) {
                return;
            }

            if (_.isEmpty(source)) {
            	if ($selector.data('ui-autocomplete') != undefined) {
            		$selector.autocomplete("disable");
            	}
              return;
            }

            if ($selector.data('ui-autocomplete') != undefined) {
		        $selector.autocomplete("enable");
	        }
	        var outerScope = this;
            $.each(source, function () {
                if (!ObjectUtil.isNullOrEmpty(this.autocompleteSourceValue)) {
                    this.value = this.autocompleteSourceValue;
                } else {
                    this.value = this.name;
                }
            });

            $selector.autocomplete({
                select: function (event, ui) {
                    $idSelector.val(ui.item.id);
                    $idSelector.trigger('change');

                    //set background color
                    $($selector).css({
                        "border-color": "#B2B8BD",
                        "border-weight": "1px",
                        "border-style": "solid",
                        "background-color": "#FFFFFF"
                    });
                    return false;
                },
                minLength: 0,
                focus: function (event, ui) {
                    $selector.val(ui.item.name);
                    return false;
                },

                appendTo: $appendTo,

                source: source
            }).focus(function() {
                    $(this).autocomplete('search', $(this).val())
            }).focusout(function() {
                    $(this).autocomplete('close')
            }).data("ui-autocomplete")._renderItem = function (ul, item) {
                return $("<li>")
                    .append("<a>" + item.name + "</a>")
                    .appendTo(ul);
            };

            $selector.off('blur').on('blur', function () {
                outerScope.checkSelectedOption(source, this.value, $selector, $idSelector);
            });
        },
        setAutocompleteAjax: function (deferredObject, $selector, $idSelector, minLength, required) {
            if ($selector.length == 0) {
                return;
            }

            if ($idSelector.length == 0) {
                return;
            }

            var outerScope = this;

            $selector.autocomplete({
                minLength: minLength,
                select: function (event, ui) {
                    $idSelector.val(ui.item.id);
                    $idSelector.trigger('change');

                    //set background color
                    $($selector).css({
                        "border-color": "#B2B8BD",
                        "border-weight": "1px",
                        "border-style": "solid",
                        "background-color": "#FFFFFF"
                    });
                    return false;
                },
                minLength: 2,
                focus: function (event, ui) {
                    $selector.val(ui.item.name);
                    return false;
                },
                source: function (request, response) {
                    deferredObject($selector.val())
                        .success(function (data) {
                            var source = JSON.parse(data.d);

                            if (_.isEmpty(source)) {
                                return;
                            }

                            $.each(source, function () {
                                if (!ObjectUtil.isNullOrEmpty(this.autocompleteSourceValue)) {
                                    this.value = this.autocompleteSourceValue;
                                } else {
                                    this.value = this.name;
                                }
                            });

                            $selector.off('blur').on('blur', function () {
                                outerScope.checkSelectedOption(source, this.value, $selector, $idSelector, true);
                            });

                            response($.map(source, function(item) {
                                return item;
                            }));
                        });
                }
            }).data("ui-autocomplete")._renderItem = function (ul, item) {
                return $("<li>")
                    .append("<a>" + item.name + "</a>")
                    .appendTo(ul);
            };
        },
       
        checkSelectedOption: function (source, selectedValue, $selector, $idSelector, required) {
            var isValid = false;
            var value;

            for (var i in source) {
                value = source[i];
                if (!ObjectUtil.isNullOrEmpty(value) && !ObjectUtil.isNullOrEmpty(value.name) && value.name.toLowerCase() === selectedValue.toLowerCase()) {
                    isValid = true;
                    break;
                }
            }

            if (!isValid) {
               //Set the field to be empty, if typing an invalid state.
                $selector.val("");
                $("#InvalidStateWarning").show();
                $idSelector.val("");
                $idSelector.trigger('change');

                if (required) {
                    //set background color
                    $($selector).css({
                        "border-color": "#D8000C", 
                        "border-weight": "1px",
                        "border-style": "solid",
                        "background-color": "#FFBABA"
                    });
                }
            } else {
                $("#InvalidStateWarning").hide();
                $selector.val(value.name);
                $idSelector.val(value.id);
                $idSelector.trigger('change');

                //set background color
                $($selector).css({
                    "border-color": "#B2B8BD",
                    "border-weight": "1px",
                    "border-style": "solid",
                    "background-color": "#FFFFFF"
                });
            }
        },
        setOptions: function (taxonomyType, $dropDownBox) {
            //get the list of taxonomies
            $dropDownBox.find('option').remove();
            var taxonomyTypes = App.taxonomy.getTaxonomyTypeList(taxonomyType);
            var selectOneText = App.dictionary.get('common.Lists.SelectOne');
            
            $dropDownBox.append('<option value="" data-id="">' + selectOneText + '</option>');
            this.setOptionsForType(taxonomyTypes, $dropDownBox);
        },
        setOptionsWithOutSelect: function (taxonomyType, $dropDownBox) {
            //clear all of the options
            $dropDownBox.find('option').remove();
            //get the list of taxonomies
            var taxonomyTypes = App.taxonomy.getTaxonomyTypeList(taxonomyType);
            this.setOptionsForType(taxonomyTypes, $dropDownBox);
        },
        setOptionsForType: function (source, $selector) {
            //set a default value
            _.each(source, function (type) {
                var taxonomyType = '<option value="' + type.name + '" data-id="' + type.id + '" class="' + type.name + '">' + type.name + '</option>';
                $selector.append(taxonomyType);
            });
        },
        setCustomOptions: function (source, $dropDownBox) {
            $dropDownBox.find('option').remove();
            var selectOneText = App.dictionary.get('common.Lists.SelectOne');
            $dropDownBox.append('<option value="" data-id="">' + selectOneText + '</option>');
            this.setOptionsForType(source, $dropDownBox);
        },
        setCustomOptionsWithOutSelect: function (source, $dropDownBox) {
            $dropDownBox.find('option').remove();
            this.setOptionsForType(source, $dropDownBox);
        }
    };

    return taxonomyDomUtil;
});