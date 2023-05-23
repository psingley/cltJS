define([
    'jquery',
    'underscore'
], function ($, _) {
    var prettySelectUtil = {
        setValue: function (value, $dropDownList) {
            if ($dropDownList.length > 0) {
                //change the drop down list to the new default value
                $dropDownList.val(value);
                $dropDownList.trigger('update');
            }else{
                console.log('could not find drop down list for pretty select setter of ' +  value);
            }
        },
        removeOption: function (index, $dropDownList) {
            $.each($dropDownList, function(id,value) {
            	$(value.options[index]).remove();
            });
            $dropDownList.trigger('update');
        },
        addOption: function (dataValue, $dropDownList) {
            $.each($dropDownList, function(id,value){
               $(value).append('<option>' + dataValue + '</option>');
            });
            $dropDownList.trigger('update');
        }
    };
    return prettySelectUtil;
});