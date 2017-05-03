//--------------------------------------------------------------------------------------------------------------------------------------
// ENOISH
//--------------------------------------------------------------------------------------------------------------------------------------
/*
 * Basically my take on Brian Eno's RandomTransposer script that can be seen in his BBC interview
 */
//--------------------------------------------------------------------------------------------------------------------------------------
var NUMBER_OF_TRANSPOSERS = 2; // Default setting
//--------------------------------------------------------------------------------------------------------------------------------------

var PARAMS_TO_ADD = [];
var PARAMS_TO_REMOVE = [];
var GROUP_NUMBER = NUMBER_OF_TRANSPOSERS;

var activeNotes = [];

function HandleMIDI(event) {
    if (event instanceof NoteOn) {
        var noteOn = new NoteOn(event);
        var record = {
            originalPitch: event.pitch,
            transposedNote: noteOn
        };
        for (var i = 0; i < GROUP_NUMBER; i++) {
            if (event.pitch == GetParameter("Note " + (i + 1))) {
                var transpose = GetParameter("Transpose " + (i + 1));
                var probability = GetParameter("Probability " + (i + 1));
                var randomTranspose = function(transpose, probability) {
                    return Math.floor(Math.random() * 100) + 1 <= probability ? transpose : 0;
                };
                noteOn.pitch += randomTranspose(transpose, probability);
            }
        }
        if ((Math.floor(Math.random() * 100) + 1 <= GetParameter("Probability Send") ? true : false) == true) {
            activeNotes.push(record);
            noteOn.send();
        }
    } else if (event instanceof NoteOff) {
        for (var i in activeNotes) {
            if (activeNotes[i].originalPitch == event.pitch) {
                var noteOff = new NoteOff(activeNotes[i].transposedNote);
                noteOff.send();
                activeNotes.splice(i, 1);
                break;
            }
        }
    }
}

function ParameterChanged(param, value) {
    if (param <= 3) {
        switch (param) {
            case 0:
                break;
            case 1:
                break;   
            case 2:
                if (GROUP_NUMBER < GetParameter("Number of Groups")) {
                    for (i = 0; i < (GetParameter("Number of Groups") - GROUP_NUMBER); i++) {
                        GROUP_NUMBER++;
                        PARAMS_TO_ADD.push({
                            name: "Group " + GROUP_NUMBER,
                            type: "text"
                        }, {
                            name: "Note " + GROUP_NUMBER,
                            type: "menu",
                            defaultValue: 60,
                            minValue: 0,
                            maxValue: 127,
                            numberOfSteps: 128,
                            valueStrings: MIDI._noteNames
                        }, {
                            name: "Transpose " + GROUP_NUMBER,
                            type: 'lin',
                            minValue: -24,
                            maxValue: 24,
                            numberOfSteps: 48,
                            defaultValue: 0
                        }, {
                            name: "Probability " + GROUP_NUMBER,
                            type: 'lin',
                            minValue: 0,
                            maxValue: 100,
                            numberOfSteps: 100,
                            defaultValue: 50
                        });
                    }
                } else if (GROUP_NUMBER > GetParameter("Number of Groups")) {
                    for (i = 0; i < (GROUP_NUMBER - GetParameter("Number of Groups")); i++) {
                        PARAMS_TO_REMOVE.push(PluginParameters.length - 1);
                        PARAMS_TO_REMOVE.push(PluginParameters.length - 2);
                        PARAMS_TO_REMOVE.push(PluginParameters.length - 3);
                        PARAMS_TO_REMOVE.push(PluginParameters.length - 4);
                    }
                }
                break;
            case 3:
                break;   
            default:
                Trace("Error In ParameterChanged()" + param);
        }
    }
}

function Idle() {
    if (PARAMS_TO_ADD.length > 0) {
        for (var i = 0; i < PARAMS_TO_ADD.length; i++) {
            PluginParameters.push(PARAMS_TO_ADD[i]);
        }
        PARAMS_TO_ADD = [];
        UpdatePluginParameters();
    }
    if (PARAMS_TO_REMOVE.length > 0) {
        var removeCanceled = false;
        for (var i = 0; i < PARAMS_TO_REMOVE.length; i++) {
            var paramIndex = PARAMS_TO_REMOVE[i];
            if (GROUP_NUMBER === 1) {
                PARAMS_TO_REMOVE = [];
                removeCanceled = true;
                Trace("Remove Group failed: There must be at least one group.");
                break;
            }
            var removedItem = PluginParameters.splice(paramIndex, 1);
        }
        if (!removeCanceled) {
            GROUP_NUMBER--;
        }
        PARAMS_TO_REMOVE = [];
        UpdatePluginParameters();
    }
}

ResetParameterDefaults = false;

var PluginParameters = [{
    name: "🕹️ ENOISH",
    type: "text"
}, {
    name: "Global Controls",
    type: "text"
}, {
    name: "Number of Groups",
    type: "linear",
    defaultValue: NUMBER_OF_TRANSPOSERS,
    minValue: 1,
    maxValue: 8,
    numberOfSteps: 7,
    disableAutomation: true
}, {
    name: "Probability Send",
    type: "linear",
    defaultValue: 50,
    minValue: 0,
    maxValue: 100,
    numberOfSteps: 100
}];

for (var i = 0; i < NUMBER_OF_TRANSPOSERS; i++) {
    PluginParameters.push({
        name: "Group " + (i + 1),
        type: "text"
    }, {
        name: "Note " + (i + 1),
        type: "menu",
        defaultValue: 60,
        minValue: 0,
        maxValue: 127,
        numberOfSteps: 128,
        valueStrings: MIDI._noteNames
    }, {
        name: "Transpose " + (i + 1),
        type: 'lin',
        minValue: -24,
        maxValue: 24,
        numberOfSteps: 48,
        defaultValue: 0
    }, {
        name: "Probability " + (i + 1),
        type: 'lin',
        minValue: 0,
        maxValue: 100,
        numberOfSteps: 100,
        defaultValue: 50
    });
}
