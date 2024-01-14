# Current Build Features
MSS Worship 0.1.0 is public! This version features reading and displaying MSS files, automatic font size adjustment, overlaying a logo / black screen to hide what is currently being projected, along with two differently-styled windows.

To learn how to write lyrics in MSS format with any plain text editor, or how to style lyrics / change the logo image, check out this repository's wiki, soon to be expanded an translated to spanish.

### Note: Due to the fact that this version was somewhat-rushed into having an installer, the installer is one-click, with no options, (installs in \Users\<USER>\AppData\Local\Programs), and has asar:false in the electron-builder options. This is all bound to change in releases in the near future. An installer for MacOS and Linux is also planned in the near future, once the software is in a more robust state.


# MSS-Worship
An open-source Electron app for displaying song lyrics, images, and more, designed with worship in mind.

## Backstory
This project was born out of the need for projecting the lyrics to worship songs, along with images, verses, and other media, both with very large font, to be projected on a stage, and as captions for livestreamed services. Originally, the solution was to run a presentation software on two computers simultaneously, one for each use case, but due to a shortage of voulenteer staff, this proved difficult. 

Thus, the project was started with the following objectives in mind, named after the church where the idea was concieved.

## Initial Project Goals
- Loading song lyrics and data (title and author) from a simple, plain-text format
- Saving and sharing set lists in a way that individuallly manages and resolves missing files
- Projecting lyrics and images to between one and two windows simultaneously, each with individual styling
- Allowing the user to set the HTML class of each element of a set list in the GUI, allowing for
  the user to customize the styling of each class, and add custom styling
- Implementation of api.bible

## Longer-term Goals
- Support for more than two projection windows
- Integrated Bible translations, without the need for an internet connection
- #### Making the best and most flexible open source lyric presentation software on the internet

## Contributing to the project
#### I am by all means not an experienced programmer, but I plan to continually improve this app for years to come.
#### Any and all contributions to this project are much appreciated!
