var X=0;
var Y=0;
var speed = 0.5;
const pi=Math.PI;
const sq2=Math.SQRT2;
const MAPWIDTH = 5000;
const MAPHEIGHT = 5000;
const tinter = document.getElementById("tinter")
var showAllPlayers = false;

lastTick = 0;
function send_projectiles(){
    if (projectilesend.length) {
        socket.emit("projectile", projectilesend);
        projectilesend = [];
    }
}

const app = new PIXI.Application();
app.init({
    resizeTo: window,
    autoDensity: true,
    backgroundColor: 0xffffff,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
}).then(() => {
    document.body.appendChild(app.canvas);
    app.ticker.add(ticker);
    let circleGraphic = new PIXI.Graphics();
    circleGraphic.beginFill(0xffffff);
    circleGraphic.drawCircle(0,0,20);
    circleGraphic.endFill();
    circleGraphic.drawCircle(0,0,20);
    circleGraphic.stroke({width:2,color:0});
    window.playerTexture = app.renderer.generateTexture(circleGraphic);

    let projectileGraphic = new PIXI.Graphics();
    projectileGraphic.beginFill(0x00AAFF);
    projectileGraphic.drawCircle(0,0,10);
    projectileGraphic.endFill();
    window.projectileTexture = app.renderer.generateTexture(projectileGraphic);

    window.playerSprite = new PIXI.Sprite(window.playerTexture);
    playerSprite.anchor.set(0.5);
    playerSprite.roundPixels = true;
    app.stage.addChild(playerSprite);
    for (let i=0;i<max_projectiles;i++){
        projectiles_sprites.push(new PIXI.Sprite(window.projectileTexture));
        projectiles_sprites[i].anchor.set(0.5);
        projectiles_sprites[i].visible = false;
        projectiles_sprites[i].roundPixels = true;
        app.stage.addChild(projectiles_sprites[i]);
    }

    let ptext = new PIXI.Text({
        text: username,
        style: {
            fill: '#000000',
            fontSize: 20,
            fontFamily: 'monospace',
        },
        anchor: 0.5
    });
    ptext.roundPixels = true;
    window.playername_text = ptext;
    app.stage.addChild(ptext);
    let fpstext = new PIXI.Text({
        text: "FPS: ~",
        style: {
            fill: '#000000',
            fontSize: 20,
            fontFamily: 'monospace',
        }
    });
    fpstext.roundPixels = true;
    fpstext.anchor.set(1,0);
    window.fps_text = fpstext;
    app.stage.addChild(fpstext); 
    let playerIconGraphic = new PIXI.Graphics();
    playerIconGraphic.beginFill(0);
    playerIconGraphic.drawCircle(0,0,5);
    playerIconGraphic.stroke({width:2,color:0});
    window.playerIcon = app.renderer.generateTexture(playerIconGraphic);
    let currentPlayerIconGraphic = new PIXI.Graphics();
    currentPlayerIconGraphic.beginFill(0);
    currentPlayerIconGraphic.drawCircle(0,0,5);
    currentPlayerIconGraphic.stroke({width:2,color:0x00AAFF});
    let currentPlayerIcon = app.renderer.generateTexture(currentPlayerIconGraphic);
    window.current_player_icon = new PIXI.Sprite(currentPlayerIcon);
    current_player_icon.anchor.set(0.5);
    current_player_icon.roundPixels = true;
    app.stage.addChild(current_player_icon);
    window.minimap = new PIXI.Graphics();
    minimap.drawRect(0,0,2*MMAPWIDTH,2*MMAPHEIGHT);
    minimap.stroke({width:2,color:0});
    app.stage.addChild(minimap);
});
var player_sprite = {};
var player_icon = {};
var player_text = {};
var ftime = 0;
var FPSX = Array(60).fill(0);
var FPSI = 0;
var FPST = 0;
function ticker(dt){
    ftime+=dt.deltaMS;
    tick(dt.deltaMS,ftime);
    playerSprite.position.set(dimW, dimH);
    for (let id of playerids) {
        if (id!=socketid){
            drawPlayer(id,playerX[id],playerY[id]);
        }
    }
    while (projectileN && projectileTIME[projectileLEFT]+1000<ftime){
        popProjectile();
    }
    for (let pji=0;pji<projectileN;pji++){
        let pjid = (projectileLEFT+pji)%max_projectiles;
        projectiles_sprites[pjid].position.set(getprojectileX(pjid,ftime)-X+dimW,getprojectileY(pjid,ftime)-Y+dimH);
    }
    playername_text.position.set(dimW, dimH-30);
    current_player_icon.position.set(minimapX(X),minimapY(Y));

    if (lastTick%1000<=500 && ftime%1000>500){
        fps_text.text = `FPS: ${Math.round(FPST/60)}`;
    }
    FPSI = (FPSI+1)%60;
    FPST -= FPSX[FPSI];
    FPSX[FPSI] = Math.round(app.ticker.FPS);
    FPST += FPSX[FPSI];
    fps_text.position.set(2*dimW-10,10);
    lastTick = ftime;
    damaged = false;
    minimap.position.set(2*dimW-MMAPMARGINW-2*MMAPWIDTH,MMAPMARGINH);
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
    for (let pjid=0;pjid<projectileN;pjid++){
        projectileCollision((pjid+projectileLEFT)%max_projectiles,timestamp);
    }
    socket.volatile.emit("move",X,Y);
    send_projectiles();
}
const MMAPMARGINH = 40;
const MMAPMARGINW = 20;
const MMAPWIDTH = 100;
const MMAPHEIGHT = 100;
function minimapX(x){
    return 2*dimW-MMAPMARGINW-(MAPWIDTH-x)/(MAPWIDTH/MMAPWIDTH);
}
function minimapY(y){
    return MMAPMARGINH+(y+MAPHEIGHT)/(MAPHEIGHT/MMAPHEIGHT);
}
function drawPlayer(id,x,y){
    // X and Y are in global coordinates
    if (Math.abs(x-X)>dimW+20 || Math.abs(y-Y)>dimH+20) return;
    player_sprite[id].position.set(x-X+dimW,y-Y+dimH);
    player_text[id].position.set(x-X+dimW,y-Y+dimH-30);
    player_icon[id].position.set(minimapX(x),minimapY(y)); 
}
function getprojectileX(id,timestamp){
    return projectileX[id]+(timestamp-projectileTIME[id])*projectileDX[id];
}
function getprojectileY(id,timestamp){
    return projectileY[id]+(timestamp-projectileTIME[id])*projectileDY[id];
}
var damageTime = -10000;
var damaged = false;
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
        damageTime = timestamp;
        if (!damaged){
            tinter.animate([{boxShadow: "inset 0px 0px 100px 50px rgba(255, 0, 0, 0.6)"},{}
                ], { duration: 500 });
        }
        damaged = true;
    }
}
var FPS = 0;
var projectilesend = [];
function createProjectile(x,y,dx,dy){
    projectilesend.push([x,y,dx,dy]);
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