
const mongoose= require("mongoose");
const Schema = mongoose.Schema;

const ParticipantsStartSchema = new Schema({
    name: String,
    participantNumber: String,
});

module.exports = mongoose.model("ParticipantsStart", ParticipantsStartSchema);