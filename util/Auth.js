/*
helpers for checking who is making a request, based on the session
*/

// returns the logged-in user, or null if nobody is logged in
exports.getUser = function(request){
    if(request.session && request.session.user)
    {
        return request.session.user;
    }
    return null;
}

exports.isAdmin = function(request){
    let user = exports.getUser(request);
    return user !== null && user.admin === 1;
}
