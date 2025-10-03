var poses = [[1,0],[2,0],[-1,0],[-2,0],[0,1],[0,2],[0,-1],[0,-2],[0,0],[1,2],[2,2],[-2,1],[-2,2],[2,-1],[2,-2],[-2,-2],[-1,-2]]
onclick = (e)=>{
    let dx = e.clientX-dimW;
    let dy = e.clientY-dimH;
    let scl = 0.5*Math.max(1,Math.hypot(dx,dy));
    dx/=scl;
    dy/=scl;
    for (let pos of poses){
        createProjectile(X-pos[0]*20,Y-pos[1]*20,dx,dy);
    }
}

setInterval(()=>{for(let player of playerids) createProjectile(X,Y,(playerX[player]-X)/10,(playerY[player]-Y)/10)})

angle=0;setInterval(()=>{angle+=1;createProjectile(X,Y,2*Math.sin(angle),2*Math.cos(angle))})

onclick = (e) => {
    let tx = e.clientX - dimW+X;
    let ty = e.clientY - dimH+Y;
    for (let deg=0;deg<2*Math.PI;deg+=0.1){
        let x = 100*Math.cos(deg)+X;
        let y = 100*Math.sin(deg)+Y;
        createProjectile(x, y, (tx-x)/100, (ty-y)/100);
    }
}

onclick = (e) => {
    let tx = e.clientX - dimW + X;
    let ty = e.clientY - dimH + Y;
    for (let dat of poses) {
        let x = 20 * dat[0] + X;
        let y = 20 * dat[1] + Y;
        createProjectile(x, y, (tx - x) / 100, (ty - y) / 100);
    }
}

onclick = (e) => {
    let spd = 3;
    let tx = e.clientX - dimW+X;
    let ty = e.clientY - dimH+Y;
    let scl = Math.hypot(tx-X,ty-Y);
    for (let deg=0;deg<2*Math.PI;deg+=0.1){
        let x = 100*Math.cos(deg)+X;
        let y = 100*Math.sin(deg)+Y;
        createProjectile(x, y, spd*(tx-x)/scl, spd*(ty-y)/scl);
    }
}

onclick = (e) => {
    let spd = 3;
    let tx = e.clientX - dimW + X;
    let ty = e.clientY - dimH + Y;
    let scl = Math.hypot(tx - X, ty - Y);
    for (let deg = 0; deg < 2 * Math.PI; deg += 0.1) {
        let x = 100 * Math.cos(deg) + X;
        let y = 100 * Math.sin(deg) + Y;
        createProjectile(x, y, spd * (tx - x) / scl, spd * (ty - y) / scl);
    }
}

onclick = (e) => {
    let tx = e.clientX - dimW + X;
    let ty = e.clientY - dimH + Y;
    for (let k=0;k<1000;k++) {
        let x = 200 * Math.random()-100 + X;
        let y = 200 * Math.random()-100 + Y;
        createProjectile(x, y, (tx - x) / 100, (ty - y) / 100);
    }
    send_projectiles();
}