const bigInput = document.getElementById("bigInput");
const sectionButtonContainer = document.getElementById("sectionButtonContainer");
const addSectionButton = document.getElementById("addSection");
const writeSongButton = document.getElementById("writeSong");

const lSong = window.mss.BasicSong();
// BasicSong doesnt have verses / lines; just a block of text.
// NOTE: this has to be changed for editing songs loaded in main window
// changes need to be done at RMBSCL

let currentSection = null;

window.Parser.debugPrintSong(lSong);

// --------- Section for one-time startup things
bigInput.disabled = true;
// ---------------------------------------------

/**
 * Resolve true when ok is pressed, idk what else to do
 * Not like it really matters i think
 */
async function alert2(heading) {
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
      promptBox.remove();
      resolve(true);
    });
  });
}

async function confirm2(heading) {
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
      promptBox.remove();
      resolve(true);
    });
    noButton.addEventListener("click", (event) => {
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
 * Looks for and returns index of element in sections
 * with sectionName. If not found, returns -1.
 */
function getSectionIndex(sectionName) {
  for (let i = 0; i < lSong.sections.length; i++) {
    if (lSong.sections[i].name == sectionName) {
      return i;
    }
  }
  return -1;
}

// TODO: maybe document this lol
function songToString() {
  let title = null;
  let author = null;

  //
  // screw it we're using for loops
  // convenient array methods are for the weak.
  let resString = "";

  // bool for if each index of lSong .sections has been defined in resString
  const writtenArr = [];
  for (let i = 0; i < lSong.sections.length; i++) {
    writtenArr[i] = false; // is this bad practice?
  }

  for (let sname of lSong.sectionOrder) {
    let indexToWrite = getSectionIndex(sname);
    if (writtenArr[indexToWrite] == true) {
      resString += ("!-R " + sname + "\n\n");
    } else {
      writtenArr[indexToWrite] = true;
      resString += ("!-S " + sname + "\n");
      resString += lSong.sections[indexToWrite].text;
      resString += "\n\n";
    }
  }


  return new Promise((resolve) => {
    if (resString.trim() == "") {
      throw new Error("Song is empty!");
    }

    prompt2("Song title:", "").then((value) => {
      if (value) {
        title = value;
      } else {
        throw new Error("Song has no Title!");
      }
      return null; // because not defing result below stresses me
    }).then((result) => {
      prompt2("Song author:", "Author is optional..").then((value) => {
        if (value) {
          author = value;
        } else {
          author = "no author"
        }
      });
      return null;
    });


    resString = ("!-T" + title + "\n\n") + ("!-A" + author + "\n\n") + resString;

    resolve(resString);
  });

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
    currentSection = lSong.sections.find((s) => { return s.name == name });
    updateBigInput();
  });

  const delButton = document.createElement("button");
  delButton.type = "button";
  delButton.innerText = "X";
  delButton.classList.add("sectionSubButton");

  delButton.addEventListener("click", () => {
    if (lSong.sectionOrder.filter((n) => { return n == name }).length == 1) {

      // TODO: WHY DOES IT WAIT FOR A SECOND BUTTON PRRESS??
      confirm2("Permanently delete section?").then((value) => {
        if (value) {
          lSong.sectionOrder = lSong.sectionOrder.filter((n) => { return n != name })
          lSong.sections = lSong.sections.filter((s) => { return s.name != name })

          if (lSong.sections.length == 0) {
            currentSection = null;
          } else {
            for (let i = 0; i < lSong.sections.length && lSong.sections[i].name != name; i++) {
              currentSection = lSong.sections[i];
            }
          }
        }
        // TODO: maybe move these up?
        drawSectionArr();
        updateBigInput();
      })

    } else {
      lSong.sectionOrder.splice(index, 1);
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
    lSong.sectionOrder.push(name);
    currentSection = lSong.sections.find((s) => { return s.name == name });
    updateBigInput();
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

  newBox.appendChild(nameButton);
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
  if (lSong.sections.length == 0) {
    currentSection = null;
  }

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
  // RMBSCL
  const newSection = window.mss.BasicSection();
  newSection.name = name;

  lSong.sections.push(newSection);
  lSong.sectionOrder.push(name)

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
  console.log("clicked!");

  prompt2("Enter name of new section:", "name..").then((result) => {
    if (result == null || result == "" || lSong.sectionOrder.find((a) => { return a == result })) { // validates that a section with that name doesnt already exist
      console.log("No new section name!");
    } else {
      console.log("New section name: " + result);
      pushSection(result);
      currentSection = lSong.sections[lSong.sections.length - 1];
      updateBigInput();

    }
  });

});

writeSongButton.addEventListener("click", (event) => {

  songToString().then((value) => {
    console.log("songToString():");
    console.log(value);
  }).catch((error) => {
    console.log("Handled error: " + error.message);
    alert2(error.message);
  })
})
