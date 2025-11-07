/* --- stories -- */


// containers
let story_form = document.getElementById('story-form-container');

// buttons
// let button_share = document.getElementById('button-story-share');
// let button_write = document.getElementById('button-story-write');
let button_submit = document.getElementById('button-story-submit');
// let button_back_to_carousell = document.getElementById('button-back-to-carousell');
// let button_back_to_share = document.getElementById('button-back-to-share');
let button_thanks_back_to_carousell = document.getElementById('button-thanks-back-to-carousell');


// button submit action
button_submit.addEventListener('click', storyFormValidation.bind(this, 'thanks'));


// form validation in JS
function storyFormValidation(action) {

  //action.preventDefault();

  const spans = document.querySelector('#story-form').children; // all spans

  let isFilled = true;
  let filledCount = 0;

  // check for edited values

  Array.from(spans).forEach(el => {
    if(!el.classList.contains('fixed') && el.dataset.edited != '1') {
      isFilled = false;
      filledCount++;
      el.classList.add('not-filled');
    }
  })

  // console.log('filledCount: ' + filledCount); 



  //if(isFilled) {
  if(filledCount < 14) {  // don't check if full filled, allow for not complete

    // collect story

    let formHTML = "";
    let formHTML_b = "";

    Array.from(spans).forEach(el => {

      if(el.classList.contains('fixed')) {
        formHTML += '<b>' + el.innerText + '</b>';
        formHTML_b += '<b>' + el.innerText + '</b><br>';
      }
      else if(el.classList.contains('editable')) {
        formHTML += ' <' + el.dataset.formColor + '>' + el.innerText + '</' + el.dataset.formColor + '> ';
        formHTML_b += el.innerText.normalize("NFC") + '<br>';   // in theory normalize will fix the UTF8 problem
      }

    })

    //console.log(formHTML);

    let formText = document.querySelector('#story-form').innerText;


    //console.log(formText);
    
    //Tolte per far entrare le storie al lancio instagram
    //const storyRegExp = /([^a-zA-ZÀ-ÖØ-öø-ÿ0-9.\s()?,’'&%/])/g;
    //const isValid = !storyRegExp.test(formText);

    const isValid = true;

    //console.log('isValid: ' + isValid);


    if(isValid) {

      // send form

      sendData(formHTML, formHTML_b);


      // reset form
      Array.from(spans).forEach(el => {
        if(!el.classList.contains('fixed')) {
          el.innerText = el.dataset.placeholder;
          el.dataset.edited = '0';
          el.classList.remove('edited');
          el.classList.remove('color-grey');
          el.classList.remove('color-red');
          el.classList.remove('color-pink');
        }
      })

      //alert('Thank you! The form has been successfully collected.');
      window.location.href = "story-sent.html";

    }

    else {
      // console.log('Data not valid!');
      alert('Some of the text is not valid. Please use only letters, numbers and round brackets');
    }

  }
  else {
    alert('Some fileds are empty. Please fill them in order to submit the form.');
  }

}

// send data for email sending
function sendData(formHTML, formHTML_b) {

  const XHR = new XMLHttpRequest();
  const FD = new FormData();

  FD.append('formHTML', formHTML);
  FD.append('formText', formHTML_b);
  FD.append('key', 'JHZFUZIfugkju587hoo998=)86frhvhjk)uzihfuz');
  
  // Define what happens on successful data submission
  XHR.addEventListener('load', (event) => {
    // console.log("Data sent and response loaded!");
  });

  // Define what happens in case of an error
  XHR.addEventListener("error", (event) => {
    // console.log("Oops! Something went wrong.");
  });

  // Set up our request
  XHR.open("POST", "https://marcolurati.ch/extra/api_ml.php");

  // Send our FormData object; HTTP headers are set automatically
  XHR.send(FD);

}


/* ----- form ------ */

document.querySelectorAll('.editable').forEach( el => {

  el.setAttribute('contenteditable', true)
  el.dataset.edited = '0' // el.dataset -> dataset is used to add custom data to an element
  el.dataset.placeholder = el.innerHTML // save the placeholder of every element

  el.addEventListener('keydown', e => {

    if (e.which === 13) {   // don't allow the 'enter' key
        e.preventDefault();
    } else {

      const el = e.target   // target is the current edited element @event 'keydown'

    
      if (el.dataset.edited == '0') { // not edited
          el.dataset.edited = '1' // now edited
          el.classList.add('edited')
          el.classList.add(el.dataset.formColor)
          el.classList.remove('not-filled')
          el.innerHTML = '' // clear current placeholder
      }
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