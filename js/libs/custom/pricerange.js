const rangeInput = document.querySelectorAll(".range-input input"),
priceInput = document.querySelectorAll(".price-input input"),
range = document.querySelector(".slider .progress");
let priceGap = 100;
//priceInput[0].value = localStorage.getItem('minxy');
//priceInput[1].value = localStorage.getItem('maxy');

//rangeInput[0].value = localStorage.getItem('minxy');
//rangeInput[1].value = localStorage.getItem('maxy');

priceInput.forEach(input =>{
    input.addEventListener("input", e =>{
        let minPrice = parseInt(priceInput[0].value),
            maxPrice = parseInt(priceInput[1].value);
        if((maxPrice - minPrice >= priceGap) && maxPrice <= rangeInput[1].max){
            if(e.target.className === "input-min"){
                rangeInput[0].value = minPrice;
                range.style.left = 100 - ((minPrice / rangeInput[0].max) * 100) + "%";
                range.style.left = 0;
            }else{
                rangeInput[1].value = maxPrice;
                range.style.right = 10 - (maxVal / rangeInput[1].max) * 100 + "%";
                range.style.right = 100;
            }

   
        }
    });
});

rangeInput.forEach(input =>{
    input.addEventListener("input", e => {
        //rangeInput[0].min = localStorage.getItem('minxy');
        //rangeInput[1].min = localStorage.getItem('minxy');
        //rangeInput[0].max = localStorage.getItem('maxy');
        //rangeInput[1].max = localStorage.getItem('maxy');

        let minVal = parseInt(rangeInput[0].value),
            maxVal = parseInt(rangeInput[1].value);

        if ((maxVal - minVal) < priceGap) {
            if(e.target.className === "range-min"){
                rangeInput[0].value = maxVal - priceGap;
            }else{
                rangeInput[1].value = minVal + priceGap;
            }
        }else{
            priceInput[0].value = minVal;
            priceInput[1].value = maxVal;
            range.style.left = ((minVal / rangeInput[0].max) * 100) + "%";
            range.style.right = 100 - (maxVal / rangeInput[1].max) * 100 + "%";
        }
      
    });
});


