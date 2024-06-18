let blockedSites = {};
let timers = {};
let TIME_LIMIT = 10000; // Default time limit in milliseconds (10 seconds for testing)
const DEFAULT_TIME_LIMIT = 10000; // Default time limit in milliseconds (10 seconds for testing)
const WARNING_TIME = 3000; // Time before redirect to show warning in milliseconds (3 seconds for testing)


// Retrieve blocked sites and time limit from storage
chrome.storage.sync.get(['blockedSites', 'timeLimit'], function(result) {
    if (result.blockedSites) {
        blockedSites = result.blockedSites;
        console.log("Retrieved blocked sites from storage:", blockedSites);
    }
    if (result.timeLimit) {
        TIME_LIMIT = result.timeLimit;
        console.log("Retrieved time limit from storage:", TIME_LIMIT);
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("Received message:", request);
    
    if (request.action === "addSite") {
        chrome.storage.sync.set({blockedSites: blockedSites});
        blockedSites[request.site] = request.time
        chrome.storage.sync.set({blockedSites: blockedSites});
        console.log("Added site to blocked sites:", request.site, "with time limit:", request.time);
    } else if (request.action === "removeSite") {
        blockedSites = Object.keys(blockedSites).filter(site => site !== request.site);
        chrome.storage.sync.set({blockedSites: blockedSites});
        console.log("Removed site from blocked sites:", request.site);
    } else if (request.action === "setTimeLimit") {
        blockedSites[request.site] = request.timeLimit
        chrome.storage.sync.set({blockedSites: blockedSites});
        console.log(request.timeLimit);
        console.log("Set new time limit:", request.timeLimit, "for site:", request.site);
    } 
    
    sendResponse({status: "success"});
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    console.log("Tab updated:", tab);
    
    if (changeInfo.status === 'complete' && Object.keys(blockedSites).some(site => tab.url.includes(site))) {
        if (timers[tabId]) {
            clearTimeout(timers[tabId].redirectTimer);
            clearTimeout(timers[tabId].warningTimer);
            console.log("Cleared timeouts for tab:", tabId);
        }

        timers[tabId] = {
            warningTimer: setTimeout(() => {
                chrome.notifications.create({
                    type: "basic",
                    iconUrl: "icons/icon48.png",
                    title: "Warning",
                    message: "You will be redirected soon!",
                    priority: 2
                });
                console.log("Warning notification shown for tab:", tabId);
            }, TIME_LIMIT - WARNING_TIME),
            
            redirectTimer: setTimeout(() => {
                chrome.tabs.update(tabId, { url: "https://www.google.com" });
                console.log("Redirected tab:", tabId, "to Google");
            }, TIME_LIMIT)
        };
    }
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    console.log("Tab removed:", tabId);
    
    if (timers[tabId]) {
        clearTimeout(timers[tabId].redirectTimer);
        clearTimeout(timers[tabId].warningTimer);
        delete timers[tabId];
        console.log("Cleared timeouts for tab:", tabId);
    }
});


// chrome.storage.onChanged.addListener((changes, namespace) => {
//   for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
//     console.log(
//       `Storage key "${key}" in namespace "${namespace}" changed.`,
//       `Old value was "${oldValue}", new value is "${newValue}".`
//     );
//   }
// });
