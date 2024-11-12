// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "summarize") {
      // Call the summarizeContent function and handle the response
      (async () => {
        try {
          const summary = await summarizeContent(request.content);
          sendResponse({ summary });
        } catch (error) {
          sendResponse({ error: "Failed to summarize content\n\n" + error.message });
        }
      })();
  
      // Return true to indicate that we'll respond asynchronously
      return true;
    }
  });

// Function to send content to the GPT API and get a summary
async function summarizeContent(content) {
  const apiUrl = "https://api.openai.com/v1/chat/completions";
  
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer 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`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: "Summarize: " + content
        }
      ],
      temperature: 0.5,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch summary from GPT API\n\n" + response.statusText);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
