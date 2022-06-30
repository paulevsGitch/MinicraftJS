class GameObject {
	render(context, x, y) {}
}

class PlantObject extends GameObject {
	constructor(image, wavign, offset, countX, countY, size) {
		super();
		this.image = image;
		this.wavign = wavign;
		this.offset = offset;
		this.center = new Vec2();
		this.countX = countX;
		this.countY = countY;
		this.size = size;
	}
	
	render(context, x, y) {
		let px = x << 4;
		let py = y << 4;
		let index = (y & 15) << 4 | (x & 15);
		let table = GameObjects.renderingData.randomTable;
		let ix = this.countX == undefined ? 0 : table[index].x % this.countX;
		let iy = this.countY == undefined ? 0 : table[index].y % this.countY;
		
		if (this.offset) {
			let offset = GameObjects.renderingData.offsets[index];
			px += offset.x;
			py += offset.y;
		}
		
		let transform = context.getTransform();
		if (this.wavign) {
			let time = Minicraft.renderContext.time;
			let dist = Math.sin(time * 0.002 + x * 0.5 + y) * 0.1;
			context.transform(1.0, 0.0, dist, 1.0, px - dist * 16, py + this.center.y);
		}
		else {
			context.transform(1.0, 0.0, 0.0, 1.0, px, py);
		}
		
		context.drawImage(this.image, ix * this.size, iy * this.size, this.size, this.size, 0, 0, this.size, this.size);
		context.setTransform(transform);
	}
}

const GameObjects = {};

GameObjects.renderingData = {
	offsets: [],
	randomTable: []
};

for (let i = 0; i < 256; i++) {
	GameObjects.renderingData.offsets[i] = new Vec2(Math.round(MathHelper.randomCentered() * 4), Math.round(MathHelper.randomCentered() * 4));
	GameObjects.renderingData.randomTable[i] = new Vec2(Math.floor(Math.random() * 256), Math.floor(Math.random() * 256));
}

GameObjects.tallGrass = new PlantObject(Images.load("img/sprites/tall_grass.png"), true, true, 2, 2, 16);
GameObjects.tallGrass.center.y = 0;