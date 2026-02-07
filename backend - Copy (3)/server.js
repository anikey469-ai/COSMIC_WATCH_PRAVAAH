const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// NASA API Proxy - Keeps keys hidden from the client
app.get('/api/neos', async (req, res) => {
  const { start_date } = req.query;
  const apiKey = process.env.NASA_API_KEY || 'KXRwExHnLSAu5xiX5IjsolZmuQtwWLo4FhZIPvOc';
  const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${start_date || new Date().toISOString().split('T')[0]}&api_key=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`NASA API returned status ${response.status}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('NASA Proxy Error:', error);
    res.status(500).json({ error: 'Failed to synchronize with NASA telemetry' });
  }
});

// Gemini AI Proxy - Centralized AI logic
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  
  if (!process.env.API_KEY) {
    return res.status(500).json({ error: 'AI Uplink Key Not Configured' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: message,
      config: {
        systemInstruction: "You are CosmoAI, a high-fidelity expert system for orbital mechanics and asteroid tracking. Provide professional, scientific, and concise responses. Use technical terminology when appropriate but remain accessible to authorized observers.",
      }
    });
    res.json({ text: response.text });
  } catch (error) {
    console.error('AI Proxy Error:', error);
    res.status(500).json({ error: 'Neural link interrupted' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[COSMIC-BACKEND] Terminal active on port ${PORT}`);
});