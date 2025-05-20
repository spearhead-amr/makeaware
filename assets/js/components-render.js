document.addEventListener('DOMContentLoaded', function() {
  // Enhanced function to load HTML and execute scripts
  function loadComponent(url, targetId) {
    fetch(url)
      .then(response => response.text())
      .then(html => {
        const target = document.getElementById(targetId);
        if (!target) return;

        // Temporarily inject HTML so we can find scripts
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // Move all non-script content into the target
        target.innerHTML = '';
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
      .catch(error => console.error('Failed to load component:', error));
  }

  // Load components html structure
  loadComponent('components/header.html', 'page-header');
  loadComponent('components/head.html', 'page-head');
  loadComponent('components/footer.html', 'page-footer');

  // Load only on the homepage (widgets)
  if(document.getElementById('main-home') != null) {
    loadComponent('components/widgets/widget-petri.html', 'widget-petri');
    loadComponent('components/widgets/widget-world.html', 'widget-world');
  }

  /*
  if(document.getElementById('main-workshops') != null) {
    loadComponent('components/workshops-card.html', 'workshops-card');
  }
  */

});
