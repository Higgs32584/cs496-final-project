let dao = require('../model/NewsDAO');
const auth = require('../util/Auth');
const imageUtil = require('../util/ImageUtil');
/*
    setting the DAO, for testing purposes
*/
exports.setDAO = function(otherDAO)
{
    dao = otherDAO;
}

exports.readAllNews = async function(request, response)
{
    let allNews = await dao.readAllNews();
    if(allNews) // if we found news information from the DAO, return it
    {
        response.status(200);
        response.send(allNews);
    }
    else // nothing found
    {
        response.status(404);
        response.send(null);
    }
}

exports.saveNewsPost = async function(request, response)
{
    if(auth.isAdmin(request))
    {
        // the images in the request
        let requestImages = imageUtil.toNewsImages(request.files);

        let newsPost = {
            date: request.body.date,
            title: request.body.title,
            description: request.body.description
        }

        // if a link is included in the submission, add it
        if(request.body.link){
            newsPost.link = request.body.link;
        }
        // if there are images in the submission, add them
        if(requestImages.length > 0)
        {
            newsPost.images = requestImages;
        }
        
        // save to DAO
        let savedNewsPost = await dao.create(newsPost);
        
        // conditional response based on DAO return
        if(savedNewsPost)
        {
            response.status(200);
            response.send(savedNewsPost);
        }
        else
        {
            response.status(500);
            response.send(null);
        }
    }
    else
    {
        response.status(401);
        response.send(null);
    }
}

/*
POST request
updates a news Item
protected by Session

the link is replaced by whatever is sent (an empty link removes it).
the images are only replaced if new ones are uploaded.
*/
exports.updateNewsPost = async function(request, response)
{

    // if the requester is logged in as an admin, go through with updating
    if(auth.isAdmin(request)){
        try{
            // the images in the request
            let requestImages = imageUtil.toNewsImages(request.files);

            let updatedNewsPost = {
                _id: request.body._id,
                date: request.body.date,
                title: request.body.title,
                description: request.body.description
            }

            // if a link is included in the submission, set it (even if it is empty)
            if(typeof request.body.link === 'string'){
                updatedNewsPost.link = request.body.link;
            }
            // if there are images in the submission, add them
            if(requestImages.length > 0)
            {
                updatedNewsPost.images = requestImages;
            }
            
            let returnedPost = await dao.updateNewsItem(updatedNewsPost);
            
            if(returnedPost)
            {
                response.status(204);
                response.send({msg: `news post has been updated`});
            }
            else{
                response.status(404);
                response.send(null);
            }
            

        }
        catch(error){
            console.log(error);
            response.status(500);
            response.send({error: error.message});
        }
    }
    else{
        response.status(401);
        response.send(null);
    }
}

/*
DELETE request
deletes a news Item by its ID
protected by Session
*/
exports.deleteNewsPost = async function(request, response)
{
    const postID = request.params.id;

    // if the requester is logged in as an admin, go through with deletion
    if(auth.isAdmin(request)){
        try{
            await dao.deleteNewsPost(postID);

            response.status(204);
            response.send({msg: `news post with ID:${postID} has been deleted`});
        }
        catch(error){
            response.status(500);
            response.send({error: error.message});
        }
    }
    else{
        response.status(401);
        response.send(null);
    }
}

/*
    GET request
    finds a news post by its ID
*/
exports.findNewsPostByID = async function(request, response)
{
    const postID = request.params.id;
    
    try{
        let newsPost = await dao.readByID(postID);
        
        if(newsPost)
        {
            response.status(200);
            response.send(newsPost);
        }
        else
        {
            response.status(404);
            response.send(null);
        }
    }
    catch(error){
        console.log(error);
        response.status(500);
        response.send({msg: 'an error occurred'});
    }
}