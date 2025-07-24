// datas

// const storyFields = ["I decided to", "who", "because", "I was feeling", "every time", "I've been told by", "that I was suffering from", "It happened", "for", "The doctor", "to me that", "I started", "Ultimately, the cure", "I started feeling", "I noticed", "So, I tried", "Now", "I am", "Now	I am", "Based in"];

function loadData() {
    fetch('assets/json/stories-collection.json')
        .then(Response => Response.json())
        .then(data => appendData(data))
        .then(filterButtonsAddEventListener())
        .catch(error => console.error('Error: ' + error));
}

function appendData(data) {
    console.log(data)
    let output = "";
    const STORIESLIST = document.getElementById("stories-list");

    let story;
    console.log(data.length);
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
}

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

loadData();