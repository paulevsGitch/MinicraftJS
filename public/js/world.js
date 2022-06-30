class Chunk {
	constructor(x, y) {
		this.tiles = [];
		this.objects = [];
		this.entities = [];
		this.position = new Vec2(x, y);
		this.blockPosition = new Vec2(x << 4, y << 4);
		this.renderPosition = new Vec2(x << 8, y << 8);
		this.canvas = document.createElement("canvas");
		this.canvas.width = 256;
		this.canvas.height = 256;
		this.needUpdate = false;
	}
	
	getIndex(x, y) {
		return x << 4 | y;
	}
	
	getTile(x, y) {
		return this.tiles[this.getIndex(x, y)];
	}
	
	setTile(x, y, tile) {
		this.tiles[this.getIndex(x, y)] = tile;
	}
	
	getObject(x, y) {
		return this.objects[this.getIndex(x, y)];
	}
	
	setObject(x, y, obj) {
		this.objects[this.getIndex(x, y)] = obj;
		//let px = this.blockPosition.x | x;
		//let py = this.blockPosition.y | y;
		//obj.position = new Vec2(px, py);
	}
	
	renderObjects(context) {
		this.objects.forEach((obj, index) => {
			let x = (index >> 4);
			let y = (index & 15);
		 	let px = this.blockPosition.x | x;
			let py = this.blockPosition.y | y;
			obj.render(context, px, py);
		});
		this.entities.forEach(entity => entity.render(context));
	}
	
	update(world) {
		this.needUpdate = false;
		let ctx = this.canvas.getContext("2d");
		ctx.clearRect(0, 0, 256, 256);
		
		let layers = [];
		for (let i = 0; i < 256; i++) {
			let tile = this.tiles[i];
			if (tile != undefined) {
				let layer = layers[tile.renderOrder];
				if (layer == undefined) {
					layer = [];
					layers[tile.renderOrder] = layer;
				}
				layer.push(i);
			}
		}
		
		layers.forEach(layer => layer.forEach(index => {
			let tile = this.tiles[index];
			let x = (index >> 4);
			let y = (index & 15);
			tile.draw(world, ctx, x, y, this.blockPosition.x | x, this.blockPosition.y | y);
		}));
		
		for (let i = 0; i < 16; i++) {
			let px = this.blockPosition.x | i;
			let py = this.blockPosition.y | i;
			
			let tile = world.getTile(this.blockPosition.x - 1, py);
			if (tile != undefined) tile.draw(world, ctx, -1, i, this.blockPosition.x - 1, py);
			
			tile = world.getTile(this.blockPosition.x + 16, py);
			if (tile != undefined) tile.draw(world, ctx, 16, i, this.blockPosition.x + 16, py);
			
			tile = world.getTile(px, this.blockPosition.y - 1);
			if (tile != undefined) tile.draw(world, ctx, i, -1, px, this.blockPosition.y - 1);
			
			tile = world.getTile(px, this.blockPosition.y + 16);
			if (tile != undefined)tile.draw(world, ctx, i, 16, px, this.blockPosition.y + 16);
		}
		
		for (let i = 0; i < 256; i++) {
			let tile = this.tiles[i];
			if (tile != undefined) {
				let render = Tiles.overlayRender[tile.id];
				if (render != undefined) {
					let x = (i >> 4);
					let y = (i & 15);
					render(ctx, x, y);
				}
			}
		}
		
		Render.setAlpha(ctx, 0.2);
		ctx.strokeStyle = "#ffff00";
		ctx.beginPath();
		ctx.rect(0.5, 0.5, 255, 255);
		ctx.stroke();
		Render.setAlpha(ctx, 1.0);
	}
}

class World {
	constructor(size) {
		this.blockSize = size << 4;
		this.entityLimit = this.blockSize - 0.001;
		this.size = size;
		this.chunks = [];
		this.renderObjects = new List();
		this.comparator = (obj1, obj2) => obj1.position.y - obj2.position.y;
	}
	
	getIndex(x, y) {
		return x * this.size + y;
	}
	
	getOrCreateChunk(x, y) {
		let index = this.getIndex(x, y);
		let chunk = this.chunks[index];
		if (chunk === undefined) {
			chunk = new Chunk(x, y);
			this.chunks[index] = chunk;
		}
		return chunk;
	}
	
	getTile(x, y) {
		let cx = x >> 4;
		let cy = y >> 4;
		if (cx < 0 || cy < 0 || cx >= this.size || cy >= this.size) {
			return undefined;
		}
		let index = this.getIndex(cx, cy);
		let chunk = this.chunks[index];
		if (chunk === undefined) {
			return undefined;
		}
		return chunk.getTile(x & 15, y & 15);
	}
	
	setTile(x, y, tile) {
		let cx = x >> 4;
		let cy = y >> 4;
		if (cx < 0 || cy < 0 || cx >= this.size || cy >= this.size) {
			return;
		}
		let chunk = this.getOrCreateChunk(cx, cy);
		chunk.setTile(x & 15, y & 15, tile);
		chunk.needUpdate = true;
	}
	
	getObject(x, y) {
		let cx = x >> 4;
		let cy = y >> 4;
		if (cx < 0 || cy < 0 || cx >= this.size || cy >= this.size) {
			return undefined;
		}
		let index = this.getIndex(cx, cy);
		let chunk = this.chunks[index];
		if (chunk === undefined) {
			return undefined;
		}
		return chunk.getObject(x & 15, y & 15);
	}
	
	setObject(x, y, obj) {
		let cx = x >> 4;
		let cy = y >> 4;
		if (cx < 0 || cy < 0 || cx >= this.size || cy >= this.size) {
			return;
		}
		let chunk = this.getOrCreateChunk(cx, cy);
		chunk.setObject(x & 15, y & 15, obj);
	}
	
	addEntity(entity) {
		let x = Math.floor(entity.position.x) >> 4;
		let y = Math.floor(entity.position.y) >> 4;
		this.chunks[this.getIndex(x, y)].entities.push(entity);
	}
	
	tick(delta) {
		this.chunks.forEach(chunk => {
			if (chunk != undefined) {
				let count = chunk.entities.length;
				for (let i = 0; i < count; i++) {
					let entity = chunk.entities[i];
					entity.tick(delta);
					entity.position.x = MathHelper.clamp(entity.position.x, 0.0, this.entityLimit);
					entity.position.y = MathHelper.clamp(entity.position.y, 0.0, this.entityLimit);
					let x = Math.floor(entity.position.x) >> 4;
					let y = Math.floor(entity.position.y) >> 4;
					if (x != chunk.position.x || y != chunk.position.y) {
						this.chunks[this.getIndex(x, y)].entities.push(entity);
						chunk.entities.splice(i, 1);
						count--;
						i--; 
					}
				}
			}
		});
	}
	
	render(context) {
		//this.renderObjects.clear();
		
		this.chunks.forEach(chunk => {
			if (chunk != undefined) {
				if (chunk.needUpdate) chunk.update(this);
				context.drawImage(chunk.canvas, chunk.renderPosition.x, chunk.renderPosition.y);
				//this.renderObjects.add(chunk.objects);
			}
		});
		
		//this.renderObjects.sort(this.comparator);
		//this.renderObjects.forEach(obj => obj.render(context, obj.position.x, obj.position.y));
		
		this.chunks.forEach(chunk => {
			if (chunk != undefined) {
				chunk.renderObjects(context);
			};
		});
	}
}
