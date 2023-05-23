var report = new Object();
report.pageName = "BrochureClickStats";
report.itemId = "{04A22E96-1146-4038-A325-18E5D016FA96}";

/*After document is ready then datepicker is attached to textboxes*/
$(function() {
	$("#startDate").datepicker({
		dateFormat: 'yy-mm-dd'
	});
	$("#endDate").datepicker({
		dateFormat: 'yy-mm-dd'
	});
});

getMyDatePicker = function (date) {
	$(date).datepicker({
		onClose: function () {
			var year = $("#ui-datepicker-div .ui-datepicker-year :selected").val();
			var month = $("#ui-datepicker-div .ui-datepicker-month :selected").val();
			var dates = $("#ui-datepicker-div .ui-datepicker-date :selected").val();
			$(date).datepicker('setDate', new Date(year, month, dates));
		}
	});

};