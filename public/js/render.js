const Render = {}
Render.textures = {}

Render.drawCentered = function(context, image, x, y, scale) {
	let width = image.width * scale;
	let height = image.height * scale;
	context.drawImage(image, x - (width >> 1), y - (height >> 1), width, height);
}

Render.printCentered = function(context, text, x, y) {
	let metrics = context.measureText(text);
	let height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
	context.fillText(text, x - (metrics.width >> 1), y + (height >> 1));
}

Render.defaultBlending = function(context) {
	context.globalCompositeOperation = "source-over";
}

Render.screenBlending = function(context) {
	context.globalCompositeOperation = "screen";
}

Render.multiplyBlending = function(context) {
	context.globalCompositeOperation = "multiply";
}

Render.overlayBlending = function(context) {
	context.globalCompositeOperation = "overlay";
}

Render.addBlending = function(context) {
	context.globalCompositeOperation = "lighter";
}

Render.setAlpha = function(context, alpha) {
	context.globalAlpha = alpha;
}

Render.enableSmooth = function(context, smooth) {
	context.imageSmoothingEnabled = smooth;
}

Render.setDefaultFont = function(context) {
	context.font = "bold 24px serif";
}

Render.setFont = function(context, scale) {
	context.font = "bold " + scale + "px serif";
}

Render.drawNineElements = function(context, image, x, y, width, height, corner) {
	let startSide = image.width / 3;
	let delX = image.width - startSide;
	let delY = image.height - startSide;
	let posX = x + width - corner;
	let posY = y + height - corner;
	let width2 = width - (corner << 1);
	let height2 = height - (corner << 1);
	
	context.drawImage(image, 0, 0, startSide, startSide, x, y, corner, corner);
	context.drawImage(image, delX, 0, startSide, startSide, posX, y, corner, corner);
	
	context.drawImage(image, 0, delY, startSide, startSide, x, posY, corner, corner);
	context.drawImage(image, delX, delY, startSide, startSide, posX, posY, corner, corner);
	
	let posX2 = x + corner;
	let posY2 = y + corner;
	context.drawImage(image, startSide, 0, startSide, startSide, posX2, y, width2, corner);
	context.drawImage(image, startSide, delY, startSide, startSide, posX2, posY, width2, corner);
	
	context.drawImage(image, 0, startSide, startSide, startSide, x, posY2, corner, height2);
	context.drawImage(image, delX, startSide, startSide, startSide, posX, posY2, corner, height2);
	
	context.drawImage(image, startSide, startSide, startSide, startSide, posX2, posY2, width2, height2);
}