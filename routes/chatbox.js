const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = 'AIzaSyA-baKPCqwWQ_hQs-cWZIeKMDMc6TmaNQc';
const genAI = new GoogleGenerativeAI(apiKey);

router.get('/', (req, res) => {
    res.render('chatbox');
});

router.post('/send', async (req, res) => {
    const userMessage = req.body.message;

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(userMessage);
        const response = await result.response;
        const geminiReply = response.text();

        res.json({ reply: geminiReply });
    } catch (error) {
        console.error('API 调用错误：', error);
        res.status(500).json({ error: 'API 调用失败' });
    }
});

module.exports = router;