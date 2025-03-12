document.addEventListener('DOMContentLoaded', function() {
    // Function to load HTML from a file and append it to a target element
    function loadComponent(url, target) {
      fetch(url)
        .then(response => response.text())
        .then(html => {
          document.getElementById(target).innerHTML = html;
        })
        .catch(error => console.error('Failed to load and parse text:', error));
    }

    // Load the header
  
    // Load thhe components
    loadComponent('components/header.html', 'page-header');
    loadComponent('components/footer.html', 'page-footer');
    loadComponent('components/head.html', 'page-head');
  });
  