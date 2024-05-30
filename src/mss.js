// Important classes and stuff 

class Verse {
  constructor() {
    this.lines = [];
  }
}
class Section {
  constructor() {
    this.name = "default name";
    this.verses = [];
  }
}

class Song {
  constructor() {
    this.data = {
      title: "default title",
      author: "default author"
    }
    this.sections = [];
    this.sectionOrder = [];
  }
}

/**
  * For editor (maybe temporary)
  */
class BasicSection {
  constructor() {
    this.name = "default name";
    this.text = ""; // <- only difference
  }
}

class BasicSong {
  constructor() {
    this.data = {
      title: "default title",
      author: "default author"
    }
    this.sections = [];
    this.sectionOrder = [];
  }
}

module.exports = { Song, Section, Verse, BasicSong, BasicSection };
