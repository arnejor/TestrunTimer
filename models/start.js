

const mongoose= require("mongoose");
const ParticipantSchema = require("./participantsStart");
const Schema = mongoose.Schema;

const StartSchema = new Schema({
    name: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    participantsStart: [{ type: Schema.Types.ObjectId, ref: "ParticipantsStart"}],

});

module.exports = mongoose.model("Start", StartSchema);