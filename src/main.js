const renderSongList = [];

let lastPressed = null;

let currentButtonIndex = -1;
let globalButtonCounter = 0;

const verseList = document.querySelector(".verse-list");


let listItems = document.querySelectorAll(".verse-button");

// css root
const r = document.querySelector(":root");

// "current selected button"
let currentLI = 0;
// Set up a key event handler for the document
document.addEventListener("keydown", function(event){
  // Check for up/down key presses
  switch(event.key){
    case "ArrowUp": // Up arrow    

      currentLI = currentLI > 0 ? --currentLI : 0;     // Decrease the counter      
      listItems[currentLI].focus();

      break;
    case "ArrowDown": // Down arrow
      
      currentLI = currentLI < listItems.length-1 ? ++currentLI : listItems.length-1; // Increase counter 
      listItems[currentLI].focus();

      break;    
  }
});


function drawVerse(verse) {
  let i = 0;
  let contentStr = "";

  const verseButton = document.createElement("button");
  const verseLi = document.createElement("li");

  verseButton.classList.add("verse-button");

  for (i = 0; i < verse.lines.length -1; i++) {
    contentStr += verse.lines[i] + "<BR />";
  }

  contentStr += verse.lines[i];
  
  verseButton.innerHTML = contentStr;

  // gives each button an index
  // so that it can sync with arrow keys
  verseButton.globalIndex = globalButtonCounter++;

  verseButton.addEventListener("click", () => {
    
    console.log("hi");
    window.mainAPI.sendDisplayText(contentStr);

    // for arrow keys to sync right
    currentLI = verseButton.globalIndex;

    if (lastPressed) {
      lastPressed.classList.remove("last-pressed");
    }

    verseButton.classList.add("last-pressed");

    lastPressed = verseButton;

  });

  verseLi.appendChild(verseButton);

  verseList.appendChild(verseLi);
 
}

function drawSection(section) {
  const sectionHeading = document.createElement("li");
  sectionHeading.classList.add("section-heading");
  sectionHeading.innerText = section.name;
  
  verseList.appendChild(sectionHeading);
  
  for (let i of section.verses) {
    drawVerse(i);
  }

}

function drawSong(song) {
  const verseList = document.querySelector(".verse-list");

  verseList.innerHTML = "";

  // resettind when drawing song
  currentLI = 0;
  globalButtonCounter = 0;

  for (let sectionName of song.sectionOrder) {
    console.log(song.sections.find( (s) => s.name == sectionName));

    drawSection(song.sections.find( (s) => s.name == sectionName));

  }
  listItems = document.querySelectorAll(".verse-button");

  listItems[0].focus();
}




function swapElements(array, index1, index2) {
    [array[index1], array[index2]] = [array[index2], array[index1]];
}

function drawSongButton(song, index) {
  const songList = document.querySelector(".song-list");

  const thisLi = document.createElement("li");

  const thisButton = document.createElement("button");

  thisButton.classList.add("song-button");
  thisButton.innerText = song.data.title;

  thisButton.addEventListener("click", () => {
    drawSong(song);
    currentButtonIndex = index;
  })

  thisLi.appendChild(thisButton);

  songList.appendChild(thisLi);
  
}

function drawImageButton(image, index) {
  const songList = document.querySelector(".song-list");

  const thisLi = document.createElement("li");

  const thisButton = document.createElement("button");

  thisButton.classList.add("song-button");

  // !!!!!!!! backslash does not work on any other operating system !!!!!!!!!!!!1
  // the above problem is now solved with the two if statements
  if (image.path.includes("\\")) {
    thisButton.innerText = image.path.substring(image.path.lastIndexOf('\\')+1);
  }
  

  if (thisButton.innerText.includes("/")) {
    thisButton.innerText = thisButton.innerText.substring(thisButton.innerText.lastIndexOf('/')+1);
  }

  thisButton.addEventListener("click", () => {
    const verseList = document.querySelector(".verse-list");
    // clears the verse list when sending a song
    verseList.innerHTML = "";
    window.mainAPI.sendDisplayImage(image.path);
    currentButtonIndex = index;
  })

  thisLi.appendChild(thisButton);

  songList.appendChild(thisLi);
  
}


function drawSongList() {
  const songList = document.querySelector(".song-list");
  songList.innerHTML = "";

  let i = 0;

  for (let object of renderSongList) {
    if (object.type == "song") {
      drawSongButton(object, i);
      i++;
    } else if (object.type == "image") {
      drawImageButton(object, i);
      i++;
    }
  }
}


const delButton = document.querySelector("#del-element");
delButton.addEventListener("click", () => {
  renderSongList.splice(currentButtonIndex,1);
  drawSongList();
})

const upButton = document.querySelector("#mv-element-up");
upButton.addEventListener("click", () => {
  if (currentButtonIndex > 0) {
    swapElements(renderSongList, currentButtonIndex, (currentButtonIndex - 1) );
    drawSongList();
    currentButtonIndex--;
  }
})

const downButton = document.querySelector("#mv-element-down");
downButton.addEventListener("click", () => {
  if (currentButtonIndex < (renderSongList.length - 1)) {
    swapElements(renderSongList, currentButtonIndex, (currentButtonIndex + 1) );
    currentButtonIndex++;
    drawSongList();
  }
})

const readSongButton = document.querySelector("#read-song");
readSongButton.addEventListener("click", () => {
  window.mainAPI.sendReadSong();
});

const readImageButton = document.querySelector("#read-image");
readImageButton.addEventListener("click", () => {
  window.mainAPI.sendReadImage();
});

const readDirButton = document.querySelector("#read-dir");
readDirButton.addEventListener("click", () => {
  window.mainAPI.sendReadDir();
});

const window1Button = document.querySelector("#create-window-1");
window1Button.addEventListener("click", () => {
  window.mainAPI.sendCreateWindow(1);
});

const window2Button = document.querySelector("#create-window-2");
window2Button.addEventListener("click", () => {
  window.mainAPI.sendCreateWindow(2);
});

const logoButton = document.querySelector("#to-logo");
logoButton.on = 0;

logoButton.addEventListener("click", () => {
  if (logoButton.on) {
    window.mainAPI.sendToLogo("off");
    logoButton.on = 0;
    logoButton.classList.remove("check-active");
  } else {
    window.mainAPI.sendToLogo("on");
    logoButton.on = 1;
    logoButton.classList.add("check-active");
  }
});

const blackButton = document.querySelector("#to-black");
blackButton.on = 0;

blackButton.addEventListener("click", () => {
  if (blackButton.on) {
    window.mainAPI.sendToBlack("off");
    blackButton.on = 0;
    blackButton.classList.remove("check-active");
  } else {
    window.mainAPI.sendToBlack("on");
    blackButton.on = 1;
    blackButton.classList.add("check-active");
  }
});

window.mainAPI.onSongAdded((value) => {
  const parsedSong = JSON.parse(value);
  parsedSong.type = "song";
  renderSongList.push(parsedSong);
  drawSongList();
})

window.mainAPI.onImageAdded((value) => {
  renderSongList.push({type: "image", path: value});
  drawSongList();
})


// lightmode toggle
const lightModeButton = document.querySelector("#to-light-mode");
let lightMode = false;

lightModeButton.addEventListener("click", () => {
  if (!lightMode) {
    r.style.setProperty("--tc", "black");
    r.style.setProperty("--c3", "#EDE4E4");
    r.style.setProperty("--c2", "#CDC5C5");
    r.style.setProperty("--c1", "#ADA9A9");
    r.style.setProperty("--c4", "white");

    lightMode = true;

    lightModeButton.classList.add("check-active");
  } else {
    r.style.setProperty("--tc", "white");
    r.style.setProperty("--c1", "#CED4DA");
    r.style.setProperty("--c2", "#6C757D");
    r.style.setProperty("--c3", "#343A40");
    r.style.setProperty("--c4", "#212529");

    lightMode = false;

    lightModeButton.classList.remove("check-active");
  }
})

