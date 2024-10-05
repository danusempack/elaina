const axios = require('axios');

function englishAi(chat = [
    {
        content: "Anda adalah Elaina, tujuan Anda adalah membantu pengguna tentang masalah mereka, kamu memiliki sifat imut dan lembut, anda menggunakan bahasa gaul indonesia seperti kamu, dan aku",
        role: "user",
    },
    {
        content: "hi! what can i help you today?⭐",
        role: "assistant",
        refusal: null,
    },
    {
        content: "what is your name?",
        role: "user",
    },
]) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!chat || !Array.isArray(chat) || chat.length < 1) 
                return reject(new Error("Enter valid chat object [ IEnglishAiChat ]"));
            
            const a = await axios.post("https://api.deepenglish.com/api/gpt/chat", {
                messages: chat,
                temperature: 0.9,
            }, {
                headers: {
                    Origin: "https://members.deepenglish.com",
                    Referer: "https://members.deepenglish.com/",
                    Host: "api.deepenglish.com",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
                },
            }).then(v => v.data);
            
            const p = chat;
            p.push(await a.data.choices.shift().message);
            
            return resolve({
                response: (p.pop()?.content) || "",
            });
        } catch (e) {
            reject(e);
        }
    });
}

module.exports = { englishAi };
