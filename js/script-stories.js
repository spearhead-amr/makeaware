let stories;

document.addEventListener("DOMContentLoaded", function() {
  fetch("data/stories.json")
      .then(response => response.json())
      .then(data => loadStories(data))
      .catch(error => console.error(error));
});

function loadStories (data) {
  console.log("File stories.json loaded!");
  stories = data.stories;
  displayStoriesCarousell();
}


function typeWriteStories(text) {

  let index = 0;  
  let color_tag_open = false;
  let tag_length = 0;

  var printNextLetter = function() {

    if(index < text.length) {
      let story = document.getElementById("stories-carousell-container");
      let CHAR = text[index];

      let CHAR_temp;
      

      if(CHAR == '<') { // color tag opening
        color_tag_open = true;
        tag_length++;

        while(CHAR_temp != '>') {
          tag_length++;
          index++;
          CHAR_temp = text[index];
          CHAR += CHAR_temp;
        }

        index++;
        CHAR += text[index];  // add first letter inside the color tag
        story.innerHTML += CHAR;
      }

      if(color_tag_open) {
        story.innerHTML[index - (tag_length+1)] += CHAR;
      }
      else {
        story.innerHTML += CHAR;
      }
      
    }

    index++;

    setTimeout(printNextLetter, 10);
  }

  printNextLetter();


}

function displayFullStories() {

  let story = document.getElementById("stories-carousell-container");

  for(let i=0; i<stories.length; i++) {
    story.innerHTML += stories[i];
  }

}

function displayStoriesCarousell() {

  displayFullStories();

  //typeWriteStories(stories[0]);

}

