document.querySelector("body").addEventListener("keypress", function(e) {
    var keynum;
    if(e.which){
        keynum = e.which;
        document.querySelector("#prompt").innerHTML = document.querySelector("#prompt").innerHTML + String.fromCharCode(keynum);
    }
});

document.querySelector("body").addEventListener("keydown", function(e) {
    var keynum;
    if(e.which){
        if (e.which === 8) {
            e.preventDefault();
            document.querySelector("#prompt").innerHTML = document.querySelector("#prompt").innerHTML.slice(0, document.querySelector("#prompt").innerHTML.length - 1);
        }
    }
});