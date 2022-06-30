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

class BoundingBox {
	constructor(position, size) {
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
}

class List {
	constructor() {
		this.values = [];
		this.size = 0;
	}
	
	add(element) {
		if (Array.isArray(element)) element.forEach(e => this.values[this.size++] = e);
		else this.values[this.size++] = element;
	}

	clear() {
		this.size = 0;
	}
	
	sort(comparator) {
		if (this.values.length != this.size) this.values.length = this.size;
		this.values.sort(comparator);
	}
	
	forEach(lambda) {
		this.values.forEach(lambda);
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