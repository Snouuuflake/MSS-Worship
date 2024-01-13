const displayDiv = document.querySelector(".display-global-text");
const displayContainer = document.querySelector(".display-container");
const body = document.querySelector("body");
const logoDiv = document.querySelector(".logo");
const blackDiv = document.querySelector(".black");


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


const hideLogo = () => {
  logoDiv.style.display = 'none';
};


const hideBlack = () => {
  blackDiv.style.display = 'none';
};

window.displayAPI.onGetLogo( (value) => {
  if (value == "on") {
    logoDiv.removeEventListener("animationend", hideLogo);
    logoDiv.style.display = 'block';
    logoDiv.classList.remove("fadeOut");
    logoDiv.classList.add("fadeIn");
  } else if (value == "off") {
    logoDiv.classList.remove("fadeIn");
    logoDiv.classList.add("fadeOut");
    logoDiv.addEventListener("animationend", hideLogo);
  }
});


window.displayAPI.onGetBlack( (value) => {
  if (value == "on") {
    blackDiv.removeEventListener("animationend", hideBlack);
    blackDiv.style.display = 'block';
    blackDiv.classList.remove("fadeOut");
    blackDiv.classList.add("fadeIn");
  } else if (value == "off") {
    blackDiv.classList.remove("fadeIn");
    blackDiv.classList.add("fadeOut");
    blackDiv.addEventListener("animationend", hideBlack);
  }
});

