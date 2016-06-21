//The character that the caret is currently at from the end of the input string
var offsetFromRight = 0;
//The location of the caret (above which character) in pixels
var caretLocation = 0;

function moveCaret (direction) {
    //get document style sheet
    var sheet = document.styleSheets[0];

    //Remove first rule (always ".caret::after")
    sheet.removeRule(0);

    if (direction == 'left') {
        //Every character is 8 pixels in width
        caretLocation += 8;
    } else {
        //Every character is 8 pixels in width
        caretLocation -= 8;
    }

    //move the caret to the left at every key stroke (the width of the character)
    sheet.insertRule('.caret::after { right: '+ caretLocation +'px; }', 0);
}

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
        if (e.which === 8) { //Backspace
            e.preventDefault();

            //Constructing the input string, before caret + after caret
            var rightHalf;
            //If no arrow keys are pressed yet, left half is full string (minus last character), right half is empty
            if (offsetFromRight === 0) {
                rightHalf = '';
            } else {
                rightHalf = document.querySelector("#prompt").innerHTML.slice(offsetFromRight);
            }

            //offset from right is the character that the caret is at
            //we want the string before it and after it, but not itself
            var leftHalf = document.querySelector("#prompt").innerHTML.slice(0, offsetFromRight-1);

            document.querySelector("#prompt").innerHTML = leftHalf + rightHalf;
        }
        else if (e.which === 37) { //Left arrow
            if (document.querySelector("#prompt").innerHTML.length + offsetFromRight > 0){
                offsetFromRight -= 1;
                moveCaret('left');
            }
        }
        else if (e.which === 39) { //Right arrow
            if (offsetFromRight < 0){
                offsetFromRight += 1;
                moveCaret('right');
            }
        }
    }
});
