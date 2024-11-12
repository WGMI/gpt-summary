const OPENAI_API_KEY = ""

// Conversation history to maintain context
let conversationHistory = [];

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { type, content, question } = request;

  if (type === "summarize") {
    handleGPTRequest([{ role: "user", content: "Summarize: " + content }], sendResponse);
  } else if (type === "ask") {
    if(conversationHistory.length == 0) conversationHistory.push({ role: "user", content: 'Answer using: ' + content });
    conversationHistory.push({ role: "user", content: question });
    handleGPTRequest(conversationHistory, sendResponse);
  } else if (type === "clear") {
    conversationHistory = [];
    sendResponse({ success: true });
  }
  return true;
});

// Helper function to send the conversation to GPT API
async function handleGPTRequest(messages, sendResponse) {
  try {
    const apiUrl = "https://api.openai.com/v1/chat/completions";
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: messages,
        max_tokens: 150,
        temperature: 0.5,
      }),
    });

    const data = await response.json();
    const answer = data.choices[0].message.content.trim();

    // Save the response to conversation history
    conversationHistory.push({ role: "assistant", content: answer });

    sendResponse({ answer });
  } catch (error) {
    console.error("Error with GPT request:", error);
    sendResponse({ error: "Failed to fetch response from GPT" });
  }
}
