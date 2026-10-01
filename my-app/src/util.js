/*
    small helpers shared by the pages
*/

/*
    the `src` for an image stored in the database.
    the server sends the image data as base64 text, and the incantation
    `data:<type>;base64,<data>` is how that text is displayed as an image.
    returns null if there is no image to show.
*/
export function imageSrc(image)
{
    if(!image || !image.data)
    {
        return null;
    }
    return `data:${image.contentType || 'image/jpeg'};base64,${image.data}`;
}

function twoDigits(number)
{
    return String(number).padStart(2, '0');
}

/* the value an <input type="date"> needs (yyyy-mm-dd), in local time */
export function toDateInput(dateValue)
{
    let date = new Date(dateValue);
    if(isNaN(date))
    {
        return '';
    }
    return `${date.getFullYear()}-${twoDigits(date.getMonth() + 1)}-${twoDigits(date.getDate())}`;
}

/* the value an <input type="time"> needs (hh:mm), in local time */
export function toTimeInput(dateValue)
{
    let date = new Date(dateValue);
    if(isNaN(date))
    {
        return '';
    }
    return `${twoDigits(date.getHours())}:${twoDigits(date.getMinutes())}`;
}

/* combines the values of a date input and a time input into one Date, in local time */
export function combineDateTime(date, time)
{
    return new Date(`${date}T${time}`);
}
