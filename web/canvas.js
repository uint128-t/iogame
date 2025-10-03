var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");
var dimW=0;
var dimH=0;
window.onresize = resizeCanvas;
function resizeCanvas() {
    console.log("resize");
    canvas.width = innerWidth * devicePixelRatio;
    canvas.height = innerHeight * devicePixelRatio;
    dimW = innerWidth / 2;
    dimH = innerHeight / 2;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    ctx.translate(dimW, dimH);
}
resizeCanvas();