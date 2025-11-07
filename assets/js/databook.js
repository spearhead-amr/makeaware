// datas

// const storyFields = ["I decided to", "who", "because", "I was feeling", "every time", "I've been told by", "that I was suffering from", "It happened", "for", "The doctor", "to me that", "I started", "Ultimately, the cure", "I started feeling", "I noticed", "So, I tried", "Now", "I am", "Now	I am", "Based in"];
const keysList = {
    "antibiotic" : 0,
    "doctor" : 0,
    "feel" : 0,
    "pain" : 0,
    "infection" : 0,
    "time" : 0,
    "treatment" : 0,
    "side effects" : 0,
    "cure" : 0,
    "symptom" : 0,
    "uti" : 0,
    "fever" : 0,
    "skin " : 0,
    "stomach": 0
}

const wordsList = {
    "Consultation": "A meeting with a doctor or advisor to discuss symptoms and care options. In this study, it includes both formal visits and informal advice-seeking.",
    "Diagnosis": "The process of identifying a disease based on symptoms, exams, or tests. Here it also includes patients’ own interpretations and self-diagnosis.",
    "Prevention": "Actions to avoid getting sick, such as daily habits, routines, or medical steps. This study focuses on personal strategies to prevent urinary or intimate infections.",
    "Treatment": "The actions taken to manage or cure illness, from medicines to self-care. In this study, it refers to both prescribed and self-initiated responses to infections.",
    "Biographies": "Personal life stories or backgrounds that shape how people experience and understand illness.",
    "Symptoms": "The physical or emotional signs felt by a person that show something may be wrong with their health.",
    "UTI": "An infection in the bladder, urethra, or kidneys that makes peeing painful or frequent.",
    "Cystitis": "A common UTI that affects the bladder and causes burning when urinating.",
    "Bronchitis": "An infection that irritates the airways in the lungs and causes cough and mucus.",
    "Bronchopneumonia": "A more serious lung infection affecting small areas of the lungs.",
    "Dermatitis": "Skin conditions that cause redness, itching, or rashes.",
    "Eczema": "Skin conditions that cause redness, itching, or rashes.",
    "Sinusitis": "Infection or swelling of the sinuses, often after a cold, causing blocked nose and pain.",
    "Tonsillitis": "Infection of the tonsils in the throat, often causing fever and sore throat.",
    "Streptococcus infection": "Infection of the tonsils in the throat, often causing fever and sore throat.",
    "Mononucleosis": "A viral illness (often called “mono”) that makes you very tired and gives sore throat and fever.",
    "Ulcerative colitis": "A long-lasting disease that causes inflammation and sores in the large intestine.",
    "Borreliosis": "An infection from tick bites that can cause fever, rash, and joint pain.",
    "Appendicitis": "A painful infection of the appendix, a small organ in the belly, usually treated with surgery.",
    "Alluce valgo (Hallux valgus / bunion)": "A bony bump at the base of the big toe that can be painful.",
    "Asthma": "A condition where the airways tighten, making it hard to breathe.",
    "Parainfectious asthma": "Asthma attacks triggered by infections, such as colds.",
    "Polipetti": "Small growths inside the nose that can make breathing harder.",
    "Micropolycystic ovary": "A condition where the ovaries have many small cysts, sometimes causing irregular periods.",
    "Antibiotics": "Medicines that kill bacteria and treat bacterial infections (not viruses).",
    "Amoxicillin": "Types of antibiotics prescribed for specific infections.",
    "Augmentin": "Types of antibiotics prescribed for specific infections.",
    "Lymecycline": "Types of antibiotics prescribed for specific infections.",
    "Chloramphenicol": "Types of antibiotics prescribed for specific infections.",
    "Nitroxoline": "Types of antibiotics prescribed for specific infections.",
    "Fuzolidone": "Types of antibiotics prescribed for specific infections.",
    "Cortisone": "A medicine that reduces swelling and inflammation.",
    "Antifungals": "Medicines that treat infections caused by fungi (like yeast).",
    "Probiotics": "“Good bacteria” taken as food or supplements to help digestion or reduce side effects of antibiotics.",
    "Integrators": "Vitamins or minerals taken to support general health.",
    "Anti baby": "A daily pill taken by women to prevent pregnancy.",
    "Conception pill" : "A daily pill taken by women to prevent pregnancy.",
    "Chemotherapy": "Strong medicines used to treat cancer.",
    "Immune system": "The body's defense system that fights infections.",
    "Antimicrobial resistance": "When germs stop responding to antibiotics or other medicines.",
    "Side effects": "Unwanted problems caused by medicines, like nausea or tiredness."
}

// for code consistency both HTML, CSS and JS (indipedently from the data content), the stories header keys can be adjusted here
const headerStories = {
    "decided": "I decided to",
    "with": "with",
    "because": "because",
    "feeling": "I was feeling",
    "every_time": "every time",
    "told_by": "I've been told by",
    "suffering": "that I was suffering from",
    "happened": "It happened",
    "when": "for",
    "doctor": "The doctor",
    "to_me_that": "to me that",
    "started": "I started",
    "cure": "Ultimately, the cure",
    "started_feeling": "I started feeling",
    "noticed": "I noticed",
    "tried": "So, I tried",
    "now": "Now",
    "gender": "I am",
    "age": "years old",
    "location": "based in"
}

// mapping between story headers and their filter categories
const headerToFilter = {
    "decided": "diagnosis",
    "with": "diagnosis", 
    "because": "symptoms",
    "feeling": "symptoms",
    "every_time": "symptoms",
    "told_by": "diagnosis",
    "suffering": "diagnosis",
    "happened": "diagnosis",
    "when": "diagnosis",
    "doctor": "treatment",
    "to_me_that": "treatment",
    "started": "treatment",
    "cure": "treatment",
    "started_feeling": "follow-up",
    "noticed": "follow-up",
    "tried": "follow-up",
    "now": "follow-up",
    "gender": "demographics",
    "age": "demographics",
    "location": "demographics"
}

function loadData() {
    let originalCleanData; // Store the original clean data
    
    fetch('assets/json/stories-collection.json')
        .then(Response => Response.json())
        .then(data => {
            originalCleanData = cleanData(data);
            return JSON.parse(JSON.stringify(originalCleanData)); // Create a deep copy
        })
        .then(data => {
            return checkWords(data);
        })
        .then(data => {
            return appendData(data);
        })
        .then(data => addKeyCount(data))
        .then(() => {
            return generateTermsLists(originalCleanData); // Use original clean data
        })
        .then(() => filterButtonsAddEventListener())
        .then(() => addWorldButtons())
        .then(() => termsButtonCloseAddEventListener())
        .catch(error => console.error('Error: ' + error));
}

function cleanData(data) {

    for(const story of data) {

        for(let storyKey of Object.keys(story)) {

            // console.log("Before (typeof: " + typeof story[storyKey] + "), key:  " + storyKey);
            // console.log(story[storyKey]);

            if(storyKey != "Based in" && storyKey != "years old") { // escape age (because being a number) and location (first letter Uppercase)
                // check for "I ", "I'" adn "UTI" to leave them uppercase
                if(!(/^(I(\s|')|UTI)/.test(story[storyKey]))) {
                    if(typeof story[storyKey] == 'string') {
                        //console.log("Is String!");
                        story[storyKey] = story[storyKey].charAt(0).toLowerCase() + story[storyKey].slice(1);
                    }
                }
            }
        }

    }
    return data;
}

function appendData(data) {
    //console.log(data)
    let output = "";
    const STORIESLIST = document.getElementById("stories-list");

    let story;
    //console.log(data.length);
    for(let i=0; i<data.length; i++) {
        story = data[i];
        // Format story number with leading zeros
        let formattedNumber;
        if (i < 9) {
            formattedNumber = "00" + (i+1);
        } else if (i < 99) {
            formattedNumber = "0" + (i+1);
        } else {
            formattedNumber = (i+1).toString();
        }
        
        output += `
            <li id="story-no-${i}">
                <h3>#${formattedNumber}</h3>
                <div class="story-container-div">
                    <span data-filter="diagnosis">I decided to <span class="filter-diagnosis">${story[headerStories["decided"]]} ${story[headerStories["with"]]}</span></span> <span data-filter="symptoms">because <span class="filter-symptoms">${story[headerStories["because"]]}</span>.</span>
                    <span data-filter="symptoms">I was feeling <span class="filter-symptoms">${story[headerStories["feeling"]]}</span> every time <span class="filter-symptoms">${story[headerStories["every_time"]]}</span>.</span>
                    <span data-filter="diagnosis">I've been told by <span class="filter-diagnosis">${story[headerStories["told_by"]]}</span> that I was suffering from <span class="filter-diagnosis">${story[headerStories["suffering"]]}</span>.</span>
                    <span data-filter="diagnosis">It happened <span class="filter-diagnosis">${story[headerStories["happened"]]} for ${story[headerStories["when"]]}</span>.</span>
                    <span data-filter="treatment">The doctor <span class="filter-treatment">${story[headerStories["doctor"]]}</span> to me that <span class="filter-treatment">${story[headerStories["to_me_that"]]}</span>.</span> 
                    <span data-filter="treatment">I started <span class="filter-treatment">${story[headerStories["started"]]}</span>.</span>
                    <span data-filter="treatment">Ultimately, the cure <span class="filter-treatment">${story[headerStories["cure"]]}</span>.</span>
                    <span data-filter="follow-up">I started feeling <span class="filter-follow-up">${story[headerStories["started_feeling"]]}</span>.</span>
                    <span data-filter="follow-up">I noticed <span class="filter-follow-up">${story[headerStories["noticed"]]}</span>.</span>
                    <span data-filter="follow-up">So, I tried <span class="filter-follow-up">${story[headerStories["tried"]]}</span>.</span>
                    <span data-filter="follow-up">Now <span class="filter-follow-up">${story[headerStories["now"]]}</span>.</span>
                    <span data-filter="demographics">I am <span class="filter-demographics">${story[headerStories["gender"]]}, ${story[headerStories["age"]]} years old, based in ${story[headerStories["location"]]}</span>.</span>
                </div>
            </li>
        `;
    }

    STORIESLIST.innerHTML = output;

    return data;
}

// Filter buttons
const toggleFilterButton = (button) => {
    const currentFilterElement = document.getElementById("stories-list");
    const buttonFilterName = button.getAttribute('data-filters');

    button.classList.toggle('story-active');
    currentFilterElement.classList.toggle(buttonFilterName);
    

    /* old

    const buttonsList = document.getElementById("stories-filters-container").children;

    for(const b of buttonsList) {
        b.classList.remove('story-active');
    }
    
    if(currentFilterElement.getAttribute('data-current-filter') != button.dataset.filters) {
        currentFilterElement.setAttribute('data-current-filter', button.dataset.filters);
        button.classList.add('story-active');
    }
    else {
        currentFilterElement.setAttribute('data-current-filter', "");
        button.classList.remove('story-active');
    }
    */
}

function filterButtonsAddEventListener() {
    const buttonsList = document.getElementById("stories-filters-container").children;

    for(let i=0; i<buttonsList.length; i++) {
        buttonsList[i].addEventListener('click', toggleFilterButton.bind(this, buttonsList[i]));
    }
}

// Check the presence of wordList and keysList words in the stories and the <span data-word=""></span> or data-key respectively around the word itself
function checkWords(data) {

    // knowledge note: reference to objects points to the original object, so any changes made to the reference will affect the orginal object

    for(const story of data) {

        for(let storyKey of Object.keys(story)) {

            // search for words
            for(const word of Object.entries(wordsList)) {   

                if(String(story[storyKey]).toLowerCase().includes(word[0].toLowerCase())) {
                    const regex = new RegExp(`\\b(${word[0].toLowerCase()})\\b`, 'gi');
                    story[storyKey] = String(story[storyKey]).replace(regex, `$1<span class="glyph" data-word="${String(word[0])}"> (✧)</span>`);
                }
            }

            // search for keys. Search only in the text! NOT in the <sapn>...</span> elements!
            for(const keyKey of Object.keys(keysList)) {
                

                if (String(story[storyKey]).toLowerCase().includes(keyKey.toLowerCase())) {
                    const regex = new RegExp(`\\b(${keyKey})\\b`, 'gi');
                    keysList[keyKey] = (keysList[keyKey] || 0) + 1;
                
                    story[storyKey] = String(story[storyKey])
                        .split(/(<span\b[^>]*>[\s\S]*?<\/span>)/gi) // split by spans
                        .map(part => {
                            if (part.startsWith('<span')) {
                                return part; // leave spans as they are
                            } else {
                                return part.replace(regex, (match) => {
                                    return `${match}<span data-key='${keyKey.toLowerCase()}'></span>`;
                                });
                            }
                        })
                        .join('');
                }
            }            
        }
    }

    // console.log(data);
    // console.log(keysList);

    return data;
}

// add the count to the keys and the button functionality
const toggleKeyButtons = function(button) {

    //console.log(button.getAttribute('data-key'));

    const currentKey = button.getAttribute('data-key');
    
    // remove any class (active) to all the sections
    const sectionsCollection = document.getElementById("terms-collection-container").children;
    for(section of sectionsCollection) {
        section.classList = "";
    }

    // add .active class to the <section id="key"></section> in the terms-collection-container
    document.getElementById(`section-${currentKey}`).classList.add("current-key-active");
    
    toggleTermsButton(true);
}

function addKeyCount(data) {

    let currentKey = "";

    // keys
    const dataKeysElements = document.querySelectorAll('[data-key]');

    for(const element of dataKeysElements) {
        currentKey = element.getAttribute('data-key');
        //element.innerHTML = ` <span class="glyph">[<div class=\"key-counter\">${keysList[currentKey]}</div>]</span>`;
        element.innerHTML = ` <span class="databook-citations">(<span class="number-container"><span class="number-icon">${keysList[currentKey]}</span></span>)</span>`;
    }

    const keyButtons = document.querySelectorAll('[data-key]');

    for(let i=0; i<keyButtons.length; i++) {
        keyButtons[i].addEventListener("click", toggleKeyButtons.bind(this, keyButtons[i]));
    }
}

// add glyps button functionality
const toggleWordButtons = function(button) {
    if(!button.classList.contains("story-active")) {
        // close all the descriptions
        const worldButtons = document.querySelectorAll('[data-word]');
        // console.log(worldButtons);
        for(const b of worldButtons) {
            b.classList.remove("story-active");
            b.innerHTML = ` (✧) `;
        }
        // activate the current description
        const key = button.getAttribute('data-word');
        const description = wordsList[key];
        button.innerHTML = ` (✧ ${description}) `;
        button.classList.add("story-active");
    } else {
        button.innerHTML = ` (✧) `;
        button.classList.remove("story-active");
    }
}

function addWorldButtons() {
    
    const worldButtons = document.querySelectorAll('[data-word]');

    for(let i=0; i<worldButtons.length; i++) {
        worldButtons[i].addEventListener("click", toggleWordButtons.bind(this, worldButtons[i]));
    }
}

// terms container toggle
const toggleTermsButton = function(status) {
    const termsContainer = document.getElementById('terms-container');
    const storiesWrapper = document.getElementById('stories-with-terms-wrapper');
    
    console.log('toggleTermsButton called with status:', status);
    console.log('termsContainer element:', termsContainer);
    console.log('storiesWrapper element:', storiesWrapper);
    
    if(status) {    // true, open
        termsContainer.classList.add("terms-container-active");
        storiesWrapper.classList.add("terms-active");
        console.log('Added classes - termsContainer classes:', termsContainer.className);
        console.log('Added classes - storiesWrapper classes:', storiesWrapper.className);
    }
    else {  // false, close
        termsContainer.classList = "";
        storiesWrapper.classList.remove("terms-active");
        console.log('Removed classes');
    }
}

function termsButtonCloseAddEventListener() {
    const termButtonClose = document.getElementById('terms-close-button');

    termButtonClose.addEventListener("click", toggleTermsButton.bind(this, false));
}

// Function to navigate to a specific story
function navigateToStory(storyIndex) {
    console.log('Navigating to story index:', storyIndex);
    
    // Don't close the terms container - keep it open
    // toggleTermsButton(false);
    
    // Scroll to the specific story immediately
    const targetStory = document.getElementById(`story-no-${storyIndex}`);
    console.log('Target story element:', targetStory);
    
    if (targetStory) {
        console.log('Scrolling to story:', storyIndex);
        
        // Since the story element has display: contents, find the first child element to scroll to
        const storyHeading = targetStory.querySelector('h3');
        const storyContainer = targetStory.querySelector('.story-container-div');
        
        // Try the heading first, then the container
        const elementToScrollTo = storyHeading || storyContainer || targetStory.firstElementChild;
        
        console.log('Element to scroll to:', elementToScrollTo);
        console.log('Element tag name:', elementToScrollTo ? elementToScrollTo.tagName : 'null');
        
        if (elementToScrollTo) {
            // Check dimensions of the actual element we're scrolling to
            const rect = elementToScrollTo.getBoundingClientRect();
            console.log('Target element rect:', {
                top: rect.top,
                bottom: rect.bottom,
                height: rect.height,
                width: rect.width
            });
            
            // Calculate position manually with offset
            const elementRect = elementToScrollTo.getBoundingClientRect();
            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
            
            // Calculate target position: element's absolute position - 100px offset
            const elementAbsolutePosition = elementRect.top + currentScroll;
            const targetScrollPosition = Math.max(0, elementAbsolutePosition - 100);
            
            console.log('Element absolute position:', elementAbsolutePosition);
            console.log('Target scroll position with offset:', targetScrollPosition);
            
            // Scroll to target position with offset
            window.scrollTo({
                top: targetScrollPosition,
                behavior: 'smooth'
            });
            
            setTimeout(() => {
                targetStory.style.transition = 'font-weight 0.5s ease'; // Enable transition
                targetStory.style.fontWeight = 'normal'; // Transition back to normal
            }, 3000);
            
        } else {
            console.error('No child element found to scroll to in story:', storyIndex);
        }
        
    } else {
        console.error('Story element not found for index:', storyIndex);
        // Let's also check if there are any stories at all
        const allStories = document.querySelectorAll('[id^="story-no-"]');
        console.log('Total stories in DOM:', allStories.length);
        console.log('Available story IDs:', Array.from(allStories).map(s => s.id).slice(0, 10));
    }
}


function generateTermsLists(originalData) {

    /* build the object that rapresent all keys with all headers and story parts */

    let termsObject = {};  // object containing all the stories organised by terms and story keys

    for (const key of Object.keys(keysList)) {
        termsObject[key] = {};
        
        originalData.forEach((story, storyIndex) => {

            for (const header of Object.keys(headerStories)) {
                const storyPart = story[headerStories[header]];
                
                if(String(storyPart).toLowerCase().includes(key.toLowerCase())) {
                    if(!termsObject[key][header]) {
                        termsObject[key][header] = []; // create header key if not existing, empty array
                    }
                    // Store both the story part and its index for navigation
                    termsObject[key][header].push({
                        text: storyPart,
                        storyIndex: storyIndex
                    });
                }
            }
        });
    }

    console.log(termsObject);

    /* create the html elements */

    const termsCollectionContainer = document.getElementById("terms-collection-container");

    Object.keys(termsObject).forEach((key) => {
        //console.log(key);
        const keyListElementSection = document.createElement("section");
        keyListElementSection.id=`section-${key}`;
        termsCollectionContainer.appendChild(keyListElementSection);

        Object.keys(termsObject[key]).forEach((header) => {
            //console.log(header);
            
            const headingH3 = document.createElement("h3");
            headingH3.innerHTML = `${headerStories[header].toLowerCase()}`;

            const ulStoryList = document.createElement("ul");
            ulStoryList.id=`ul-${header}`;
            ulStoryList.classList = "terms-ul-key";

            Object.values(termsObject[key][header]).forEach((storyData) => {
                //console.log(storyData);
                const liStory = document.createElement("li");
                const regex = new RegExp(`\\b(${key})\\b`, 'gi');
                
                // Get the filter category for this header to apply the appropriate color class
                const filterCategory = headerToFilter[header];
                const colorClass = filterCategory ? `filter-${filterCategory}` : '';
                
                // Apply color class to the entire li element
                if (colorClass) {
                    liStory.classList.add(colorClass);
                }
                
                // Add click functionality to navigate to the original story
                liStory.style.cursor = 'pointer';
                liStory.addEventListener('click', (event) => {
                    console.log('Clicked on story data:', storyData);
                    event.preventDefault();
                    navigateToStory(storyData.storyIndex);
                });
                
                storyHighlighted = storyData.text.replace(regex, '<span class="current-key">$1</span>');    // add the key highlight
                liStory.innerHTML = storyHighlighted;
                ulStoryList.appendChild(liStory);
            });

            keyListElementSection.appendChild(headingH3);
            keyListElementSection.appendChild(ulStoryList);
        })
    })

    return originalData;
}


// start here
loadData();