const bigInput = document.getElementById("bigInput");
const addSectionButton = document.getElementById("addSection");
const sectionButtonContainer = document.getElementById("sectionButtonContainer");

const lSong = window.mss.Song();

window.Parser.debugPrintSong(lSong);

bigInput.addEventListener("input", (event) => {
  console.log(bigInput.value);
});

/**
 * Swaps two array indexes
 */
function swapElements(array, index1, index2) {
  [array[index1], array[index2]] = [array[index2], array[index1]];
}

/**
 * Draws a section button
 *
 * @param index Allows button's event listeners to know its index
 */
function drawSectionButton(name, index) {
  const newBox = document.createElement("div");
  newBox.classList.add("sectionButtonBox");

  const nameSpan = document.createElement("span");
  nameSpan.innerText = name;
  nameSpan.classList.add("sectionNameSpan");

  const delButton = document.createElement("button");
  delButton.type = "button";
  delButton.innerText = "X";
  delButton.classList.add("sectionSubButton");

  delButton.addEventListener("click", () => {
    if (lSong.sectionOrder.filter((n) => { return n == name }).length == 1) {
      // TODO: add confirmation buttons prompt for this case
      lSong.sectionOrder = lSong.sectionOrder.filter((n) => { return n != name })
      lSong.sections = lSong.sections.filter((s) => { return s.name != name })
    } else {
      lSong.sectionOrder.splice(index, 1);
    }
    drawSectionArr();
  });

  const dupeButton = document.createElement("button");
  dupeButton.type = "button";
  dupeButton.innerText = "📄";
  dupeButton.classList.add("sectionSubButton");

  dupeButton.addEventListener("click", () => {
    lSong.sectionOrder.push(name);
    drawSectionArr();
  });

  const upButton = document.createElement("button");
  upButton.type = "button";
  upButton.innerText = "↑";
  upButton.classList.add("sectionSubButton");

  upButton.addEventListener("click", () => {
    if (index > 0 && lSong.sectionOrder.length > 1) {
      swapElements(lSong.sectionOrder, index, (index - 1));
      drawSectionArr();
    }
  });

  const downButton = document.createElement("button");
  downButton.type = "button";
  downButton.innerText = "↓";
  downButton.classList.add("sectionSubButton");

  downButton.addEventListener("click", () => {
    if (index < (lSong.sectionOrder.length - 1) && lSong.sectionOrder.length > 1) {
      swapElements(lSong.sectionOrder, index, (index + 1));
      drawSectionArr();
    }
  });

  newBox.appendChild(nameSpan);
  newBox.appendChild(dupeButton);
  newBox.appendChild(delButton);
  newBox.appendChild(upButton);
  newBox.appendChild(downButton);

  sectionButtonContainer.appendChild(newBox);
}

/**
 * Draws all section buttons in global lSong.sectionOrder
 */
function drawSectionArr() {
  sectionButtonContainer.innerHTML = "";
  let i = 0;
  for (let name of lSong.sectionOrder) {
    drawSectionButton(name, i);
    i++;
  }
}

/**
 * Adds a new section to global sectionArray
 * WARN: does not check for name duplicates !
 *
 * @param name Name of the new section
 */
function pushSection(name) {
  const newSection = window.mss.Section();
  newSection.name = name;

  lSong.sections.push(newSection);
  lSong.sectionOrder.push(name)

  drawSectionArr();
}

/**
 * My async and bad version of the prompt method
 *
 * @param heading Prompt text
 * @param filler Default value for input box
 *
 * @return null if exited or input box contents
 */
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
    if (result == null || result == "" || lSong.sectionOrder.find((a) => { return a == result })) { // validates that a section with that name doesnt already exist
      console.log("No new section name!");
    } else {
      console.log("New section name: " + result);
      pushSection(result);
    }
  });

});

