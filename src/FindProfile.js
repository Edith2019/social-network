import React, { useState, useEffect } from "react";
import axios from "./axios";

export default function FindProfile() {

    const [users, setUsers] = useState([]);
    const [usersearch, setUserSearch] = useState();
    const [error, setError] = useState(false);

    useEffect(() => {
        axios.get("/users.json").then(
            data => {
                if (data.data) {
                    setUsers(data.data);
                } else {
                    useState({
                        error: true
                    });
                }
            });
    }, []);

    useEffect(() => {
        if (usersearch === undefined) return;
        let ignore = false;
        axios.get(`/findprofile/${usersearch || "d9r3"}`).then(data => {
            if (data.data.length == 0) {
                setUsers(users);
            } else if (!ignore && data.data) {
                setUsers(data.data);
            } else if (!data.data && !ignore) {
                setError(true);
            }
        });
        return () => {
            ignore = true;
        };
    }, [usersearch]);
    const handleUserSearchChange = (e) => {
        setUserSearch(e.target.value);
    };

    return (
        <React.Fragment>
            <div className="FindProfile">
                <input type="text"
                    className="userSearch"
                    name="userSearch"
                    placeholder="enter a name"
                    onChange={handleUserSearchChange} />
                <div className="allusers">
                    {users && users.map((user) => {
                        return <div className="searchUsersList" key={user.id} >
                            <a href={`https://swork-berlin.herokuapp.com/user/${user.id}`}>
                                <img src={user.url_profile} width="100px" height="100px"></img>
                                <h2 className="nameUserSearch"> {user.first} {user.last} </h2>
                            </a>
                        </div>;
                    })}
                </div>
            </div>
        </React.Fragment >
    );
}

