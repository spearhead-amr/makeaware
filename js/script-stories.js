let stories;  // all the loaded stories as an array

let scroll_character_delay = 10;  // milliseconds, speed of the story text appearing
let story_carousell_interval = 20000; // milliseconds, interval between every story one fully displayed before changing to the next one 


// load the JSON story file when the DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
  fetch("data/stories.json")
      .then(response => response.json())
      .then(data => loadStories(data))  // if successfull loaded, 
      .catch(error => console.error(error));
});


// load the stories
function loadStories (data) {
  console.log("File stories.json loaded!");
  stories = data.stories;
  startStoriesCarousell();  // start the carousell sequence
}


// Parse the story text to extrapolate the indexes of the tags items
// argument: String story to parse
// return: 2D array with indexes of start stop html grouped tags 

function preapreStory(story) {

  let text; // only the text of the String "story"
  let html; // only html part of the String "story"
  let index;  // for loop
  let html_in = false;  // if into the html tag of the current String "story"
  let indexes = []; // array of the index of '<' or '>'
  let indexes_2D = [];  // 2D array with [opening tag start, opening tag stop, closing tag start, closing tag stop]


  let done = false;

  for(let i=0; i<story.length; i++) {

    let char = story[i];

    if(char == '<') {
      html_in = true;
      indexes.push(i);
    }

    if(!html_in) {
      text += char;
    }
    else {
      html += char;
    }

    if(char == '>') {
      indexes.push(i);
      html_in = false;
    }

  }

  for(let i=0; i<indexes.length/4; i++) {

     indexes_2D.push([indexes[i*4], indexes[i*4+1], indexes[i*4+2], indexes[i*4+3]]);
  }

  return indexes_2D;

}

// extra: display the full story without animation
function displayFullStories() {

  let story = document.getElementById("stories-carousell-container");

  for(let i=0; i<stories.length; i++) {
    story.innerHTML += stories[i];
  }

}

// display the text appearing in the HTML
function scrollText(story, indexes_2D) {

  let story_container = document.getElementById('stories-carousell-container');

  story_container.innerHTML = ""; // erase previous story

  let tag_index = 0;  // current html tag of "indexes_2D"

  // load the first tag items
  let opening_tag = story.substring(indexes_2D[tag_index][0], indexes_2D[tag_index][1]+1);  // opening tag <color-...>
  let closing_tag = story.substring(indexes_2D[tag_index][2], indexes_2D[tag_index][3]+1);  // closing tag </color-...>
  let text_tag = story.substring(indexes_2D[tag_index][1]+1, indexes_2D[tag_index][2]); // text inside the tag


  let story_html = "";  // string to store the html to insert in the HTML page

  let index = 0;  // index used to scroll the "story"

  let index_text_tag = 0; // index used to scroll the "text_tag"

  let tag_scroll = "";  // string containing the text inside the tag


  let printNextLetter = function() {

    if(index < story.length) { // scroll the whole "story"

      if(index < indexes_2D[tag_index][0]) {  // not inside a tag

        story_html += story[index]; // add next character

        story_container.innerHTML = story_html; // update the html

        index++;
      }

      else {  // inside a tag


        if(index_text_tag < text_tag.length) {  // scroll the text tag

          tag_scroll += text_tag[index_text_tag];  // add next character of the text tag

          story_container.innerHTML = story_html + opening_tag + tag_scroll + closing_tag;  // update the HTML with the text tag and proper closing tags (<color-...> tag_scroll... </color-...>)

          index_text_tag++;

        }

        else {

          index_text_tag = 0; // reset the index for scrolling the text in the tag

          story_html += opening_tag + tag_scroll + closing_tag; // tag over, add the whole tag to the string storing the html

          tag_scroll = "";  // rest the tag text container
          
          index = indexes_2D[tag_index][3]+1; // update the index to skip the just read tag

          tag_index++;  // update the tag index for the indexes_2D array

          if(tag_index < indexes_2D.length) { // update the tag items with the next tag coming next if still any remaining
            opening_tag = story.substring(indexes_2D[tag_index][0], indexes_2D[tag_index][1]+1);
            closing_tag = story.substring(indexes_2D[tag_index][2], indexes_2D[tag_index][3]+1);
            text_tag = story.substring(indexes_2D[tag_index][1]+1, indexes_2D[tag_index][2]);
          }
        }

      }

    }

    setTimeout(printNextLetter, scroll_character_delay);  // call the function every x milliseconds for the animation

  }

  printNextLetter();  // start the animation


}

function startStoriesCarousell() {

  let current_story = 0;

  let storyCarousell = function() {

    console.log("current_story: " + current_story);

    if(current_story < stories.length) {

      let _indexes_2D = preapreStory(stories[current_story]);

      scrollText(stories[current_story], _indexes_2D);

      current_story++;
    }
    else {
      current_story = 0;  // reset the story
    }

    setTimeout(storyCarousell, story_carousell_interval); // change the function to update the story every x milliseconds
  }

  storyCarousell();

}

