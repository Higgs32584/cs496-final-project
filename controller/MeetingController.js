let dao = require('../model/MeetingDAO');
const auth = require('../util/Auth');
const imageUtil = require('../util/ImageUtil');
/*
setting the DAO, for testing purposes
*/
exports.setDAO = function(otherDAO)
{
    dao = otherDAO;
}

/*
POST request
save a new meeting to the DAO
*/
exports.saveMeeting = async function(request, response)
{
    // assumes the request body gives all variable values individually
    /*
        here is how the controller handles the image file. note that the
        request now has a new attribute, 'request.file.' you can `console.log`
        the `request.file` to see all of the fields. the important one is
        `request.file.buffer,` which contains the actual data for the image.
        
        note that trying to console log `request.file.buffer` will print out
        a Looooooooong string of Hex digits.
        
        check the MeetingDAO.js to see how mongoose works with this to store it
        on the database
    */
    if(auth.isAdmin(request))
    {
        let newMeeting =
        {
            date: request.body.date,
            speaker: request.body.speaker,
            topic: request.body.topic,
            location: request.body.location,
            content: request.body.content,
            // setting up empty fields for feedback
            feedback: {
                avgRatings:0,
                numRatings:0,
                reviews:[]}
        };
        
        if(request.file)
        {
            newMeeting.img = imageUtil.toMeetingImage(request.file);
        }

        let savedMeeting = await dao.create(newMeeting);
        
        response.status(200);
        response.send(savedMeeting);
    }
    else
    {
        response.status(401);
        response.send(null);
    }
}

/*
GET request
read all meetings currently saved in the database

get requests do not change with images, thankfully.
*/
exports.readAllMeetings = async function(request, response)
{
    let allMeetings = await dao.readAll();
    response.status(200);
    response.send(allMeetings);

}

/*
GET request
read all meetings that occured in the past
*/
exports.readPastMeetings = async function(request, response)
{
    let pastMeetings = await dao.getPastMeetings();
    response.status(200);
    response.send(pastMeetings);
}

/*
GET request
read all meetings that will occur in the future
*/
exports.readFutureMeetings = async function(request, response)
{
    let futureMeetings = await dao.getUpcomingMeetings();
    response.status(200);
    response.send(futureMeetings);
}

/*
GET request
get a particular meeting by its ID
*/
exports.readMeetingByID = async function(request, response)
{
    let meeting = await dao.readByID(request.params.id);
    // if the DAO finds the meeting
    if(meeting !== null)
    {
        response.status(200);
        response.send(meeting);
    }
    else
    {
        response.status(404);
        response.send(null);
    }
}

/*
POST request
update the information for a meeting
Make sure only Admins can perform this action
*/
exports.updateMeeting = async function(request, response)
{
    if(auth.isAdmin(request))
    {
        let updatedMeeting = {
            _id: request.body._id,
            date: request.body.date,
            speaker: request.body.speaker,
            topic: request.body.topic,
            location: request.body.location,
            content: request.body.content
        };

        // only replace the image if a new one was uploaded
        if(request.file)
        {
            updatedMeeting.img = imageUtil.toMeetingImage(request.file);
        }

        let returnedMeeting = await dao.updateMeeting(updatedMeeting);
        
        if(returnedMeeting !== null)
        {
            response.status(202);
            response.send(returnedMeeting);
        }
        else
        {
            response.status(404);
            response.send(null);
        }
    }
    else{
        response.status(401);
        response.send(null);
    }
}

/*
DELETE request
delete a meeting by its ID
*/

exports.deleteMeeting = async function(request, response) {
    const meetingID = request.params.id;

    if(auth.isAdmin(request))
    {
        try {
            // Find the meeting by its ID and delete it
            await dao.deleteMeeting(meetingID);
            
            response.status(204);
            response.send(`Meeting with id ${meetingID} has been deleted.`);
        } catch (error) {
            response.status(500);
            response.send({ error: error.message });
        }
    }
    else{
        response.status(401);
        response.send(null);
    }
}

/*
POST request
add a rating to a meeting
assumes the rating is on a 1-5 scale and checks if there is a review as well
*/

/*
POST request
performs a search query on data through text search of the indexed fields
*/
exports.searchForMeetings = async function(request, response){
    let meetingSearch = request.body.search;

    // the search must be plain text
    if(typeof meetingSearch !== 'string' || meetingSearch.trim() === '')
    {
        response.status(404);
        response.send(null);
        return;
    }

    let returnedMeetings = await dao.searchMeetings(meetingSearch);
    
    if(returnedMeetings && returnedMeetings.length > 0)
    {
        response.status(200);
        response.send(returnedMeetings);
    }
    else{
        response.status(404);
        response.send(null);
    }
}