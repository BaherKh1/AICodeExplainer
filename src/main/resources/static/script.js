async function submitTask(task) {
  const code = document.getElementById("code").value;
  if (!code.trim()) return;

  addMessage("user", code);
  addMessage("assistant", "Loading...");

  try {
    const response = await fetch("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, task })
    });

    const data = await response.json();
    const result = data.output || "No response";

    updateLastAssistantMessage(result);
  } catch (err) {
    updateLastAssistantMessage("Error fetching explanation.");
    console.error(err);
  }
}

async function submitTaskWithVoice(task) {
  const code = document.getElementById("code").value;
  if (!code.trim()) return;

  addMessage("user", code);
  addMessage("assistant", "Loading...");

  try {
    const response = await fetch("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, task })
    });

    const data = await response.json();
    const result = data.output || "No response";

    updateLastAssistantMessage(result);
    speakText(result);
  } catch (err) {
    updateLastAssistantMessage("Error fetching explanation.");
    console.error(err);
  }
}

function addMessage(role, text) {
  const container = document.getElementById("chat-container");

  const messageDiv = document.createElement("div");
  messageDiv.className = role === "user" ? "text-right" : "text-left";

  const bubble = document.createElement("div");
  bubble.className = role === "user"
    ? "inline-block max-w-xl bg-cyan-600 text-white px-4 py-3 rounded-2xl shadow-md whitespace-pre-wrap"
    : "inline-block max-w-xl bg-gray-700 text-white px-4 py-3 rounded-2xl shadow-md prose prose-invert prose-sm";

  if (role === "assistant") {
    // Render markdown
    bubble.innerHTML = marked.parse(text);
    Prism.highlightAll();
  } else {
    bubble.innerText = text;
  }

  messageDiv.appendChild(bubble);
  container.appendChild(messageDiv);
  container.scrollTop = container.scrollHeight;
}


function updateLastAssistantMessage(text) {
  const container = document.getElementById("chat-container");
  const lastAssistant = Array.from(container.querySelectorAll(".text-left .inline-block")).pop();
  if (lastAssistant) {
    lastAssistant.innerHTML = marked.parse(text);
    Prism.highlightAll();
  }}

function speakText(text) {
  const stopBtn = document.getElementById("stop-voice-btn");

  stopBtn.classList.remove("hidden");

  if (typeof responsiveVoice !== "undefined" && responsiveVoice.voiceSupport()) {
    responsiveVoice.speak(text, "US English Female", {
      onend: function () {
        stopBtn.classList.add("hidden");
      }
    });
  } else if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.onend = function () {
      stopBtn.classList.add("hidden");
    };
    speechSynthesis.speak(utterance);
  } else {
    console.warn("No speech synthesis available.");
    stopBtn.classList.add("hidden");
  }
}

function stopVoice() {
  const stopBtn = document.getElementById("stop-voice-btn");

  if (typeof responsiveVoice !== "undefined") {
    responsiveVoice.cancel();
  }

  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
  }

  stopBtn.classList.add("hidden");
}
