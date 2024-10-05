// script.js
const typingForm = document.querySelector(".typing-form");
const chatContainer = document.querySelector(".chat-list");
const suggestions = document.querySelectorAll(".suggestion");
const toggleThemeButton = document.querySelector("#theme-toggle-button");
const deleteChatButton = document.querySelector("#delete-chat-button");

let userMessage = null;
let isResponseGenerating = false;

const loadDataFromLocalstorage = () => {
  const savedChats = localStorage.getItem("saved-chats");
  const isLightMode = (localStorage.getItem("themeColor") === "light_mode");

  document.body.classList.toggle("light_mode", isLightMode);
  toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";

  chatContainer.innerHTML = savedChats || '';
  document.body.classList.toggle("hide-header", savedChats);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
};

const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
}

function copyCode(id) {
	const codeElement = document.getElementById(id);
	const codeText = codeElement.innerText;
	navigator.clipboard.writeText(codeText);
}

const generateId = () => {
	let r = "";
	const c = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-";
	for (let i = 0; i < 10; i++) {
		r += c.charAt(Math.floor(Math.random() * c.length));
	}
	return r;
};

const md = window.markdownit({
  highlight: function (str, lang) {
    let codeId = generateId();
    if (lang && window.hljs.getLanguage(lang)) {
      try {
        return `<div class="codehead">
                  <p>${lang || "plaintext"}</p>
                  <button onclick="copyCode('${codeId}')"><i class="fa-regular fa-copy"></i> Salin</button>
                </div>
                <pre class="hljs"><code id="${codeId}">${window.hljs.highlight(lang, str, true).value}</code></pre>`;
      } catch (__) {}
    }
    return `<div class="codehead">
              <p></p>
              <button onclick="copyCode('${codeId}')"><i class="fa-regular fa-copy"></i> Salin</button>
            </div>
            <pre class="hljs"><code id="${codeId}">${md.utils.escapeHtml(str)}</code></pre>`;
  },
});

const showTypingEffect = (text, textElement, incomingMessageDiv) => {
    const isCodeBlock = text.startsWith("```") && text.endsWith("```");

    if (isCodeBlock) {
        const codeText = text.slice(3, -3).trim();
        const renderedCode = md.render(`\`\`\`${codeText}\`\`\``);
        textElement.innerHTML = renderedCode;
        isResponseGenerating = false;
        incomingMessageDiv.querySelector(".icon").classList.remove("hide");
        chatContainer.scrollTo(0, chatContainer.scrollHeight);
        return;
    }
    
    // Render text as Markdown
    const renderedText = md.render(text);
    textElement.innerHTML = renderedText;
    isResponseGenerating = false;
    incomingMessageDiv.querySelector(".icon").classList.remove("hide");
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
};

const generateAPIResponse = async (incomingMessageDiv) => {
    const textElement = incomingMessageDiv.querySelector(".text");
    
    try {
        const response = await fetch("/generate-response", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userMessage }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message);

        showTypingEffect(data.response, textElement, incomingMessageDiv);
    } catch (error) {
        isResponseGenerating = false;
        textElement.innerText = error.message;
        textElement.parentElement.closest(".message").classList.add("error");
    } finally {
        incomingMessageDiv.classList.remove("loading");
    }
};

const showLoadingAnimation = () => {
  const html = `
    <div class="message-content">
      <p class="text"></p>
      <div class="loading-indicator">
        <div class="loading-bar"></div>
        <div class="loading-bar"></div>
        <div class="loading-bar"></div>
      </div>
    </div>
    <span onClick="copyMessage(this)" class="icon material-symbols-rounded">content_copy</span>
  `;

  const incomingMessageDiv = createMessageElement(html, "incoming", "loading");
  chatContainer.appendChild(incomingMessageDiv);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  generateAPIResponse(incomingMessageDiv);
};

const copyMessage = (copyButton) => {
  const messageText = copyButton.parentElement.querySelector(".text").innerText;
  navigator.clipboard.writeText(messageText);
  copyButton.innerText = "done";
  setTimeout(() => copyButton.innerText = "content_copy", 1000);
};

const handleOutgoingChat = () => {
  userMessage = typingForm.querySelector(".typing-input").value.trim() || userMessage;
  if (!userMessage || isResponseGenerating) return;

  isResponseGenerating = true;

  const html = `
    <div class="message-content">
      <p class="text2"></p>
    </div>
  `;

  const outgoingMessageDiv = createMessageElement(html, "outgoing");
  outgoingMessageDiv.querySelector(".text2").innerText = userMessage;
  chatContainer.appendChild(outgoingMessageDiv);

  typingForm.reset();
  document.body.classList.add("hide-header");

  showLoadingAnimation();
};

const deleteChats = () => {
  if (isResponseGenerating) return;
  Swal.fire({
    title: "Apakah Anda yakin?",
    text: "Chat akan dihapus dan hilang permanen!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, hapus",
    cancelButtonText: "Batalkan",
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem("saved-chats");
      chatContainer.innerHTML = '';
      document.body.classList.remove("hide-header");
    }
  });
};

typingForm.addEventListener("submit", (e) => {
  e.preventDefault();
  handleOutgoingChat();
});

deleteChatButton.addEventListener("click", deleteChats);

toggleThemeButton.addEventListener("click", () => {
  document.body.classList.toggle("light_mode");
  const isLightMode = document.body.classList.contains("light_mode");
  localStorage.setItem("themeColor", isLightMode ? "light_mode" : "dark_mode");
  toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";
});

suggestions.forEach((suggestion) => {
  suggestion.addEventListener("click", () => {
    userMessage = suggestion.querySelector("h4").innerText;
    handleOutgoingChat();
  });
});

window.addEventListener("load", loadDataFromLocalstorage);
