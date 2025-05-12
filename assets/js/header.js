   console.log("ciao")

  setTimeout(navSlide, 2000)

function navSlide() {
    const mobilemenu = document.getElementById("hamburger-menu"); //burger
    const nav = document.querySelector(".nav-links"); //blocco tendina
    //const navLinks = document.querySelectorAll(".nav-links li"); //voci menu
    console.log(mobilemenu)
    //a questo evento associa la funzione
    mobilemenu.addEventListener("click", ()=> {
      //Toggle nav se c'è la classe toglila se non c'è mettila
      nav.classList.toggle("nav-active");
    });
  
  }


function ActivePage() {
  document.addEventListener("DOMContentLoaded", () => {
    const currentPath = window.location.pathname;
    const links = document.querySelectorAll(".nav-links a");

    links.forEach(link => {
      if (link.getAttribute("href") === currentPath) {
        link.classList.add("active-link");
      }
    });
  });
}

ActivePage()