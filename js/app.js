//The character that the caret is currently at from the end of the input string
var offsetFromRight = 0;
//The location of the caret (above which character) in pixels
var caretLocation = 0;

var commandStack = [];
var currentStackCommand = -1;

var promptElem = document.querySelector("#prompt");

var blogLink = "https://shockry.blogspot.com";
var githubLink = "https://github.com/shockry";

//Answers to the which command
var whichAnswers  = {country: "Egypt",
                     phone: "+20 100 453 1621",
                     email: '<a href="mailto:shokry92@gmail.com">shokry92@gmail.com</a>',
                     mail: '<a href="mailto:shokry92@gmail.com">shokry92@gmail.com</a>',
                     age: (new Date().getFullYear() - new Date('1992').getFullYear()) + " years"};

//CORRECTME I wanted a future-proof hierarchy for this situation
//I thought of a tree for this thing, but I think it's gonna slow things up and waste space.
//I know it's better to explicitly specify children, but
//in this particular case (where the user is not creating directories, just viewing),
//it should faster to create objects (hash tables)
var dirMap = {
    '~': {data: ["work/", "skills/", "projects/", "education/", "<a href=" + blogLink + " target='_blank'>blog</a>",
                 "<a href=" + githubLink + " target='_blank'>github</a>", "interests/"],
          parent: '~'},
    work: {data: ["08/2017 - present Software Engineer, Symbyo technologies", "06/2014 - 06/2017 Full stack web developer, Inception soft solutions", "07/2013 - 06/2014: Freelance developer"],
           listNewLines: true,
           parent: '~'},
    skills: {data: ["PHP", "MySQL", "Laravel", "HTML", "CSS", "Javascript", "React",
                    "Redux", "Nodejs", "Mongodb", "Azure",
                    "Mocha", "Babel", "Webpack", "JQuery", "AngularJS", "Vim",
                    "Polymer", "git", "Python", "Java", "Unix/Linux" ],
             parent: '~'},
    projects: {data: ['<a href="https://github.com/shockry/remotrack-web" target="_blank">' +
                              'Remotely-controlled web game via iPhone\'s sensors over Bluetooth</a>',
                      '<a href="https://shockry.github.io/editest/" target="_blank">' +
                              'Friendly photo editor, making use of Javascript\'s consurrency features</a>',
                      '<a href="http://shokry.dx.am/random-name-generator" target="_blank">' +
                              'Random codename generator</a>',
                      '<a href="http://shokry.dx.am/pomodoro-timer" target="_blank">Ticking Pomodoro timer</a>',
                      "Android application that utilized QR codes to make online shopping lists",
                      'Self-solving "Missionaries and Cannibals" graphical game',
                      "Parser for a simple-grammar programming language",
                      "Web application for an international organization (CRS)"
                      ],
               listNewLines: true,
               parent: '~'},
    education: {data: ["Faculty of computer science, Mansoura university, Egypt"],
          parent: '~'},
    blog: {data: '', externalLink: blogLink,
           parent: '~'},
    github: {data: '', externalLink: githubLink,
             parent: '~'},
    interests: {data: ["Software", "Blogging", "Writing short stories", "Gaming", "Cycling", "Cats :3"],
                parent: '~'}
};

var handleCd = function(currentCommand, currentDir) {
    command = currentCommand.split(' ');

    if (command.length > 2){
        return "I don't know, I need one or two parameters";
    }

    if (command.length === 1 || (command.length === 2 && (command[1] == '..' || command[1] == '~'))) {
        return {changedDir: dirMap[currentDir].parent};
    }

    if (command.length === 2) {
        //Check if the desired directory is at the current directory before proceeding
        if (typeof dirMap[command[1]] != 'undefined' && dirMap[command[1]].parent === currentDir) {
            if (dirMap[command[1]].externalLink) {
                window.open(dirMap[command[1]].externalLink);
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
            //Loop through the data array of the current directory and display it
            for (var i=0; i< dirMap[currentDir].data.length; i++) {
                fileList += '<span>' + dirMap[currentDir].data[i] + '</span>';
                if (dirMap[currentDir].listNewLines) {
                    fileList += '<div class="space-separator"></div>';
                }
            }
            return fileList + '</div>';
        }
    }

    //If a directory name is specified, recursevly ls that directory if it's not a link to something
    if (command.length === 2) {
        if (dirMap[command[1]].externalLink) {
            return '<div class="ls"><span>' +
                'Click the <a href="' + dirMap[command[1]].externalLink +
                '" target="_blank">link</a> or cd to ' + command[1] +
                '</span></div>';
        }
        if (dirMap[command[1]].parent === currentDir) {
            //command[0] is just "ls" now, command[1] is the new "currentDir" we wanna listaaaaass
            return handleLs(command[0], command[1]);
        }
    }

    return "I don't know this directory";
}

var handleWhich = function(currentCommand, currentDir) {
    command = currentCommand.split(' ');
    if (command.length != 2){
        return "I don't know, I need exactly one parameter";
    }

    if (whichAnswers[command[1]]) {
        return '<div class="ls"><span>' + whichAnswers[command[1]] +'</span></div>';
    }

    return "I don't know which";
}

var getCurrentDir = function(currentCommand, currentDir) {
    return document.querySelector("#current-dir").innerHTML;
}

var commands = {
    whoami: "Ahmed Shokry. Programmer, learner, gamer and cat lover",
    uptime: (new Date().getFullYear() - new Date('1992').getFullYear()) + " years",
    ls: handleLs,
    cd: handleCd,
    pwd: getCurrentDir,
    which: handleWhich
};

//Ansewrs pool if the command was not defined
var commandNotFound = [
    "Nope", "Umm.. wat?", "I can't answer that", "Nah", "That doesn't make sense to me",
    "Let me see... No", "You misspelled something?"
];

function moveCaret (direction) {
    //get document style sheet
    var sheet = document.styleSheets[1];

    //A workaround to get current character width (always make it monospace, please)
    //We still need a dynamic width for the caret itself
    var charWidth = document.querySelector("#char-width").clientWidth;

    //Remove first rule (always "#prompt::after")
    sheet.deleteRule(0);

    if (direction == 'left') {
        //Move by the width of one character
        caretLocation += charWidth;
    } else {
        //Move by the width of one character
        caretLocation -= charWidth;
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
                command = command(commandText, getCurrentDir());
            }

            divToClone = document.querySelectorAll(".promptContainer");

            //If you're changing directories, don't print out anything
            //otherwise show the command output and clone the prompt text to a new line
            commandOut = command.changedDir? '': command;

            document.querySelector("body").innerHTML += '<br>' + commandOut +
             '<div class="promptContainer">' + divToClone[divToClone.length - 1].innerHTML + '</div>';

            //Remove old ids (to use new clones' ones)
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

            //Move caret to the beginning of the typing area.
            //A precaution for when the user has moved to the left
            for (var i = offsetFromRight; i < 0; i++) {
                moveCaret('right');
            }
            offsetFromRight = 0;

            //Push into the command stack and set the pointer to the top
            commandStack.unshift(commandText);
            currentStackCommand = -1;

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
        //Command stack navigation
        else if (e.which === 38) { //Up arrow
            e.preventDefault();
            if (currentStackCommand < commandStack.length - 1){
                currentStackCommand += 1;
                promptElem.innerHTML = commandStack[currentStackCommand];
            }
        }
        else if (e.which === 40) { //Down arrow
            e.preventDefault();
            if (currentStackCommand > 0){
                currentStackCommand -= 1;
                promptElem.innerHTML = commandStack[currentStackCommand];
            } else {
                promptElem.innerHTML = '';
            }
        }
    }
});
