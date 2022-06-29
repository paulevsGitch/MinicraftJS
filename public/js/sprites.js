class Sprite {
	constructor(image) {
		this.position = new Vec2();
		this.image = image;
	}
	
	render(context) {
		context.drawImage(this.image, this.position.x, this.position.y);
	}
}

class AtlasSprite extends Sprite {
	constructor(image, start, size) {
		super(image);
		this.start = start;
		this.size = size;
	}
	
	render(context) {
		context.drawImage(this.image, this.start.x, this.start.y, this.size.x, this.size.y, this.position.x, this.position.y, this.size.x, this.size.y);
	}
}

const Sprites = [];

Sprites.fromAtlas = function(image, countX, countY, size) {
	let sprites = [];
	for (let x = 0; x < countX; x++) {
		for (let y = 0; y < countY; y++) {
			let sprite = new AtlasSprite(image, new Vec2(x, y).multiply(size), size);
			sprites.push(sprite);
		}
	}
	console.log(sprites);
	return sprites;
}