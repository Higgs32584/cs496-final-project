/*
helpers for turning files from multer into the image objects stored by the DAOs
*/

const DEFAULT_TYPE = 'image/jpeg';

// image object for the Meeting schema
exports.toMeetingImage = function(file){
    return {
        data: file.buffer,
        title: file.originalname,
        contentType: file.mimetype || DEFAULT_TYPE
    };
}

// array of image objects for the NewsPost schema
exports.toNewsImages = function(files){
    let images = [];
    if(Array.isArray(files))
    {
        for(let i = 0; i < files.length; i++)
        {
            images.push({
                name: files[i].originalname,
                data: files[i].buffer,
                contentType: files[i].mimetype || DEFAULT_TYPE
            });
        }
    }
    return images;
}
