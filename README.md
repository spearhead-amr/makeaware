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

## Build and Serve (Gulp)  

Start the local server by running `gulp` in the terminal. It will build the `assets/css/main.css` file from the Stylus files and serve the website locally, usually at `localhost:3000`.  

Every time the Stylus files are changed, the `main.css` is updated, and the page is refreshed. 