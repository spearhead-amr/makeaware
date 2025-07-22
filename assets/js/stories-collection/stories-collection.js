// datas

// const storyFields = ["I decided to", "who", "because", "I was feeling", "every time", "I've been told by", "that I was suffering from", "It happened", "for", "The doctor", "to me that", "I started", "Ultimately, the cure", "I started feeling", "I noticed", "So, I tried", "Now", "I am", "Now	I am", "Based in"];

function loadData() {
    fetch('assets/json/stories-collection.json')
        .then(Response => Response.json())
        .then(data => appendData(data))
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
                I decided to ${story["I decided to"]} - ${story["who"]} 
                because ${story["because"]}. I was feeling ${story["I was feeling"]} 
                every time ${story["every time"]}. I've been told by ${story["I've been told by"]} 
                that I was suffering from ${story["that I was suffering from"]}. It happened ${story["It happened"]} 
                for ${story["for"]}. The doctor ${story["The doctor"]} to me that ${story["to me that"]}. I started ${story["I started"]}.
                Ultimately, the cure ${story["Ultimately, the cure"]}. I started feeling ${story["I started feeling"]}. I noticed ${story["I noticed"]}.
                So, I tried ${story["So, I tried"]}. Now ${story["Now"]}. I am ${story["I am"]}, ${story["Years old"]} years old, 
                based in ${story["Based in"]}.
            </li>
        `;
    }

    //console.log(output);

    STORIESLIST.innerHTML = output;
}


loadData();