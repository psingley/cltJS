function myTabs() {

    let navTabs = Array.from(document.querySelectorAll('#myTab a'));

    let handleClick = (e) => {
        e.preventDefault();
        navTabs.forEach(node => {
            node.classList.remove('active');
        });

        // hide all tab panes
        let tabContents = document.getElementsByClassName('enhanceTripTabs');
        for (var i = 0; i < tabContents.length; i++) {
            tabContents[i].classList.remove('show', 'active');
        }

        // get tab pane id and find element and show it
        let currentID = e.currentTarget.id;

        // add active class to button that was clicked
        e.currentTarget.classList.add('active');
        document.querySelector('div[aria-labelledby="' + currentID + '"]').classList.add('show', 'active');
    }

    navTabs.forEach(node => {
        node.addEventListener('click', handleClick)
    });

  
}

function excursionsOpener() {
    let eytItinClick = document.querySelector('a.activity-link[data-bs-target="#EnhanceYourTourModal"]');
    if (eytItinClick) {
        eytItinClick.addEventListener('click', excursionsOpen);
    }
    let tdcClick = document.querySelector('.tour-options__details [data-bs-target="#EnhanceYourTourModal"]');
    if (tdcClick) {
        tdcClick.addEventListener('click', excursionsOpen);
    }
}

function excursionsOpen() {
    let exClick = document.getElementById("excursions-tab"); 
    if (exClick) {
        exClick.click();
    }
}


function myOpener() {
    let eytclick = document.getElementById("eytClick");
    if (eytclick) {
        eytclick.addEventListener('click', handleOpen);
    }
}

function handleOpen() {
    const navlinx = document.getElementById("EnhanceYourTourModal");
    const linx = navlinx.querySelectorAll(".nav-item a");
    if (linx.length > 0) {
        linx[0].click();
    }
}

function myExpands() {
    const element = document.querySelectorAll('.expand');

    for (let i = 0; i < element.length; i++) {
        element[i].addEventListener('click', function (event) {

            let readlessBtn = event.target.parentNode.parentNode.querySelector('.truncatedBtn .read-less-btn').classList;
            let readmoreBtn = event.target.parentNode.parentNode.querySelector('.truncatedBtn .read-more-btn').classList;

            if (event.target.parentNode.parentNode.querySelector('p').classList.contains('line-clamp-4')) {

                if (event.target.parentNode.parentNode.querySelector('.truncatedBtn .read-less-btn').classList.contains('hide')) {
                    console.log("show read less button");

                    readlessBtn.replace('hide', 'show');
                    readmoreBtn.replace('show', 'hide');
                }
            } else {
                readlessBtn.replace('show', 'hide');
                readmoreBtn.replace('hide', 'show');

            }
            console.log(event.target.parentNode.parentNode.querySelector('p'));
            event.target.parentNode.parentNode.querySelector('p').classList.toggle('line-clamp-4');
        });
    }


    const elementx = document.querySelectorAll('.expand-the-itinerary');

    for (let i = 0; i < elementx.length; i++) {
        elementx[i].addEventListener('click', function (event) {

            let readlessBtnx = document.getElementById("readlessBtn").classList;
            let readmoreBtnx = document.getElementById("readmoreBtn").classList;

            if (event.target.parentNode.classList.contains('line-clamp-1')) {

                if (event.target.parentNode.parentNode.querySelector('.truncatedBtn .read-less-btn').classList.contains('hide')) {
                    console.log("show read less button");

                    readlessBtnx.replace('hide', 'show');
                    readmoreBtnx.replace('show', 'hide');
                }
            } else {
                readlessBtnx.replace('show', 'hide');
                readmoreBtnx.replace('hide', 'show');

            }
            event.target.parentNode.parentNode.querySelector('.theitin').classList.toggle('line-clamp-1');
        });
    }
}
function getTheDate(thedateid) {
    let sdate = new Date(document.querySelector("#newTourDetails").dataset.startdate);
    let smonth = sdate.toLocaleString('default', { month: 'long' });
    let syear = sdate.getFullYear();
    let sday = sdate.getDate();
    let edate = new Date(document.querySelector("#newTourDetails").dataset.enddate);
    let emonth = edate.toLocaleString('default', { month: 'long' });
    let eyear = edate.getFullYear();
    let eday = edate.getDate();
    let rd = document.getElementById(thedateid);
    if (rd) {
        if (smonth === emonth) {
            rd.textContent = smonth + " " + sday + " - " + eday + " " + eyear;
        }
        else if (smonth !== emonth && syear === eyear) {
            rd.textContent = smonth + " " + sday + " - " + emonth + " "  + eday + " " + eyear;
        }
        else { rd.textContent = smonth + " " + sday + " " + syear + " - " + emonth + " " + eday + " " + eyear; }

    }
}

