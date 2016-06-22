//The character that the caret is currently at from the end of the input string
var offsetFromRight = 0;
//The location of the caret (above which character) in pixels
var caretLocation = 0;

var promptElem = document.querySelector("#prompt");

var handleLs = function() {
    currentDir = document.querySelector("#current-dir").innerHTML;
    if (currentDir === '~') {
        return '<div class="ls">' + '<span>projects/</span>' + '<span>education/</span>' + '<span>work/</span>' + '</div>';
    }
}

var commands = {
    whoami: "Ahmed Shokry. Programmer, learner, gamer and cat lover",
    uptime: (new Date().getFullYear() - new Date('1992').getFullYear()) + " years",
    ls: handleLs()
};

//Ansewrs if the command was not defined
var commandNotFound = [
    "Nope", "Umm.. wat?", "I can't answer that", "Nah", "That doesn't make sense to me",
    "Let me see... No"
];

function moveCaret (direction) {
    //get document style sheet
    var sheet = document.styleSheets[1];

    //Remove first rule (always "#prompt::after")
    sheet.deleteRule(0);

    if (direction == 'left') {
        //Every character is 7 pixels in width
        caretLocation += 7;
    } else {
        //Every character is 7 pixels in width
        caretLocation -= 7;
    }

    //move the caret to the left at every key stroke (the width of the character)
    sheet.insertRule('#prompt::after { right: '+ caretLocation +'px; }', 0);
}

document.querySelector("body").addEventListener("keypress", function(e) {
    var keynum;
    if(e.which){
        var keynum = e.which;

        if (keynum === 13) {
            command = promptElem.innerHTML.trim();

            //Do nothing if empty command
            if (command.length === 0){
                return;
            }

            command = commands[command];

            //Pick a random answer if the command was not found in the commands array
            if (typeof command == 'undefined') {
                command = commandNotFound[Math.floor(Math.random() * commandNotFound.length)];
            }

            divToClone = document.querySelectorAll(".promptContainer");
            
            //show the command output and clone the prompt text to a new line
            document.querySelector("body").innerHTML += '<br>' + command +
             '<div class="promptContainer">' + divToClone[divToClone.length - 1].innerHTML + '</div>';

            //Remove old ids (to use new clones ones)
            document.querySelector("#prompt").removeAttribute("id");
            document.querySelector("#placeholder").removeAttribute("id");
            document.querySelector("#current-dir").removeAttribute("id");

            //Clear the command
            document.querySelector("#prompt").innerHTML = '';

            //Re-assign the prompt element
            promptElem = document.querySelector("#prompt");

            //Scroll to the end of the window
            window.scrollTo(0,document.body.scrollHeight);

            return;
        }

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
