document.addEventListener('DOMContentLoaded', function() {
    const siteInput = document.getElementById('siteInput');
    const addButton = document.getElementById('addButton');
    const blockedList = document.getElementById('blockedList');
  
    function renderBlockedList(blockedSites) {
      blockedList.innerHTML = '';
      Array.isArray(blockedSites) || console.error(blockedSites);
      blockedSites.forEach(site => {
        console.log("Blocked site:", site);
        const li = document.createElement('li');
        li.textContent = site;
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.onclick = () => {
          chrome.runtime.sendMessage({action: 'removeSite', site: site}, function(response) {
            if (response.status === 'success') {
              renderBlockedList(Array.from(blockedSites).filter(s => s !== site).reduce((obj, key) => {
                obj[key] = blockedSites[key];
                return obj;
              }, {}));
            }
          });
        };
        const timeLimitInput = document.createElement('input');
        timeLimitInput.type = 'number';
        timeLimitInput.value = blockedSites[site] / 1000; // Convert from milliseconds to seconds
        timeLimitInput.onchange = () => {
          const timeLimit = parseInt(timeLimitInput.value) * 1000; // Convert from seconds to milliseconds
          if (!isNaN(timeLimit)) {
            chrome.runtime.sendMessage({action: 'setTimeLimit', site: site, timeLimit: timeLimit}, function(response) {
              if (response.status === 'success') {
                console.log("Time limit set for", site, "to", timeLimit);
              }
            });
          }
        };
        li.appendChild(timeLimitInput);
        li.appendChild(removeButton);
        blockedList.appendChild(li);
      });
    }
  
    chrome.storage.sync.get(['blockedSites'], function(result) {
      if (result.blockedSites) {
        renderBlockedList(result.blockedSites);
      }
    });
  
    addButton.onclick = function() {
      const site = siteInput.value;
      if (site) {
        chrome.runtime.sendMessage({action: 'addSite', site: site}, function(response) {
          if (response.status === 'success') {
            chrome.storage.sync.get('blockedSites', function(result) {
                console.log("Blocked sites:", result.blockedSites);
              if (result.blockedSites) {
                renderBlockedList(result.blockedSites);
              }
            });
          }
        });
      }
    };
  });
  