// This is the model shcema for the event. It includes
// reference to participants and name.

const mongoose= require("mongoose");
const Schema = mongoose.Schema;
const Participant = require("./participant");

const EventSchema = new Schema({
    name: String,
    participants: [{ type: Schema.Types.ObjectId, ref: "Participant"}],
    comment: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    start: {
        type: Schema.Types.ObjectId,
        ref: "Start"
    },
    date: Date
});

module.exports = mongoose.model("Event", EventSchema); 