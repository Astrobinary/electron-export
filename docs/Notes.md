##Thoughts:
####Main component mount:
Get job location and display basic information
    
####Interface:
Options: R tags, toc header, save location
Buttons: Start/Stop buttons

####Logic
On start: Run command to generate XML from XPP project then pass it to JSON transformer to save in global state. Handlebar reads from state and copies locally to modify and properly template html.

###XML generation command:
`divxml -job -nol -ncrd -wpi -xsh`