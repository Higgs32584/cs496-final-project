import React, { useState, useEffect } from 'react';

/*
    file input for a single image, with a preview.
    props:
        imageChange - function that accepts the image file.
                if using this component on another and you want
                to set the state of the other page to the image,
                you can pass the `setImage` hook or its equivalent
                as a prop to this component (see CreateMeeting.js
                for an example).
*/
function ImageUpload(props){
    /* no preview until an image is chosen */
    const [imagePreview, setImagePreview] = useState();


    /* function to set the file upon changing on the page */
    const onImageChange = (event) => {
        if(event.target.files && event.target.files[0])
        {
            setImagePreview(URL.createObjectURL(event.target.files[0]));

            // this is meant to update the value on the page that calls this component
            props.imageChange(event.target.files[0]);
        }
    };

    /* preview URLs hold on to the file in memory until they are released */
    useEffect(() => {
        return () => {
            if(imagePreview)
            {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);


    return (
        <div>
            {/* `accept` limits the file picker to images. the server rejects anything else. */}
            <input type='file' className='form-control' accept='image/*' onChange={onImageChange} />

            {/* this is for the preview. not necessary in the uploading process, but still
                a good feature to have. */}
            {imagePreview ?
                <img alt='preview of the upload' style={{maxHeight:400, maxWidth:'100%'}} src={imagePreview}/>
            :
                <></>
            }

        </div>
    );

}

export default ImageUpload
