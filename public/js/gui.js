const GUI = {}
GUI.textures = {}

GUI.textures.button = Images.load("img/gui/button.png");

class GUIElement {
	constructor() {
		this.position = new Vec2();
		this.size = new Vec2();
		this.size = new Vec2();
	}
	
	render(context) {}
	process(x, y) {}
}

class Button extends GUIElement {
	constructor(size, corner, fontSize, text, onClick) {
		super();
		this.size = size;
		this.text = text;
		this.onClick = onClick;
		this.corner = corner;
		this.fontSize = fontSize;
		this.boundingBox = new BoundingBox(this.position, this.size);
	}
	
	render(context) {
		context.fillStyle = "white";
		Render.setFont(context, this.fontSize);
		Render.drawNineElements(context, GUI.textures.button, this.position.x, this.position.y, this.size.x, this.size.y, this.corner);
		
		let text = this.text;
		if (this.boundingBox.isInside(Controls.mouse.x, Controls.mouse.y)) {
			text = "> " + this.text + " <";
		}
		Render.printCentered(context, text, this.position.x + (this.size.x >> 1), this.position.y + (this.size.y >> 1));
	}
	
	process(x, y) {
		if (this.onClick != undefined && this.boundingBox.isInside(x, y)) {
			this.onClick();
		}
	}
}

GUI.makeDefaultButton = function(text, onClick) {
	return new Button(new Vec2(512, 128), 32, 64, text, onClick);
}

class Simple9Part extends GUIElement {
	constructor(image, corner) {
		super();
		this.image = image;
		this.corner = corner;
	}
	
	render(context) {
		Render.drawNineElements(context, this.image, this.position.x, this.position.y, this.size.x, this.size.y, this.corner);
	}
}

class ScaledImage extends GUIElement {
	constructor(image, scale) {
		super();
		this.image = image;
		this.scale = scale;
		this.size.set(image.width * scale, image.height * scale);
	}
	
	render(context) {
		let width = this.image.width * this.scale;
		let height = this.image.height * this.scale;
		context.drawImage(this.image, this.position.x, this.position.y, width, height);
	}
}

class Screen {
	constructor(parent) {
		this.elements = [];
		this.parent = parent;
	}
	
	addElement(element) {
		this.elements.push(element);
	}
	
	render(renderContext) {
		Render.enableSmooth(renderContext.context, false);
		this.elements.forEach(element => element.render(renderContext.context));
		Render.enableSmooth(renderContext.context, true);
	}
	
	onClick(x, y) {
		this.elements.forEach(element => element.process(x, y));
	}
	
	onResize(center, width, height) {
		if (this.parent != undefined) this.parent.onResize(center, width, height);
	}
	
	onTick() {
		if (this.parent != undefined && Controls.isKeyPressed("Escape")) this.returnToParent();
	}
	
	returnToParent() {
		Minicraft.screen = this.parent;
	}
}

class MainMenuScreen extends Screen {
	constructor() {
		super();
		
		this.logo = new ScaledImage(Images.load("img/gui/logo.png"), 8);
		this.addElement(this.logo);
		
		this.border = new Simple9Part(Images.load("img/gui/borders.png"), 64);
		this.addElement(this.border);
		
		let self = this;
		this.startButton = GUI.makeDefaultButton("START", function() { Minicraft.screen = new WorldScreen(self); });
		this.addElement(this.startButton);
		
		this.optionsButton = GUI.makeDefaultButton("OPTIONS", function() { console.log("B"); });
		this.addElement(this.optionsButton);
		
		this.sourcesButton = GUI.makeDefaultButton("SOURCES", function() { window.location.href = "https://github.com/paulevsGitch/MinicraftJS"; });
		this.addElement(this.sourcesButton);
	}
	
	onResize(center, width, height) {
		super.onResize(center, width, height);
		this.logo.position.set(center.x - (this.logo.image.width << 2), (center.y >> 1) - (this.logo.image.height << 3));
		this.border.size.set(width, height);
		this.startButton.position.set(center.x - 256, center.y - 64 - 70);
		this.optionsButton.position.set(this.startButton.position.x, this.startButton.position.y + 140);
		this.sourcesButton.position.set(this.startButton.position.x, this.optionsButton.position.y + 140);
	}
}

class WorldScreen extends Screen {
	constructor(parent) {
		super(parent);
		this.world = new World(4);
		WorldGenerator.generateWorld(this.world);
		Minicraft.inWorld = true;
		
		this.player = new PlayerEntity();
		this.player.position.set(31, 31);
		this.world.addEntity(this.player);
		
		Minicraft.renderContext.camera.target = this.player;
		
		this.light = Images.load("img/light/light_64.png");
	}
	
	render(renderContext) {
		let height = renderContext.canvas.height;
		let width = renderContext.canvas.width;
		let camera = renderContext.camera;
		let ctx = renderContext.context;
		let lightmap = renderContext.lightmap;
		
		this.world.tick(renderContext.delta);
		if (camera.target != undefined) camera.position.set(camera.target.position).multiply(16.0).subtract(0, 8);
		
		Render.enableSmooth(ctx, false);
		
		ctx.transform(camera.zoom, 0.0, 0.0, camera.zoom, width * 0.5, height * 0.5);
		ctx.transform(1.0, 0.0, 0.0, 1.0, -camera.position.x, -camera.position.y);
		let transform = ctx.getTransform();
		
		this.world.render(ctx);
		
		let mouse = Controls.mouse;
		let px = ((mouse.x - width * 0.5) / camera.zoom + camera.position.x) / 16;
		let py = ((mouse.y - height * 0.5) / camera.zoom + camera.position.y) / 16;
		
		let screen = renderContext.screenArea;
		screen.position.set(-width * 0.5, -height * 0.5).divide(camera.zoom).add(camera.position).divide(16);
		screen.size.set(width, height).divide(camera.zoom * 16);
		
		let inventory = this.player.inventory;
		if (inventory.selected > -1) {
			let stack = inventory.items[inventory.selected];
			stack.item.renderOnCursor(ctx, px, py);
		}
		
		Entities.mutableBox.size.set(8.0);
		this.world.visibleEntities.forEach(entity => {
			Entities.mutableBox.position.set(entity.position).subtract(4.0);
			entity.visible = screen.collides(Entities.mutableBox);
		});
		Entities.mutableBox.size.set(1.0);
		
		this.selected = undefined;
		this.world.visibleEntities.forEach(entity => {
			if (entity.selectionBox != undefined && entity.selectionBox.isInside(px, py)) {
				entity.selected = true;
				this.selected = entity;
				return true;
			}
		});
		
		ctx.setTransform();
		
		this.world.setAmbientLight(lightmap.context, renderContext.time);
		Render.enableSmooth(lightmap.context, false);
		lightmap.context.setTransform();
		Render.defaultBlending(lightmap.context);
		lightmap.context.fillRect(0, 0, width, height);
		lightmap.context.setTransform(transform);
		Render.screenBlending(lightmap.context);
		lightmap.context.drawImage(this.light, camera.position.x - (this.light.width >> 1), camera.position.y - (this.light.height >> 1));
		
		Render.multiplyBlending(ctx);
		renderContext.context.drawImage(lightmap.canvas, 0, 0);
		Render.defaultBlending(ctx);
		
		Render.enableSmooth(ctx, true);
	}
	
	onTick() {
		super.onTick();
		
		if (Controls.isKeyPressed("KeyR")) {
			WorldGenerator.generateWorld(this.world);
		}
		
		if (Controls.isKeyPressed("KeyE")) {
			Minicraft.screen = new InventoryScreen(this, this.player);
		}
		
		let camera = Minicraft.renderContext.camera;
		if (camera.target === undefined) {
			camera.movement.set(0, 0);
			if (Controls.isKeyHold("KeyW")) {
				camera.movement.y -= 1;
			}
			if (Controls.isKeyHold("KeyS")) {
				camera.movement.y += 1;
			}
			if (Controls.isKeyHold("KeyA")) {
				camera.movement.x -= 1;
			}
			if (Controls.isKeyHold("KeyD")) {
				camera.movement.x += 1;
			}
			camera.position.add(camera.movement.normalize().multiply(100 * Minicraft.renderContext.delta));
		}
	}
	
	onClick(x, y) {
		super.onClick(x, y);
		if (this.selected != undefined) {
			this.selected.alive = false;
		}
		let inventory = this.player.inventory;
		if (inventory.selected > -1) {
			let stack = inventory.items[inventory.selected];
			let renderContext = Minicraft.renderContext;
			let height = renderContext.canvas.height;
			let width = renderContext.canvas.width;
			let camera = renderContext.camera;
			let px = ((x - width * 0.5) / camera.zoom + camera.position.x) / 16;
			let py = ((y - height * 0.5) / camera.zoom + camera.position.y) / 16;
			stack.item.onUse(this.world, px, py, stack);
			if (stack.count < 1) {
				inventory.items.splice(inventory.selected, 1);
				inventory.selected = -1;
			}
		}
	}
	
	returnToParent() {
		super.returnToParent();
		Minicraft.inWorld = false;
	}
}

class InventoryScreen extends Screen {
	constructor(parent, player) {
		super(parent);
		this.player = player;
		this.cache = [];
	}
	
	render(renderContext) {
		this.parent.render(renderContext);
		
		let height = renderContext.canvas.height;
		let width = renderContext.canvas.width;
		let ctx = renderContext.context;
		
		ctx.setTransform();
		Render.enableSmooth(ctx, false);
		
		Render.setAlpha(ctx, 0.5);
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, width, height);
		Render.setAlpha(ctx, 1.0);
		
		let minX = (width - 512) >> 1;
		let minY = (height - 512) >> 1;
		Render.drawNineElements(ctx, GUI.textures.button, minX, minY, 512, 512, 32);
		
		Render.setFont(ctx);
		ctx.fillStyle = "white";
		let inventory = this.player.inventory;
		
		let i = 0;
		inventory.items.forEach(stack => {
			let x = (i & 7) * 64 + minX + 32;
			let y = (i >> 3) * 64 + minY + 32;
			
			if (stack.item.id === inventory.selected) {
				ctx.strokeStyle = "white";
				ctx.lineWidth = 4;
				ctx.beginPath();
				ctx.rect(x, y, 64, 64);
				ctx.stroke();
				ctx.lineWidth = 1;
			}
			
			ctx.drawImage(stack.item.image, x, y, 64, 64);
			if (stack.count > 1) Render.printRightBottom(ctx, stack.count, x + 60, y + 60);
			this.cache[i] = stack.item.id;
			i++;
		});
		
		Render.enableSmooth(ctx, true);
	}
	
	onClick(x, y) {
		super.onClick(x, y);
		let height = Minicraft.renderContext.canvas.height;
		let width = Minicraft.renderContext.canvas.width;
		let minX = ((width - 512) >> 1) + 32;
		let minY = ((height - 512) >> 1) + 32;
		let px = (x - minX) >> 6;
		let py = (y - minY) >> 6;
		
		let inventory = this.player.inventory;
		if (px < 0 || py < 0 || px > 7 || py > 7) {
			inventory.selected = -1;
			return;
		}
		
		let index = py << 3 | px;
		if (index >= inventory.items.length) {
			inventory.selected = -1;
			return;
		}
		
		inventory.selected = this.cache[index];
	}
}