let dao = require('../model/SpeakerDAO');
const auth = require('../util/Auth');
/*
setting the DAO, for testing purposes
*/
exports.setDAO = function(otherDAO)
{
    dao = otherDAO;
}


/*
GET request
read all speakers currently saved in the database
*/
exports.readAllSpeakers = async function(request, response)
{
    let allSpeakers = await dao.readAll();
    response.status(200);
    response.send(allSpeakers);

}

/*
POST request
save a new speaker to the DAO
Make sure only Admins can perform this action
*/
exports.saveSpeaker = async function(request, response)
{
    if(!auth.isAdmin(request))
    {
        response.status(401);
        response.send(null);
        return;
    }

    // assumes the request body gives all variable values individually
    let newSpeaker =
    {
        name: request.body.name,
        phone: request.body.phone,
        email: request.body.email,
        mailing_address: request.body.mailing_address,
        specialty: request.body.specialty
    };

    let savedSpeaker = await dao.create(newSpeaker);

    // the DAO returns null if there is already a speaker with the same email
    if(savedSpeaker === null)
    {
        response.status(409);
        response.send({msg: 'Speaker with that email already exists'});
        return;
    }

    response.status(200);
    response.send(savedSpeaker);
}

/*
POST request
update the information for a speaker
Make sure only Admins can perform this action
*/
exports.updateSpeaker = async function(request, response)
{
    if(!auth.isAdmin(request))
    {
        response.status(401);
        response.send(null);
        return;
    }

    let updatedSpeaker =
    {
        _id: request.body._id,
        name: request.body.name,
        phone: request.body.phone,
        email: request.body.email,
        mailing_address: request.body.mailing_address,
        specialty: request.body.specialty
    };
    let returnedSpeaker = await dao.updateSpeaker(updatedSpeaker);

    if(returnedSpeaker !== null)
    {
        response.status(202);
        response.send(returnedSpeaker);
    }
    else
    {
        response.status(404);
        response.send(null);
    }
}

/*
GET request
get a particular speaker by its ID
*/
exports.readSpeakerByID = async function(request, response)
{
    let speaker = await dao.readByID(request.params.id);
    // if the DAO finds the speaker
    if(speaker !== null)
    {
        response.status(200);
        response.send(speaker);
    }
    else
    {
        response.status(404);
        response.send(null);
    }
}

/*
DELETE request
delete a speaker by its ID
Make sure only Admins can perform this action
*/
exports.deleteSpeaker = async function(request, response)
{
    if(!auth.isAdmin(request))
    {
        response.status(401);
        response.send(null);
        return;
    }

    let deletedSpeaker = await dao.deleteSpeakerByID(request.params.id);
    if(deletedSpeaker !== null)
    {
        response.status(202);
        response.send(deletedSpeaker);
    }
    else
    {
        response.status(404);
        response.send(null);
    }
}
