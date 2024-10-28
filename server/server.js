const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const PORT = 5000;

// Initialize OpenAI
const client = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY'],
});

// Middleware
app.use(cors());
app.use(express.json());

// Endpoint for processing requests
app.post('/process-request', async (req, res) => {

    const { userInput, chatHistory } = req.body;

    try {
        // Simulate a call to OpenAI to determine if the request is valid.
        const response = await client.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { 
                    role: "system", 
                    content: `You are an assistant that processes user requests and checks if a request is valid or not. 
                    - If a user greets you with something like "hi", "hello", or "how are you", respond with a friendly greeting (e.g., "Hello! How can I assist you today?").
                    - After greeting, if the message contains a request, you must evaluate it.
                    - If the request involves changing or updating content something specific (such as making content more focused on a specific topic), respond with 'yes' **only**.
                    - If the request is about design changes (like colors, fonts, or UI layout), or anything that is not content-focused, consider the request as invalid.
                    - If a request is invalid or not clear, respond with 'Please make a valid request. Valid requests involve changing or updating information, such as making content more focused on a specific topic.`
                },
                {
                    role: "user",
                    content: userInput,
                },
            ]
        });

        const responseData = response.choices[0].message.content.toLowerCase()
        const isValid = responseData === 'yes'

        if(isValid){

            const response = await axios.post('https://jsonplaceholder.typicode.com/posts', {
                input: [{user: userInput},...chatHistory],
            });
            console.log(response.data)
            res.send("We are currently changing the content.")

        } else{
            res.send(`${responseData}`)
        }

    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).send('data: Error processing your request.\n\n');
        res.end();
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
