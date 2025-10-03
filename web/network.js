let url = new URL(window.location.href);
let params = new URLSearchParams(url.search);
var username = params.get("name").substring(0,30);

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
var projectileN = 0;
var projectiles = [];
var projectileX = {};
var projectileY = {};
var projectileDX = {};
var projectileDY = {};
var projectilePLR = {};
var projectileTIME = {};
var lastTick;
var firstJoin = true;
socket.on("players",(Dplayerids,Dplayernames)=>{
    // Remove old keys
    for (let id of playerids){
        if(!Dplayerids.includes(id)){
            delete playerX[id];
            delete playerY[id];
            let msg = document.createElement("div");
            msg.appendChild(document.createElement("b")).innerText = playernames[id];
            msg.appendChild(document.createTextNode(" left"));
            messages.appendChild(msg);
        }
    }
    // Add new data
    playerids = Dplayerids;
    playernames = Dplayernames;
    // Add new keys
    for (let i = 0; i < playerids.length; i++) {
        if (playerids[i] in playerX) continue;
        playerX[playerids[i]] = 0;
        playerY[playerids[i]] = 0;
        if (!firstJoin){
            let msg = document.createElement("div");
            msg.appendChild(document.createElement("b")).innerText = playernames[playerids[i]];
            msg.appendChild(document.createTextNode(" joined"));
            messages.appendChild(msg);
        }
    }
    firstJoin = false;
})
socket.on("position",(pX,pY)=>{
    playerX = pX;
    playerY = pY;
})
socket.on("projectile",(pid,prjs)=>{
    console.log("receive",pid,prjs);
    for (let prj of prjs){
        projectiles.push(projectileN);
        projectileX[projectileN] = prj[0];
        projectileY[projectileN] = prj[1];
        projectileDX[projectileN] = prj[2];
        projectileDY[projectileN] = prj[3];
        projectilePLR[projectileN] = pid;
        projectileTIME[projectileN] = lastTick;
        projectileN++;
    }
})
socket.on("disconnect",()=>{
    playerids = [];
    let msg = document.createElement("div");
    msg.appendChild(document.createElement("b")).textContent = "Error: Disconnected from server";
    messages.appendChild(msg);
})