WorldGenerator = {}

WorldGenerator.walls = function(world, x1, y1, x2, y2, tile) {
	for (let px = x1; px <= x2; px++) {
		world.setTile(px, y1, tile);
		world.setTile(px, y2, tile);
	}
	
	for (let py = y1 + 1; py < y2; py++) {
		world.setTile(x1, py, tile);
		world.setTile(x2, py, tile);
	}
}

WorldGenerator.fillCircle = function(world, px, py, radius, tile, mask) {
	let r2 = radius * radius;
	let dist = Math.ceil(radius);
	for (let x = -dist; x <= dist; x++) {
		let x2 = x * x;
		for (let y = -dist; y <= dist; y++) {
			let y2 = y * y;
			if (x2 + y2 <= r2) {
				if (mask === undefined || mask == world.getTile(px + x, py + y, tile)) world.setTile(px + x, py + y, tile);
			}
		}
	}
}

WorldGenerator.fillChunk = function(chunk, tile) {
	for (let i = 0; i < 256; i++) {
		chunk.tiles[i] = tile;
	}
	chunk.needUpdate = true;
}

WorldGenerator.generateWorld = function(world) {
	let size = world.size << 4;
	let scale = world.size >> 1;
	let half = size >> 1;
	
	for (let x = 0; x < world.size; x++) {
		for (let y = 0; y < world.size; y++) {
			let chunk = world.getOrCreateChunk(x, y);
			WorldGenerator.fillChunk(chunk, Tiles.water);
			chunk.objects = [];
		}
	}
	
	let radius = (Math.random() * 5 + 5) * scale;
	WorldGenerator.fillCircle(world, half, half, radius, Tiles.grass);
	
	let count = Math.floor((Math.random() * 5 + 5) * scale);
	for (let i = 0; i < count; i++) {
		let px = Math.floor((Math.random() * 2 - 1) * radius) + half;
		let py = Math.floor((Math.random() * 2 - 1) * radius) + half;
		let radius2 = Math.random() * 2 + 2;
		WorldGenerator.fillCircle(world, px, py, radius2, Tiles.stone, Tiles.grass);
	}
	
	count = Math.floor((Math.random() * 3 + 3) * scale);
	for (let i = 0; i < count; i++) {
		let angle = Math.random() * 6.283;
		let px = Math.floor(Math.sin(angle) * radius + half);
		let py = Math.floor(Math.cos(angle) * radius + half);
		let radius2 = Math.random() * 3 + 3;
		WorldGenerator.fillCircle(world, px, py, radius2, Tiles.grass);
	}
	
	radius *= 1.2;
	count = Math.floor((Math.random() * 3 + 3) * scale);
	for (let i = 0; i < count; i++) {
		let angle = Math.random() * 6.283;
		let px = Math.floor(Math.sin(angle) * radius + half);
		let py = Math.floor(Math.cos(angle) * radius + half);
		let radius2 = Math.random() * 1.7 + 1.6;
		WorldGenerator.fillCircle(world, px, py, radius2, Tiles.grass);
	}
	
	WorldGenerator.walls(world, 0, 0, size - 1, size - 1, Tiles.water);
	
	for (let x = 0; x < size; x ++) {
		for (let y = 0; y < size; y ++) {
			let tile = world.getTile(x, y);
			if (tile == Tiles.grass && WorldGenerator.isNear(world, x, y, Tiles.water)) {
				WorldGenerator.fillCircle(world, x, y, 1, Tiles.sand, Tiles.grass);
			}
		}
	}
	
	for (let x = 0; x < size; x ++) {
		for (let y = 0; y < size; y ++) {
			let tile = world.getTile(x, y);
			if (tile == Tiles.grass && Math.random() < 0.3) {
				world.setObject(x, y, GameObjects.tallGrass);
			}
		}
	}
}

WorldGenerator.isNear = function(world, x, y, tile) {
	for (let i = 0; i < 4; i++) {
		let offset = MathHelper.neighbours4[i];
		if (world.getTile(x + offset.x, y + offset.y) == tile) {
			return true;
		}
	}
	return false;
}