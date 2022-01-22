//--------------------------------------------------------------------------------------------------------------------------------------
// Type2Beat
//--------------------------------------------------------------------------------------------------------------------------------------
/*
 * A PlugIn that creates a beat / a note pattern from an input string (idea is based on TypeDrummer).
 * INPUT has to be changed within the editor. Haven't come up with a better solution yet, sorry.
 */
 
var INPUT_STRINGS = [
    "The quick brown fox jumped over the lazy dog",
    "Tension, apprehension, and dissension have begun.",
    "Now is the time for all good men to come to the aid of their country.",
    "call me Ishmael."
];

 
//--------------------------------------------------------------------------------------------------------------------------------------
//var INPUT = "I said nothing, and tried to think nothing."; // Change it up!!!
//--------------------------------------------------------------------------------------------------------------------------------------
var INPUT = INPUT_STRINGS[0];


var string = INPUT;
var currentStep = 0;

NeedsTimingInfo = true;
var wasPlaying = false;


function ParameterChanged(pNum, pVal) {
	if (pNum == 1) {
	    Trace("changed text....");
	    INPUT = INPUT_STRINGS[pVal]
	    string = INPUT;
	}
}

function ProcessMIDI() {
    var info = GetTimingInfo();
    if (wasPlaying && !info.playing) {
        MIDI.allNotesOff();
        currentStep = 0;
    }
    wasPlaying = info.playing;
    if (info.playing) {
        var seq = typeToBeat(string);
        var div = GetParameter("Beat Division");
        var nextBeat = Math.ceil(info.blockStartBeat * div) / div;
        var noteLength = 1 / div;
        if (info.cycling && info.blockEndBeat >= info.rightCycleBeat) {
            if (info.blockEndBeat >= info.rightCycleBeat) {
                var cycleBeats = info.rightCycleBeat - info.leftCycleBeat;
                var cycleEnd = info.blockEndBeat - cycleBeats;
            }
        }
        while ((nextBeat >= info.blockStartBeat && nextBeat < info.blockEndBeat) ||
            (info.cycling && nextBeat < cycleEnd)) {
            if (info.cycling && nextBeat >= info.rightCycleBeat) {
                nextBeat -= cycleBeats;
            }
            if (seq[(currentStep % seq.length)] != null) {
                var noteOn = new NoteOn();
                noteOn.pitch = seq[(currentStep % seq.length)];
                noteOn.sendAtBeat(nextBeat);
                Trace("Note: " + MIDI.noteName(noteOn.pitch));
                var noteOff = new NoteOff(noteOn);
                noteOff.sendAtBeat(nextBeat + noteLength);
            }
            currentStep += 1;
            nextBeat += 0.001;
            nextBeat = Math.ceil(nextBeat * div) / div;
        }
    }
}

function typeToBeat(string) {
    var startNote = GetParameter("A → ");
    var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    var inputArray = Array.from(this.string.toUpperCase());
    var outputArray = [];
    for (i = 0; i < inputArray.length; i++) {
        if (alphabet.includes(inputArray[i])) {
            outputArray.push(alphabet.indexOf(inputArray[i]) + startNote);
        } else {
            outputArray.push(null);
        }
    }
    return outputArray;
}

ResetParameterDefaults = false;

var PluginParameters = [{
    name: "🥁 TYPE2BEAT",
    type: "text",
},{
    name: "Text",
    type: "menu",
    valueStrings: INPUT_STRINGS,
    minValue: 0,
    maxValue: INPUT_STRINGS.length -1,
    numberOfSteps: INPUT_STRINGS.length,
    defaultValue: 0
    
}, {
    name: "A → ",
    type: "menu",
    valueStrings: MIDI._noteNames,
    minValue: 0,
    maxValue: 127,
    numberOfSteps: 128,
    defaultValue: 15
}, {
    name: "Beat Division",
    type: "linear",
    minValue: 1,
    maxValue: 8,
    numberOfSteps: 7,
    defaultValue: 4
}];