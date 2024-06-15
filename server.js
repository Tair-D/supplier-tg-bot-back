const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
const PDFDocument = require('pdfkit');
const fs = require('fs');

const token = process.env.TELEGRAM_BOT_TOKEN || '7461522699:AAE5E5APgIdzh7xO5X1-lMXWXN-PFoZGC-s';
const webAppUrl = 'https://delicate-youtiao-f100b5.netlify.app/';

const bot = new TelegramBot(token, {polling: true});
const app = express();
require('dotenv').config(); // Load environment variables from .env file

app.use(express.json());
app.use(cors());

bot.on('message', async (msg) => {
	const chatId = msg.chat.id;
	const text = msg.text;

	if (text === '/start') {

		await bot.sendMessage(chatId, 'Добро пожаловать в наш магазин! 🛒\n' +
			'\n' +
			'Ниже вы найдете кнопку "Сделать заказ". Нажмите на нее, чтобы начать процесс оформления заказа и выбрать нужные товары из нашего каталога.\n' +
			'\n' +
			'Приятных покупок!\n' +
			'\n' +
			'👇 Нажмите кнопку "Сделать заказ" ниже, чтобы начать.', {
			reply_markup: {
				inline_keyboard: [
					[{text: 'Сделать заказ', web_app: {url: webAppUrl}}]
				]
			}
		});
	}

	if (msg?.web_app_data?.data) {
		try {
			const data = JSON.parse(msg?.web_app_data?.data);
			console.log(data);
			await bot.sendMessage(chatId, 'Спасибо за обратную связь!');
			await bot.sendMessage(chatId, 'Ваша страна: ' + data?.country);
			await bot.sendMessage(chatId, 'Ваша улица: ' + data?.street);

			setTimeout(async () => {
				await bot.sendMessage(chatId, 'Всю информацию вы получите в этом чате');
			}, 3000);
		} catch (e) {
			console.log(e);
		}
	}
});

// Function to generate PDF receipt
const generatePDFReceipt = (queryId, shopName, receiverName, phoneNumber, address, products, totalPrice) => {
	return new Promise((resolve, reject) => {
		const doc = new PDFDocument();
		const filePath = `receipts/${queryId}.pdf`;

		doc.pipe(fs.createWriteStream(filePath))
			.on('finish', () => resolve(filePath))
			.on('error', reject);

		doc.fontSize(20).text('Receipt/Invoice', {align: 'center'});
		doc.moveDown();
		doc.fontSize(12).text(`Shop Name: ${shopName}`);
		doc.text(`Receiver Name: ${receiverName}`);
		doc.text(`Phone Number: ${phoneNumber}`);
		doc.text(`Address: ${address}`);
		doc.moveDown();
		doc.text('Products:');
		products.forEach(product => {
			doc.text(`- ${product.title}: ${product.quantity} шт - ${product.price} ₸`);
		});
		doc.moveDown();
		doc.fontSize(14).text(`Total Price: ${totalPrice} ₸`, {align: 'right'});
		doc.end();
	});
};

// Function to send PDF via Telegram bot
const sendPDFToTelegram = async (filePath) => {
	const url = `https://api.telegram.org/bot${bot.token}/sendDocument`;
	const form = new FormData();
	// form.append('chat_id', chatId);
	form.append('document', fs.createReadStream(filePath));

	const response = await fetch(url, {method: 'POST', body: form});
	return response.json();
};


app.post('/web-data', async (req, res) => {
	const {queryId, products = [], totalPrice, address, receiverName, shopName, phoneNumber} = req.body;
	const productList = products.map(product => `- ${product?.title}: ${product?.quantity} шт - ${product?.price} ₸`).join('\n');
	// const chatId = req.body.chatId; // Make sure you have the chatId

	try {
		// const filePath = await generatePDFReceipt(queryId, shopName, receiverName, phoneNumber, address, products, totalPrice);
		// await sendPDFToTelegram(filePath);

		await bot.answerWebAppQuery(queryId, {
			type: 'article',
			id: queryId,
			title: 'Заказ оформлен',
			input_message_content: {
				message_text: 'Ваш заказ успешно оформлен! 🎉\n' + '\n' +
					`Сумма заказа: ${totalPrice} ₸\n` +
					`Список товаров: \n${productList}\n` + '\n' +
					`Название магазина: ${shopName}\n` +
					`Ваш заказ будет доставлен по адресу: ${address}\n` + `Контактный телефон: ${phoneNumber} \n` +
					`Имя и фамилия получателя: ${receiverName}\n\n` +
					`Спасибо за покупку! Если у вас возникнут вопросы, обращайтесь к нам.`
			}
		});

		return res.status(200).json({});
	} catch (e) {
		await bot.answerWebAppQuery(queryId, {
			type: 'article',
			id: queryId,
			title: 'Ошибка',
			input_message_content: {
				message_text: `Произошла Ошибка`
			}
		});
		return res.status(500).json({});
	}
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => console.log('Server started on PORT ' + PORT));
