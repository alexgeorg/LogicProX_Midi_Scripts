//--------------------------------------------------------------------------------------------------------------------------------------
// VOSSDELAY
//--------------------------------------------------------------------------------------------------------------------------------------
/*
 * A PlugIn that delays incoming midi notes with pink noise values (calculated with 
 * altered Voss Algorithem). Number of dices and max dice value are chosen randomly,
 * change them up to taste!
 */
//--------------------------------------------------------------------------------------------------------------------------------------

var stepCounter = 0;

function vossAlgorithem() {
    var nbDice     = GetParameter("Number of dices ");
    var maxDice    = GetParameter("Max dice value ");
    var diceValues = new Array(nbDice);
    for (i = 1; i <= nbDice; i++) {
        if (((stepCounter ^ (stepCounter - 1)).toString(2)).charAt(i - 1) == 1) {
            diceValues[i] = Math.floor(Math.random() * maxDice) + 1;
        }
    }
    return diceValues.reduce(function(a, b) {
        return a + b;
    }, 0);
}

function HandleMIDI(event) {
    if(event instanceof Note) {
        if (event instanceof NoteOn) { 
            var noteDelay = vossAlgorithem();     
            event.sendAfterMilliseconds(noteDelay);
            stepCounter++;
            SetParameter(3, noteDelay);
        } else if (event instanceof NoteOff) {       
            event.send();                      
        }
    } else {event.send();}
}

ResetParameterDefaults = true;

var PluginParameters = [{
    name: "🌊 VOSSDELAY", type: "text"
}, { 
    name: "Number of dices ", type: "lin", defaultValue: 5, minValue: 1, 
    maxValue: 10, numberOfSteps: 9
}, {
    name: "Max dice value ", type: "lin", defaultValue: 6, minValue: 1, 
    maxValue: 6, numberOfSteps: 5
}, {
    name: "Delay in ms ", type: "lin", defaultValue: 0, minValue: 0, 
    maxValue: 100, numberOfSteps: 100, disableAutomation: true, readOnly: true
}];