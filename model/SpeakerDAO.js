const mongoose = require('mongoose');

const speakerSchema = new mongoose.Schema(
    {
        name: String,
        phone: String,
        email: String,
        mailing_address: String,
        specialty: String
    });

const speakerModel = mongoose.model('Speaker', speakerSchema);

exports.create = async function(newSpeaker) {
    // search for potential duplicates first
    let dupeEmail = await speakerModel.find({ email: newSpeaker.email }).lean();
    // if we find a user who already has the same email, return null
    if (dupeEmail.length > 0) {
        return null;
    } else { // if there are no duplicates, create the user in the DB
        const mongoUser = new speakerModel(newSpeaker);
        await mongoUser.save();
        let dbUser = await speakerModel.findById(mongoUser._id).lean();
        //console.log(dbUser);
        return dbUser;
    }
}

exports.readAll = async function() {
    let speakers = await speakerModel.find({}).lean();
    return speakers;
}

exports.deleteAll = async function() {
    await speakerModel.deleteMany();
}

exports.updateSpeaker = async function(speakerData) {
    // without a valid ID, the filter would be empty and match the first speaker in the collection
    if(!speakerData._id || !mongoose.isValidObjectId(speakerData._id))
    {
        return null;
    }
    // find the speaker by its ID
    let editedSpeaker = await speakerModel.findOneAndUpdate({_id: speakerData._id}, speakerData, {returnOriginal: false}).lean();
    return editedSpeaker;
}

exports.readByID = async function(id) {
    if(!mongoose.isValidObjectId(id))
    {
        return null;
    }
    let speaker = await speakerModel.findById(id).lean();
    return speaker;
}

exports.deleteSpeakerByID = async function(id) {
    if(!mongoose.isValidObjectId(id))
    {
        return null;
    }
    let deletedSpeaker = await speakerModel.findByIdAndDelete(id).lean();
    return deletedSpeaker;
}