const Entities = {};

class Entity {
	constructor() {
		this.position = new Vec2();
		this.velocity = new Vec2();
		this.speed = 5.0;
	}
	
	render(context) {}
	
	tick(delta) {
		this.position.add(this.velocity.x * delta * this.speed, this.velocity.y * delta * this.speed);
	}
}

class PlayerEntity extends Entity {
	constructor() {
		super();
	}
	
	tick(delta) {
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
		this.position.add(this.velocity);
	}
	
	render(context) {
		context.fillStyle = "magenta";
		context.fillRect(this.position.x * 16 - 4, this.position.y * 16 - 4, 8, 8);
	}
}