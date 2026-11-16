import React, { useState, useEffect } from 'react';

// the server accepts at most this many images for one news post
const MAX_IMAGES = 10;

/*
    file input for several images, with previews.
    images can be added a few at a time, and removed again before submitting.
    props:
        imagesChange - function that accepts the array of all chosen image files.
                it is called every time an image is added or removed, so you can
                pass a `setImages` hook to it (see CreateNewsPost.js for an example).
*/
function MultiImageUpload(props){
    // each entry is {file, url}, where the url is for the preview
    const [images, setImages] = useState([]);

    const updateImages = (newImages) => {
        setImages(newImages);
        // this is meant to update the value on the page that calls this component
        props.imagesChange(newImages.map(image => image.file));
    };

    /* function to add the chosen files */
    const onImageChange = (event) => {
        if(event.target.files && event.target.files.length > 0)
        {
            let added = Array.from(event.target.files).map(file => (
                {file: file, url: URL.createObjectURL(file)}
            ));
            let newImages = [...images, ...added];
            if(newImages.length > MAX_IMAGES)
            {
                window.alert(`A news post can have at most ${MAX_IMAGES} images.`);
                newImages.slice(MAX_IMAGES).forEach(image => URL.revokeObjectURL(image.url));
                newImages = newImages.slice(0, MAX_IMAGES);
            }
            updateImages(newImages);

            // clear the input, so the same file can be chosen again after removing it
            event.target.value = '';
        }
    };

    /* function to remove an image */
    const removeImage = (index) => {
        URL.revokeObjectURL(images[index].url);
        updateImages(images.filter((image, i) => i !== index));
    };

    /* preview URLs hold on to the files in memory until they are released */
    useEffect(() => {
        return () => {
            images.forEach(image => URL.revokeObjectURL(image.url));
        };
        // only when the component goes away
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    return(
        <div>
            {/* `accept` limits the file picker to images. the server rejects anything else. */}
            <input type='file' className='form-control' accept='image/*' multiple onChange={onImageChange} />
            <br/>
            {/* this is for the preview. not necessary in the uploading process, but still
                a good feature to have. */}
            {images.length > 0 ?
                <div className='row'>
                {images.map((image, index) => {
                        return <div className='col-auto text-center' key={image.url}>
                            <img alt={image.file.name} style={{height:100}} src={image.url} />
                            <br/>
                            <button type='button' className='btn btn-sm btn-link' onClick={() => removeImage(index)}>Remove</button>
                        </div>
                    })
                }
                </div>
            :
                <p>No images chosen</p>
            }


        </div>
    );
}

export default MultiImageUpload;
