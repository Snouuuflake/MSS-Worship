const bigInput = document.getElementById("bigInput");
const sectionButtonContainer = document.getElementById(
  "sectionButtonContainer",
);
const addSectionButton = document.getElementById("addSection");
const writeSongButton = document.getElementById("writeSong");
const readSongButton = document.getElementById("readSong");

let gSong = window.mss.BasicSong();

// BasicSong doesnt have verses / lines; just a block of text.
// NOTE: this has to be changed for editing songs loaded in main window
// changes need to be done at RMBSCL

let currentSection = null;

window.Parser.debugPrintSong(gSong);

// --------- Section for one-time startup things
bigInput.disabled = true;
let uiIsLocked = false;
// ---------------------------------------------

/**
 * Async version of html alert
 * @param heading Text content of popup
 * @returns promise that resolve true when ok is pressed, idk what else to do
 * Not like it really matters i think
 */
async function alert2(heading) {
  uiIsLocked = true;
  const promptBox = document.createElement("div");
  promptBox.classList.add("promptBox");

  const promptHeading = document.createElement("h1");
  promptHeading.classList.add("promptHeading");
  promptHeading.innerHTML = heading;

  const promptButtonContainer = document.createElement("div");
  promptButtonContainer.classList.add("promptButtonContainer");

  const okButton = document.createElement("button");
  okButton.classList.add("promptButton");
  okButton.innerText = "Ok";

  promptBox.appendChild(promptHeading);
  promptButtonContainer.appendChild(okButton);
  promptBox.appendChild(promptButtonContainer);

  document.body.appendChild(promptBox);

  return new Promise((resolve) => {
    okButton.addEventListener("click", (event) => {
      uiIsLocked = false;
      promptBox.remove();
      resolve(true);
    });
  });
}

/**
 * Async version of html confirm
 * @param heading Text content of popup
 * @returns promise that resolves true or false
 */
async function confirm2(heading) {
  uiIsLocked = true;
  const promptBox = document.createElement("div");
  promptBox.classList.add("promptBox");

  const promptHeading = document.createElement("h1");
  promptHeading.classList.add("promptHeading");
  promptHeading.innerHTML = heading;

  const promptButtonContainer = document.createElement("div");
  promptButtonContainer.classList.add("promptButtonContainer");

  const yesButton = document.createElement("button");
  yesButton.classList.add("promptButton");
  yesButton.innerText = "Yes";

  const noButton = document.createElement("button");
  noButton.classList.add("promptButton");
  noButton.innerText = "No";

  promptBox.appendChild(promptHeading);
  promptButtonContainer.appendChild(yesButton);
  promptButtonContainer.appendChild(noButton);
  promptBox.appendChild(promptButtonContainer);

  document.body.appendChild(promptBox);

  return new Promise((resolve) => {
    yesButton.addEventListener("click", (event) => {
      uiIsLocked = false;
      promptBox.remove();
      resolve(true);
    });
    noButton.addEventListener("click", (event) => {
      uiIsLocked = false;
      promptBox.remove();
      resolve(false);
    });
  });
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
  uiIsLocked = true;
  const promptBox = document.createElement("div");
  promptBox.classList.add("promptBox");

  const promptHeading = document.createElement("h1");
  promptHeading.classList.add("promptHeading");
  promptHeading.innerHTML = heading;

  const promptInput = document.createElement("input");
  promptInput.type = "text";
  promptInput.placeholder = filler;
  promptInput.classList.add("promptInput");
  // promptInput.id = "promptInput";

  const promptButtonContainer = document.createElement("div");
  promptButtonContainer.classList.add("promptButtonContainer");

  const exitButton = document.createElement("button");
  exitButton.classList.add("promptButton");
  exitButton.innerText = "Exit";

  const submitButton = document.createElement("button");
  submitButton.classList.add("promptButton");
  submitButton.innerText = "Ok";

  promptBox.appendChild(promptHeading);
  promptBox.appendChild(promptInput);
  promptButtonContainer.appendChild(exitButton);
  promptButtonContainer.appendChild(submitButton);
  promptBox.appendChild(promptButtonContainer);

  document.body.appendChild(promptBox);

  promptInput.focus();

  return new Promise((resolve) => {
    exitButton.addEventListener("click", (event) => {
      uiIsLocked = false;
      promptBox.remove();
      resolve(null);
    });
    submitButton.addEventListener("click", (event) => {
      uiIsLocked = false;
      let res = promptInput.value.trim(); // NOTE: we trim the input.
      promptBox.remove();
      resolve(res);
    });
  });
}

/**
 * Looks for and returns index of element in sections
 * with sectionName. If not found, returns -1.
 */
function getSectionIndex(sectionName) {
  for (let i = 0; i < gSong.sections.length; i++) {
    if (gSong.sections[i].name == sectionName) {
      return i;
    }
  }
  return -1;
}

// TODO: maybe document this lol
async function songToString() {
  let title = null;
  let author = null;

  //
  // screw it we're using for loops
  // convenient array methods are for the weak.
  let resString = "";

  // bool for if each index of gSong .sections has been defined in resString
  const writtenArr = [];
  for (let i = 0; i < gSong.sections.length; i++) {
    writtenArr[i] = false; // is this bad practice?
  }

  for (let sname of gSong.sectionOrder) {
    let indexToWrite = getSectionIndex(sname);
    if (writtenArr[indexToWrite] == true) {
      resString += "!-R " + sname + "\n\n";
    } else {
      writtenArr[indexToWrite] = true;
      resString += "!-S " + sname + "\n";
      resString += gSong.sections[indexToWrite].text;
      resString += "\n\n";
    }
  }

  if (resString.trim() == "") {
    throw new Error("Song is empty!");
  }

  title = await prompt2("Song title:", "");
  if (!title) {
    throw new Error("Song has no Title!");
  }

  author = await prompt2("Song author:", "Author is optional..");
  if (!author) {
    author = "no author";
  }

  resString = "!-T " + title + "\n\n" + ("!-A " + author + "\n\n") + resString;

  return resString;
}

/**
 * Swaps two array indexes
 */
function swapElements(array, index1, index2) {
  [array[index1], array[index2]] = [array[index2], array[index1]];
}

function updateBigInput() {
  // RMBSCL

  if (currentSection == null) {
    bigInput.disabled = true;
    bigInput.value = "";
  } else {
    bigInput.value = currentSection.text;
    bigInput.disabled = false;
  }
}

/**
 * Draws a section button
 *
 * @param index Allows button's event listeners to know its index
 */
function drawSectionButton(name, index) {
  const newBox = document.createElement("div");
  newBox.classList.add("sectionButtonBox");

  const nameButton = document.createElement("button");
  nameButton.innerText = name;
  nameButton.classList.add("sectionNameButton");

  nameButton.addEventListener("click", () => {
    currentSection = gSong.sections.find((s) => {
      return s.name == name;
    });
    updateBigInput();
  });

  const delButton = document.createElement("button");
  delButton.type = "button";
  delButton.innerText = "X";
  delButton.classList.add("sectionSubButton");

  delButton.addEventListener("click", () => {
    if (
      gSong.sectionOrder.filter((n) => {
        return n == name;
      }).length == 1
    ) {
      // TODO: WHY DOES IT WAIT FOR A SECOND BUTTON PRRESS??
      confirm2("Permanently delete section?").then((value) => {
        if (value) {
          gSong.sectionOrder = gSong.sectionOrder.filter((n) => {
            return n != name;
          });
          gSong.sections = gSong.sections.filter((s) => {
            return s.name != name;
          });

          if (gSong.sections.length == 0) {
            currentSection = null;
          } else {
            for (
              let i = 0;
              i < gSong.sections.length && gSong.sections[i].name != name;
              i++
            ) {
              currentSection = gSong.sections[i];
            }
          }
        }
        // TODO: maybe move these up?
        drawSectionArr();
        updateBigInput();
      });
    } else {
      gSong.sectionOrder.splice(index, 1);
      drawSectionArr();
      updateBigInput();
    }
    // just in case
    // drawSectionArr();
    // updateBigInput();
  });

  const dupeButton = document.createElement("button");
  dupeButton.type = "button";
  dupeButton.innerText = "📄";
  dupeButton.classList.add("sectionSubButton");

  dupeButton.addEventListener("click", () => {
    gSong.sectionOrder.push(name);
    currentSection = gSong.sections.find((s) => {
      return s.name == name;
    });
    updateBigInput();
    drawSectionArr();
  });

  const upButton = document.createElement("button");
  upButton.type = "button";
  upButton.innerText = "↑";
  upButton.classList.add("sectionSubButton");

  upButton.addEventListener("click", () => {
    if (index > 0 && gSong.sectionOrder.length > 1) {
      swapElements(gSong.sectionOrder, index, index - 1);
      drawSectionArr();
    }
  });

  const downButton = document.createElement("button");
  downButton.type = "button";
  downButton.innerText = "↓";
  downButton.classList.add("sectionSubButton");

  downButton.addEventListener("click", () => {
    if (
      index < gSong.sectionOrder.length - 1 &&
      gSong.sectionOrder.length > 1
    ) {
      swapElements(gSong.sectionOrder, index, index + 1);
      drawSectionArr();
    }
  });

  newBox.appendChild(nameButton);
  newBox.appendChild(dupeButton);
  newBox.appendChild(delButton);
  newBox.appendChild(upButton);
  newBox.appendChild(downButton);

  sectionButtonContainer.appendChild(newBox);
}

/**
 * Draws all section buttons in global gSong.sectionOrder
 */
function drawSectionArr() {
  if (gSong.sections.length == 0) {
    currentSection = null;
  }

  sectionButtonContainer.innerHTML = "";
  let i = 0;
  for (let name of gSong.sectionOrder) {
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
  // RMBSCL
  const newSection = window.mss.BasicSection();
  newSection.name = name;

  gSong.sections.push(newSection);
  gSong.sectionOrder.push(name);

  drawSectionArr();
}

bigInput.addEventListener("input", (event) => {
  console.log(bigInput.value);
  // RMBSCL
  if (currentSection != null) {
    currentSection.text = bigInput.value;
  }
});

/**
 * Add uhh
 * uhh
 * a section to our song object with a popup to get the name
 * validate that the name has not already been used ig
 */
addSectionButton.addEventListener("click", (event) => {
  console.log("clicked! " + "ui is " + (uiIsLocked ? "" : "not ") + "locked.");

  if (!uiIsLocked) {
    prompt2("Enter name of new section:", "name..").then((result) => {
      if (
        result == null ||
        result == "" ||
        gSong.sectionOrder.find((a) => {
          return a == result;
        })
      ) {
        // validates that a section with that name doesnt already exist
        console.log("No new section name!");
      } else {
        console.log("New section name: " + result);
        pushSection(result);
        currentSection = gSong.sections[gSong.sections.length - 1];
        updateBigInput();
      }
    });
  }
});

writeSongButton.addEventListener("click", (event) => {
  if (!uiIsLocked) {
    songToString()
      .then((value) => {
        console.log("songToString():");
        console.log(value);
        window.editorAPI.sendSongString(value);
      })
      .catch((error) => {
        console.log("Handled error: " + error.message);
        alert2(error.message);
      });
  }
});

readSongButton.addEventListener("click", (event) => {
  if (!uiIsLocked) {
    window.editorAPI.sendReadSong("a string");
  }
});

window.editorAPI.onReadSong((value) => {
  console.log("does this run?");
  console.log("Got song string from main");
  console.log(value);
  const lSong = JSON.parse(value).song;

  gSong = window.mss.BasicSong();

  gSong.data.title = lSong.data.title;
  gSong.data.author = lSong.data.author;

  for (let i = 0; i < lSong.sectionOrder.length; i++) {
    gSong.sectionOrder[i] = lSong.sectionOrder[i];
  }

  for (let i = 0; i < lSong.sections.length; i++) {
    gSong.sections[i] = window.mss.BasicSection();
    gSong.sections[i].name = lSong.sections[i].name;

    for (let g = 0; g < lSong.sections[i].verses.length; g++) {
      for (let k = 0; k < lSong.sections[i].verses[g].lines.length; k++) {
        gSong.sections[i].text += lSong.sections[i].verses[g].lines[k];
      gSong.sections[i].text += "\n";
      }
      gSong.sections[i].text += "\n";
    }
    gSong.sections[i].text = gSong.sections[i].text.trim();
  }

  drawSectionArr();
});
