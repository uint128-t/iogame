let url = new URL(window.location.href);
let params = new URLSearchParams(url.search);
var username = params.get("name").trim().substring(0,30) || "Player";

const socket = io();
var socketid;
console.log(username);
socket.on("connect",()=>{
    console.log("connected");
    socket.emit("join",{"name":username});
    socketid = socket.id;
})
var playerids = [];
var playernames = {};
var playerX = {};
var playerY = {};

const max_projectiles = 30000;
var projectileN = 0;
var projectileLEFT = 0;
var projectiles_sprites = [];
var projectileX = Array(max_projectiles).fill(0);
var projectileY = Array(max_projectiles).fill(0);
var projectileDX = Array(max_projectiles).fill(0);
var projectileDY = Array(max_projectiles).fill(0);
var projectilePLR = Array(max_projectiles).fill(0);
var projectileTIME = Array(max_projectiles).fill(0);

function addProjectile(x,y,dx,dy,plr){
    if (projectileN==max_projectiles){
        popProjectile();
    }
    let pix = (projectileN+projectileLEFT)%max_projectiles;
    projectiles_sprites[pix].visible = true;
    projectileN+=1;
    projectileX[pix] = x;
    projectileY[pix] = y;
    projectileDX[pix] = dx;
    projectileDY[pix] = dy;
    projectilePLR[pix] = plr;
    projectileTIME[pix] = ftime;
}
function popProjectile(){
    projectiles_sprites[projectileLEFT].visible = false;
    projectileLEFT=(projectileLEFT+1)%max_projectiles;
    projectileN--;
}

var lastTick;
var firstJoin = true;
socket.on("players",(Dplayerids,Dplayernames)=>{
    // Remove old keys
    for (let id of playerids){
        if(!Dplayerids.includes(id)){
            let msg = document.createElement("div");
            msg.appendChild(document.createElement("b")).innerText = playernames[id];
            msg.appendChild(document.createTextNode(" left"));
            messages.appendChild(msg);
            player_sprite[id].destroy();
            player_text[id].destroy();
            player_icon[id].destroy();
            delete player_sprite[id];
            delete player_text[id];
            delete player_icon[id];
        }
    }
    // Add new data
    let oldplayerids = playerids.slice();
    playerids = Dplayerids;
    playernames = Dplayernames;
    // Add new keys
    console.log(oldplayerids,playerids);
    for (let i = 0; i < playerids.length; i++) {
        if (oldplayerids.includes(playerids[i])) continue;
        if (playerids[i]==socketid) continue;
        console.log("new player",playerids[i]);
        playerX[playerids[i]] = 0;
        playerY[playerids[i]] = 0;
        if (!firstJoin){
            let msg = document.createElement("div");
            msg.appendChild(document.createElement("b")).innerText = playernames[playerids[i]];
            msg.appendChild(document.createTextNode(" joined"));
            messages.appendChild(msg);
        }
        player_sprite[playerids[i]] = new PIXI.Sprite(playerTexture);
        player_sprite[playerids[i]].anchor.set(0.5);
        player_sprite[playerids[i]].roundPixels = true;
        app.stage.addChild(player_sprite[playerids[i]]);
        let text = new PIXI.Text({
            text: playernames[playerids[i]],
            style: {
                fill: '#000000',
                fontSize: 20,
                fontFamily: 'monospace',
            },
            anchor: 0.5
        });
        player_text[playerids[i]] = text;
        text.roundPixels = true;
        app.stage.addChild(text);
        player_icon[playerids[i]] = new PIXI.Sprite(playerIcon);
        player_icon[playerids[i]].anchor.set(0.5);
        player_icon[playerids[i]].roundPixels = true;
        app.stage.addChild(player_icon[playerids[i]]);
    }
    firstJoin = false;
})
socket.on("position",(pX,pY)=>{
    playerX = pX;
    playerY = pY;
})
socket.on("projectile",(pid,prjs)=>{
    for (let prj of prjs){
        addProjectile(prj[0],prj[1],prj[2],prj[3],pid);
    }
})
socket.on("disconnect",()=>{
    playerids = [];
    let msg = document.createElement("div");
    msg.appendChild(document.createElement("b")).textContent = "Error: Disconnected from server";
    messages.appendChild(msg);
})
