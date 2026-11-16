import React, {useEffect} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { InstagramEmbed, YouTubeEmbed } from 'react-social-media-embed';
import api, { errorMessage } from '../api';
import { useUser } from '../UserContext';
import { imageSrc } from '../util';

/*
    shows the social media link of a news post.
    instagram and youtube links are embedded, and anything else is shown as a normal link.
*/
function SocialLink({ link })
{
    let host = '';
    try
    {
        let url = new URL(link);
        // only web links are shown, since anything else could be unsafe to click
        if(url.protocol === 'http:' || url.protocol === 'https:')
        {
            host = url.hostname.replace(/^www\./, '');
        }
    }
    catch(error)
    {
        // not a valid link, so there is nothing to show
    }

    if(host === '')
    {
        return <></>;
    }
    if(host === 'instagram.com')
    {
        return <InstagramEmbed url={link} width={328}/>;
    }
    if(host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtu.be')
    {
        return <YouTubeEmbed url={link} width={328} height={220}/>;
    }
    return <p><a href={link} target="_blank" rel="noopener noreferrer">{link}</a></p>;
}

function ViewNewsPost() {
    const [newsPost,setNewsPost] = React.useState();
    const [isLoading, setIsLoading] = React.useState(true);
    const { isAdmin } = useUser();

    // the ID of the news post comes from the URL, so the page can be linked to directly
    const { id: newsID } = useParams();
    const navigate = useNavigate();

    useEffect(() => {

        // get the information for the news post from its ID
        api.get("/news/" + newsID)
        .then((response) => {
            setNewsPost(response.data);
            setIsLoading(false);
        })
        .catch((error) => {
            console.log('error in news GET request');
            console.log(error);
            setIsLoading(false);
        });

    }, [newsID]);

    const toEditPage = (postID) => {
        navigate('/EditNewsPost/' + postID);
    }

    const handleDelete = (postID) => {
        let confirmDelete = window.confirm("Are you sure you want to delete this news entry? This cannot be undone.");
        if(confirmDelete){
            api.delete(`/news/${postID}`)
            .then(() => {
                navigate('/Home');
            })
            .catch((error) => {
                console.log(error);
                window.alert(errorMessage(error, 'Could not delete the news post.'));
            });
        }
    }

    if(isLoading)
    {
        return (
            <div className='d-flex justify-content-center align-items-center'>
                <h1>Loading...</h1>
            </div>
        );
    }

    if(!newsPost)
    {
        return (
            <div className='d-flex justify-content-center align-items-center'>
                <h1>News post not found</h1>
            </div>
        );
    }

    return (
    <div className='d-flex justify-content-center align-items-center'>

        <div className='row'>
            <div className='col-lg-11'>
                {/* buttons for editing or deleting an entry.
                    only appear to logged-in admins */}
                {isAdmin ?
                <>
                    <button className="btn" style={{backgroundColor:'#84B9F9'}} onClick={()=>{toEditPage(newsPost._id)}}> Edit </button>
                <span> </span>
                    <button className="btn" style={{backgroundColor:'#84B9F9'}} onClick={()=>{handleDelete(newsPost._id)}}> Delete </button>
                </>
                :
                <></>
                }
                {/* layout for the news post itself. */}
                <p><span style={{fontWeight: 700}}>{newsPost.title} </span></p>
                <p style={{whiteSpace:'pre-wrap'}}>{newsPost.description}</p>
                {newsPost.link ?
                        <div>
                        <SocialLink link={newsPost.link}/>
                        </div>
                    :
                        <></>
                }

            </div>
            {/* check to see if there are images included with this news post. if so, display them. */
            newsPost.images && newsPost.images.map ?
                <div>
                {newsPost.images.map((image) => (
                    <span key={image._id}>
                        <img alt={image.name || newsPost.title} src={imageSrc(image)} style={{height:200, maxWidth:'100%'}}/>
                    </span>
                ))}
                </div>
            :
                <></>
            }
        </div>

    </div>
);
}

export default ViewNewsPost;
