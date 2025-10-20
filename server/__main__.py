import sys
import eventlet
import flask
import flask_socketio
import time

from . import console

app = flask.Flask(__name__)
socketio = flask_socketio.SocketIO(app)
bannedIPs = set()
playerids = set()
playernames = {}
playerX = {}
playerY = {}
@app.route("/")
def index():
    return flask.send_file("../web/index.html")
@app.route("/<path:path>")
def static_file(path):
    return flask.send_from_directory("../web", path)

def update_players():
    socketio.emit("players",data=(list(playerids),playernames))

@socketio.on("connect")
def player_connect(data):
    if flask.request.remote_addr in bannedIPs:
        return socketio.server.disconnect(flask.request.sid)
    pid = flask.request.sid
    playerids.add(pid)
    playerX[pid] = 0
    playerY[pid] = 0

@socketio.on("join")
def player_join(data):
    pid = flask.request.sid
    playernames[pid] = data["name"][:30].strip() or "Player"
    update_players()
    console.log(f"{data['name']} ({flask.request.remote_addr}) joined as {pid}")

@socketio.on("disconnect")
def player_disconnect():
    pid = flask.request.sid
    if pid not in playerids: return
    playerids.discard(pid)
    del playernames[pid]
    del playerX[pid]
    del playerY[pid]
    update_players()

@socketio.on("move")
def player_move(X,Y):
    pid = flask.request.sid
    if pid not in playerids: return
    playerX[pid] = X
    playerY[pid] = Y
    # socketio.emit("move",data=(pid,X,Y))

@socketio.on("message")
def player_message(text):
    pid = flask.request.sid
    if pid not in playerids: return
    socketio.emit("message",data=(pid,text))
    console.log(f"{playernames.get(pid,'Unknown')}: {text}")

@socketio.on("projectile")
def player_projectile(prjlist):
    pid = flask.request.sid
    if pid not in playerids: return
    for prj in prjlist:
        if len(prj)!=4:
            return
        if not all(isinstance(x,float) or isinstance(x,int) for x in prj):
            return
    socketio.emit("projectile",data=(pid,prjlist))

def command_kick(pid=""):
    for pidi in playerids.copy():
        if pidi.startswith(pid):
            print(f"kicked {pidi} ({playernames.get(pidi,"Unknown")})")
            socketio.server.disconnect(pidi)
console.register_command("kick",command_kick)
def command_say(*args):
    socketio.emit("message",data=(""," ".join(args)))
def command_ban(ip):
    if len(ip.split("."))==4:
        bannedIPs.add("::ffff:"+ip)
    else:
        bannedIPs.add(ip)
    print("done")
console.register_command("ban",command_ban)
def command_unban(ip):
    bannedIPs.discard(ip)
    bannedIPs.discard("::ffff:"+ip)
    print("done")
console.register_command("unban",command_unban)
console.register_command("say",command_say)
def command_exit():
    sys.exit(0)
console.register_command("exit",command_exit)
def command_list():
    for pid in playerids:
        print(f"{pid}: {playernames.get(pid,'Unknown')}")
console.register_command("list",command_list)

TIME_PER_TICK = 0.05
def emit_positions():
    ticks = 0
    start = time.monotonic()
    while True:
        socketio.emit("position",data=(playerX,playerY))
        ticks+=1
        eventlet.sleep((start+ticks*TIME_PER_TICK)-time.monotonic())

socketio.start_background_task(console.processs_commands)
socketio.start_background_task(emit_positions)
socketio.run(app,host="::",port=8000)