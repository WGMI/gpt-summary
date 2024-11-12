// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", () => {
  const summarizeButton = document.getElementById("summarizeButton");
  const summaryDisplay = document.getElementById("summary");

  // Add click event listener to the "Summarize Page" button
  summarizeButton.addEventListener("click", async () => {
    // Clear previous summary
    summaryDisplay.textContent = "Loading summary...";

    try {
      // Query the current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      // Inject content.js into the current tab to extract webpage content
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: extractPageContent
      });

      // Send extracted content to the background script for summarization
      const summary = await requestSummary(result.result);

      // Display the summary in the popup
      summaryDisplay.textContent = summary;
    } catch (error) {
      console.error("Error summarizing page:", error);
      summaryDisplay.textContent = "An error occurred. Please try again.\n\n" + error;  
    }
  });
});

// Function to extract text content from the webpage
function extractPageContent() {
  return document.body.innerText;
}

// Function to send the content to the background script and get a summary
async function requestSummary(content) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: "summarize", content }, (response) => {
      if (chrome.runtime.lastError || !response || response.error) {
        reject(chrome.runtime.lastError || response.error);
      } else {
        resolve(response.summary);
      }
    });
  });
}
