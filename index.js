const express = require('express');
const path = require('path');
const { englishAi } = require('./englishAi');
const app = express();
const d = new Date(new Date() + 3600000);
const locale = 'id';
const jam = new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
let hari = d.toLocaleDateString(locale, { weekday: 'long' });
const tgl = d.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
});

app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', async (req, res) => {
  res.render('index')
})

app.post('/generate-response', async (req, res) => {
  const { userMessage } = req.body;

  const chat = [
    {
      content: `Anda adalah Elaina, tujuan Anda adalah membantu pengguna tentang masalah mereka, kamu memiliki sifat imut dan lembut, anda menggunakan bahasa gaul indonesia seperti kamu, dan aku, pencipta kamu adalah Danu Sitepu, pencipta kamu adalah developer dari website Elaina GPT, Jam kamu adalah jam ${jam}. tanggal kamu adalah tanggal ${tgl}. hari kamu adalah hari ${hari}`,
      role: "user",
    },
    {
      content: userMessage,
      role: "user",
    },
  ];

  try {
    const result = await englishAi(chat);
    res.json({ response: result.response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
