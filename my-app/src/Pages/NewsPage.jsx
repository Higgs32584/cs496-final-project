import React, {useEffect} from 'react';
import {useNavigate } from 'react-router-dom';
import api, { errorMessage } from '../api';
import { useUser } from '../UserContext';
import { imageSrc } from '../util';

function NewsPage()
{
    const navigate = useNavigate();
    const [news,setNews] = React.useState([]);
    const { isAdmin } = useUser();



    useEffect(() => {

        api.get("/getnews")
        .then((response) => {
            setNews(response.data);
        })
        .catch((error) => {
            console.log('error in news GET request');
            console.log(error);
        });

    }, []);

    const toEditPage = (postID) => {
        navigate('/EditNewsPost/' + postID);
    }

    const toViewPage = (postID) => {
        navigate('/ViewNewsPost/' + postID);
    }

    const handleDelete = (postID) => {
        let confirmDelete = window.confirm("Are you sure you want to delete this news entry? This cannot be undone.");
        if(confirmDelete){
            api.delete(`/news/${postID}`)
            .then(() => {
                setNews(current => current.filter(newsPost => newsPost._id !== postID));
            })
            .catch((error) => {
                console.log(error);
                window.alert(errorMessage(error, 'Could not delete the news post.'));
            });
        }
    }


    return(
    <div className="d-flex justify-content-center align-items-center">
        <div className="col-12">

            {/*page header*/}
            <div style={{ backgroundColor: '#84B9F9' }}>
              <header className="mt-2 p-4 text-white text-center rounded">
                <h1 style={{ fontWeight: 700, color: '#ffffff' }}> News and Events </h1>
              </header>
            </div>

            <div className="d-flex justify-content-center align-items-center">
            {/* statement that checks for news. If it's there, display it. If not, show that there is no news */}
            {news && news.map && (news.length > 0) ? // the 'if' condition. if 'news' and 'news.map' are not null,...
                <ul>
                {news.map((newsPost) => (
                    <li className="page_li" key={newsPost._id}>
                        <div className='row'>
                            <div className='col-lg-11'>
                                {/* buttons for editing or deleting a news post. only appear to logged-in admins */}
                                {isAdmin ?
                                <>
                                    <button className="btn" style={{backgroundColor:'#84B9F9'}} onClick={()=>{toEditPage(newsPost._id)}}> Edit </button>
                                <span> </span>
                                    <button className="btn" style={{backgroundColor:'#84B9F9'}} onClick={()=>{handleDelete(newsPost._id)}}> Delete </button>
                                <span> </span>
                                </>
                                :
                                <></>
                                }
                                <button className="btn" style={{backgroundColor:'#84B9F9'}} onClick={()=>{toViewPage(newsPost._id)}}> View </button>
                                {/* layout for the news post itself. */}
                                <p><span style={{fontWeight: 700}}>{newsPost.title} </span></p>
                                <p>{newsPost.description}</p>

                            </div>
                            {/* check to see if there are images included with this news post. if so, display them. */
                            newsPost.images && newsPost.images.map ?
                                <div>
                                {newsPost.images.map((image) => (
                                    <span key={image._id}>
                                        <img alt={image.name || newsPost.title} src={imageSrc(image)} style={{height:150, maxWidth:'100%'}}/>
                                    </span>
                                ))}
                                </div>
                            :
                                <></>
                            }
                        </div>
                    </li>
                ))}
                </ul>
                :
                <h1>No News Found</h1>
            }
            </div>

        </div>
    </div>
);
}
export default NewsPage;
