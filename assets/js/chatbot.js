var animationBigLogo = true;

//Chatbot description animation
(function() {
  const container = document.querySelector('#description-rect-content');
  if (!container) return;
  const paragraphs = Array.from(container.querySelectorAll('p'));
  if (paragraphs.length === 0) return;

  let index = paragraphs.findIndex(p => p.classList.contains('active'));
  if (index < 0) index = 0;

  function show(i) {
    const current = paragraphs[index];
    const nextP = paragraphs[i];
    if (!current || !nextP || current === nextP) return;

    const startHeight = container.offsetHeight;
    nextP.classList.add('active');
    nextP.classList.remove('hidden');
    nextP.style.opacity = '0';
    nextP.style.transform = 'translateY(8px)';
    const endHeight = nextP.offsetHeight + parseFloat(getComputedStyle(container).paddingTop) + parseFloat(getComputedStyle(container).paddingBottom);

    container.style.height = startHeight + 'px';
    requestAnimationFrame(() => {
      container.style.height = endHeight + 'px';
    });

    current.classList.remove('active');
    current.classList.add('hidden');
    nextP.style.opacity = '';
    nextP.style.transform = '';

    container.addEventListener('transitionend', function onEnd(e) {
      if (e.propertyName !== 'height') return;
      container.removeEventListener('transitionend', onEnd);
      container.style.height = '';
    });

    index = i;
  }

  function next() {
    const nextIndex = (index + 1) % paragraphs.length;
    show(nextIndex);
  }

  const initialHeight = paragraphs[index].offsetHeight + parseFloat(getComputedStyle(container).paddingTop) + parseFloat(getComputedStyle(container).paddingBottom);
  container.style.height = initialHeight + 'px';
  requestAnimationFrame(() => { container.style.height = ''; });

  const intervalMs = 7500;
  setInterval(next, intervalMs);
})();

// Big chatbot logo animation
(function() {
  if (!animationBigLogo) return;
  const icon = document.querySelector('#chatbot-logo-icon');
  if (!icon) return;

  function randPercent(min, max) {
    return Math.round(min + Math.random() * (max - min));
  }

  function moveIconRandomly() {
    const topP = randPercent(10, 50);
    const leftP = randPercent(10, 50);
    icon.style.top = topP + '%';
    icon.style.left = leftP + '%';
  }

  moveIconRandomly();
  const intervalMs = 2500;
  window.bigLogoAnimationInterval = setInterval(moveIconRandomly, intervalMs);
})();

// Mini chatbot logo animation - controlled by chat state
(function() {
    let animationInterval = null;
    
    function randPercent(min, max) {
      return Math.round(min + Math.random() * (max - min));
    }
  
    function moveIconRandomly() {
      // Find all mini logo icons and select the last one (most recent)
      const allIcons = document.querySelectorAll('[id^="chatbot-minilogo-icon-"]');
      if (allIcons.length === 0) return;
      const iconMini = allIcons[allIcons.length - 1];
      
      const topP = randPercent(10, 50);
      const leftP = randPercent(10, 50);
      iconMini.style.top = topP + '%';
      iconMini.style.left = leftP + '%';
    }
    
    // Global functions to control animation
    window.startMiniLogoAnimation = function() {
      if (animationInterval) return; // Already running
      
      moveIconRandomly(); // Move immediately
      const intervalMs = 800;
      animationInterval = setInterval(moveIconRandomly, intervalMs);
    };
    
    window.stopMiniLogoAnimation = function() {
      if (animationInterval) {
        clearInterval(animationInterval);
        animationInterval = null;
      }
    };
  })();

//Footer interaction
(function() {
  const trigger = document.getElementById('project-info');
  const footer = document.getElementById('page-footer');
  const closeFooter = document.getElementById('close-footer');
  if (!trigger || !footer || !closeFooter) return;

  trigger.addEventListener('click', function() {
    footer.classList.add('active');
    closeFooter.classList.remove('hidden');
    closeFooter.classList.add('active');
  });

  closeFooter.addEventListener('click', function() {
    footer.classList.remove('active');
    closeFooter.classList.remove('active');
    closeFooter.classList.add('hidden');
  });
})();

//Sending chat interaction
(function() {
    let messageCounter = 0;
    animationBigLogo = false;
    const sendBtn = document.getElementById('sendBtn');
    const userInput = document.getElementById('userInput');
    const chatbotDescription = document.getElementById('chatbot-description');
    const chatbotTitle = document.getElementById('chatbot-title');
    const newChatBtn = document.getElementById('new-chat');
    const chatbotLogo = document.getElementById('chatbot-logo-outer');
    const chatHistory = document.getElementById('chat-history');
    const clearBtn = document.getElementById('clearStorageBtn');

    // Load cached history
    let history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    
    // Load existing messages from history on page load
    history.forEach(addMessageToDOM);

    // If there is history, reveal chat UI states and scroll to bottom
    if (history.length > 0) {
      // Stop big logo animation
      if (window.bigLogoAnimationInterval) {
        clearInterval(window.bigLogoAnimationInterval);
        window.bigLogoAnimationInterval = null;
      }
      
      // Reveal chat UI states
      if (chatbotDescription) chatbotDescription.style.display = 'none';
      if (chatbotTitle) chatbotTitle.classList.add('hidden');
      if (newChatBtn) newChatBtn.classList.remove('hidden');
      if (chatbotLogo) {
        chatbotLogo.classList.remove('chatbot-logo-big');
        chatbotLogo.classList.add('chatbot-logo-small');
      }
      if (chatHistory) chatHistory.classList.remove('hidden');

      // Scroll to the bottom to show the most recent message
      scrollToNewestMessage();
    }

    function addMessageToDOM(msg) {
      messageCounter++;
      const msgDiv = document.createElement('div');
      msgDiv.id = 'msg-' + messageCounter;

      const userContent = document.createElement('div');
      userContent.className = 'user-content';
      const youP = document.createElement('p');
      youP.className = 'msg-light';
      youP.textContent = 'you:';
      const userTextP = document.createElement('p');
      userTextP.className = 'msg-bold';
      userTextP.textContent = msg.user;
      userContent.appendChild(youP);
      userContent.appendChild(userTextP);

      const assistantInfo = document.createElement('div');
      assistantInfo.className = 'assistant-info';
      const miniLogo = document.createElement('div');
      miniLogo.id = 'chatbot-mini-logo';
      miniLogo.innerHTML = '<div id="chatbot-logo-outer" class="chatbot-logo-mini"><div id="chatbot-logo-background"><div class="chatbot-minilogo-icon" id="chatbot-minilogo-icon-' + messageCounter + '"></div></div></div>';
      const writtenInfo = document.createElement('div');
      writtenInfo.className = 'written-info';
      const nameP = document.createElement('p');
      nameP.className = 'msg-light';
      nameP.textContent = 'Chattyware';
      const metaP = document.createElement('p');
      metaP.className = 'msg-light';
      
      // Set response time if available
      if (typeof msg.responseTimeMs === 'number') {
        const seconds = (msg.responseTimeMs / 1000);
        const rounded = seconds < 10 ? seconds.toFixed(1) : Math.round(seconds).toString();
        const label = msg.content && msg.content.startsWith('Error:') ? 'ragionato per' : 'ragionato per';
        metaP.innerHTML = '<span class="assistant-time">' + label + ': ' + rounded + 's; modello: Gemini</span>';
      } else {
        metaP.innerHTML = '<span class="assistant-time">...</span>';
      }
      
      writtenInfo.appendChild(nameP);
      writtenInfo.appendChild(metaP);
      assistantInfo.appendChild(miniLogo);
      assistantInfo.appendChild(writtenInfo);

      const assistantContent = document.createElement('div');
      assistantContent.className = 'assistant-content';
      const assistantMessage = document.createElement('div');
      assistantMessage.className = 'assistant-message';
      const assistantResponseP = document.createElement('p');
      assistantResponseP.className = 'msg-bold assistant-response';
      assistantResponseP.textContent = msg.content || '';
      assistantMessage.appendChild(assistantResponseP);
      const assistantCitations = document.createElement('div');
      assistantCitations.className = 'assistant-citations';

      // Build citations from saved history
      if (msg.citations) {
        if (msg.citations.primary_citation && msg.citations.primary_citation.length) {
          const titleP = document.createElement('p');
          titleP.textContent = 'Primary sources:';
          assistantCitations.appendChild(titleP);
          const primaryP = document.createElement('p');
          primaryP.className = 'primary-sources';
          primaryP.innerHTML = msg.citations.primary_citation.map(c => c).join('<br>');
          assistantCitations.appendChild(primaryP);
        }
        if (msg.citations.secondary_citation && msg.citations.secondary_citation.length) {
          const titleP2 = document.createElement('p');
          titleP2.textContent = 'Secondary sources:';
          assistantCitations.appendChild(titleP2);
          const secondaryP = document.createElement('p');
          secondaryP.className = 'secondary-sources';
          secondaryP.innerHTML = msg.citations.secondary_citation.map(c => c).join('<br>');
          assistantCitations.appendChild(secondaryP);
        }
      }

      assistantContent.appendChild(assistantMessage);
      assistantContent.appendChild(assistantCitations);

      msgDiv.appendChild(userContent);
      msgDiv.appendChild(assistantInfo);
      msgDiv.appendChild(assistantContent);

      if (chatHistory) chatHistory.appendChild(msgDiv);
    }

    function scrollToNewestMessage() {
      if (!chatHistory) return;
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        chatHistory.scrollTo({
          top: chatHistory.scrollHeight,
          behavior: 'smooth'
        });
      });
    }

    function clearHistory() {
      const confirmed = confirm('Erase saved chat history? This cannot be undone.');
      if (!confirmed) return;
      localStorage.removeItem('chatHistory');
      history = [];
      if (chatHistory) chatHistory.innerHTML = '';
      messageCounter = 0;
    }

    function newChat() {
      // Clear history without confirmation
      localStorage.removeItem('chatHistory');
      history = [];
      if (chatHistory) chatHistory.innerHTML = '';
      messageCounter = 0;

      // Reset UI to initial state
      if (chatbotDescription) chatbotDescription.style.display = '';
      if (chatbotTitle) chatbotTitle.classList.remove('hidden');
      if (newChatBtn) newChatBtn.classList.add('hidden');
      if (chatbotLogo) {
        chatbotLogo.classList.remove('chatbot-logo-small');
        chatbotLogo.classList.add('chatbot-logo-big');
      }
      if (chatHistory) chatHistory.classList.add('hidden');

      // Restart big logo animation
      animationBigLogo = true;
      const icon = document.querySelector('#chatbot-logo-icon');
      if (icon) {
        function randPercent(min, max) {
          return Math.round(min + Math.random() * (max - min));
        }

        function moveIconRandomly() {
          const topP = randPercent(10, 50);
          const leftP = randPercent(10, 50);
          icon.style.top = topP + '%';
          icon.style.left = leftP + '%';
        }

        moveIconRandomly();
        const intervalMs = 2500;
        window.bigLogoAnimationInterval = setInterval(moveIconRandomly, intervalMs);
      }
    }

    function sendMessage() {
      const text = (userInput && userInput.value ? userInput.value : '').trim();
      if (!text) return;
      if (userInput) userInput.value = '';

      // Stop big logo animation
      if (window.bigLogoAnimationInterval) {
        clearInterval(window.bigLogoAnimationInterval);
        window.bigLogoAnimationInterval = null;
      }

      // Reveal chat UI states
      if (chatbotDescription) chatbotDescription.style.display = 'none';
      if (chatbotTitle) chatbotTitle.classList.add('hidden');
      if (newChatBtn) newChatBtn.classList.remove('hidden');
      if (chatbotLogo) {
        chatbotLogo.classList.remove('chatbot-logo-big');
        chatbotLogo.classList.add('chatbot-logo-small');
      }
      if (chatHistory) chatHistory.classList.remove('hidden');

      // Build a new message block
      messageCounter++;
      const msg = document.createElement('div');
      msg.id = 'msg-' + messageCounter;

      const userContent = document.createElement('div');
      userContent.className = 'user-content';
      const youP = document.createElement('p');
      youP.className = 'msg-light';
      youP.textContent = 'you:';
      const userTextP = document.createElement('p');
      userTextP.className = 'msg-bold';
      userTextP.textContent = text;
      userContent.appendChild(youP);
      userContent.appendChild(userTextP);

      const assistantInfo = document.createElement('div');
      assistantInfo.className = 'assistant-info';
      const miniLogo = document.createElement('div');
      miniLogo.id = 'chatbot-mini-logo';
      miniLogo.innerHTML = '<div id="chatbot-logo-outer" class="chatbot-logo-mini"><div id="chatbot-logo-background"><div class="chatbot-minilogo-icon" id="chatbot-minilogo-icon-' + messageCounter + '"></div></div></div>';
      const writtenInfo = document.createElement('div');
      writtenInfo.className = 'written-info';
      const nameP = document.createElement('p');
      nameP.className = 'msg-light';
      nameP.textContent = 'Chattyware';
      const metaP = document.createElement('p');
      metaP.className = 'msg-light';
      metaP.innerHTML = '<span class="assistant-time">...</span>';
      writtenInfo.appendChild(nameP);
      writtenInfo.appendChild(metaP);
      assistantInfo.appendChild(miniLogo);
      assistantInfo.appendChild(writtenInfo);

      const assistantContent = document.createElement('div');
      assistantContent.className = 'assistant-content';
      const assistantMessage = document.createElement('div');
      assistantMessage.className = 'assistant-message';
      const assistantResponseP = document.createElement('p');
      assistantResponseP.className = 'msg-bold assistant-response';
      assistantResponseP.textContent = '';
      assistantMessage.appendChild(assistantResponseP);
      const assistantCitations = document.createElement('div');
      assistantCitations.className = 'assistant-citations';

      assistantContent.appendChild(assistantMessage);
      assistantContent.appendChild(assistantCitations);

      msg.appendChild(userContent);
      msg.appendChild(assistantInfo);
      msg.appendChild(assistantContent);

      if (chatHistory) chatHistory.appendChild(msg);

      // Scroll to the newly added message
      scrollToNewestMessage();

      // Start mini logo animation while waiting for response
      if (window.startMiniLogoAnimation) {
        window.startMiniLogoAnimation();
      }

      // Start timing
      const requestStartMs = performance.now();

      // Prepare payload: include previous messages (last 10)
      const maxHistory = 10;
      const payload = {
        input_prompt: text,
        messages: history.slice(-maxHistory).map(h => ({
          role: 'user',
          content: h.user
        })).concat(
          history.flatMap(h => h.content ? [{ role: 'assistant', content: h.content }] : [])
        )
      };

      fetch('https://api-gooey.vercel.app/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(r => r.json())
      .then(result => {
        // Stop mini logo animation
        if (window.stopMiniLogoAnimation) {
          window.stopMiniLogoAnimation();
        }

        // Fill assistant response
        assistantResponseP.textContent = result.content || '';

        // Build citations
        assistantCitations.innerHTML = '';
        if (result.citations) {
          if (result.citations.primary_citation && result.citations.primary_citation.length) {
            const titleP = document.createElement('p');
            titleP.textContent = 'Primary sources:';
            assistantCitations.appendChild(titleP);
            const primaryP = document.createElement('p');
            primaryP.className = 'primary-sources';
            primaryP.innerHTML = result.citations.primary_citation.map(c => c).join('<br>');
            assistantCitations.appendChild(primaryP);
          }
          if (result.citations.secondary_citation && result.citations.secondary_citation.length) {
            const titleP2 = document.createElement('p');
            titleP2.textContent = 'Secondary sources:';
            assistantCitations.appendChild(titleP2);
            const secondaryP = document.createElement('p');
            secondaryP.className = 'secondary-sources';
            secondaryP.innerHTML = result.citations.secondary_citation.map(c => c).join('<br>');
            assistantCitations.appendChild(secondaryP);
          }
        }

        // Update time
        const elapsedMs = Math.round(performance.now() - requestStartMs);
        const timeSpan = msg.querySelector('.assistant-time');
        if (timeSpan) {
          const seconds = (elapsedMs / 1000);
          const rounded = seconds < 10 ? seconds.toFixed(1) : Math.round(seconds).toString();
          timeSpan.textContent = 'ragionato per: ' + rounded + 's; modello: Gemini';
        }

        // Save to history
        history.push({
          user: text,
          content: assistantResponseP.textContent,
          citations: result.citations,
          responseTimeMs: elapsedMs
        });
        localStorage.setItem('chatHistory', JSON.stringify(history));

        // Scroll to show the complete response
        scrollToNewestMessage();
      })
      .catch(err => {
        // Stop mini logo animation
        if (window.stopMiniLogoAnimation) {
          window.stopMiniLogoAnimation();
        }

        assistantResponseP.textContent = 'Error: ' + err.message;
        const elapsedMs = Math.round(performance.now() - requestStartMs);
        const timeSpan = msg.querySelector('.assistant-time');
        if (timeSpan) {
          const seconds = (elapsedMs / 1000);
          const rounded = seconds < 10 ? seconds.toFixed(1) : Math.round(seconds).toString();
          timeSpan.textContent = 'ragionato per: ' + rounded + 's; modello: Gemini';
        }

        // Save to history including response time
        history.push({
          user: text,
          content: assistantResponseP.textContent,
          citations: undefined,
          responseTimeMs: elapsedMs
        });
        localStorage.setItem('chatHistory', JSON.stringify(history));

        // Scroll to show the error message
        scrollToNewestMessage();
      });
    }

    if (sendBtn) sendBtn.addEventListener('click', sendMessage);
    if (userInput) {
      userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendMessage();
      });
    }
    if (clearBtn) clearBtn.addEventListener('click', clearHistory);
    if (newChatBtn) newChatBtn.addEventListener('click', newChat);
})();