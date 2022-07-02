class Vec2 {
	constructor(x, y) {
		if (x === undefined) {
			this.x = 0.0;
			this.y = 0.0;
		}
		else if (y === undefined) {
			this.x = x;
			this.y = x;
		}
		else {
			this.x = x;
			this.y = y;
		}
	}
	
	lengthSqr() {
		return this.x * this.x + this.y * this.y;
	}
	
	length() {
		return Math.sqrt(lengthSqr());
	}
	
	normalize() {
		var length = this.lengthSqr();
		if (length > 0) {
			this.divide(Math.sqrt(length));
		}
		return this;
	}
	
	set(x, y) {
		if (x instanceof Vec2) {
			this.x = x.x;
			this.y = x.y;
		}
		else if (y === undefined) {
			this.x = x;
			this.y = x;
		}
		else {
			this.x = x;
			this.y = y;
		}
		return this;
	}
	
	add(x, y) {
		if (x instanceof Vec2) {
			this.x += x.x;
			this.y += x.y;
		}
		else if (y === undefined) {
			this.x += x;
			this.y += x;
		}
		else {
			this.x += x;
			this.y += y;
		}
		return this;
	}
	
	subtract(x, y) {
		if (x instanceof Vec2) {
			this.x -= x.x;
			this.y -= x.y;
		}
		else if (y === undefined) {
			this.x -= x;
			this.y -= x;
		}
		else {
			this.x -= x;
			this.y -= y;
		}
		return this;
	}
	
	divide(x, y) {
		if (x instanceof Vec2) {
			this.x /= x.x;
			this.y /= x.y;
		}
		else if (y === undefined) {
			this.x /= x;
			this.y /= x;
		}
		else {
			this.x /= x;
			this.y /= y;
		}
		return this;
	}
	
	multiply(x, y) {
		if (x instanceof Vec2) {
			this.x *= x.x;
			this.y *= x.y;
		}
		else if (y === undefined) {
			this.x *= x;
			this.y *= x;
		}
		else {
			this.x *= x;
			this.y *= y;
		}
		return this;
	}
}

const BoundingBoxData = {
	enterTime: new Vec2(),
	exitTime: new Vec2()
}

class BoundingBox {
	constructor(position, size) {
		if (size == undefined) {
			size = position;
			position = new Vec2();
		}
		this.position = position;
		this.size = size;
	}
	
	isInside(x, y) {
		let relX = 0.0;
		let relY = 0.0;
		if (x instanceof Vec2) {
			relX = x.x - this.position.x;
			relY = x.y - this.position.y;
		}
		else {
			relX = x - this.position.x;
			relY = y - this.position.y;
		}
		return relX >= 0 && relY >= 0 && relX < this.size.x && relY < this.size.y;
	}
	
	collides(box) {
		return this.position.x < box.position.x + box.size.x &&
			   this.position.x + this.size.x > box.position.x &&
			   this.position.y < box.position.y + box.size.y &&
			   this.size.y + this.position.y > box.position.y;
	}
	
	sweptCollision(box, velocity) {
		let enter = 0.0;
		let exit = 0.0;
		
		if (velocity.x == 0) {
			if (this.position.x < box.position.x + box.size.x && box.position.x < this.position.x + this.size.x) {
				BoundingBoxData.enterTime.x = -1000.0;
				BoundingBoxData.exitTime.x = 1000.0;
			}
			else return;
		}
		else {
			enter = velocity.x > 0 ? box.position.x - (this.size.x + this.position.x) : this.position.x - (box.size.x + box.position.x);
			exit = velocity.x > 0 ? (box.size.x + box.position.x) - this.position.x : (this.size.x + this.position.x) - box.position.x;
			BoundingBoxData.enterTime.x = enter / Math.abs(velocity.x);
			BoundingBoxData.exitTime.x = exit / Math.abs(velocity.x);
		}

		if (velocity.y == 0) {
			if (this.position.y <  box.position.y + box.size.y && box.position.y < this.position.y + this.size.y) {
				BoundingBoxData.enterTime.y = -1000.0;
				BoundingBoxData.exitTime.y = 1000.0;
			}
			else return;
		}
		else {
			enter = velocity.y > 0 ? box.position.y - (this.size.y + this.position.y) : this.position.y - (box.size.y + box.position.y);
			exit = velocity.y > 0 ? (box.size.y + box.position.y) - this.position.y : (this.size.y + this.position.y) - box.position.y;
			BoundingBoxData.enterTime.y = enter / Math.abs(velocity.y);
			BoundingBoxData.exitTime.y = exit / Math.abs(velocity.y);
		}

		if (BoundingBoxData.enterTime.x > BoundingBoxData.exitTime.y || BoundingBoxData.enterTime.y > BoundingBoxData.exitTime.x) {
			return;
		}
		
		enter = Math.max(BoundingBoxData.enterTime.x, BoundingBoxData.enterTime.y);

		if (enter < 0 || enter > 1) return;

		if (enter == BoundingBoxData.enterTime.x) velocity.x = velocity.x * enter;
		else velocity.y = velocity.y * enter;
	}
}

class List {
	constructor() {
		this.values = [];
		this.size = 0;
	}
	
	add(element) {
		if (Array.isArray(element)) element.forEach(e => this.values[this.size++] = e);
		if (element instanceof List) element.forEach(e => this.values[this.size++] = e);
		else this.values[this.size++] = element;
	}
	
	remove(element) {
		if (Number.isInteger(element)) {
			this.values.splice(element, 1);
			this.size--;
		}
		else {
			for (let i = 0; i < this.size; i++) {
				if (this.values[i] === element) {
					this.values.splice(i, 1);
					this.size--;
					return;
				}
			}
		}
	}
	
	clear() {
		this.size = 0;
	}
	
	sort(comparator) {
		if (this.values.length != this.size) this.values.length = this.size;
		this.values.sort(comparator);
	}
	
	forEach(lambda) {
		for (let i = 0; i < this.size; i++) {
			let result = lambda(this.values[i]);
			if (result === true) return;
		};
	}
}

const MathHelper = {};

MathHelper.neighbours8 = [
	new Vec2( 0, -1),
	new Vec2( 1, -1),
	new Vec2( 1,  0),
	new Vec2( 1,  1),
	new Vec2( 0,  1),
	new Vec2(-1,  1),
	new Vec2(-1,  0),
	new Vec2(-1, -1)
];

MathHelper.neighbours4 = [
	new Vec2( 0, -1),
	new Vec2( 1,  0),
	new Vec2( 0,  1),
	new Vec2(-1,  0)
];

MathHelper.lerp = function(a, b, delta) {
	return a + (b - a) * delta;
}

MathHelper.clamp = function(x, min, max) {
	return x < min ? min : x > max ? max : x;
}

MathHelper.randomCentered = function() {
	return Math.random() * 2.0 - 1.0;
}

MathHelper.randomRange = function(min, max) {
	return min + Math.random() * (max - min);
}

MathHelper.clampFloat = function(x, delta) {
	return Math.floor(x * delta) / delta;
}

MathHelper.randomInt = function(maxExclusive) {
	return Math.floor(Math.random() * maxExclusive);
}