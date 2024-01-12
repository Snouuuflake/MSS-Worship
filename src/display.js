displayDiv = document.querySelector(".display-global");
body = document.querySelector("body");


window.displayAPI.onReadyFromMain( (value) => {
  displayDiv.classList.add("display-" + value + "-text");
  body.classList.add("display-" + value + "-background");
});

window.displayAPI.onGetDisplayText( (value) => {
  displayDiv.innerHTML = value;
})
