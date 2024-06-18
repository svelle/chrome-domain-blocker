document.addEventListener('DOMContentLoaded', function () {
    const siteInput = document.getElementById('siteInput');
    const addButton = document.getElementById('addButton');
    const blockedList = document.getElementById('blockedList');

    function renderBlockedList(blockedSites) {
        blockedList.innerHTML = '';
        Array.isArray(blockedSites) || console.error(blockedSites);
        Object.keys(blockedSites).forEach(site => {
            console.log("Blocked site:", site);
            const li = document.createElement('li');
            li.textContent = site;
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.onclick = () => {
                chrome.runtime.sendMessage({ action: 'removeSite', site: site }, function (response) {
                    if (response.status === 'success') {
                        console.log("Removed site from blocked sites:", site);
                    }
                });
            };

            const timeLimitInput = document.createElement('input');
            timeLimitInput.type = 'number';
            timeLimitInput.value = blockedSites[site] / 1000; // Convert from milliseconds to seconds
            timeLimitInput.onchange = () => {
                const timeLimit = parseInt(timeLimitInput.value) * 1000; // Convert from seconds to milliseconds
                if (!isNaN(timeLimit)) {
                    chrome.runtime.sendMessage({ action: 'setTimeLimit', site: site, timeLimit: timeLimit }, function (response) {
                        if (response.status === 'success') {
                            console.log("Time limit set for", site, "to", timeLimit);
                        }
                    });
                }
            };

            const updateButton = document.createElement('button');
            updateButton.textContent = 'Update';
            updateButton.onclick = () => {
                const timeLimit = parseInt(timeLimitInput.value) * 1000; // Convert from seconds to milliseconds
                if (!isNaN(timeLimit)) {
                    chrome.runtime.sendMessage({ action: 'setTimeLimit', site: site, timeLimit: timeLimit }, function (response) {
                        if (response.status === 'success') {
                            console.log("Time limit set for", site, "to", timeLimit);
                        }
                    });
                }
            };

            li.appendChild(timeLimitInput);
            li.appendChild(updateButton);
            li.appendChild(removeButton);
            blockedList.appendChild(li);
        });
    }

    chrome.storage.sync.get(['blockedSites'], function (result) {
        if (result.blockedSites) {
            renderBlockedList(result.blockedSites);
        }
    });

    addButton.onclick = function () {
        const site = siteInput.value;
        const time = parseInt(timeInput.value) * 1000;
        if (site) {
            chrome.runtime.sendMessage({ action: 'addSite', site: site, time: time }, function (response) {
                if (response.status === 'success') {
                    chrome.storage.sync.get('blockedSites', function (result) {
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
