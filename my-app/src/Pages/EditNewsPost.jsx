import React, {useEffect, useState} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { errorMessage } from '../api';
import MultiImageUpload from '../Components/MultiImageUpload';
import { imageSrc } from '../util';

function EditNewsPost(){
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [link, setLink] = useState('');
    // the images the post already has. only for display.
    const [currentImages, setCurrentImages] = useState([]);
    // new images chosen on this page. if there are any, they replace the current ones.
    const [newImages, setNewImages] = useState([]);
    const [notFound, setNotFound] = useState(false);

    // the ID of the news post comes from the URL
    const { id: postID } = useParams();
    const navigate = useNavigate();

    /*
        set default values to what is retrieved from the GET request
    */
    useEffect(() => {

        api.get("/news/" + postID)
        .then((response) => {
            setTitle(response.data.title || '');
            setDescription(response.data.description || '');
            setLink(response.data.link || '');
            if(response.data.images)
            {
                setCurrentImages(response.data.images);
            }
        })
        .catch((error) => {
            console.log('error in news GET request');
            console.log(error);
            setNotFound(true);
        });

    }, [postID]);


    const handleSubmit = async (e) =>{
        e.preventDefault();

        // the date is left out, so the post keeps the date it was created
        let updatedPost = new FormData();
        updatedPost.append('_id', postID);
        updatedPost.append('title', title);
        updatedPost.append('description', description);
        // always sent, even when empty, so that the link can be removed
        updatedPost.append('link', link);
        for(let i = 0; i < newImages.length; i++){
            updatedPost.append('newsImages', newImages[i]);
        }

        // send the news post to the backend
        api.post('/updatenewspost', updatedPost)
        .then((response) =>
        {
            // redirect to the page for this news post
            navigate('/ViewNewsPost/' + postID);
        })
        .catch((error) =>
        {
            console.log(error);
            window.alert(errorMessage(error, 'Could not update the news post.'));
        });
    }

    if(notFound)
    {
        return (
            <div className="d-flex justify-content-center align-items-center">
                <h1>News post not found</h1>
            </div>
        );
    }

    return (
    <div className="d-flex justify-content-center align-items-center">
      <div className="col-12 col-lg-8">
        {/*page header*/}
        <div style={{ backgroundColor: '#84B9F9' }}>
          <header className="mt-2 p-4 text-white text-center rounded">
            <h1 style={{ fontWeight: 700, color: '#ffffff' }}> Editing News Post </h1>
          </header>
        </div>

        <form encType="multipart/form-data" onSubmit={handleSubmit}>

          {/*field for setting the title*/}
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input type="text" className="form-control" id="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          {/*field for setting the social media link*/}
          <div className="form-group">
            <label htmlFor="link">Social Media Link</label>
            <input type="url" className="form-control" id="link" placeholder="https://" value={link} onChange={(e) => setLink(e.target.value)} />
          </div>
          {/*field for setting the description*/}
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea className="form-control" id="description" required value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          {/*the images the post has right now*/}
          {currentImages.length > 0 ?
            <div className="form-group">
              <label>Current images</label>
              <div className='row'>
              {currentImages.map((image) => (
                <div className='col-auto' key={image._id}>
                  <img alt={image.name} style={{height:100}} src={imageSrc(image)} />
                </div>
              ))}
              </div>
            </div>
          :
            <></>
          }

          {/*field for sending new images*/}
          <div className ="form-group">
            <label>
              {currentImages.length > 0 ?
                'Replace images (optional). Choosing any images here removes all of the current ones.'
              :
                'Add images (optional)'
              }
            </label>
            <MultiImageUpload imagesChange={setNewImages}/>
          </div>

          <button type="submit" className="btn btn-primary">Submit</button>

        </form>
      </div>
    </div>
  );
}

export default EditNewsPost;
