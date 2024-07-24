const fs = require('fs');
const {PDFDocument, rgb} = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');

async function createPdfWithTable(outputPdfPath) {
	// Создаем новый PDF документ
	const pdfDoc = await PDFDocument.create();

	// Встраиваем шрифт
	pdfDoc.registerFontkit(fontkit);
	const fontBytes = fs.readFileSync('Roboto-Regular.ttf');
	const customFont = await pdfDoc.embedFont(fontBytes);

	const page = pdfDoc.addPage([595, 842]); // Размер страницы A4
	const {width, height} = page.getSize();

	const fontSize = 10;
	const titleFontSize = 14;
	const tableX = 50;
	const tableY = height - 100;

	// Заголовок
	const title = 'Расходная накладная № ___ от ___ 2023 г.\nПоставщик: ТОО "Тауык Хауз"';
	const titleX = tableX;
	const titleY = height - 50;

	// Данные для таблицы
	const tableData = [
		['№ п/п', 'Товар', 'Количество', 'ед изм', 'Цена', 'Сумма'],
		['1', 'Печенье', '', 'кор', '2 600', ''],
		['2', 'Печенье', '', 'кор', '2 700', ''],
		['3', 'Печенье', '', 'кор', '6 520', ''],
	];

	// Определение ширины колонок
	const columnWidths = [50, 250, 70, 50, 80, 80];
	const cellHeight = 20;

	// Функция для отрисовки текста в ячейке таблицы
	function drawTextInCell(page, text, x, y, cellWidth, cellHeight, fontSize) {
		page.drawText(text, {
			x: x + 2,
			y: y - cellHeight + fontSize + 2,
			size: fontSize,
			font: customFont,
			color: rgb(0, 0, 0),
		});
	}

	// Отрисовка заголовка
	page.drawText(title, {
		x: titleX,
		y: titleY,
		size: titleFontSize,
		font: customFont,
		color: rgb(0, 0, 0),
	});

	// Отрисовка таблицы
	let currentY = tableY;
	tableData.forEach((row, rowIndex) => {
		let currentX = tableX;
		row.forEach((cellText, colIndex) => {
			const cellWidth = columnWidths[colIndex];
			page.drawRectangle({
				x: currentX,
				y: currentY - cellHeight,
				width: cellWidth,
				height: cellHeight,
				borderColor: rgb(0, 0, 0),
				borderWidth: 1,
			});
			drawTextInCell(page, cellText, currentX, currentY, cellWidth, cellHeight, fontSize);
			currentX += cellWidth;
		});
		currentY -= cellHeight;
	});

	// Сохранение PDF документа
	const pdfBytes = await pdfDoc.save();
	fs.writeFileSync(outputPdfPath, pdfBytes);

	console.log(`PDF файл сохранен как ${outputPdfPath}`);
}

// Пример использования
createPdfWithTable('output.pdf');
