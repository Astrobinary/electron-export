## Overview:
#### Main component:
Get job location and display basic information
    
#### Interface:
Options: r tags toogle, TOC header toggle, save location, EDGAR shading toggle
Buttons: Start/Stop, validate links/images

#### Logic
On start: Run command to generate XML from XPP project then pass it to JSON transformer to save in global state. Handlebar reads from state and copies locally to modify and properly template html.

### XPP XML command:
`divxml -job -nol -ncrd -wpi -xsh`

***

## HTML TODO:

#### Text
- Continued header not properly breaking between lines. Something to do with CGT and empty lines (Wabtec F-22)
- Footer not centered (Wabtec F-38)
- Normalize checkbox sizes

#### Tables
- Continued headers breaking issues
- Headers last column does not need ch spacing
- Text indent folio 3 (nc10000790x1_def14a-FILED)
- Table width
- Take into account shapes (shading) that display negative att.x values.
- Handle EDGAR shading exceptions.
- Handle rule exceptions.
- Generate vertical rules.

#### Images
- Export images based on job overview.

#### House Only
- Special regcov rules to ignore vertical spacing.
- Hanging characters on tables. (Noticeable with EDGAR shading)

#### Other
- Properly handle red herring.

***

## Available Scripts
In the project directory, you can run:

#### `npm run dev` or `yarn dev`
Runs the app in the development mode.

#### `npm run build` or `yarn build`
Builds the app for production to the `build` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.
The app is ready to be deployed!

