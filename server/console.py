import eventlet
import threading
import queue
import readline
commands = queue.Queue()
cont = queue.Queue()
def console():
    while True:
        command = input(">> ")
        commands.put(command)
        cont.get()

threading.Thread(target=console, daemon=True).start()
def processs_commands():
    while True:
        try:
            cmd = commands.get_nowait()
            process_command(cmd)
        except queue.Empty:
            eventlet.sleep(0.1)
cmdp = {}
cmdp["help"]=lambda:print("commands:",*cmdp.keys())
def register_command(name,fn):
    cmdp[name] = fn
def process_command(cmd):
    args = cmd.split()
    if not args: return
    name = args[0]
    if name not in cmdp:
        print("Command not found")
    else:
        cmdp[name](*args[1:])
    cont.put(1)

def log(text):
    # print("\r"+str(text),end="\n>> ")
    print("\r"+str(text))
    print(">> ",end=readline.get_line_buffer(),flush=True)
    readline.redisplay()