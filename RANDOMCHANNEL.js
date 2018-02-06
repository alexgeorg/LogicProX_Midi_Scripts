//--------------------------------------------------------------------------------------------------------------------------------------
// RANDOMCHANNEL
//--------------------------------------------------------------------------------------------------------------------------------------
/*
 * Just randomizes the MIDI Channel that the notes are send to.
 * Basic idea is to share a melody between multiple instruments.
 */
//--------------------------------------------------------------------------------------------------------------------------------------


var activeNotes = [];

function HandleMIDI(event) {
    if (event instanceof NoteOn) {
        var numChannel = GetParameter("Max Channels");
        var randomChannel = Math.floor(Math.random() * numChannel) + 1;
        var record = {
            pitch: event.pitch,
            channel: randomChannel
        };
        event.channel = randomChannel;
        activeNotes.push(record);
        event.send();
    } else if (event instanceof NoteOff) {
        for (var i in activeNotes) {
            if (activeNotes[i].pitch == event.pitch) {
                event.channel = activeNotes[i].channel;
                activeNotes.splice(i, 1);               
                event.send();
                break;
            }
        }
    }
    Trace(event);
}

var PluginParameters = [{
    name: "RANDOMCHANNEL",
    type: "text"
}, {
    name: "Max Channels",
    type: "linear",
    defaultValue: 2,
    minValue: 2,
    maxValue: 16,
    numberOfSteps: 14
}];
