//The character that the caret is currently at from the end of the input string
var offsetFromRight = 0;
//The location of the caret (above which character) in pixels
var caretLocation = 0;

var promptElem = document.querySelector("#prompt");

var blogLink = "https://shockry.blogspot.com";

//CORRECTME I wanted a future-proof hierarchy for this situation
//I thought of a tree for this thing, but I think it's gonna slow things up and waste space.
//In this particular case (where the user is not creating directories, just viewing),
//it should faster to create objects (hash tables)
var dirMap = {
    '~': {data: ["work/", "projects/", "<a href=" + blogLink + " target='_blank'>blog</a>", "education/"],
          parent: '~'},
    education: {data: ["Faculty of computer science, Mansoura university, Egypt"],
          parent: '~'},
    work: {data: ["06/2014 - Present: Full stack web developer<br>", "07/2013 - 06/2014: Freelance developer"],
          parent: '~'},
    blog: {data: '', link: blogLink,
           parent: '~'}

};

var handleCd = function(currentCommand, currentDir) {
    command = currentCommand.split(' ');

    if (command.length > 2){
        return "I don't know, I need one or two parameters";
    }

    if (command.length === 1 || (command.length === 2 && command[1] == '..')) {
        return {changedDir: dirMap[currentDir].parent};
    }

    if (command.length === 2) {
        if (typeof dirMap[command[1]] != 'undefined' && dirMap[command[1]].parent === currentDir) {
            if (dirMap[command[1]].link) {
                window.open(dirMap[command[1]].link);
                return "Opened in a new tab";
            }
            return {changedDir: command[1]};
        }
    }

    return "No such directory";
}

var handleLs = function(currentCommand, currentDir) {
    command = currentCommand.split(' ');

    if (command.length > 2){
        return "I don't know, I need one or two parameters";
    }

    if (command.length === 1) {
        if (typeof dirMap[currentDir] != 'undefined') {
            var fileList = '<div class="ls">';

            for (var i=0; i< dirMap[currentDir].data.length; i++) {
                fileList += '<span>' + dirMap[currentDir].data[i] + '</span>';
            }
            return fileList + '</div>';
        }
    }

    if (command.length === 2) {
        if (command[1] === 'blog') {
            return '<div class="ls"><span>' + 
                'Click the <a href="' + blogLink + '" target="_blank">link</a> or cd to blog' +
                '</span></div>';
        }
        return handleLs(command[0], command[1]);
    }

    return "I don't know this directory";
}

var handleWhich = function(currentCommand) {
    command = currentCommand.split(' ');
    if (command.length != 2){
        return "I don't know, I need exactly one parameter";
    }

    if (command[1] === 'country') {
        return "Egypt";
    }

    return "I don't know which";
}

var commands = {
    whoami: "Ahmed Shokry. Programmer, learner, gamer and cat lover",
    uptime: (new Date().getFullYear() - new Date('1992').getFullYear()) + " years",
    ls: handleLs,
    cd: handleCd,
    which: handleWhich
};

//Ansewrs pool if the command was not defined
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
            commandText = promptElem.innerHTML.trim();

            //Do nothing if empty command
            if (commandText.length === 0){
                return;
            }

            command = commandText.split(' ')[0];
            command = commands[command];

            //Pick a random answer if the command was not found in the commands array
            if (typeof command === 'undefined') {
                command = commandNotFound[Math.floor(Math.random() * commandNotFound.length)];
            }

            if (typeof command === 'function') {
                if (commandText.indexOf('which') === 0) {
                    command = command(commandText);
                } else if (commandText.indexOf('ls') === 0) {
                    command = command(commandText, document.querySelector("#current-dir").innerHTML);
                } else if (commandText.indexOf('cd') === 0) {
                    command = command(commandText, document.querySelector("#current-dir").innerHTML);
                }
            }

            divToClone = document.querySelectorAll(".promptContainer");
            
            //If you're changing directories, don't print out anything
            //else show the command output and clone the prompt text to a new line
            commandOut = command.changedDir? '': command;
            
            document.querySelector("body").innerHTML += '<br>' + commandOut +
             '<div class="promptContainer">' + divToClone[divToClone.length - 1].innerHTML + '</div>';

            //Remove old ids (to use new clones ones)
            document.querySelector("#prompt").removeAttribute("id");
            document.querySelector("#placeholder").removeAttribute("id");
            document.querySelector("#current-dir").removeAttribute("id");

            //Clear the command
            document.querySelector("#prompt").innerHTML = '';

            //Re-assign the prompt element
            promptElem = document.querySelector("#prompt");

            if (command.changedDir) {
                document.querySelector("#current-dir").innerHTML = command.changedDir;
            }

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
