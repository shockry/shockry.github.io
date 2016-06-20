document.querySelector("body").addEventListener("keypress", function(e) {
    var keynum;
    if(e.which){
      keynum = e.which;
    }
    
    document.querySelector("#prompt").innerHTML = document.querySelector("#prompt").innerHTML + String.fromCharCode(keynum)
});