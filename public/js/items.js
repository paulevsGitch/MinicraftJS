class Item {
	constructor(image) {
		this.image = image;
		this.id = 0;
	}
	
	render(context, x, y) {
		context.drawImage(this.image, x, y);
	}
	
	onUse(world, x, y, stack) {}
	
	renderOnCursor(context, x, y) {
		this.render(context, x * 16, y * 16);
	}
}

class ItemEntity extends MovableEntity {
	constructor(item) {
		super();
		this.item = item;
		this.maxAge = 10;
		this.canPick = false;
		this.age = 0;
	}
	
	tick(world, delta) {
		super.tick(world, delta);
		this.age += delta;
		this.speed -= delta * 20;
		if (this.speed < 0.0) this.speed = 0.0;
		if (this.age > this.maxAge) this.alive = false;
		this.canPick = this.age > 0.5;
	}
	
	render(context) {
		if (this.age > 8) {
			let flick = Math.cos((this.age - 8) * 10) * 0.25 + 0.75;
			Render.setAlpha(context, flick);
		}
		let dy = Math.sin(this.age) * 4 + 4;
		if (this.age < 0.4) {
			let delta = MathHelper.clamp(this.age / 0.2 - 1.0, 0.0, 1.0);
			let addition = Math.cos(this.age / 0.4 * Math.PI) * 6 + 8;
			dy = MathHelper.lerp(addition, dy, delta);
		}
		this.item.render(context, this.position.x * 16 - 8, this.position.y * 16 - 8 - dy);
		Render.setAlpha(context, 1.0);
	}
	
	drop(world, position) {
		this.velocity.set(MathHelper.randomCentered(), MathHelper.randomCentered()).normalize();
		this.speed = 5.0;
		this.position.set(position);
		world.addEntity(this);
	}
}

class PlacerItem extends Item {
	constructor(item, entityConstructor) {
		super(item);
		this.entityConstructor = entityConstructor;
		this.entityInstance = entityConstructor(0, 0);
	}
	
	onUse(world, x, y, stack) {
		this.entityInstance.position.set(x, y);
		world.addEntity(this.entityConstructor(x, y));
		stack.count--;
	}
	
	renderOnCursor(context, x, y) {
		Render.setAlpha(context, 0.5);
		this.entityInstance.position.set(x, y);
		this.entityInstance.render(context);
		Render.setAlpha(context, 1.0);
	}
	
	drop(world, position) {
		this.velocity.set(MathHelper.randomCentered(), MathHelper.randomCentered()).normalize();
		this.speed = 5.0;
		this.position.set(position);
		world.addEntity(this);
	}
}

const Items = {
	values: []
}

Items.registerItem = function(item) {
	var values = Items.values;
	var id = values.length;
	if (values[id] === undefined) {
		values[id] = item;
		item.id = id;
	}
	return item;
}

Items.treeLog = Items.registerItem(new Item(Images.load("img/items/tree_log.png")));
Items.treeSapling = Items.registerItem(new PlacerItem(Images.load("img/items/tree_sapling.png"), (x, y) => {
	let tree = new SimpleTree(x, y);
	tree.age = 0.0;
	return tree;
}));