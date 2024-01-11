
const testDisplay = document.querySelector("#test-display");
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
    window.mainAPI.sendDisplayTest(contentStr);

  });

  verseLi.appendChild(verseButton);

  verseList.appendChild(verseLi);

}

function drawSection(section) {
  const sectionHeading = document.createElement("li");
  sectionHeading.classList.add("section-Heading");
  sectionHeading.innerText = section.name;
  
  verseList.appendChild(sectionHeading);
  
  for (let i of section.verses) {
    drawVerse(i);
  }

}

function drawSong(song) {
  for (let sectionName of song.sectionOrder) {
    console.log(song.sections.find( (s) => s.name == sectionName));

    drawSection(song.sections.find( (s) => s.name == sectionName));

  }
  listItems = document.querySelectorAll(".verse-button");
}


window.mainAPI.onReadyFromMain((value) => {
  testDisplay.innerText = value;
  console.log(value);
});

window.mainAPI.onSongTest((value) => {
  const parsedSong = JSON.parse(value);
  //window.Parser.debugPrintSong(parsedSong);
  drawSong(parsedSong);

})
