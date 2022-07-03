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
		this.wavingSpeed = 0.002;
		if (size != -1) this.spriteOffset.set(size * 0.5, size);
	}
	
	render(context) {
		let transform = context.getTransform();
		context.transform(1.0, 0.0, 0.0, 1.0, this.position.x * 16.0 - this.spriteOffset.x, this.position.y * 16.0 - this.spriteOffset.y);
		
		if (this.waving > 0) {
			let time = Minicraft.renderContext.time;
			let dist = Math.sin(time * this.wavingSpeed + this.position.x * 0.5 + this.position.y) * this.waving;
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
		this.damage = 0.0;
		this.oldDamage = 0.0;
		this.animationProgress = 0.0;
	}
	
	render(context) {
		this.imageX = Math.floor(this.age * this.stages) * this.size;
		super.render(context);
	}
	
	onDeath(world) {
		let count = Math.ceil(this.age * 2.5);
		for (let i = 0; i < count; i++) {
			let entity = new ItemEntity(Items.treeSapling);
			entity.drop(world, this.position);
		}
		
		if (this.age > 0.5) {
			count = Math.ceil(this.age * 3) + MathHelper.randomInt(1);
			for (let i = 0; i < count; i++) {
				let entity = new ItemEntity(Items.treeLog);
				entity.drop(world, this.position);
			}
		}
	}
	
	onItemUse(stack) {
		if (stack.item == Items.woodenAxe) {
			this.damage += 0.34;
			if (this.damage > 1.0) this.alive = false;
		}
	}
	
	tick(world, delta) {
		super.tick(world, delta);
		if (this.oldDamage != this.damage) {
			if (this.animationProgress == 0.0) {
				this.oldWaving = this.waving;
				this.oldWavingSpeed = this.wavingSpeed;
			}
			this.animationProgress += MathHelper.clamp(delta * 3, 0.0, 1.0);
			this.waving = this.oldWaving + Math.pow(Math.sin(this.animationProgress * Math.PI), 0.5) * 0.05;
			this.wavingSpeed = 0.02;
			if (this.animationProgress >= 1.0) {
				this.oldDamage = this.damage;
				this.animationProgress = 0.0;
				this.waving = this.oldWaving || 0.02;
				this.wavingSpeed = this.oldWavingSpeed || 0.002;
			};
		}
	}
}

class SimpleTree extends TreePlant {
	constructor(x, y) {
		super(x, y, 4, 0.01);
	}
	
	tick(world, delta) {
		super.tick(world, delta);
		if (this.age < 0.999) {
			this.age = this.age + delta * this.growSpeed;
			if (this.age > 0.999) this.age = 0.999;
		}
	}
}