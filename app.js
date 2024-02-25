const { Telegraf } = require('telegraf')
const { message } = require('telegraf/filters')
const axios = require('axios');

require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN)

async function interact(ctx, chatID, request){

    const response = await axios({
        method: "POST",
        url: "https://general-runtime.voiceflow.com/state/user/${userID}/interact",
        headers:{
            Authorization: process.env.VF_API_KEY
        },
        data:{
            request
        }
    });

    // Handle responses
    for (const trace of response.data){
        switch (trace.type){
            case "text":
            case "speak":
                {
                    await ctx.reply(trace.payload.message);
                }
            case "visual":
                {
                    await ctx.replyWithPhoto(trace.payload.image);
                }
            case "end": 
                {
                    await ctx.reply("Conversation is over");
                    break;
                }
        }
    }
}

// Start bot
bot.start(async(ctx) => {
    let chatID = ctx.message.chat.id;
    await interact(ctx, chatID, {type: "launch"});
});


//bot.help((ctx) => ctx.reply('Send me a sticker'))
//bot.on(message('sticker'), (ctx) => ctx.reply('👍'))

// Capture any expression that a user sends in the conversation thread
const ANY_WORD_REGEX = new RegExp(/{.+}/i);
bot.hears(ANY_WORD_REGEX, async(ctx) => {
    let chatID = ctx.message.chat.id;
    await interact(ctx, chatID, {
        type: "text", payload: ctx.message.text});
});


bot.launch()



// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))