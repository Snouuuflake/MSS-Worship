const sectionArray = []

const bigInput = document.getElementById("bigInput");
const addSectionButton = document.getElementById("addSection");

const lSong = window.mss.Song();

window.Parser.debugPrintSong(lSong);

bigInput.addEventListener("input", (event) => {
  console.log(bigInput.value);
});

async function prompt2(heading, filler) {
  const promptBox = document.createElement("div");
  promptBox.classList.add("promptBox");

  const promptHeading = document.createElement("h1");
  promptHeading.classList.add("promptHeading");
  promptHeading.innerHTML = heading;

  const promptInput = document.createElement("input");
  promptInput.type = "text";
  promptInput.classList.add("promptInput");
  // promptInput.id = "promptInput";

  const exitButton = document.createElement("button");
  exitButton.classList.add("promptButton");
  exitButton.innerText = "Exit";


  const submitButton = document.createElement("button");
  submitButton.classList.add("promptButton");
  submitButton.innerText = "Ok";

  promptBox.appendChild(promptHeading);
  promptBox.appendChild(promptInput);
  promptBox.appendChild(exitButton);
  promptBox.appendChild(submitButton);

  document.body.appendChild(promptBox);

  return new Promise((resolve) => {
    exitButton.addEventListener("click", (event) => {
      promptBox.remove();
      resolve(null);
    });
    submitButton.addEventListener("click", (event) => {
      let res = promptInput.value.trim(); // NOTE: we trim the input.
      promptBox.remove();
      resolve(res);
    });
  });
}

/**
  * Add uhh
  * uhh
  * a section to our song object with a popup to get the name
  * validate that the name has not already been used ig
  */
addSectionButton.addEventListener("click", (event) => {
  console.log("clicked!");

  prompt2("hi!", "filler").then((result) => {
    if (result == null || result == "" || sectionArray.find((a) => { return a.name == result })) { // validates that a section with that name doesnt already exist
      console.log("No result!");
    } else {
      console.log("result = " + result);
      const newSection = window.mss.Section();
      newSection.name = result;
      // TODO: pushSection
      sectionArray.push(newSection);
    }
  });

});
