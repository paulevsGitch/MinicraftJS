const Entities = {};
Entities.mutableBox = new BoundingBox(new Vec2(), new Vec2(1.0));

class Entity {
	constructor() {
		this.lastPosition = new Vec2();
		this.position = new Vec2();
		this.collideVelocity = new Vec2();
		this.velocity = new Vec2();
		this.speed = 5.0;
		this.boundingBox = new BoundingBox(new Vec2(-0.5), new Vec2(1.0));
	}
	
	render(context) {}
	
	tick(delta) {
		this.position.add(this.velocity.x * delta * this.speed, this.velocity.y * delta * this.speed);
	}
	
	canMove(tile) {
		return tile != undefined && tile != Tiles.water;
	}
}

class PlayerEntity extends Entity {
	constructor() {
		super();
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
		
		// let x = Math.floor(this.position.x);
		// let y = Math.floor(this.position.y);
		// 
		// if (!this.canMove(world.getTile(x, y))) {
		// 	this.position.set(this.lastPosition);
		// }
		
		let px = Math.floor(this.position.x);
		let py = Math.floor(this.position.y);
		
		let x1 = this.velocity.x < 0 ? -1 : 0;
		let x2 = this.velocity.x > 0 ?  1 : 0;
		let y1 = this.velocity.y < 0 ? -1 : 0;
		let y2 = this.velocity.y > 0 ?  1 : 0;
		
		for (let x = x1; x <= x2; x++) {
			let wx = px + x;
			for (let y = y1; y <= y2; y++) {
				let wy = py + y;
				if (!this.canMove(world.getTile(wx, wy))) {
					Entities.mutableBox.position.set(wx, wy);
					if (this.boundingBox.collides(Entities.mutableBox)) this.boundingBox.sweptCollision(Entities.mutableBox, this.velocity);
				}
			}
		}
		
		//console.log(this.velocity);
		
		this.lastPosition.set(this.position);
		this.position.add(this.velocity);
		this.boundingBox.position.set(this.position).subtract(0.5);
	}
	
	render(context) {
		//context.fillStyle = Entities.mutableBox.collides(this.boundingBox) ? "red" : "magenta";
		context.fillStyle = "magenta";
		//context.fillRect(this.position.x * 16 - 4, this.position.y * 16 - 4, 8, 8);
		context.fillRect(
			//(this.position.x + this.boundingBox.position.x) * 16,
			//(this.position.y + this.boundingBox.position.y) * 16,
			(this.boundingBox.position.x) * 16,
			(this.boundingBox.position.y) * 16,
			this.boundingBox.size.x * 16,
			this.boundingBox.size.y * 16
		);
	}
}