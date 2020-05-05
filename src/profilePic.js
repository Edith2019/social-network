import React from 'react';

export default function ProfilePic({ first, last, url }) {
    // console.log("props in pres", first, last, url);
    url = url || "/profileimg.png";
    return (
        <React.Fragment>
            <div className="overviewPro">
                <img name="profilePic" src={url} alt={`${first} ${last}`} width="200px" height="200px" />
                <h2 className="name-profile">{first} -  {last}</h2>
            </div>
        </React.Fragment >
    );
}