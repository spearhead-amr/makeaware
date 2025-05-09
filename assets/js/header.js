// menu

function navSlide() {
    const mobilemenu = document.querySelector(".mobile-menu"); //burger
    const nav = document.querySelector(".nav-links"); //blocco tendina
    const navLinks = document.querySelectorAll(".nav-links li"); //voci menu
  
    //a questo evento associa la funzione
    mobilemenu.addEventListener("click", ()=> {
      //Toggle nav se c'è la classe toglila se non c'è mettila
      nav.classList.toggle("nav-active");
    });
  
  }
  
  navSlide();