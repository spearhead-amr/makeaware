// Enhanced function to load HTML and execute scripts
function loadComponent(url, targetId) {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then(response => response.text())
      .then(html => {
        const target = document.getElementById(targetId);
        if (!target) return;

        // Temporarily inject HTML so we can find scripts
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // Move all non-script content into the target
        // Special handling for head element - preserve existing critical content
        if (targetId === 'page-head') {
          // Preserve existing title and stylesheet links
          const existingTitle = target.querySelector('title');
          const existingStylesheets = target.querySelectorAll('link[rel="stylesheet"]');
          const existingScripts = target.querySelectorAll('script');
          
          target.innerHTML = '';
          
          // Re-add preserved elements first
          if (existingTitle) target.appendChild(existingTitle);
          existingStylesheets.forEach(link => target.appendChild(link));
          existingScripts.forEach(script => target.appendChild(script));
        } else {
          target.innerHTML = '';
        }
        
        Array.from(tempDiv.childNodes).forEach(node => {
          if (node.tagName !== 'SCRIPT') {
            target.appendChild(node.cloneNode(true));
          }
        });

        // Re-inject scripts so they run
        const scripts = tempDiv.querySelectorAll('script');
        scripts.forEach(oldScript => {
          const newScript = document.createElement('script');
          if (oldScript.src) {
            newScript.src = oldScript.src;
            newScript.async = false; // preserve order
          } else {
            newScript.textContent = oldScript.textContent;
          }
          document.body.appendChild(newScript); // or target.appendChild if you prefer
        });
      })
      .then(() => {
        resolve();
      })
      .catch(error => console.error('Failed to load component:', error));
  })
}

function loadJavaScript(src, onload) {
  return new Promise((resolve, reject) => {
    let script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.defer = false;
    document.head.appendChild(script);
    resolve();
  })
}

document.addEventListener('DOMContentLoaded', function() {
// header, footer loading on all the pages
loadComponent('components/head.html', 'page-head')
  .then(() => loadComponent('components/header.html', 'page-header'))
  .then(() => loadJavaScript('assets/js/header.js'))
  .then(() => loadComponent('components/footer.html', 'page-footer'))
  
  .then(() => {
    // load specific content per page
    if(document.getElementById('main-home') != null) {
      loadJavaScript('assets/js/widgets/widget-overlay.js')
        .then(() => loadComponent('components/widgets/widget-petri.html', 'widget-petri'))
        .then(() => loadComponent('components/widgets/widget-world-viz.html', 'widget-world-viz'))
        .then(() => loadComponent('components/widgets/widget-swiss-viz.html', 'widget-swiss-viz'))
        .then(() => loadComponent('components/widgets/widget-death-viz.html', 'widget-death-viz'))
        .then(() => loadComponent('components/widgets/widget-timeline-viz.html', 'widget-timeline-viz'))
        //.then(() => loadJavaScript('assets/js/widgets/widget-world.js'))
        //.then(() => loadJavaScript('assets/js/widgets/widget-death.js'))
        //.then(() => loadJavaScript('assets/js/widgets/widget-petri.js'))
        //.then(() => loadJavaScript('assets/js/widgets/widget-swiss.js'))
        //.then(() => loadJavaScript('assets/js/widgets/widget-timeline.js'))
        .then(() => loadJavaScript('assets/js/widgets/legenda-popup.js'))
    }
    else if (document.getElementById('main-chatbot') != null) {
      loadJavaScript('assets/js/chatbot.js');
    }
    else if (document.getElementById('main-workshops') != null) {
      /* loadJavaScript('assets/js/workshops.js'); */
      loadComponent('components/workshops/workshops-cards.html', 'workshops-cards')
    }
  });
});
