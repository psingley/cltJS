var report = new Object();
report.pageName = "AllToursAudit";
report.itemId = "{E9A18A3B-5D67-49F7-8603-5316D632789C}";

$(function() {
    $(document).on("click", ".import-button", function (event) {
        var command = 'collette:import.current(id=' + this.getAttribute("data-tour-id") + ')';
        window.parent.scForm.postEvent(this,event,command);
        getTourUpdates(this, this.getAttribute("data-tour-id"));
    });
});