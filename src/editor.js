const sectionArray = []

const bigInput = document.getElementById("bigInput");
const addSectionButton = document.getElementById("addSection");
const sectionButtonContainer = document.getElementById("sectionButtonContainer");

const lSong = window.mss.Song();

window.Parser.debugPrintSong(lSong);

bigInput.addEventListener("input", (event) => {
  console.log(bigInput.value);
});

function swapElements(array, index1, index2) {
  [array[index1], array[index2]] = [array[index2], array[index1]];
}

function drawSectionButton(section, index) {
  const newBox = document.createElement("div");
  newBox.classList.add("sectionButtonBox");

  const nameSpan = document.createElement("span");
  nameSpan.innerText = section.name;
  nameSpan.classList.add("sectionNameSpan");

  const delButton = document.createElement("button");
  delButton.type = "button";
  delButton.innerText = "X";
  delButton.classList.add("sectionSubButton");

  const dupeButton = document.createElement("button");
  dupeButton.type = "button";
  dupeButton.innerText = "📄";
  dupeButton.classList.add("sectionSubButton");

  const upButton = document.createElement("button");
  upButton.type = "button";
  upButton.innerText = "↑";
  upButton.classList.add("sectionSubButton");

  upButton.addEventListener("click", () => {
    if (index > 0 && sectionArray.length > 1) {
      swapElements(sectionArray, index, (index - 1));
      drawSectionArr();
    }
  });

  const downButton = document.createElement("button");
  downButton.type = "button";
  downButton.innerText = "↓";
  downButton.classList.add("sectionSubButton");

  downButton.addEventListener("click", () => {
    if (index < (sectionArray.length - 1) && sectionArray.length > 1) {
      swapElements(sectionArray, index, (index + 1));
      drawSectionArr();
    }
  });

  newBox.appendChild(nameSpan);
  newBox.appendChild(dupeButton);
  newBox.appendChild(upButton);
  newBox.appendChild(downButton);

  sectionButtonContainer.appendChild(newBox);
}

function drawSectionArr() {
  sectionButtonContainer.innerHTML = "";
  let i = 0;
  for (let s of sectionArray) {
    drawSectionButton(s, i);
    i++;
  }
}

function pushSection(name) {
  const newSection = window.mss.Section();
  newSection.name = name;

  sectionArray.push(newSection);

  drawSectionArr();
}

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
      console.log("No new section name!");
    } else {
      console.log("New section name: " + result);
      pushSection(result);
    }
  });

});

