$(function () {
    $('#divNoInfo').hide();
    $('#divReport').hide();
});

var report = {
    pageName: "TourContentAudit",
    itemId: "{F71D7701-2CD5-4BC8-AD9E-DDC311C3964C}"
};

var table;

function getReport(button) {
    $(".site-button.current").removeClass("current");
    $(button).addClass("current");
    var lang = button.getAttribute("data-lang");
    var site = button.getAttribute("data-site");
    var url = '/sitecore modules/Web/Tabs/' + report.pageName + '.aspx?id=' + report.itemId + '&vs=1&version=1&database=master&readonly=0&db=master&la=' + lang + '&language=' + lang + '&siteName=' + site;
    $(".loading").remove();
    $('#divReport').hide();
    $("#sitesList").after("<div class='loading'></div>");
    $.ajax({
        type: "GET",
        timeout: 1000*60*30, // 30 minutes
        url: url,
        success: function(response) {
            $('#divReport').show();
            if (response.length > 0) {
                $('#divNoInfo').hide();
                $('#tbReport').show();
                table = $('#tbReport').DataTable({
                    "data": response,
                    "destroy": true,
                    "columns": [
                        {"data": "countryName"},
                        {"data": "id"},
                        {"data": "name"},
                        {"data": "missingMessage"},
                        {"data": "masterPackageId"}
                    ],
                    "columnDefs": [ {
                        "targets": 4,
                        "data": "masterPackageId",
                        "render": function ( data ) {
                            return data == null ? "" : '<a class="sync-button open-button" data-lang="' + lang + '" data-master-package-id="' + data + '">View</a>';
                        }
                    } ]
                });
            }
            else{
                if (table != undefined) {
                    table.destroy();
                }
                $('#divNoInfo').show();
                $('#tbReport').hide();
            }
            var date = new Date();
            $("#spTime").text(date.toLocaleString());
            $("#spReportTitle").text(site);
        },
        error: function(errorResponse) {
            console.log("Inside Failure");
            console.log(errorResponse.responseText);
        }
    }).complete(function() {
        $(".loading").remove();
    });
}

$(document).on("click", ".open-button", function () {
    var masterPackageId = this.getAttribute("data-master-package-id");
    var lang = this.getAttribute("data-lang");
    var url = '/sitecore/shell/sitecore/content/Applications/Content Editor.aspx?id=' + masterPackageId + '&la=' + lang + '&fo=' + masterPackageId;
    window.open(url);
});
