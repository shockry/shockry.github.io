//The character that the caret is currently at from the end of the input string
var offsetFromRight = 0;
//The location of the caret (above which character) in pixels
var caretLocation = 0;

var promptElem = document.querySelector("#prompt");

function moveCaret (direction) {
    //get document style sheet
    var sheet = document.styleSheets[1];

    //Remove first rule (always ".caret::after")
    sheet.deleteRule(0);

    if (direction == 'left') {
        //Every character is 7 pixels in width
        caretLocation += 7;
    } else {
        //Every character is 7 pixels in width
        caretLocation -= 7;
    }

    //move the caret to the left at every key stroke (the width of the character)
    sheet.insertRule('.caret::after { right: '+ caretLocation +'px; }', 0);
}

document.querySelector("body").addEventListener("keypress", function(e) {
    var keynum;
    if(e.which){
        var keynum = e.which;
        var character = String.fromCharCode(keynum);
        
        // No double spaces allowed
        if (keynum === 32) {
            //If the caret has moved two places to the left, 
            //check if there's a space under tha caret or after it
            //Otherwise just check for the last character
            if (offsetFromRight < -1) {
                if (promptElem.innerHTML.slice(offsetFromRight-1, offsetFromRight) === ' ' || 
                    promptElem.innerHTML.slice(offsetFromRight, offsetFromRight+1) === ' ') {
                    return;
                }
            } else {
                if (promptElem.innerHTML.slice(-1) === ' ') {
                    return;
                }
            }            
        }

        //If the caret has moved, the string is left half + typed character + right half
        if (offsetFromRight < 0){
            //Getting left and right halves of current input string
            var leftHalf  = promptElem.innerHTML.slice(0, offsetFromRight);
            var rightHalf = promptElem.innerHTML.slice(offsetFromRight);

            promptElem.innerHTML = leftHalf + character + rightHalf;
        } else {
            promptElem.innerHTML = promptElem.innerHTML + character;
        }
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
                rightHalf = promptElem.innerHTML.slice(offsetFromRight);
            }

            //offset from right is the character that the caret is at
            //we want the string before it and after it, but not itself
            var leftHalf = promptElem.innerHTML.slice(0, offsetFromRight-1);

            promptElem.innerHTML = leftHalf + rightHalf;
        }
        else if (e.which === 37) { //Left arrow
            if (promptElem.innerHTML.length + offsetFromRight > 0){
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
