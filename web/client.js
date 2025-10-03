var X=0;
var Y=0;
var speed = 0.5;
const pi=Math.PI;
const sq2=Math.SQRT2;
const MAPWIDTH = 5000;
const MAPHEIGHT = 5000;
var showAllPlayers = false;

lastTick = 0;
function send_projectiles(){
    if (projectilesend.length) {
        console.log("projectile");
        socket.emit("projectile", projectilesend);
        projectilesend = [];
    }
}
function tick(dt,timestamp){
    let dx=0;
    let dy=0;
    if(keys[38]||keys[87])dy-=1;
    if(keys[40]||keys[83])dy+=1;
    if(keys[37]||keys[65])dx-=1;
    if(keys[39]||keys[68])dx+=1;
    let scl = Math.max(1,Math.hypot(dx,dy));
    X+=speed*dt*dx/scl;
    Y+=speed*dt*dy/scl;
    X = Math.min(Math.max(X,20-MAPWIDTH),MAPWIDTH-20);
    Y = Math.min(Math.max(Y,20-MAPHEIGHT),MAPHEIGHT-20);
    for (let id of projectiles){
        projectileCollision(id,timestamp);
    }
    socket.volatile.emit("move",X,Y);
    send_projectiles();
    return dt;
}
function drawPlayer(id,x,y){
    // X and Y are in global coordinates
    if (Math.abs(x-X)>dimW+20 || Math.abs(y-Y)>dimH+20) return;
    ctx.font = "20px monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = "black";
    ctx.fillText(playernames[id]||"...",x-X,y-Y-30);
    ctx.beginPath();
    ctx.ellipse(x-X,y-Y,20,20,0,0,2*Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.stroke();
}
function getprojectileX(id,timestamp){
    return projectileX[id]+(timestamp-projectileTIME[id])*projectileDX[id];
}
function getprojectileY(id,timestamp){
    return projectileY[id]+(timestamp-projectileTIME[id])*projectileDY[id];
}
var projectilesToRemove = [];
function drawProjectile(id,timestamp){
    let x = getprojectileX(id,timestamp);
    let y = getprojectileY(id,timestamp);
    if (Math.abs(x-X)<dimW+20 && Math.abs(y-Y)<dimH+20){
        ctx.moveTo(x-X+10,y-Y);
        ctx.ellipse(x-X,y-Y,10,10,0,0,2*Math.PI);
    }
    if (timestamp-projectileTIME[id]>1000){
        projectilesToRemove.push(id);
        delete projectileX[id];
        delete projectileY[id];
        delete projectileDX[id];
        delete projectileDY[id];
        delete projectilePLR[id];
        delete projectileTIME[id];
    }
}
let damageTime = -10000;
function projectileCollision(id,timestamp){
    // equation: find minimum T for (projX+projdx*t-X)^2+(projY+projdy*t-Y)^2
    // derivative: (projX+projdx*t-X)*projdx + (projY+projdy*t-Y)*projdy = 0
    // expansion: projX*projdx-X*projdx + projY*projdy-Y*projdy = t(projdx^2+projdy^2)
    // solve for t. if t is in the current tick, then during
    // (projX+projdx*t-X)^2+(projY+projdy*t-Y)^2 < 900
    if (projectilePLR[id]==socketid) return;
    let projX = projectileX[id];
    let projY = projectileY[id];
    let projdx = projectileDX[id];
    let projdy = projectileDY[id];
    let collisionTime = -(projX*projdx-X*projdx+projY*projdy-Y*projdy)/(projdx*projdx+projdy*projdy)+projectileTIME[id];
    let projectileMinDist = Math.hypot(getprojectileX(id,collisionTime)-X,getprojectileY(id,collisionTime)-Y);
    if (lastTick<=collisionTime && collisionTime<=timestamp && projectileMinDist<=30){
        console.log("hit");
        canvas.animate(
            [
                {boxShadow: "inset 0px 0px 100px 50px rgba(255, 0, 0, 0.8)"},
                {}
            ], {
                duration:500
            }
        );
        damageTime = timestamp;
    }
}
var FPS = 0;
var projectilesend = [];
function createProjectile(x,y,dx,dy){
    projectilesend.push([x,y,dx,dy]);
}
function render(timestamp){
    requestAnimationFrame(render);
    ctx.clearRect(-dimW,-dimH,dimW*2,dimH*2);
    let dt = timestamp - lastTick;
    let delta = tick(dt,timestamp);
    // draw FPS
    ctx.fillStyle = "black";
    ctx.textAlign = "right";
    ctx.font = "24px monospace";
    if (lastTick%500<=250 && timestamp%500>250){
        FPS = Math.round(1000/delta);
    }
    ctx.fillText(`Projectiles: ${projectiles.length} FPS: ${FPS}`,dimW-10,24-dimH);
    // draw players
    for (let id of playerids) {
        if (id!=socketid){
            drawPlayer(id,playerX[id],playerY[id]);
        }
    }
    drawPlayer(socketid,X,Y);
    // draw projectiles
    ctx.fillStyle = "blue";
    ctx.beginPath();
    for (let prj of projectiles){
        drawProjectile(prj,timestamp);
    }
    ctx.fill();
    // ctx.stroke();
    let newProjectiles = [];
    for (let prj of projectiles){
        if (!projectilesToRemove.includes(prj)){
            newProjectiles.push(prj);
        }
    }
    projectiles = newProjectiles;
    projectilesToRemove = [];
    // Draw origin
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.ellipse(0-X,0-Y,10,10,0,0,2*pi);
    ctx.fill();
    ctx.stroke();
    // Draw minimap
    ctx.rect(dimW-120,40-dimH,100,100);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.strokeStyle = "red";
    for (let player of playerids){
        if (player==socketid || !showAllPlayers){
            continue;
        }
        ctx.beginPath();
        ctx.ellipse(dimW-70+playerX[player]*50/MAPWIDTH, 90-dimH+playerY[player]*50/MAPHEIGHT,5,5,0,0,2*pi);
        ctx.stroke();
    }
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.ellipse(dimW-70+X*50/MAPWIDTH, 90-dimH+Y*50/MAPHEIGHT,5,5,0,0,2*pi);
    ctx.stroke();
    // Draw map boundaries
    ctx.beginPath();
    ctx.rect(-MAPWIDTH-X,-MAPHEIGHT-Y,2*MAPWIDTH,2*MAPHEIGHT);
    ctx.stroke();
    lastTick = timestamp;
    // Draw damage tint
    if (timestamp-damageTime<500){
        ctx.fillStyle = "red";
        ctx.globalAlpha = 0.2-(timestamp-damageTime)/2500;
        ctx.fillRect(-dimW,-dimH,dimW*2,dimH*2);
        ctx.globalAlpha = 1;
    }
}
onmousedown = (e)=>{
    let dx = e.clientX-dimW;
    let dy = e.clientY-dimH;
    let scl = Math.max(1,Math.hypot(dx,dy));
    dx/=scl;
    dy/=scl;
    createProjectile(X,Y,dx,dy);
    send_projectiles();
    // socket.volatile.emit("projectile",X,Y,dx,dy);
}
requestAnimationFrame(render);