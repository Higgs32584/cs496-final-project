import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errorMessage } from '../api';
import MultiImageUpload from '../Components/MultiImageUpload';

function CreateNewsPost() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [link, setLink] = useState('');
    const [images, setImages] = useState([]);

    let navigate = useNavigate();

    const handleSubmit = async (e) => {
        // stop the page from reloading
        e.preventDefault();

        // must be a FormData object for the images to be sent along
        let newPost = new FormData();
        newPost.append('date', Date.now());
        newPost.append('title', title);
        newPost.append('description', description);
        /* it is SUPER important that the first parameter (in this case, 'newsImages'),
           is the exact same here as it is on the backend for this request. */
        for(let i = 0; i < images.length; i++){
            newPost.append('newsImages', images[i]);
        }
        if(link !== ''){
            newPost.append('link', link);
        }

        // send the news post to the backend
        api.post('/savenewspost', newPost)
        .then((response) =>
        {
            // redirect to the home page, which shows the news
            let path = '/';
            navigate(path);
        })
        .catch((error) =>
        {
            console.log(error);
            window.alert(errorMessage(error, 'Could not save the news post.'));
        });
    }

    return (
    <div className="d-flex justify-content-center align-items-center">
      <div className="col-12 col-lg-8">
        {/*page header*/}
        <div style={{ backgroundColor: '#84B9F9' }}>
          <header className="mt-2 p-4 text-white text-center rounded">
            <h1 style={{ fontWeight: 700, color: '#ffffff' }}> Creating News Post </h1>
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

          {/*field for sending images*/}
          <div className ="form-group">
            <MultiImageUpload imagesChange={setImages}/>
          </div>

          <button type="submit" className="btn btn-primary">Submit</button>

        </form>
      </div>
    </div>
  );

}

export default CreateNewsPost;
