/* --- stories -- */


// containers
let story_carousell = document.getElementById('story-carousell-container');
let story_share = document.getElementById('story-share-container');
let story_form = document.getElementById('story-form-container');
let story_thanks = document.getElementById('story-thanks-container');

// buttons
let button_share = document.getElementById('button-story-share');
let button_write = document.getElementById('button-story-write');
let button_submit = document.getElementById('button-story-submit');
let button_back_to_carousell = document.getElementById('button-back-to-carousell');
let button_back_to_share = document.getElementById('button-back-to-share');
let button_thanks_back_to_carousell = document.getElementById('button-thanks-back-to-carousell');


let current_container = "carousell";  // carousell, story, form, thanks



// visibility function
let changeStoryContainer = function (container) {

  // console.log(container);

  current_container = container;

  switch (container) {
  case 'carousell':
    story_carousell.style.display = "block";
    story_share.style.display = "none";
    story_form.style.display = "none";
    story_thanks.style.display = "none";
    break;
  case 'share':
    story_carousell.style.display = "none";
    story_share.style.display = "block";
    story_form.style.display = "none";
    story_thanks.style.display = "none";
    break;
  case 'form':
    story_carousell.style.display = "none";
    story_share.style.display = "none";
    story_form.style.display = "block";
    story_thanks.style.display = "none";
    break;
  case 'thanks':
    story_carousell.style.display = "none";
    story_share.style.display = "none";
    story_form.style.display = "none";
    story_thanks.style.display = "block";
    break;
  }

}

// form validation in JS

function storyFormValidation(action) {

  const spans = document.querySelector('#story-form').children; // all spans

  let isFilled = true;

  // check for edited values

  spans.forEach(el => {
    if(!el.classList.contains('fixed') && el.dataset.edited != '1') {
      isFilled = false;
      el.classList.add('not-filled');
    }
  })



  if(isFilled) {

    // collect story

    let formHTML = "";

    spans.forEach(el => {

      if(el.classList.contains('fixed')) {
        formHTML += el.innerText;
      }
      else if(el.classList.contains('editable')) {
        formHTML += ' <' + el.dataset.formColor + '>' + el.innerText + '</' + el.dataset.formColor + '> ';
      }

    })

    let formText = document.querySelector('#story-form').innerText;


    //console.log(formText);

    const storyRegExp = /([^a-zA-Z0-9. ()?,’'])/g;

    const isValid = !storyRegExp.test(formText);

    console.log('isValid: ' + isValid);


    if(isValid) {

      // reset form
      spans.forEach(el => {
        if(!el.classList.contains('fixed')) {
          el.innerText = el.dataset.placeholder;
          el.dataset.edited = '0';
          el.classList.remove('edited');
          el.classList.remove('color-grey');
          el.classList.remove('color-red');
          el.classList.remove('color-pink');
        }
      })

      changeStoryContainer(action);
    }

  }

}



// init visibility
changeStoryContainer(current_container);

// add buttons event listener

button_share.addEventListener('click', changeStoryContainer.bind(this, 'share'));
button_write.addEventListener('click', changeStoryContainer.bind(this, 'form'));
button_submit.addEventListener('click', storyFormValidation.bind(this, 'thanks'));
button_back_to_carousell.addEventListener('click', changeStoryContainer.bind(this, 'carousell'));
button_back_to_share.addEventListener('click', changeStoryContainer.bind(this, 'share'));
button_thanks_back_to_carousell.addEventListener('click', changeStoryContainer.bind(this, 'carousell'));



/* ----- form ------ */

document.querySelectorAll('.editable').forEach( el => {

  el.setAttribute('contenteditable', true)
  el.dataset.edited = '0' // el.dataset -> dataset is used to add custom data to an element
  el.dataset.placeholder = el.innerHTML // save the placeholder of every element

  el.addEventListener('keydown', e => {
    const el = e.target   // target is the current edited element @event 'keydown'
    if (el.dataset.edited == '0') { // not edited
        el.dataset.edited = '1' // now edited
        el.classList.add('edited')
        el.classList.add(el.dataset.formColor)
        el.classList.remove('not-filled')
        el.innerHTML = '' // clear current placeholder
    }
  })

  el.addEventListener('keyup', e => { // e => is quivalent to function(e) {}
    const el = e.target
    if (el.dataset.edited == '1') {
      if (el.innerText.length == 0) { // if no letters from the user...
        el.dataset.edited = '0'
        el.classList.remove('edited')
        el.classList.remove(el.dataset.formColor)
        el.innerText = el.dataset.placeholder // set the placeholder back as content
      }
    }
  })


})



/* ----- stories carousell --- */

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

  let story = document.getElementById("stories-carousell");

  for(let i=0; i<stories.length; i++) {
    story.innerHTML += stories[i];
  }

}

// display the text appearing in the HTML
function scrollText(story, indexes_2D) {

  let story_container = document.getElementById('stories-carousell');

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

    if(current_story == stories.length) {
      current_story = 0;  // reset the story
    }

    if(current_story < stories.length) {

      // console.log("current_story: " + current_story);


      let _indexes_2D = preapreStory(stories[current_story]);

      scrollText(stories[current_story], _indexes_2D);

      current_story++;
    }


    setTimeout(storyCarousell, story_carousell_interval); // change the function to update the story every x milliseconds
  }

  storyCarousell();

}
