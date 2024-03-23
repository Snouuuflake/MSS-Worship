const fs = require("fs");
const Song = require("./mss.js").Song;
const Section = require("./mss.js").Section;
const Verse = require("./mss.js").Verse;



/**
  * @param argLines array of all lines starting with !-
  * argLines should be trimmed because why not
  * @param char is the letter thats being searched for,
  * such as the S in !-S 
  * 
  * @return {value, error}
  * errors inclde no-arg<char> and mult-arg<char>
  */
function readProperty(argLines, char) {
  let output = {
    value: "",
    error: "none",
  }
  
  let filtered = argLines.filter((line) => line[2] == char);

  if (filtered.length == 0) {
    output.error = `File is missing command: !-${char}` ;
  } else if (filtered.length != 1) {
    output.error = `Command !-${char} is defined more than once` ;
  } else {
    output.value = filtered[0].substring(3).trim();
  }

  if (output.value.trim() == "") {
    output.error = `Command: !-${char} has no value`;
  }

  return output;
}

function getParam(argLine) {
  return argLine.substring(3).trim();
}





/** Main parsing function
  * @return {Song, error}
  * */
function parseMSS(multilineStr){

  output = {
    song: new Song(),
    error: "none",
  }

  let lines = multilineStr.split('\n');

  let i = 0;
  for (i = 0; i < lines.length; i++) {
    lines[i] = lines[i].trim()
  }
  

  // reading !-T and !-A

  const argLines = lines.filter((line) => line.substring(0,2) == "!-");
  
  readTitle = readProperty(argLines, "T");
  if (readTitle.error != "none") {
    output.error = readTitle.error;
    return output;
  } else {
    output.song.data.title = readTitle.value;
  }

  readAuthor = readProperty(argLines, "A");
  if (readAuthor.error != "none") {
    output.song.data.author = "None";
  } else {
    output.song.data.author = readAuthor.value;
  }

  // getting sections and verses
  i = 0;
  while (lines[i].substring(0,3) != "!-S") {

    if (i == (lines.length - 1)) {
      output.error = "No section is defined";
      return output;
    }

    i++;

  }

  let currentSect = new Section();
  let currentSectStart = -1;

  let currentVerse = new Verse();

  let lastArgWasR = false;

  const tempNamesList = [];

  while( i < lines.length) {
    
    lineSearchRes = argLines.filter((line) => (lines[i] == line) && (lines[i][2] == "S" || lines[i][2] == "R"));
    console.log(lineSearchRes, lines[i] == "");

    if ((lineSearchRes.length != 0) && (lines[i].substring(0,3) == "!-R")) {

      // if it found a repetition but theres no content between it and the last section definition, throw error
      if (lines.slice(currentSectStart + 1, i).filter((line) => line == "").length == (i - (currentSectStart + 1))) {

        output.error = "Section: " + getParam(lines[currentSectStart]) + " before repeition: " + lines[i] + " is not defined";
        return output;

      }

      // adds a repeat to sectionOrder
      tempNamesList.push( getParam(lines[i]) );
      
      console.log("repeat.", "i:"+i, "name:"+getParam(lines[i]));

      lastArgWasR = true;

    // if it found an arg that is not !-R (it has to be S because of how lineSearchRes is obtained),
    // more than once
    } else if (lineSearchRes.length > 1) {
      
      // if a section is defined twice
      output.error = "Section: " + getParam(lines[i]) + " is defined more than once";
      return output;

      
    // if it finds a section that only appears once
    } else if (lineSearchRes.length == 1) {

      lastArgWasR = false;

      if (currentSectStart == -1) {

        // finds first section 
        currentSect = new Section();
        currentSect.name = getParam(lines[i]);
        
        tempNamesList.push(currentSect.name);

        currentVerse = new Verse();
        
        currentSectStart = i;

      // if theres no content between !-S and the previous one !-S
      } else if (lines.slice(currentSectStart + 1, i).filter((line) => line == "").length == (i - (currentSectStart + 1))) {

        output.error = "Section: " + getParam(lines[i]) + " has no content.";
        return output;

      // if it just found a valid S i think i hope
      } else {

        output.song.sections.push(currentSect);

        currentSect = new Section();
        currentSect.name = getParam(lines[i]);
        tempNamesList.push(currentSect.name);
        currentSectStart = i;

        console.log("i:"+i, "name:"+currentSect.name);

        currentVerse = new Verse();
      }

    // if the last arg was an S (adding verses)
    } else if (!lastArgWasR){

      // the previous while loop makes this ignore any text before a !-S
      
      // if this line is empty
      if (lines[i] == "") {

        // if the previous line is empty or a section declaration
        if (lines[i-1] == "" || (i - 1) == currentSectStart) {
          // do nothing

        // if its going after some text
        } else {
          
          currentSect.verses.push(currentVerse);
          currentVerse = new Verse();

        }
      // if the line is not empty
      } else {
        currentVerse.lines.push(lines[i]);
      }

    // if the last arg was a repeat and this is not an arg
    // basically in !-R A\n hello, hello will be ignored, which is good i think
    } else {
      // do nothing
    }
    

    i++;
  }

  
  // pushing the final section
  output.song.sections.push(currentSect);

  // pushing the list of sections names
  // this must be done at the end.
  output.song.sectionOrder = tempNamesList;

  const definedSectNames = [];
  for (let sect of output.song.sections) {
    definedSectNames.push(sect.name);
  }

  // if it finds a repetition thats not defined as a section
  for (let sectName of output.song.sectionOrder) {
    if (!(definedSectNames.find((name) => name == sectName))) {
      output.error = "Section: " + sectName + " is repeated but not defined";
    }
  }

  // !! return an error if a repeated section is not defined
  return output;

}

/**
  * Reads a text file in MSS format and returns it as a mss.Song object.
  * Currently only reads files in /src 
  */
function readMSS(filename) {

  let output = {
    song: new Song(),
    error: "none",
  }
  
  try {
    const data = fs.readFileSync(filename, 'utf8');

    output = parseMSS(data);

    console.log(output);
    console.log();
    console.log("error: " + output.error);


  } catch (err) {
    output.error = "file_not_found";
    console.log(err);
  }



  return output;
}





// for testing only
function debugPrintVerse(verse) {
  console.log("   " + "Verse:");
  for (let i of verse.lines) {
    console.log("    " + i + "\n")
  }
}
function debugPrintSection(section) {
  console.log("  " + "Section: " + section.name);
  for (let i of section.verses) {
    debugPrintVerse(i);
  }
}
function debugPrintSong(song) {
  console.log("\n");
  console.log("Title: " + song.data.title);
  console.log("Author: " + song.data.author);
  for (let i of song.sectionOrder) {
    debugPrintSection(song.sections.find((s) => s.name == i));
  }
  console.log("song-end");
  console.log("\n");
}





module.exports = {readMSS, debugPrintSong};
