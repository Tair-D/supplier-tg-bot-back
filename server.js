const express = require('express');
const { Telegraf, Markup } = require('telegraf');

const app = express();
const token = '7461522699:AAE5E5APgIdzh7xO5X1-lMXWXN-PFoZGC-s';

const bot = new Telegraf(token);
bot.command('start', (ctx) => {
    const helpMessage = `
    *What can this bot do?*

    1. *Browse the Catalog*: View available products with details and images.
    2. *Add to Cart*: Add items to your cart with specified quantities.
    3. *Review Orders*: Modify or remove items before checkout.
    4. *Checkout Process*: Enter personal information and delivery details.
    5. *Personal Data Management*: Update or delete your personal data.
    6. *Order Status Tracking*: Track your order status in real-time.
    7. *Customer Support*: Get automated responses or escalate to human support.
    `;

    const webLaunchButton = Markup.inlineKeyboard([
        Markup.button.url('Visit Our Shop', 't.me/EasyPostavshik_bot/myVKAPP')
    ]);

    ctx.replyWithMarkdown(helpMessage, webLaunchButton);
});


bot.launch();
