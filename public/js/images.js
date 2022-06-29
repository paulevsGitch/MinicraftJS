const Images = {
	values: {}
}

Images.counter = 0;

Images.incrementCounter = function () {
	Images.counter++;
}

Images.load = function(path) {
	let values = Images.values;
	let img = values[path];
	if (img === undefined) {
		img = new Image();
		img.src = path;
		values[path] = img;
		if (img.complete) incrementCounter();
		else img.addEventListener("load", Images.incrementCounter, false);
	}
	return img;
}

Images.loadComplete = function() {
	return Images.counter == Object.keys(Images.values).length;
}

Images.afterLoad = function(init) {
	let intervalID = -1;
	intervalID = setInterval(() => {
		if (Images.counter > 1 && Images.loadComplete()) {
			clearInterval(intervalID);
			init();
		}
	}, 100);
}