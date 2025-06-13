import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function EditUser() {
    const { uid, cid } = useParams();
    const navigate = useNavigate();
    const [Users, setUsers] = useState({});

    const handleInput = (e) => {
        const { id, value } = e.target;
        setUsers({ ...Users, [id]: value });
    };

    const handleBack = () => {
        navigate(`/Users/${cid}`);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/login/user/${uid}`, Users);
            alert("User updated successfully");
            navigate(`/Users/${cid}`);
        } catch (err) {
            console.error(err);
            alert("Failed to edit user");
        }
    };

    const getUser = async () => {
        try {
            const res = await axios.get(`/login/user/${uid}`);
            setUsers(res.data);
        } catch (err) {
            console.error(err);
            alert("Failed to load user data");
        }
    };

    useEffect(() => {
        getUser();
    }, []);

    return (
        <div className="user-creation-container">
            <h3>Edit User</h3>
            <form className="user-creation-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="username">Username:</label>
                    <input
                        type="text"
                        id="username"
                        value={Users.username || ""}
                        onChange={handleInput}
                        className="form-control"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={Users.email || ""}
                        onChange={handleInput}
                        className="form-control"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={Users.password || ""}
                        onChange={handleInput}
                        className="form-control"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="role">Role:</label>
                    <select
                        id="role"
                        value={Users.role || ""}
                        onChange={handleInput}
                        className="form-control"
                        required
                    >
                        <option value="">Select</option>
                        <option value="recruiter">Recruiter</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div className="form-button">
                    <button type="button" className="cancel-but" onClick={handleBack}>
                        Cancel
                    </button>
                    <button type="submit" className="submit-button">
                        Update
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditUser;
