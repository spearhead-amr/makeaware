// datas

// const storyFields = ["I decided to", "who", "because", "I was feeling", "every time", "I've been told by", "that I was suffering from", "It happened", "for", "The doctor", "to me that", "I started", "Ultimately, the cure", "I started feeling", "I noticed", "So, I tried", "Now", "I am", "Now	I am", "Based in"];
const keysList = {
    "doctor": 0,
    "infection": 0,
    "cystis": 0
}

const wordsList = {
    "uti": "A urinary tract infection (UTI) is an infection in any part of the urinary system. The urinary system includes the kidneys, ureters, bladder and urethra. Most infections involve the lower urinary tract — the bladder and the urethra.",
    "antibiotic": "An antibiotic is a type of antimicrobial substance active against bacteria. It is the most important type of antibacterial agent for fighting bacterial infections, and antibiotic medications are widely used in the treatment and prevention of such infections"
}

function loadData() {
    fetch('assets/json/stories-collection.json')
        .then(Response => Response.json())
        .then(data => {
            return checkWords(data);
        })
        .then(data => {
            return appendData(data);
        })
        .then(data => addKeyCount(data))
        .then(filterButtonsAddEventListener())
        .then(addWorldButtons())
        .catch(error => console.error('Error: ' + error));
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
            <li>
                <h3>#${i}</h3>
                <span data-filter="diagnosis">I decided to <span class="filter-diagnosis">${story["I decided to"]} ${story["who"]}</span></span> <span data-filter="symptoms">because <span class="filter-symptoms">${story["because"]}</span>.</span>
                <span data-filter="symptoms">I was feeling <span class="filter-symptoms">${story["I was feeling"]}</span> every time <span class="filter-symptoms">${story["every time"]}</span>.</span>
                <span data-filter="diagnosis">I've been told by <span class="filter-diagnosis">${story["I've been told by"]}</span> that I was suffering from <span class="filter-diagnosis">${story["that I was suffering from"]}</span>.</span>
                <span data-filter="diagnosis">It happened <span class="filter-diagnosis">${story["It happened"]} for ${story["for"]}</span>.</span>
                <span data-filter="treatment">The doctor <span class="filter-treatment">${story["The doctor"]}</span> to me that <span class="filter-treatment">${story["to me that"]}</span>.</span>
                <span data-filter="treatment">I started <span class="filter-treatment">${story["I started"]}</span>.</span>
                <span data-filter="treatment">Ultimately, the cure <span class="filter-treatment">${story["Ultimately, the cure"]}</span>.</span>
                <span data-filter="follow-up">I started feeling <span class="filter-follow-up">${story["I started feeling"]}</span>.</span>
                <span data-filter="follow-up">I noticed <span class="filter-follow-up">${story["I noticed"]}</span>.</span>
                <span data-filter="follow-up">So, I tried <span class="filter-follow-up">${story["So, I tried"]}</span>.</span>
                <span data-filter="follow-up">Now <span class="filter-follow-up">${story["Now"]}</span>.</span>
                <span data-filter="demographics">I am <span class="filter-demographics">${story["I am"]}, ${story["Years old"]} years old, based in ${story["Based in"]}</span>.</span>
            </li>
        `;
    }

    STORIESLIST.innerHTML = output;

    return data;
}

// Filter buttons
const toggleFilterButton = (button) => {
    const currentFilterElement = document.getElementById("stories-list");
    const buttonsList = document.getElementById("stories-filters-container").children;

    for(const b of buttonsList) {
        b.classList.remove('active');
    }
    
    if(currentFilterElement.getAttribute('data-current-filter') != button.dataset.filters) {
        currentFilterElement.setAttribute('data-current-filter', button.dataset.filters);
        button.classList.add('active');
    }
    else {
        currentFilterElement.setAttribute('data-current-filter', "");
        button.classList.remove('active');
    }
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

                if(String(story[storyKey]).toLowerCase().includes(word[0])) {
                    const regex = new RegExp(`\\b(${word[0]})\\b`, 'gi');
                    story[storyKey] = String(story[storyKey]).replace(regex, `$1<span class="glyph" data-word="${String(word[0]).toLowerCase()}"> (✧)</span>`);
                }
            }

            // search for keys
            for(const keyKey of Object.keys(keysList)) {
                
                if(String(story[storyKey]).toLowerCase().includes(keyKey)) {
                    const regex = new RegExp(`\\b(${keyKey})\\b`, 'gi');
                    keysList[keyKey]++;
                    story[storyKey] = String(story[storyKey]).replace(regex, `$1<span data-key="${String(keyKey).toLowerCase()}"></span>`);
                }
            }   
        }
    }

    // console.log(data);
    // console.log(keysList);

    return data;
}

// add the count to the keys
function addKeyCount(data) {
    // keys
    const dataKeysElements = document.querySelectorAll('[data-key]');

    for(const element of dataKeysElements) {
        const currentKey = element.getAttribute('data-key');
        element.innerHTML = ` <span class="glyph">(<div class=\"key-counter\">${keysList[currentKey]}</div>)</span>`;
    }
}

// add glyps button fucntionality
/*
const toggleWordButtons = function(button) {
    console.log(button.getAttribute('data-word'));
}
*/

function addWorldButtons() {

    /*

    for(let i=0; i<dataWordElements.length; i++) {
        dataWordElements[i].addEventListener("click", toggleWordButtons.bind(this, dataWordElements[i]));
    }
    */
}

// start here
loadData();