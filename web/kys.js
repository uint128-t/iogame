const app = new PIXI.Application();
app.init({
    resizeTo: document.getElementById("game"),
    autoDensity: true,
    backgroundColor: 0x1099bb,
    resolution: window.devicePixelRatio || 1,
}).then(() => {
    document.getElementById("game").appendChild(app.canvas);
});