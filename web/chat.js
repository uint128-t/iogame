const chatbox = document.getElementById("message");
const messages = document.getElementById("messages");

function send_message(){
    chatbox.blur();
    if (!chatbox.value) return false;
    socket.emit("message",chatbox.value);
    chatbox.value = "";
    return false;
}
socket.on("message",(uid,message)=>{
    let msg = document.createElement("div");
    msg.appendChild(document.createElement("b")).textContent = playernames[uid] || "[SERVER]";
    msg.appendChild(document.createTextNode(": "+message));
    messages.appendChild(msg);
    if (messages.children.length>20){
        messages.firstChild.remove();
    }
})