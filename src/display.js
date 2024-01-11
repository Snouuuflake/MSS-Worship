displayDiv = document.querySelector(".display-global");


window.displayAPI.onReadyFromMain( (value) => {
  displayDiv.classList.add("display-" + value);
});

window.displayAPI.onGetDisplayText( (value) => {
  displayDiv.innerHTML = value;
})
