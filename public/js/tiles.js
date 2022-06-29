class Tile {
	constructor(name) {
		this.name = name;
		this.renderOrder = 0;
		this.id = 0;
	}
	
	draw(world, context, x, y, worldX, worldY) {}
}

class ImageTile extends Tile {
	constructor(name, image) {
		super(name);
		this.image = image;
	}
	
	draw(world, context, x, y, worldX, worldY) {
		context.drawImage(this.image, x << 4, y << 4);
	}
	
	drawPart(context, x, y, partX, partY) {
		context.drawImage(this.image, partX, partY, 16, 16, x, y, 16, 16);
	}
}

class SplatTile extends ImageTile {
	constructor(name, image) {
		super(name, image);
		this.renderOrder = Tiles.globalSplatID++;
	}
	
	draw(world, context, x, y, worldX, worldY) {
		this.drawPart(context, x << 4, y << 4, 16, 16);
		MathHelper.neighbours8.forEach(offset => {
			let px = worldX + offset.x;
			let py = worldY + offset.y;
			let tile = world.getTile(px, py);
			if (tile != this && tile.renderOrder < this.renderOrder) {
				this.drawPart(context, (x + offset.x) << 4, (y + offset.y) << 4, (offset.x + 1) << 4, (offset.y + 1) << 4);
			}
		});
	}
}

class WaterTile extends ImageTile {
	constructor(name, image) {
		super(name, image);
	}
	
	draw(world, context, x, y, worldX, worldY) {
		let px = x << 4;
		let py = y << 4;
		if (worldY > 0 && world.getTile(worldX, worldY - 1) != this) {
			let right = world.getTile(worldX + 1, worldY) == this;
			let left = world.getTile(worldX - 1, worldY) == this;
			if (right && left) this.drawPart(context, px, py, 16, 16);
			else if (right) this.drawPart(context, px, py, 32, 0);
			else if (left) this.drawPart(context, px, py, 0, 0);
			else this.drawPart(context, px, py, 16, 0);
		}
		else {
			this.drawPart(context, px, py, 0, 16);
		}
	}
}

class WangTile extends ImageTile {
	constructor(name, image) {
		super(name, image);
		this.renderOrder = 1;
	}
	
	drawPart(context, x, y, partX, partY) {
		context.drawImage(this.image, partX, partY, 16, 16, x, y, 16, 16);
	}
	
	draw(world, context, x, y, worldX, worldY) {
		//let tileUp = world.world.getTile(x, y - 1);
		//let tileDown = world.world.getTile(x, y + 1);
		//let tileRight = world.world.getTile(x + 1, y);
		//let tileLeft = world.world.getTile(x + 1, y);
		this.drawPart(context, x << 4, y << 4, 16, 16);
		// MathHelper.neighbours8.forEach(offset => {
		// 	let px = x + offset.x;
		// 	let py = y + offset.y;
		// 	let tile = world.getTile(px, py);
		// 	if (tile != undefined && tile instanceof WangTile) {
		// 		tile.drawPart(context, px << 4, py << 4, (offset.x + 1) << 4, (offset.y + 1) << 4);
		// 	}
		// });
		
		MathHelper.neighbours8.forEach(offset => {
			let px = x + offset.x;
			let py = y + offset.y;
			let tile = world.getTile(px, py);
			if (tile != this) {
				this.drawPart(context, px << 4, py << 4, (offset.x + 1) << 4, (offset.y + 1) << 4);
			}
		});
		
		// for (let i = 0; i < 4; i++) {
		// 	let offset1 = MathHelper.neighbours4[i];
		// 	let offset2 = MathHelper.neighbours4[(i + 1) & 1];
		// 	let px1 = x + offset1.x;
		// 	let py1 = y + offset1.y;
		// 	let px2 = px1 + offset2.x;
		// 	let py2 = py1 + offset2.y;
		// 	if (world.getTile(px2, py2) == this) {
		// 		this.drawPart(context, px << 4, py << 4, (offset.x + 1) << 4, (offset.y + 1) << 4);
		// 	}
		// }
	}
}

const Tiles = {
	values: [],
	globalSplatID: 1,
	overlayRender: []
};

Tiles.registerTile = function(tile) {
	var values = Tiles.values;
	var id = values.length;
	if (values[id] === undefined) {
		values[id] = tile;
		tile.id = id;
	}
	return tile;
}

Tiles.registerOverlayRender = function(tile, render) {
	Tiles.overlayRender[tile.id] = render;
}

Tiles.stone = Tiles.registerTile(new SplatTile("stone", Images.load("img/tiles/stone.png")));
Tiles.sand = Tiles.registerTile(new SplatTile("sand", Images.load("img/tiles/sand.png")));
Tiles.grass = Tiles.registerTile(new SplatTile("grass", Images.load("img/tiles/grass.png")));
Tiles.water = Tiles.registerTile(new WaterTile("water", Images.load("img/tiles/water.png")));

Tiles.stone.smallStones = Images.load("img/sprites/small_stones.png");
Tiles.registerOverlayRender(Tiles.stone, (context, x, y) => {
	if (Math.random() < 0.5) {
		let px = Math.floor(Math.random() * 8) | (x << 4);
		let py = Math.floor(Math.random() * 8) | (y << 4);
		let ix = Math.floor(Math.random() * 2) << 3;
		let iy = Math.floor(Math.random() * 2) << 3;
		context.drawImage(Tiles.stone.smallStones, ix, iy, 8, 8, px, py, 8, 8);
	}
})

Tiles.grass.smallGrass = Images.load("img/sprites/small_grass.png");
Tiles.registerOverlayRender(Tiles.grass, (context, x, y) => {
	if (Math.random() < 0.5) {
		let px = Math.floor(Math.random() * 8) | (x << 4);
		let py = Math.floor(Math.random() * 8) | (y << 4);
		let ix = Math.floor(Math.random() * 2) << 3;
		let iy = Math.floor(Math.random() * 2) << 3;
		context.drawImage(Tiles.grass.smallGrass, ix, iy, 8, 8, px, py, 8, 8);
	}
})

Tiles.sand.smallStones = Images.load("img/sprites/small_sand_stones.png");
Tiles.registerOverlayRender(Tiles.sand, (context, x, y) => {
	if (Math.random() < 0.5) {
		let px = Math.floor(Math.random() * 4) | (x << 4) | 4;
		let py = Math.floor(Math.random() * 4) | (y << 4) | 4;
		let ix = Math.floor(Math.random() * 2) << 3;
		let iy = Math.floor(Math.random() * 2) << 3;
		context.drawImage(Tiles.sand.smallStones, ix, iy, 8, 8, px, py, 8, 8);
	}
})