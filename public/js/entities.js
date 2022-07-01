const Entities = {};
Entities.mutableBox = new BoundingBox(new Vec2(1.0));

class Entity {
	constructor() {
		this.lastPosition = new Vec2();
		this.position = new Vec2();
		this.bbOffset = new Vec2(-0.5);
		this.boundingBox = new BoundingBox(new Vec2(1.0));
	}
	
	render(context) {}
	
	tick(world, delta) {}
	
	canMove(tile) {
		return tile != undefined && tile != Tiles.water;
	}
}

class StaticEntity extends Entity {
	constructor(x, y) {
		super();
		this.position.set(MathHelper.clampFloat(x, 16), MathHelper.clampFloat(y, 16));
	}
}

class MovableEntity extends Entity {
	constructor() {
		super();
		this.colliders = new List();
		this.collideVelocity = new Vec2();
		this.velocity = new Vec2();
		this.speed = 5.0;
	}
	
	tick(world, delta) {
		let px = Math.floor(this.position.x);
		let py = Math.floor(this.position.y);
		
		this.colliders.clear();
		let dx = this.velocity.x;
		let dy = this.velocity.y;
		this.boundingBox.position.add(dx, dy);
		for (let x = -1; x <= 1; x++) {
			let wx = px + x;
			for (let y = -1; y <= 1; y++) {
				let wy = py + y;
				if (!this.canMove(world.getTile(wx, wy))) {
					Entities.mutableBox.position.set(wx, wy);
					if (this.boundingBox.collides(Entities.mutableBox)) {
						this.colliders.add(structuredClone(Entities.mutableBox));
					}
				}
			}
		}
		this.boundingBox.position.subtract(dx, dy);
		
		this.colliders.sort((box1, box2) => {
			let x = box1.position.x + box1.size.x * 0.5 - this.position.x;
			let y = box1.position.y + box1.size.y * 0.5 - this.position.y;
			let d1 = x * x + y * y;
			x = box2.position.x + box2.size.x * 0.5 - this.position.x;
			y = box2.position.y + box2.size.y * 0.5 - this.position.y;
			let d2 = x * x + y * y;
			return Math.sign(d1 - d2);
		});
		
		this.colliders.forEach(box => this.boundingBox.sweptCollision(box, this.velocity));
		
		this.lastPosition.set(this.position);
		this.position.add(this.velocity);
		this.boundingBox.position.set(this.position).add(this.bbOffset);
	}
	
	render(context) {
		context.strokeStyle = "magenta";
		context.beginPath();
		context.rect(
			(this.boundingBox.position.x) * 16,
			(this.boundingBox.position.y) * 16,
			this.boundingBox.size.x * 16,
			this.boundingBox.size.y * 16
		);
		context.stroke();
		
		// context.strokeStyle = "red";
		// context.beginPath();
		// this.colliders.forEach(box => {
		// 	context.rect(
		// 		(box.position.x) * 16,
		// 		(box.position.y) * 16,
		// 		box.size.x * 16,
		// 		box.size.y * 16
		// 	);
		// })
		// context.stroke();
	}
}

class PlayerEntity extends MovableEntity {
	constructor() {
		super();
		this.colliders = new List();
	}
	
	tick(world, delta) {
		this.velocity.set(0, 0);
		if (Controls.isKeyHold("KeyW")) {
			this.velocity.y -= 1;
		}
		if (Controls.isKeyHold("KeyS")) {
			this.velocity.y += 1;
		}
		if (Controls.isKeyHold("KeyA")) {
			this.velocity.x -= 1;
		}
		if (Controls.isKeyHold("KeyD")) {
			this.velocity.x += 1;
		}
		this.velocity.normalize().multiply(delta * this.speed);
		super.tick(world, delta);
	}
	
	render(context) {
		context.fillStyle = "magenta";
		context.fillRect(
			(this.boundingBox.position.x) * 16,
			(this.boundingBox.position.y) * 16 - 8,
			this.boundingBox.size.x * 16,
			this.boundingBox.size.y * 16
		);
	}
}