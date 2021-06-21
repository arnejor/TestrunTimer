// This is the model shcema for the participant. It includes
// the rocordet time*, participant number and comments.

const mongoose= require("mongoose");
const Schema = mongoose.Schema;

const ParticipantSchema = new Schema({
    name: String,
    time: String,
    participantNumber: String,
    comment: String
});

module.exports = mongoose.model("Participant", ParticipantSchema);