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
		if (size != -1) this.spriteOffset.set(size * 0.5, size);
	}
	
	render(context) {
		let transform = context.getTransform();
		context.transform(1.0, 0.0, 0.0, 1.0, this.position.x * 16.0 - this.spriteOffset.x, this.position.y * 16.0 - this.spriteOffset.y);
		
		if (this.waving > 0) {
			let time = Minicraft.renderContext.time;
			let dist = Math.sin(time * 0.002 + this.position.x * 0.5 + this.position.y) * this.waving;
			context.transform(1.0, 0.0, dist, 1.0, 0.0, this.spriteOffset.y);
			context.transform(1.0, 0.0, 0.0, 1.0, 0.0, -this.spriteOffset.y);
		}
		
		if (this.size != -1) context.drawImage(this.image, this.imageX, this.imageY, this.size, this.size, 0, 0, this.size, this.size);
		else context.drawImage(this.image, 0, 0);
		context.setTransform(transform);
	}
}

const GameObjectTextures = {
	tallGrass: Images.load("img/sprites/tall_grass.png"),
	tree: Images.load("img/sprites/tree.png")
};

class TallGrassPlant extends PlantEntity {
	constructor(x, y) {
		super(x, y, GameObjectTextures.tallGrass, MathHelper.randomInt(2) << 4, MathHelper.randomInt(2) << 4, 16, 0.1);
		this.spriteOffset.y -= 2;
	}
}

class TreePlant extends PlantEntity {
	constructor(x, y, stages, growSpeed) {
		super(x, y, GameObjectTextures.tree, 0, 0, 48, 0.02);
		this.boundingBox.position.set(x, y).subtract(0.25);
		this.boundingBox.size.set(0.5);
		this.age = Math.random();
		this.spriteOffset.y -= 3;
		this.stages = stages;
		this.collidable = true;
		this.growSpeed = growSpeed;
		this.selectionBox = new BoundingBox(new Vec2(0.8, 1.6));
		this.selectionBox.position.set(x, y).subtract(0.4, 1.4);
	}
	
	render(context) {
		this.imageX = Math.floor(this.age * this.stages) * this.size;
		super.render(context);
	}
}

class SimpleTree extends TreePlant {
	constructor(x, y) {
		super(x, y, 4, 0.01);
	}
	
	tick(world, delta) {
		if (this.age < 0.999) {
			this.age = this.age + delta * this.growSpeed;
			if (this.age > 0.999) this.age = 0.999;
		}
	}
}