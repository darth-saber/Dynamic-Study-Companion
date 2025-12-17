// Study Companion Configuration
// Note: API functionality has been removed - this is a demo version

// DOM Elements - will be initialized after DOM loads
let notesInput,
  modeSelect,
  generateButton,
  outputArea,
  citationArea,
  sourcesList,
  buttonText,
  loadingSpinner;

// Wait for DOM to be fully loaded before accessing elements
document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  notesInput = document.getElementById("notes-input");
  modeSelect = document.getElementById("mode-select");
  generateButton = document.getElementById("generate-button");
  outputArea = document.getElementById("output-area");
  citationArea = document.getElementById("citation-area");
  sourcesList = document.getElementById("sources-list");
  buttonText = document.getElementById("button-text");
  loadingSpinner = document.getElementById("loading-spinner");

  // Attach event listener to the button
  generateButton.addEventListener("click", generateStudyAid);
});

/**
 * Sets the loading state of the UI.
 * @param {boolean} isLoading - True to show spinner and disable button, false otherwise.
 */
function setLoading(isLoading) {
  generateButton.disabled = isLoading;
  if (isLoading) {
    buttonText.textContent = "Generating...";
    loadingSpinner.classList.remove("hidden");
    generateButton.classList.add("px-4"); // Adjust padding when spinner is visible
  } else {
    buttonText.textContent = "Generate Aid";
    loadingSpinner.classList.add("hidden");
    generateButton.classList.remove("px-4");
  }
}

/**
 * Converts Markdown-like text to formatted HTML for display.
 * Simplifies bolding and list creation.
 * @param {string} text - The input text from the model.
 * @returns {string} HTML formatted text.
 */
function formatOutputText(text) {
  if (!text) return "";

  // 1. Handle bold text (e.g., **Q: ...**)
  let html = text.replace(
    /\*\*(.*?)\*\*/g,
    '<span class="font-bold text-indigo-700">$1</span>',
  );

  // 2. Handle numbered lists (for Quiz/Summary points)
  html = html.replace(/^(\d+\.\s.*)$/gm, '<p class="mt-2 ml-4">$1</p>');

  // 3. Handle Flashcard separation (ensure Q and A are clearly separated)
  // Replace newlines with <br> but use an extra <br> for paragraph breaks
  html = html.replace(/\n\n/g, "<br><br>");
  html = html.replace(/\n/g, "<br>");

  return html;
}

/**
 * Generates content based on the user's input text.
 * @param {string} notes - The input notes text.
 * @param {string} mode - The selected study aid mode.
 * @returns {Promise<Object>} Mock API response.
 */
async function generateDemoContent(notes, mode) {
  // Simulate API processing delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Extract and analyze the user's input
  const sentences = notes.split(/[.!?]+/).filter((s) => s.trim().length > 10);
  const keyPhrases = notes.split(/[,;]+/).filter((s) => s.trim().length > 3);
  const mainTopics = notes.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
  const words = notes
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3);

  // Find most common significant words (simple keyword extraction)
  const wordCount = {};
  words.forEach((word) => {
    if (
      ![
        "that",
        "with",
        "this",
        "they",
        "have",
        "been",
        "from",
        "will",
        "what",
        "when",
        "where",
        "which",
        "while",
        "these",
        "those",
      ].includes(word)
    ) {
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  });
  const keywords = Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);

  let demoContent = "";

  switch (mode) {
    case "flashcards":
      const firstKeyPoint = sentences[0]
        ? sentences[0].trim()
        : `The text discusses ${keywords.slice(0, 2).join(" and ")}`;
      const secondKeyPoint = sentences[1]
        ? sentences[1].trim()
        : `Key aspects include ${keywords.slice(2, 4).join(", ")}`;
      const thirdKeyPoint = sentences[2]
        ? sentences[2].trim()
        : `Important relationships between ${keywords.slice(4, 6).join(" and ")}`;

      demoContent = `**Q: What are the main concepts discussed in the material?**
**A:** Based on the provided text, the material covers: ${
        keyPhrases
          .slice(0, 3)
          .map((p) => p.trim())
          .join(", ") || "key topics and principles"
      }.

**Q: How would you summarize the primary focus of this content?**
**A:** ${firstKeyPoint}

**Q: What key points are emphasized in the text?**
**A:** The content highlights several important aspects including ${
        keyPhrases
          .slice(2, 5)
          .map((p) => p.trim())
          .join(", ") || "fundamental concepts and relationships"
      }.

**Q: What is the main takeaway from this information?**
**A:** ${thirdKeyPoint}

**Q: How do the concepts in this text relate to each other?**
**A:** The material presents interconnected ideas where ${keyPhrases[0] ? keyPhrases[0].trim() : "various components"} work together to and principles discussed. explain the overall framework`;
      break;

    case "quiz":
      const questions = [
        `What is the primary focus of the provided material?`,
        `How are the key concepts in the text interconnected?`,
        `What important principles or relationships are discussed?`,
        `What are the main conclusions drawn in this content?`,
        `How does this information contribute to understanding the broader topic?`,
      ];

      demoContent = `**Quiz Questions:**

1. ${questions[0]}
2. ${questions[1]}
3. ${questions[2]}
4. ${questions[3]}
5. ${questions[4]}

**Answers:**

1. The material focuses on: ${
        keyPhrases
          .slice(0, 2)
          .map((p) => p.trim())
          .join(", ") || "fundamental concepts and principles"
      } that form the core understanding of the subject matter.

2. The key concepts are interconnected through logical relationships where ${keyPhrases[0] ? keyPhrases[0].trim() : "various elements"} build upon each other to create a comprehensive framework.

3. The text discusses important principles including ${
        keyPhrases
          .slice(2, 4)
          .map((p) => p.trim())
          .join(", ") ||
        "cause-and-effect relationships and fundamental mechanisms"
      }.

4. The main conclusions emphasize ${sentences[sentences.length - 1] ? sentences[sentences.length - 1].trim() : "the importance of understanding these interconnected concepts for comprehensive knowledge"}.

5. This information contributes by providing essential building blocks and perspectives that enhance overall understanding of the broader topic and its applications.`;
      break;

    case "summary":
      const summaryPoints =
        keyPhrases
          .slice(0, 4)
          .map((p) => p.trim())
          .join(", ") ||
        `key concepts including ${keywords.slice(0, 3).join(", ")}`;
      const mainIdea = sentences[0]
        ? sentences[0].trim()
        : `The material presents essential information about ${keywords.slice(0, 2).join(" and ")}`;

      demoContent = `**Summary:**

${mainIdea} The content covers ${summaryPoints} and explores the relationships between various components of the topic.

The material demonstrates how different aspects of the subject matter interconnect and contribute to a broader understanding. Key concepts include ${
        keyPhrases
          .slice(4, 7)
          .map((p) => p.trim())
          .join(", ") ||
        `fundamental principles related to ${keywords.slice(3, 6).join(", ")}`
      }, which are presented through detailed explanations and examples.

The overall framework shows the progression from basic concepts to more complex relationships, emphasizing the importance of understanding each component in relation to the whole. This approach provides a comprehensive foundation for grasping the subject matter and its practical implications.

The text concludes by highlighting the significance of these concepts in real-world applications and their role in building a deeper, more nuanced understanding of the topic.`;
      break;
  }

  // Return mock response structure similar to what the API would return
  return {
    candidates: [
      {
        content: {
          parts: [
            {
              text: demoContent,
            },
          ],
        },
      },
    ],
  };
}

/**
 * Main function to generate the study aid.
 */
async function generateStudyAid() {
  const notes = notesInput.value.trim();
  const mode = modeSelect.value;

  if (notes.length < 50) {
    outputArea.innerHTML =
      '<span class="text-red-600">Please enter at least 50 characters of notes to generate a useful study aid.</span>';
    citationArea.classList.add("hidden");
    return;
  }

  setLoading(true);
  outputArea.textContent = "Generating demo content...";
  citationArea.classList.add("hidden");
  sourcesList.innerHTML = "";

  try {
    // Use demo content instead of API call
    const result = await generateDemoContent(notes, mode);
    const candidate = result.candidates?.[0];

    if (candidate && candidate.content?.parts?.[0]?.text) {
      const text = candidate.content.parts[0].text;
      outputArea.innerHTML = formatOutputText(text);
      // Note: Demo version doesn't include sources/citations
    } else {
      outputArea.innerHTML =
        '<span class="text-red-600">Error: Could not generate content. The response was empty or malformed.</span>';
    }
  } catch (error) {
    console.error("Generation Error:", error);
    outputArea.innerHTML = `<span class="text-red-600">An unexpected error occurred: ${error.message}</span>`;
  } finally {
    setLoading(false);
  }
}
