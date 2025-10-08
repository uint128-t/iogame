// Auto-scaling done by PIXI.JS
var dimW=0;
var dimH=0;
window.onresize = resizeCanvas;
function resizeCanvas() {
    dimW = innerWidth / 2;
    dimH = innerHeight / 2;
}
resizeCanvas();