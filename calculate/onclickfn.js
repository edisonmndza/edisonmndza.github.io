function clearField() {
    document.getElementById("displayPrev").value = '';        
    document.getElementById("displayCurr").value = '';
}

function backspace(){
    document.getElementById("displayCurr").value = document.getElementById("displayCurr").value.slice(0, -1);
}
//from https://stackoverflow.com/questions/952924/javascript-chop-slice-trim-off-last-character-in-string

function append(input){
    if (document.getElementById("displayCurr").value == '0'){
        document.getElementById("displayCurr").value = input;
    } else document.getElementById("displayCurr").value += input;
}

function appendDec(){
    var expressionSplit = document.getElementById("displayCurr").value.split(/\+|\-|\/|\*/);
    var lastNum = expressionSplit[expressionSplit.length -1];
    if (lastNum == '') 
        document.getElementById("displayCurr").value += '0.';
    else {
        if (!lastNum.includes('.'))
            document.getElementById("displayCurr").value += '.';
    }
}

function appendSym(sym){
    if (document.getElementById("displayCurr").value == ''){ // blank
        // - use previous result if available
        // - add zero if no previous result or prev result is ERROR
        var prefix = '0';
        if (document.getElementById("displayPrev").value != ''){
            //there's a previous answer - check if it's a number 
            var prevAns = document.getElementById("displayPrev").value.split('=');
            if (!isNaN(prevAns[1])){
                console.log(prevAns[1])
                prefix = prevAns[1];
            }
        }
        document.getElementById("displayCurr").value+=prefix;
    }   
    else{
        var lastChar = document.getElementById("displayCurr").value.charAt(document.getElementById("displayCurr").value.length-1);
        if((lastChar < '0' || lastChar > '9') && lastChar != '.'){
            backspace();
        } 
    }
    document.getElementById("displayCurr").value+=sym;
}

function calculate(){
    if (document.getElementById("displayCurr").value == ''){
        if (document.getElementById("displayPrev").value == ''){
            document.getElementById("displayPrev").value = '0';
        }
    } else {
        var output;
        try {
            output = eval(document.getElementById("displayCurr").value);
        } catch (e) {
            output = 'ERROR';
        }
        document.getElementById("displayPrev").value = document.getElementById("displayCurr").value + '=' + output;
        document.getElementById("displayCurr").value = '';    
    }
}