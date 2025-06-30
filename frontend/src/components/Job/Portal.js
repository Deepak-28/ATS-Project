import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import Navbar from "../admin/Navbar";
import { FaEdit } from "react-icons/fa";
import { MdOutlineLibraryAdd, MdDeleteForever } from "react-icons/md";
import axios from "axios";

function Portal() {
  const [popup, setPopup] = useState(false);
  const [Name, setName] = useState("");
  const [maskId, setMaskId] = useState("");
  const [portal, setPortal] = useState([]);
  const [BgImage, setBgImage] = useState({});
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // console.log(BgImage);

  const getPortal = async () => {
    try {
      const res = await axios.get("/portal");
      // console.log(res.data);
      setPortal(res.data);
    } catch (err) {
      console.error("failed to get portal", err);
    }
  };
  const handleSubmit = () => {
    if (!Name || !maskId) {
      alert("Please fill all fields.");
      return;
    }

    const formData = new FormData();
    formData.append("Name", Name);
    formData.append("maskId", maskId);
    if (BgImage) formData.append("image", BgImage); // optional in edit

    const request = isEditing
      ? axios.put(`/portal/${editId}`, formData)
      : axios.post("/portal", formData);

    request
      .then(() => {
        toast.success(
          `Portal ${isEditing ? "updated" : "created"} successfully!`
        );
        getPortal();
      })
      .catch((err) => {
        console.error(err);
        toast.error(`Failed to ${isEditing ? "update" : "create"} portal.`);
      });

    setPopup(false);
    setName("");
    setMaskId("");
    setBgImage(null);
    setIsEditing(false);
    setEditId(null);
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) {
      alert("No file selected.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      alert("File size is too large.");
      return;
    }
    setBgImage(file);
  };

  useEffect(() => {
    getPortal();
  }, []);
  return (
    <div className="container">
      <Navbar />
      <div className="admin-container">
        <nav className="df h10 al jcsb">
          <h2 className="logo ml10">Portal</h2>
          <div className="c-btn">
            <Link onClick={() => setPopup(true)}>
              <MdOutlineLibraryAdd size={24} className="g mr10" />
            </Link>
          </div>
        </nav>
        <div className="data-table">
          <table className="job-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Name</th>
                <th>Mask Id</th>
                <th>URL</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {portal.length > 0 ? (
                portal.map((portal, index) => (
                  <tr key={portal.id}>
                    <td>{index + 1}</td>
                    <td>{portal.Name}</td>
                    <td>{portal.maskId}</td>
                    <td>
                      <a
                        href={`http://localhost:3000/careers/${portal.maskId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#007bff",
                          textDecoration: "underline",
                        }}
                      >
                        {`http://localhost:3000/careers/${portal.maskId}`}
                      </a>
                    </td>
                    <td className="df jcsa f14  w100" data-no-nav>
                      <Link
                        onClick={() => {
                          setIsEditing(true);
                          setEditId(portal.id);
                          setName(portal.Name);
                          setMaskId(portal.maskId);
                          setBgImage(null);
                          setPopup(true);
                        }}
                      >
                        <FaEdit />
                      </Link>

                      <MdDeleteForever className="applied-link" color="red" />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No portal found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {popup && (
        <div className="test df al jc">
          <div className="pop-box df jcsb al fdc">
            <div className="w90 df fdc g10 mt20">
              <h3>Portal</h3>
              <label className="input">
                Name
                <input
                  type="text"
                  value={Name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label className="input">
                Mask Id
                <input
                  type="text"
                  value={maskId}
                  onChange={(e) => setMaskId(e.target.value)}
                />
              </label>
              <label className="input">
                BackGround Image
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={handleFile}
                />
              </label>
            </div>
            <div className="box-border w100 df jce al g10 ">
              <button
                type="button"
                className="gray s-btn mr10"
                onClick={() => setPopup(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="b s-btn mr10"
                onClick={handleSubmit}
              >
                {isEditing ? "Update" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Portal;
