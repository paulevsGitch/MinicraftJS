class GameObject extends StaticEntity {
	constructor(x, y, image) {
		super(x, y)
		this.spriteOffset = new Vec2();
		this.image = image;
	}
}

class PlantEntity extends GameObject {
	constructor(x, y, image, imageX, imageY, size, waving) {
		super(x, y, image);
		this.imageX = imageX;
		this.imageY = imageY;
		this.size = size;
		this.waving = waving;
		this.spriteOffset.set(size * 0.5, size);
	}
	
	render(context) {
		let transform = context.getTransform();
		context.transform(1.0, 0.0, 0.0, 1.0, this.position.x * 16.0 - this.spriteOffset.x, this.position.y * 16.0 - this.spriteOffset.y);
		
		if (this.waving) {
			let time = Minicraft.renderContext.time;
			let dist = Math.sin(time * 0.002 + this.position.x * 0.5 + this.position.y) * 0.1;
			context.transform(1.0, 0.0, dist, 1.0, 0.0, this.spriteOffset.y);
			context.transform(1.0, 0.0, 0.0, 1.0, 0.0, -this.spriteOffset.y);
		}
		
		context.drawImage(this.image, this.imageX, this.imageY, this.size, this.size, 0.0, 0.0, this.size, this.size);
		context.setTransform(transform);
	}
}

const GameObjectTextures = {
	tallGrass: Images.load("img/sprites/tall_grass.png")
};

class TallGrassPlant extends PlantEntity {
	constructor(x, y) {
		super(x, y, GameObjectTextures.tallGrass, MathHelper.randomInt(2) << 4, MathHelper.randomInt(2) << 4, 16, true);
		this.spriteOffset.y -= 2;
	}
}