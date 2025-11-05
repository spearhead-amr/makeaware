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

function loadData() {
    fetch('assets/json/stories-collection.json')
        .then(Response => Response.json())
        .then(data => {
            return cleanData(data);
        })
        .then(data => {
            return generateTermsLists(data);
        })
        .then(data => {
            return checkWords(data);
        })
        .then(data => {
            return appendData(data);
        })
        .then(data => addKeyCount(data))
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
    for(let i=data.length-1; i>=0; i--) {
        story = data[i];
        output += `
            <li id="story-no-${i}">
                <h3>#${i}</h3>
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

// Check the presence of wordList and keysList words in the stories and and the <span data-word=""></span> or data-key respectively around the word itself
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
    toggleTermsButton();
}

function addKeyCount(data) {

    // keys
    const dataKeysElements = document.querySelectorAll('[data-key]');

    for(const element of dataKeysElements) {
        const currentKey = element.getAttribute('data-key');
        element.innerHTML = ` <span class="glyph">[<div class=\"key-counter\">${keysList[currentKey]}</div>]</span>`;
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
const toggleTermsButton = function() {
    document.getElementById('terms-container').classList.toggle("terms-container-active");
}

function termsButtonCloseAddEventListener() {
    const termButtonClose = document.getElementById('terms-close');

    termButtonClose.addEventListener("click", toggleTermsButton.bind(this, null));
}


function generateTermsLists(data) {

    /* build the object that rapresent all keys with all headers and story parts */

    let termsObject = {};  // object containing all the stories organised by terms and story keys

    for (const key of Object.keys(keysList)) {
        termsObject[key] = {};
        
        data.forEach((story) => {

            for (const header of Object.keys(headerStories)) {
                const storyPart = story[headerStories[header]];
                
                if(String(storyPart).toLowerCase().includes(key.toLowerCase())) {
                    if(!termsObject[key][header]) {
                        termsObject[key][header] = []; // create header key if not existing, empty array
                    }
                    termsObject[key][header].push(storyPart); // add to the array the current story part
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
        keyListElementSection.id=`${key}`;
        termsCollectionContainer.appendChild(keyListElementSection);

        Object.keys(termsObject[key]).forEach((header) => {
            //console.log(header);
            const headerDiv = document.createElement("div");
            headerDiv.id = `div-${header}`;
            headerDiv.innerHTML = `
                <h3>${headerStories[header]}</h3>
            `;

            const ulStoryList = document.createElement("ul");
            ulStoryList.id=`ul-${header}`;

            Object.values(termsObject[key][header]).forEach((story) => {
                //console.log(story);
                const liStory = document.createElement("li");
                const regex = new RegExp(`\\b(${key})\\b`, 'gi');
                storyHighlighted = story.replace(regex, '<span class="current-key">$1</span>');    // add the world hightlight
                liStory.innerHTML = storyHighlighted;
                ulStoryList.appendChild(liStory);
            });

            headerDiv.appendChild(ulStoryList);
            keyListElementSection.appendChild(headerDiv);
        })
    })



    return data;
}


// start here
loadData();