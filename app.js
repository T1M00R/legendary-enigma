const axios = require('axios');
require('dotenv').config(); // Load environment variables from .env file
const TelegramBot = require('node-telegram-bot-api');

// Access the API keys from the environment variables
const botToken = process.env.BOT_TOKEN;
const vfApiKey = process.env.VF_API_KEY;

const userID = 'user_123'; // Unique ID used to track conversation state

const bot = new TelegramBot(botToken, { polling: true }); // Initialize Telegram bot
let chatId; // Variable to store the chat ID

async function startInteract(userInput) {
  try {
    // Ensure chat ID is available
    if (!chatId) {
      console.error('Error: Chat ID is not available');
      return;
    }

    const body = {
      action: {
        type: 'text',
        payload: userInput,
      },
    };

    // Start a conversation
    const response = await axios({
      method: 'POST',
      baseURL: 'https://general-runtime.voiceflow.com',
      url: `/state/user/${userID}/interact`,
      headers: {
        Authorization: vfApiKey,
      },
      data: body,
    });

    // Log the response
    console.log(response.data);

    // Extract message from response
    const messages = response.data;
    const textMessage = messages.find(msg => msg.type === 'text');
    if (textMessage) {
      const messageContent = textMessage.payload.message;
      // Send message to Telegram with the stored chat ID
      await sendMessageToTelegram(messageContent);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Listen for incoming messages
bot.on('message', (msg) => {
  // Store the chat ID if not already stored
  if (!chatId) {
    chatId = msg.chat.id;
  }
  // Start interacting with Voiceflow
  startInteract(msg.text);
});

async function sendMessageToTelegram(message) {
  try {
    if (!chatId) {
      throw new Error('Chat ID is undefined');
    }
    const response = await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      chat_id: chatId.toString(), // Convert chatId to string
      text: message,
    });
    console.log('Telegram response:', response.data);
  } catch (error) {
    console.error('Error sending message to Telegram:', error.message);
  }
}
