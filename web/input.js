var keys = Array(255).fill(false);
window.onkeydown = (e)=>{
    if (e.keyCode==84 && document.activeElement!=chatbox){
        chatbox.focus();
        return false;
    }
    if (document.activeElement!=chatbox && e.keyCode<256)
        keys[e.keyCode] = true;
}
window.onkeyup = (e)=>{
    if (document.activeElement!=chatbox && e.keyCode<256)
        keys[e.keyCode] = false;
}