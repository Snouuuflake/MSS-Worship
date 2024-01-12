const displayDiv = document.querySelector(".display-global-text");
const displayContainer = document.querySelector(".display-container");
const body = document.querySelector("body");



function overflows(element) {
  return (element.clientHeight < element.scrollHeight);
}

function fitText(textElement, parentElement, maxSize) {
  let i = 0;
  textElement.style.fontSize = i + 'px';

  for (i = 0; !overflows(parentElement) && (i != maxSize); i++) {
    textElement.style.fontSize = i + 'px';
    console.log(i);
  }

  if (overflows(parentElement)) {
    textElement.style.fontSize = (i - 2) + 'px';
    console.log(i);
  }
}

let maxFontSize = 0;



window.displayAPI.onReadyFromMain( (value) => { 
  displayDiv.classList.add("display-" + value + "-text");
  body.classList.add("display-" + value + "-background");

  maxFontSize = parseInt(getComputedStyle(displayDiv).fontSize);
});

window.displayAPI.onGetDisplayText( (value) => {
  displayDiv.innerHTML = value;
  fitText(displayDiv, displayContainer, maxFontSize);
})





