***

##Overview:
####Main component mount:
Get job location and display basic information
    
####Interface:
Options: R tags, TOC header, save location, EDGAR shading
Buttons: Start/Stop buttons

####Logic
On start: Run command to generate XML from XPP project then pass it to JSON transformer to save in global state. Handlebar reads from state and copies locally to modify and properly template html.

###XPP XML command:
`divxml -job -nol -ncrd -wpi -xsh`

***

##TODO:

####Text
- Continued header not properly breaking between lines. Something to do with CGT and empty lines (Wabtec F-22)

####Tables
- Take into account shapes (shading) that display negative att.x values.
- Handle EDGAR shading exceptions.
- Generate vertical rules.

####Images
- Export images based on job overview.

####Other
- Properly handle red herring.

***