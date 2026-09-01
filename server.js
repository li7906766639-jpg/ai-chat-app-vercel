const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

console.log('Environment Check:');
console.log('API Key Present:', !!OPENAI_API_KEY);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static('public'));

// Serve HTML
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Chat endpoint
app.post('/chat', async (req, res) => {
  try {
    const { messages, model } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: { message: 'Invalid messages format' } });
    }

    if (!OPENAI_API_KEY || OPENAI_API_KEY.trim() === '') {
      console.error('API Key not configured!');
      return res.status(500).json({ error: { message: 'API key missing' } });
    }

    console.log('Calling OpenAI API...');
    
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: model || 'gpt-3.5-turbo',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    console.log('OpenAI API response successful');
    res.json(response.data);

  } catch (error) {
    console.error('Chat Error:', error.message);
    const errorMessage = error.response?.data?.error?.message || error.message || 'Server error';
    res.status(error.response?.status || 500).json({ error: { message: errorMessage } });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', apiKeyConfigured: !!OPENAI_API_KEY });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;