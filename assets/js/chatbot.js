var animationBigLogo = true;

// Utility function for flexible citation detection
function detectCitationType(line) {
  const lowerLine = line.toLowerCase().trim();
  
  // Primary citation patterns
  const primaryPatterns = [
    /Primary\s+Knowledge\s+Base/i,
    /Primary\s+Sources?/i,
    /\*\*\s*p/i,
    /^#{4}\s*p/i,
    /^#+\s*primary/i
  ];
  
  // Secondary citation patterns  
  const secondaryPatterns = [
    /Secondary\s+Knowledge\s+Base/i,
    /Secondary\s+Sources?/i,
    /\*\*\s*s/i,
    /^#{4}\s*s/i,
    /^#+\s*secondary/i
  ];
  
  // Bibliography citation patterns
  const bibliographyPatterns = [
    /Bibliography/i,
    /\*\*\s*b/i,
    /^#+\s*bibliography/i,
    /^#+\s*b$/i
  ];
  
  if (primaryPatterns.some(pattern => pattern.test(lowerLine))) {
    return 'primary';
  }
  
  if (secondaryPatterns.some(pattern => pattern.test(lowerLine))) {
    return 'secondary';
  }
  
  if (bibliographyPatterns.some(pattern => pattern.test(lowerLine))) {
    return 'bibliography';
  }
  
  return null;
}

//Chatbot description animation
(function() {
  const container = document.querySelector('#description-rect-content');
  const chatbotDescription = document.querySelector('#chatbot-description');
  if (!container || !chatbotDescription) return;
  const paragraphs = Array.from(container.querySelectorAll('p'));
  if (paragraphs.length === 0) return;

  let index = paragraphs.findIndex(p => p.classList.contains('active'));
  if (index < 0) index = 0;
  let animationInterval = null;

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
    const mainContent = document.querySelector('main');
    if (!mainContent) return;
    const mainStyle = getComputedStyle(mainContent);
    if (
      mainContent.classList.contains('hidden') ||
      mainStyle.display === 'none' ||
      mainStyle.visibility === 'hidden' ||
      mainContent.hasAttribute('hidden')
    ) return;
    const nextIndex = (index + 1) % paragraphs.length;
    show(nextIndex);
  }

  function refreshHeight() {
    if (paragraphs[index]) {
      const initialHeight = paragraphs[index].offsetHeight + parseFloat(getComputedStyle(container).paddingTop) + parseFloat(getComputedStyle(container).paddingBottom);
      container.style.height = initialHeight + 'px';
      requestAnimationFrame(() => { container.style.height = ''; });
    }
  }

  function startAnimation() {
    if (animationInterval) return; // Already running
    refreshHeight();
    const intervalMs = 7500;
    animationInterval = setInterval(next, intervalMs);
  }

  function stopAnimation() {
    if (animationInterval) {
      clearInterval(animationInterval);
      animationInterval = null;
    }
  }

  function checkVisibility() {
    const isVisible = chatbotDescription.style.display !== 'none';
    if (isVisible && !animationInterval) {
      startAnimation();
    } else if (!isVisible && animationInterval) {
      stopAnimation();
    }
  }

  // Initial setup
  refreshHeight();
  checkVisibility();

  // Monitor visibility changes using MutationObserver
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
        checkVisibility();
      }
    });
  });

  observer.observe(chatbotDescription, {
    attributes: true,
    attributeFilter: ['style']
  });
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

//Project info interaction
(function() {
  const trigger = document.getElementById('project-info');
  const infoBox = document.getElementById('project-info-box');
  const closeFooter = document.getElementById('close-footer');
  const mainContent = document.querySelector('main');

  if (!trigger || !infoBox || !closeFooter) return;

  trigger.addEventListener('click', function() {
    infoBox.classList.add('active');
    mainContent.classList.add('hidden');
    closeFooter.classList.remove('hidden');
    closeFooter.classList.add('active');
  });

  closeFooter.addEventListener('click', function() {
    infoBox.classList.remove('active');
    mainContent.classList.remove('hidden');
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
      metaP.innerHTML = '<span class="assistant-time">thought for: ' + msg.responseTimeMs + 's; LLM model: Gemini 2.5 Pro; Ref: ' + msg.run_id + '</span>';
      
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
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        // Get the maximum scroll height from both document and body
        const maxScrollHeight = Math.max(
          document.body.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.clientHeight,
          document.documentElement.scrollHeight,
          document.documentElement.offsetHeight
        );
        
        // Scroll to the absolute bottom of the page
        window.scrollTo({
          top: maxScrollHeight,
          behavior: 'smooth'
        });
      });
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

    async function sendMessage() {
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
      metaP.innerHTML = '<span class="assistant-time">thinking with the LLM model Gemini 2.5 Pro...</span>';
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

      // Prepare payload: include previous messages (last 10) in proper order
      const maxHistory = 10;
      const messages = [];
      const recentHistory = history.slice(-maxHistory);
      
      // Build messages array with proper user/assistant alternation
      recentHistory.forEach(h => {
        messages.push({
          role: 'user',
          content: h.user
        });
        if (h.content) {
          messages.push({
            role: 'assistant',
            content: h.content
          });
        }
      });

      console.log("input prompt:", text);
      console.log("history messages:", messages);

      const response = await fetch('https://api.gooey.ai/v3/integrations/stream/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json' },
        body: JSON.stringify({
          "integration_id": "DXz",
          input_prompt: text,
          messages: messages
        })
      });

      const evtSource = new EventSource(response.headers.get("Location"));

      evtSource.onmessage = function(event) {
        const data = JSON.parse(event.data);
        console.log(data);

        if (data.status === 'running') {
          if (data.detail !== 'Running...') {
            const timeSpan = msg.querySelector('.assistant-time');
            if (timeSpan) {
              timeSpan.textContent = data.detail;
            }
            scrollToNewestMessage();
          }
        }

        if (data.type === 'final_response') {

          if (data.status === 'running'){
            // It means we got an error

            // Stop mini logo animation
            if (window.stopMiniLogoAnimation) {
              window.stopMiniLogoAnimation();
            }
            assistantResponseP.textContent = 'We are sorry, but an error occurred while processing your request. Please try again later by starting a new chat.';
            const timeSpan = msg.querySelector('.assistant-time');
            if (timeSpan) {
              timeSpan.textContent = 'thought for: ' + 'N/A' + 's; LLM model: Gemini 2.5 Pro';
            }
            evtSource.close();
            return;
          };

          // Stop mini logo animation
          if (window.stopMiniLogoAnimation) {
            window.stopMiniLogoAnimation();
          }

          assistantResponseP.innerHTML = '';

          // Fill assistant response
          const responseText = data.output.output_text[0];
          const lines = responseText.split('\n');
          console.log("response lines:", lines);
          const bibliographyPresent = lines.some(line => detectCitationType(line) === 'bibliography');
          const bibliographyIndex = lines.findIndex(line => detectCitationType(line) === 'bibliography');
          const responseContent = bibliographyPresent ? lines.slice(0, bibliographyIndex) : '';
          let responseContentString = "";

          if (bibliographyPresent) {
            responseContentString = "";
            responseContent.forEach(line => {
              if (line !== '') {
                responseContentString += line;
                console.log("Actuale response content:", responseContentString);
              }
            });
          } else {
            assistantResponseP.innerHTML += 'There was an error processing your answer, please report it to the project owners by including this reference number' + data.run_id + ' and try again.';
          }

          assistantResponseP.innerHTML = responseContentString;
          
          // Use utility function for robust citation detection
          const secondaryCitationPresent = lines.some(line => detectCitationType(line) === 'secondary');
          const primaryCitationPresent = lines.some(line => detectCitationType(line) === 'primary');
          const primaryCitationIndex = lines.findIndex(line => detectCitationType(line) === 'primary');
          const secondaryCitationIndex = lines.findIndex(line => detectCitationType(line) === 'secondary');
          const primaryCitations = [];
          const secondaryCitations = [];

          // Build citations
          if (primaryCitationPresent && secondaryCitationPresent) {
            
            if (lines[primaryCitationIndex + 1] === '' ) {
              if (lines[secondaryCitationIndex - 1] === '' ) {
                primaryCitations.push(...lines.slice(primaryCitationIndex + 2, secondaryCitationIndex - 1));
              } else {
                primaryCitations.push(...lines.slice(primaryCitationIndex + 2, secondaryCitationIndex));
              }
            } else {
              if (lines[secondaryCitationIndex - 1] === '' ) {
                primaryCitations.push(...lines.slice(primaryCitationIndex + 1, secondaryCitationIndex - 1));
              } else {
                primaryCitations.push(...lines.slice(primaryCitationIndex + 1, secondaryCitationIndex));
              }
            }

            primaryCitations.forEach(citation => {
              if (citation == '') {
                primaryCitations.splice(primaryCitations.indexOf(citation), 1);
              }
            });
            
            console.log("primary citations:", primaryCitations);

            const titleP = document.createElement('p');
            titleP.textContent = 'Primary sources:';
            assistantCitations.appendChild(titleP);
            const primaryP = document.createElement('p');
            primaryP.className = 'primary-sources';

            primaryCitations.forEach(citation => {
              if (citation.startsWith('*')) {
                if (citation.startsWith('**')) {
                  citation = citation.substring(2).trim();
                } else {
                  citation = citation.substring(1).trim();
                }
              }
              primaryP.innerHTML += citation + '<br>';
              assistantCitations.appendChild(primaryP);
            });

            if (lines[secondaryCitationIndex + 1] === '' ) {
              secondaryCitations.push(...lines.slice(secondaryCitationIndex + 2));
            } else {
              secondaryCitations.push(...lines.slice(secondaryCitationIndex + 1));
            }

            secondaryCitations.forEach(citation => {
              if (citation == '') {
                secondaryCitations.splice(secondaryCitations.indexOf(citation), 1);
              }
            });

            console.log("secondary citations:", secondaryCitations);

            const titleP2 = document.createElement('p');
            titleP2.textContent = 'Secondary sources:';
            assistantCitations.appendChild(titleP2);
            const secondaryP = document.createElement('p');
            secondaryP.className = 'secondary-sources';

            secondaryCitations.forEach(citation => {
              if (citation.startsWith('*')) {
                if (citation.startsWith('**')) {
                  citation = citation.substring(2).trim();
                } else {
                  citation = citation.substring(1).trim();
                }
              }
              secondaryP.innerHTML += citation + '<br>';
              assistantCitations.appendChild(secondaryP);
            });
          } else if (primaryCitationPresent && !secondaryCitationPresent) {
            if (lines[primaryCitationIndex + 1] === '' ) {
              primaryCitations.push(...lines.slice(primaryCitationIndex + 2));
            } else {
              primaryCitations.push(...lines.slice(primaryCitationIndex + 1));
            }

            primaryCitations.forEach(citation => {
              if (citation == '') {
                primaryCitations.splice(primaryCitations.indexOf(citation), 1);
              }
            });
            
            console.log("primary citations:", primaryCitations);

            const titleP = document.createElement('p');
            titleP.textContent = 'Primary sources:';
            assistantCitations.appendChild(titleP);
            const primaryP = document.createElement('p');
            primaryP.className = 'primary-sources';

            primaryCitations.forEach(citation => {
              if (citation.startsWith('*')) {
                if (citation.startsWith('**')) {
                  citation = citation.substring(2).trim();
                } else {
                  citation = citation.substring(1).trim();
                }
              }
              primaryP.innerHTML += citation + '<br>';
              assistantCitations.appendChild(primaryP);
            });
          } else if (secondaryCitationPresent && !primaryCitationPresent) {

            if (lines[secondaryCitationIndex + 1] === '' ) {
              secondaryCitations.push(...lines.slice(secondaryCitationIndex + 2));
            } else {
              secondaryCitations.push(...lines.slice(secondaryCitationIndex + 1));
            }

            secondaryCitations.forEach(citation => {
              if (citation == '') {
                secondaryCitations.splice(secondaryCitations.indexOf(citation), 1);
              }
            });

            console.log("secondary citations:", secondaryCitations);

            const titleP2 = document.createElement('p');
            titleP2.textContent = 'Secondary sources:';
            assistantCitations.appendChild(titleP2);
            const secondaryP = document.createElement('p');
            secondaryP.className = 'secondary-sources';

            secondaryCitations.forEach(citation => {
              if (citation.startsWith('*')) {
                if (citation.startsWith('**')) {
                  citation = citation.substring(2).trim();
                } else {
                  citation = citation.substring(1).trim();
                }
              }
              secondaryP.innerHTML += citation + '<br>';
              assistantCitations.appendChild(secondaryP);
            });
          } else {
            console.log("no citations found");
          }

          const seconds = data.run_time_sec;
          const rounded = seconds < 10 ? seconds.toFixed(1) : Math.round(seconds).toString();

          history.push({
            user: text,
            content: responseContentString,
            citations: {
              primary_citation: primaryCitationPresent ? primaryCitations : undefined,
              secondary_citation: secondaryCitationPresent ? secondaryCitations : undefined
            },
            responseTimeMs: rounded,
            run_id: data.run_id
          });
          localStorage.setItem('chatHistory', JSON.stringify(history));

          // Update time
          const timeSpan = msg.querySelector('.assistant-time');
          if (timeSpan) {
            timeSpan.textContent = 'thought for: ' + rounded + 's; LLM model: Gemini 2.5 Pro; Ref: ' + data.run_id;
          }

          // Scroll to show the complete response
          scrollToNewestMessage();

          evtSource.close();
        }
      };
    }

    if (sendBtn) sendBtn.addEventListener('click', sendMessage);
    if (userInput) {
      userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendMessage();
      });
    }
    if (newChatBtn) newChatBtn.addEventListener('click', newChat);
})();