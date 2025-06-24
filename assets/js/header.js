function navSlide() {
    const mobilemenu = document.getElementById("hamburger-menu"); // burger menu
    const nav = document.querySelector(".nav-links"); // dropdown block
    //const navLinks = document.querySelectorAll(".nav-links li"); // menu items
    //console.log(mobilemenu)
    // associate the function to this event
    mobilemenu.addEventListener("click", ()=> {
      // Toggle nav: if the class exists remove it, if it doesn't exist add it
      nav.classList.toggle("nav-active");
    });
  
  }

  navSlide()


function checkActivePage() {
  //console.log("checkActivePage function called");
  
  // Map of main section IDs and corresponding nav link IDs
  const sectionMap = {
    'main-home': 'nav-home',
    'main-workshops': 'nav-workshops', 
    'main-workshop': 'nav-workshops', 
    'main-stories-collection': 'nav-stories-collection',
    'main-databook': 'nav-databook',
    'main-publications': 'nav-publications'
  };

  // Get the ul with all navigation links
  const navList = document.getElementById('main-nav-links');
  //console.log("navList found:", navList);
  
  if (!navList) {
    //console.log("navList not found, exiting");
    return;
  }

  // Remove active-link class from all li elements first
  const allNavItems = navList.querySelectorAll('li');
  //console.log("Found nav items:", allNavItems.length);
  allNavItems.forEach(li => {
    li.classList.remove('active-link');
  });

  // Check which main section exists in the current page
  for (const [sectionId, navId] of Object.entries(sectionMap)) {
    //console.log(`Checking for section: ${sectionId}`);
    const sectionElement = document.getElementById(sectionId);
    //console.log(`Found ${sectionId}:`, sectionElement);
    
    // If the section with this ID exists, activate the corresponding nav item
    if (sectionElement) {
      //console.log(`Found section ${sectionId}, activating ${navId}`);
      const activeNavItem = document.getElementById(navId);
      //console.log(`Found nav item ${navId}:`, activeNavItem);
      
      if (activeNavItem) {
        // Add active-link class to the <li> element
        activeNavItem.classList.add('active-link');
        //console.log(`Added active-link class to li ${navId}`);
      }
      break; // Exit loop once we find the active section
    }
  }
}

// Multiple ways to ensure the function runs
// document.addEventListener('DOMContentLoaded', checkActivePage);

// Also try after a small delay in case header is loaded dynamically
setTimeout(checkActivePage, 100);

// And also call when window is fully loaded
window.addEventListener('load', checkActivePage);