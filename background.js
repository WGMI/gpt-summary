// OpenAI API key (ensure this is securely stored, not hardcoded for production)

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "summarize") {
      // Call the summarizeContent function and handle the response
      (async () => {
        try {
          const summary = await summarizeContent(request.content);
          sendResponse({ summary });
        } catch (error) {
          sendResponse({ error: "Failed to summarize content" });
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
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
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
    throw new Error("Failed to fetch summary from GPT API");
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
