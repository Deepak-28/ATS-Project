import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { IoLocationOutline } from "react-icons/io5";
import { MdOutlineAvTimer, MdDeleteForever } from "react-icons/md";
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaBriefcase, FaEdit } from "react-icons/fa";
import "./AdminJobDetails.css";
import Navbar from "../admin/Navbar";

const AdminJobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState({});
  const [formValues, setFormValues] = useState({});
  const [popup, setPopup] = useState(false);
  const [postDate, setPostDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [postOption, setPostOption] = useState("");
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [isPosted, setIsPosted] = useState(false);
  console.log(job.postDate);

  const fetchJobDetails = async () => {
    try {
      const res = await axios.get(`/job/${id}`);
      const jobData = res.data;
      console.log(jobData.formValues);

      // Set main job data
      setJob(jobData);

      // Set dynamic fields (if any)
      setFormValues(jobData.formValues || {});

      // Format date helper
      const formatDate = (dateStr) =>
        dateStr ? new Date(dateStr).toISOString().slice(0, 10) : "";

      // Set post-related details
      setPostDate(formatDate(jobData.postDate));
      setExpiryDate(formatDate(jobData.expiryDate));
      setPostOption(jobData.visibility || "");
      setIsPosted(!!jobData.visibility); // Convert to boolean
    } catch (err) {
      console.error("Error fetching job details:", err);
    }
  };
  const dateOnly = job.postDate?.slice(0, 10) || "N/A";
  const handleSubmit = () => {
    if (!postOption) {
      alert("Please select a post option before submitting.");
      return;
    }
    const jobVisibilityData = {
      jobId: selectedJobId,
      postDate,
      expiryDate,
      visibility: postOption,
    };
    axios
      .post(`/job/visibility/${id}`, jobVisibilityData)
      .then((res) => {
        toast.success("Job posted successfully!");
        setIsPosted(true);
        clearFunction();
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to post job.");
      });
  };
  const handleUnpost = async () => {
    try {
      await axios.put(`/job/unpost/${id}`);
      toast.success("Job unposted");
      setPostOption("");
      setPostDate("");
      setExpiryDate("");
      setIsPosted(false);
    } catch (err) {
      console.error("Error unposting job", err);
    }
  };
  const deleteJob = async (id) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await axios.delete(`/job/${id}`);
        toast.success("Job deleted successfully");
        fetchJobDetails();
      } catch (err) {
        console.error("Error deleting Job:", err);
        toast.error("Failed to delete Job");
      }
    }
  };
  const clearFunction = () => {
    setPopup(false);
    setExpiryDate("");
    setPostDate("");
    setPostOption("");
  };
  const handleback = () => {
    navigate(-1);
  };
  useEffect(() => {
    fetchJobDetails();
  }, []);

  return (
    <div className="container">
      <Navbar />
      <div className="admin-container  ">
        <div className="h8 df al jcsb ">
          <button
            className="s-btn ml10 df al jc black cursor-pointer"
            onClick={handleback}
          >
            <IoIosArrowRoundBack /> back
          </button>
          <div className=" w10 df mr10 g10">
            <button
              className="b s-btn"
              onClick={() => navigate(`/Job/${job.id}`)}
            >
              Edit
            </button>
            <button className="r s-btn " onClick={() => deleteJob(job.id)}>
              Delete
            </button>
          </div>
        </div>
        <div className="h15 job-detail df al jcsb ml10 w99 mr10 ">
          <div className="ml10">
            <h2>{job.jobTitle}</h2>
            <p>
              <span className="highlight">{job.companyName}</span>
            </p>
            <p className="details">
              <FaBriefcase /> {formValues.Experience} | <MdOutlineAvTimer />{" "}
              {job.jobType} | <IoLocationOutline /> {formValues.Location}
            </p>
          </div>
          <div className="w8 h100 df jcsa al">
            <span
              title={job.visibility ? "Unpost this job" : "Post this job"}
            ></span>
            <div className="w8  df al fdc">
              <span className="date">{dateOnly}</span>
               <button
              className={`p-btn ${job.visibility ? "gray" : "gray"}`}
              onClick={() => setPopup(true)}
            >
              {job.visibility ? "Post/Unpost" : "Post/Unpost"}
            </button>
            </div>
           
          </div>
        </div>
        <div className="job-detail h65 ml10 mt10 mr10  ">
          {Object.keys(formValues).length > 0 && (
            <div className="admin-job-section">
              {/* <h4>Dynamic Fields</h4> */}
              <div className="form-value-list">
                {Object.entries(formValues).map(([label, value]) => (
                  <div key={label} className="form-value-item">
                    <span className="form-label">
                      <strong>{label}:</strong>
                    </span>
                    <span className="form-value">
                      {value || <em>Not provided</em>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {popup && (
        <div className="test df al jc">
          <div className="box df jcsb al fdc">
            <div className="w90 df fdc mt20 g10">
              {job.visibility? <h3>Job UnPost</h3>:<h3>Job Post</h3>}

              <div className="df fdr w100 g10">
                <label className="input">
                  Post Date:
                  <input
                    type="date"
                    value={postDate}
                    onChange={(e) => setPostDate(e.target.value)}
                  />
                </label>

                <label className="input">
                  Expiry Date:
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </label>

                <label className="input">
                  Post Option:
                  <select
                    value={postOption}
                    onChange={(e) => setPostOption(e.target.value)}
                  >
                    <option value="">Select Option</option>
                    <option value="internal">Internal</option>
                    <option value="external">External</option>
                    <option value="internal-external">Internal-External</option>
                    <option value="agency">Agency</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="box-border w100 df jce ae g10 mt10 mb20">
              <button
                type="button"
                className="gray s-btn mr10"
                onClick={clearFunction}
              >
                Cancel
              </button>
              {isPosted ? (
                <>
                  {/* <span className="status-posted">Posted</span> */}
                  <button
                    type="button"
                    onClick={handleUnpost}
                    className="b s-btn mr30"
                  >
                    Unpost
                  </button>
                </>
              ) : (
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="b s-btn mr30"
                >
                  Post
                </button>
              )}
            </div>
            {/* {isVisible && (
              <div className="test df al jc">
                <div className="box df al jc fdc">
                  <h3 className="mb10">Available Fields</h3>
                  <table className="job-table w90">
                    <thead>
                      <tr>
                        <th>S.No</th>
                        <th>Select</th>
                        <th>Field Label</th>
                        <th>Field Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fields.map((field, index) => (
                        <tr key={field.id}>
                          <td>{index + 1}</td>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedFieldIds.includes(field.id)}
                              onChange={() => toggleFieldSelection(field.id)}
                            />
                          </td>
                          <td>{field.fieldLabel}</td>
                          <td>{field.fieldType}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <button
                    className="b btn mt20"
                    onClick={() => setIsVisible(false)}
                  >
                    Add
                  </button>
                </div>
              </div>
            )} */}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobDetails;
