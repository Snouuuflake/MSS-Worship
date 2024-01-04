# MSS Worship lyric format tutorial

The MSS format is a custom format for storing song data and lyrics, designed to be simple to type and easy to improve on in the future.

For ease of editing and transfer, MSS Worship will read any .txt file and .mss file, both of which are utf-8 plain text files.

## Commands
The format features only four commands, each beginning with "!-". They are as follows:

Command | Function
--- | --- 
!-T \<Title\> | Sets the title of the song
!-A \<Author\> | Sets the author of the song
!-S \<Section name\> | Begins a section, such as Verse 1, Chorus, etc.
!-R \<Section name\>  | Repeats a section 

## A section-based format
The format is parsed into a song object that contains an array of section objects, that each contain an array of verse objects, each of which contain an array of strings; lines of text. This means that no text can exist outside a section, and any such text will be ignored by the parser.

Each section represents a part of the song such as "chorus", "verse "1", "bridge", etc., and each of their verses is a block of text that will be displayed together. Verses inside of a section are separated by an empty line.

## Writing a song in the MSS format
Each song must contain a title and author before any section occurs. If these are not included, the parser will return an error, and if they are not at the beginning of the file, the song may be parsed incorrectly.

```
!-T Our God
!-A Chris Tomlin
```

Afterwards, sections containing lyrics must be defined.

```
!-S Verse 1
Water You turned into wine
Opened the eyes of the blind

There's no one like you
None like you

Into the darkness You shine
Out of the ashes we rise

There's No one like you
None like you
```

Sections may be repeated at any point in the file, even before they are defined, but they must, at some point, be defined.

```
!-R Chorus

!-R Bridge
```
This will make the program show the chorus and then the bridge in full again to the user, as if the lyrics were written in full at that point in the file.

## An example file
```
!-T Our God   
!-A Chris Tomlin

!-S Verse 1
Water You turned into wine
Opened the eyes of the blind

There's no one like you
None like you

Into the darkness You shine
Out of the ashes we rise

There's No one like you
None like you

!-S Chorus
Our God is greater, our God is stronger
God You are higher than any other

Our God is Healer, awesome in power
Our God, Our God

!-S Verse 2
Into the darkness you shining
Out of the ashes we Rise

No one like you
None like you

!-R Chorus

!-S Bridge
And if Our God is for us, then who could ever stop us?
And if our God is with us, then what can stand against?

And if Our God is for us, then who could ever stop us?
And if our God is with us, then what can stand against?

Then what can stand against?

!-R Chorus

!-R Bridge
```
