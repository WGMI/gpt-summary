document.addEventListener("DOMContentLoaded", () => {
  const summarizeButton = document.getElementById("summarizeButton");
  const askButton = document.getElementById("askButton");
  const clearButton = document.getElementById("clearButton");
  const questionInput = document.getElementById("questionInput");
  const summaryDisplay = document.getElementById("summary");
  const loadingSpinner = document.getElementById("loadingSpinner");

  async function handleRequest(type, question = "") {
    summaryDisplay.textContent = "";
    loadingSpinner.style.display = "block";

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: extractPageContent
      });

      const response = await requestGPT(result.result, type, question);
      summaryDisplay.textContent = response;
    } catch (error) {
      console.error("Error:", error);
      summaryDisplay.textContent = "An error occurred. Please try again.";
    } finally {
      loadingSpinner.style.display = "none";
    }
  }

  summarizeButton.addEventListener("click", () => handleRequest("summarize"));
  askButton.addEventListener("click", () => {
    const question = questionInput.value.trim();
    if (question) handleRequest("ask", question);
    else summaryDisplay.textContent = "Please enter a question.";
  });

  // Clear conversation history
  clearButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "clear" });
    summaryDisplay.textContent = "Conversation cleared.";
  });
});

function extractPageContent() {
  return document.body.innerText;
}

async function requestGPT(content, type, question = "") {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type, content, question }, (response) => {
      if (chrome.runtime.lastError || !response || response.error) {
        reject(chrome.runtime.lastError || response.error);
      } else {
        resolve(response.answer || response.summary);
      }
    });
  });
}
