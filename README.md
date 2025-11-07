# Makeaware Official Website  

Using stories and data sharing to empower people in the fight against antimicrobial resistance.  

## Development  

### Branches  

#### main  

It is the official branch that hosts the online website:  
https://github.com/spearhead-amr/makeaware  

#### dev  

Old repo built during the project.  

#### dev-final  

Final and updated version of the repo.  

### Merging Process  

The `dev` or `dev-final` branches, once merged into the `main` branch, will update the website visible at https://github.com/spearhead-amr/makeaware.  

### Dev-final Structure and Organization  

#### assets Folder  

It contains the **CSS**, **fonts**, **JS**, and **Stylus** files.  

#### components Folder  

It contains the partial HTML files like **header.html**, **footer.html**, etc., that are included in other pages.  

#### .html Pages  

The website pages are stored in the root path of the repo and are named after the page title itself. Example: `stories.html` corresponds to the URL `https://github.com/spearhead-amr/makeaware/stories.html`.  

#### Stylus  

Stylus is used to manage the CSS style of the website. The files are in the folder `assets/stylus`. The CSS rules are spread across multiple files for simpler management and maintainability.  

Have a look at the Stylus documentation here: https://stylus-lang.com/  

## Development Environment Setup  

1. Install [Node.js](https://nodejs.org)  
2. Install all the packages listed in `package.json` by running `$ npm install` in the terminal.
3. Install gulp js by running this in the terminal `$ npm install -g gulp-cli`

## Build and Serve (Gulp)  

Start the local server by running `gulp` in the terminal. It will build the `assets/css/main.css` file from the Stylus files and serve the website locally, usually at `localhost:3000`.  

Every time the Stylus files are changed, the `main.css` is updated, and the page is refreshed. 

## Absolute Path for Links
Currently all the assets are absolute for local host for development. When published it has to be changed to the online URL.
Examples main.css files, footer and header HTML files

## Fix before merging
Within this list are included all the fix to perform before the merge of the repo.
### Overall website
- [x] Header menu: text smaller following Figma
- [ ] OPT: Text on multiple columns -> automatise the split to have around 50% on one side and 50% on the other.
- [x] numbers near words: not in the format ⑨ but following the format `<span style="font-size:0.9rem;font-weight:bold;font-family: 'PP Editorial New', serif;display:inline-block;width:1.7em;height:1.7em;border-radius:50%;border:1px solid #000;text-align:center;line-height:1.7em;"><span style="display:inline-block;transform:scale(1,1.2);">193</span></span>`
- [x] Favicon to be changed with transparent background
- [x] ADDED 5/11: Web manifest and theme colors
- [x] ADDED 6/11: external links & downloads all in target blank with the correct formatting
### Homepage
- [x] #home-intro > h2: to be chaned into "Data pills ✤ and workshops ⑨ to raise
awareness on ✧ antibiotic consumption and antimicrobial resistance" following the same visual (border/empty) as the actual
- [x] #home-intro > h1 & h2: not possible to select text
- [x] #home-intro: height to be checked (- number should have a space)
- [x] ADDED 5/11: fix petri animation on mobile and tablet
- [x] project-description: text smaller as Figma
- [x] .descriptive-content > p: text smaller as Figma
- [x] ADDED 5/11: fix header widget-amr heading tag to h3
- [x] h3 (e.g. #widget-amr): text smaller as Figma
- [x] ADDED 5/11: major-fix for animation on the first widget, it was not working on mobile ans Safari
- [x] #widget-amr-abstract: text smaller as Figma
- [ ] #widget-amr-content > img: to be changed as code - carefully for mobile
- [x] #widget-amr-content > p: text smaller as previous (.descriptive-content > p)
- [x] .petri-content-block > p: text smaller as previous (.descriptive-content > p)
- [x] .circle-text > ResistanceBacterium -> Resistance baterium
- [x] .viz-containter: align the space in between rows as Figma (careful to mouse hover) 
- [x] ADDED 5/11: fix on mobile for data and legenda
- [x] footer is not displayed
- [x] ADDED 5/11: widget-petri to check on multiple mobile devices
- [x] ADDED 7/11: widget-petri to be fixed on mobile, scroll goes blank
- [ ] ADDED 7/11: widgets after widget-petri are flickering when scrolling
- [ ] ADDED 7/11: widget-petri on desktop is not starting again after scrolling up
- [x] ADDED 5/11: widget-timeline is a bit fast to see
### Workshop
- [x] #abstract-text > h2: text smaller as Figma (it should be different than project-description) -> font-size: 3rem
- [x] card: it should not be anchor the entire card but only the explore button
- [x] card > explore button: on hover just change cursor
- [x] card > explore button: text smaller as Figma (1.5rem)
- [x] last card with chatbot workshop: remove link and align right the text available soon
### Internal workshop page
- [x] button back to workshops: to be changed with two buttons one on the left with "previous" and one on the right with "next"
- [x] button "previous" "next": text smaller as previous explore button
- [x] ADDED 6/11: styling alignment with figma
- [x] ADDED 6/11: fix protocol for the viz the res workshop - align to the grid
- [x] ADDED 6/11: styling mobile for page (just missing external links - will be done with the following task)
- [x] External link (will be the same for publications): first column year + conference name (OPT.1), second column title + conference short title (without year - OPT.2) + third column authors + fourth column "Read the article" with arrow top-right before read
### Story-collection tool
- [ ] About the tool will go above instructions
- [ ] Instruction/share your story paragraph: title should be on the left side and text on two columns as Figma (check the internal workshop page for reference)
- [ ] About the tool: follow the same logic as intructions
- [ ] Submit your story: background black and foreground white, text smaller as the other buttons
- [ ] Explore the databook: remove the button and anchor the last "databook" word to the databook page.
- [ ] share your story: the input part should not have background but the color should be in foreground (for color references follow the databook)
- [ ] share your story button: instead of receiving an alert into the browser open a new page following the style as Figma
### Databook
- [ ] About the databook / Instructions: follow the same logic as story-collection tool for the instructions about paragraphs
- [ ] Filters: follow the same logic as instructions, title should be on the left, buttons should be smaller
- [ ] numbers near words in the stories: not in the format [9] but following the format `<span style="font-size:0.9rem;font-weight:bold;font-family: 'PP Editorial New', serif;display:inline-block;width:1.7em;height:1.7em;border-radius:50%;border:1px solid #000;text-align:center;line-height:1.7em;"><span style="display:inline-block;transform:scale(1,1.2);">193</span></span>` to mimic the unicode ones and inside parenthesis.
- [ ] onclick on numbers: the modal is opening from the right and stretching the story column, in the story column are only visible the stories with the word selected (filter); we can avoid the number inside the modal and align the title (e.g. I decided to) to the title of the modal (e.g. Same term repeated...); the onclick is also filtering the stories that only contains the term.
- [ ] stories columns: stories should be aligned in two/three columns with the number on the left and text in second place, third column only visible when click on numbers
- [ ] term underlined in the modal: clicking on the term underlined in the modal (e.g. doctor) is sending me to the relative story
### Chatbot
- [ ] check the sources regex function: waiting for a feedback from Gooey
### Publications
- [x] External links (follow the same logic as internal workshop page): publications "Read the article", "Read the chapter", presentation "See more", posts "Read the post", exhibition "See more", others "See more"
### Privacy and DMP page
- [x] Check the style to be aligned with other pages
### Footer
- [x] How to cite and License: titles to be swapped
- [x] License to be changed into CC BY-SA 4.0 anchor to creative commons page (check the guideline)
- [x] ADDED 6/11: styling tablet and mobile
- [ ] ADDED 6/11: OPT > footer homepage not going on top but scrolling with the page