const Minicraft = {}

Minicraft.renderContext = {}
Minicraft.loaded = false;
Minicraft.inWorld = false;

Minicraft.initGame = function() {
	Minicraft.screen = new MainMenuScreen();
	
	let ctx = Minicraft.renderContext;
	ctx.canvas = document.getElementById("canvas");
	ctx.context = canvas.getContext("2d");
	ctx.center = new Vec2();
	ctx.delta = 0.0;
	
	ctx.camera = {
		position: new Vec2(),
		movement: new Vec2(),
		zoomDelta: 0.0,
		zoomNext: 2.0,
		zoomPrev: 2.0,
		zoom: 2.0
	};
	
	ctx.fps = {
		sumDelta: 0.0,
		avDelta: 0.0,
		avFPS: 0.0,
		ticks: 0,
		time: 8,
	};
	
	Images.afterLoad(() => {
		Minicraft.loaded = true;
		Minicraft.onResize();
		ctx.time = Date.now();
		window.requestAnimationFrame(Minicraft.globalRender);
	});
}

Minicraft.onResize = function() {
	if (!Minicraft.loaded) return;
	let canvas = Minicraft.renderContext.canvas;
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	Minicraft.renderContext.center.set(canvas.width >> 1, canvas.height >> 1);
	Minicraft.screen.onResize(Minicraft.renderContext.center, canvas.width, canvas.height);
}

var but = GUI.makeDefaultButton("TEXT", null);

Minicraft.globalRender = function() {
	let ctx = Minicraft.renderContext;
	ctx.context.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	
	Minicraft.updateZoom(ctx);
	Minicraft.screen.onTick();
	Minicraft.screen.render(ctx);
	
	Minicraft.updateFPS(ctx);
	Minicraft.drawFPS(ctx);
	Minicraft.updateTime(ctx);
	
	window.requestAnimationFrame(Minicraft.globalRender);
}

Minicraft.drawFPS = function(ctx) {
	Render.setDefaultFont(ctx.context);
	ctx.context.fillStyle = "white";
	ctx.context.fillText("FPS: " + ctx.fps.avFPS, 20, 64);
	ctx.context.fillText("Delta: " + ctx.fps.avDelta, 20, 88);
}

Minicraft.updateFPS = function(ctx) {
	let fps = ctx.fps;
	fps.sumDelta += ctx.delta;
	if (fps.ticks === fps.time) {
		fps.avDelta = (fps.sumDelta / fps.time).toFixed(3);
		fps.avFPS = (fps.time / fps.sumDelta).toFixed(0);
		fps.sumDelta = 0.0;
		fps.ticks = 0;
	}
	fps.ticks++;
}

Minicraft.updateTime = function(ctx) {
	let time = Date.now();
	ctx.delta = (time - ctx.time) * 0.001;
	ctx.time = time;
}

Minicraft.updateZoom = function(ctx) {
	if (!Minicraft.inWorld) return;
	let camera = ctx.camera;
	if (camera.zoomNext != camera.zoomPrev) {
		camera.zoomDelta += ctx.delta * 10;
		if (camera.zoomDelta > 1.0) camera.zoomDelta = 1.0;
		camera.zoom = MathHelper.lerp(camera.zoomPrev, camera.zoomNext, camera.zoomDelta);
	}
}

Minicraft.changeZoom = function(zoom) {
	if (!Minicraft.inWorld) return;
	let camera = Minicraft.renderContext.camera;
	camera.zoomPrev = camera.zoom;
	camera.zoomNext = MathHelper.clamp(camera.zoomNext + zoom, 1, 8);
	camera.zoomDelta = 0.0;
}