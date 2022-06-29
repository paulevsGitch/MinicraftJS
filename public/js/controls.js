const Controls = {}
Controls.holdKeys = [];
Controls.lockedKeys = [];
Controls.mouse = new Vec2();

Controls.isKeyPressed = function(key) {
	if (Controls.holdKeys[key] === true && Controls.lockedKeys[key] != true) {
		Controls.lockedKeys[key] = true;
		return true;
	}
	return false;
}

Controls.isKeyHold = function(key) {
	return Controls.holdKeys[key] === true;
}

document.addEventListener("keydown", event =>  {
	if (!Minicraft.loaded) return;
	Controls.holdKeys[event.code] = true;
}, false);
document.addEventListener("keyup", event =>  {
	if (!Minicraft.loaded) return;
	Controls.holdKeys[event.code] = false;
	Controls.lockedKeys[event.code] = false;
}, false);

document.addEventListener("mousedown", event =>  {
	if (!Minicraft.loaded) return;
	Minicraft.screen.onClick(event.offsetX, event.offsetY);
}, false);

document.addEventListener("mousemove", event => Controls.mouse.set(event.offsetX, event.offsetY), false);

document.addEventListener("wheel", event => Minicraft.changeZoom(-Math.sign(event.deltaY)));