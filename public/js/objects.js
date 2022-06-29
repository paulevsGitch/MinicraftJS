class GameObject {
	render(context, x, y) {}
}

class PlantObject extends GameObject {
	constructor(image, wavign, offset) {
		super();
		this.image = image;
		this.wavign = wavign;
		this.offset = offset;
		this.center = new Vec2();
	}
	
	render(context, x, y) {
		if (this.wavign) {
			let px = x << 4;
			let py = y << 4;
			//context.drawImage(this.image, px, py);
			
			let time = Minicraft.renderContext.time;
			let dist = Math.sin(time * 0.002 + px * 0.5 + py) * 0.1;
			let transform = context.getTransform();
			context.transform(1.0, 0.0, dist, 1.0, px - dist * 16, py + this.center.y);
			if (this.offset) {
				let offset = GameObjects.offsets[(y & 31) << 5 | (x & 31)];
				context.drawImage(this.image, offset.x, offset.y);
			}
			else context.drawImage(this.image, 0, -this.center.y);
			context.setTransform(transform);
		}
		else context.drawImage(this.image, x << 4, y << 4);
	}
}

const GameObjects = {};

GameObjects.offsets = [];
for (let x = 0; x < 32; x++) {
	for (let y = 0; y < 64; y++) {
		let index = y << 5 | x;
		GameObjects.offsets[index] = new Vec2(MathHelper.randomCentered() * 8, MathHelper.randomCentered() * 8);
	}
}

GameObjects.tallGrass = new PlantObject(Images.load("img/sprites/tall_grass.png"), true, true);
GameObjects.tallGrass.center.y = 0;