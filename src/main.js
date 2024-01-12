const renderSongList = [];

let currentButtonIndex = -1;

const verseList = document.querySelector(".verse-list");


let listItems = document.querySelectorAll(".verse-button");
var currentLI = 0;
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

  verseButton.addEventListener("click", () => {
    
    console.log("hi");
    window.mainAPI.sendDisplayText(contentStr);

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
  for (let sectionName of song.sectionOrder) {
    console.log(song.sections.find( (s) => s.name == sectionName));

    drawSection(song.sections.find( (s) => s.name == sectionName));

  }
  listItems = document.querySelectorAll(".verse-button");
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

const delButton = document.querySelector("#del-song");
delButton.addEventListener("click", () => {
  renderSongList.splice(currentButtonIndex,1);
  drawSongList();
})

const upButton = document.querySelector("#mv-song-up");
upButton.addEventListener("click", () => {
  if (currentButtonIndex > 0) {
    swapElements(renderSongList, currentButtonIndex, (currentButtonIndex - 1) );
    drawSongList();
    currentButtonIndex--;
  }
})

const downButton = document.querySelector("#mv-song-down");
downButton.addEventListener("click", () => {
  if (currentButtonIndex < (renderSongList.length - 1)) {
    swapElements(renderSongList, currentButtonIndex, (currentButtonIndex + 1) );
    currentButtonIndex++;
    drawSongList();
  }
})


function drawSongList() {
  const songList = document.querySelector(".song-list");
  songList.innerHTML = "";

  let i = 0;

  for (let song of renderSongList) {
    drawSongButton(song, i);
    i++;
  }
}


const readSongButton = document.querySelector("#read-song");
readSongButton.addEventListener("click", () => {
  window.mainAPI.sendReadSong();
});

const window1Button = document.querySelector("#create-window-1");
window1Button.addEventListener("click", () => {
  window.mainAPI.sendCreateWindow(1);
});

const window2Button = document.querySelector("#create-window-2");
window2Button.addEventListener("click", () => {
  window.mainAPI.sendCreateWindow(2);
});


window.mainAPI.onSongAdded((value) => {
  const parsedSong = JSON.parse(value);
  renderSongList.push(parsedSong);
  drawSongList();

})
