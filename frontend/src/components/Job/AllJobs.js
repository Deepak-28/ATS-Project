import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaEdit, FaSearch } from "react-icons/fa";
import { RiListSettingsLine, RiCloseFill } from "react-icons/ri";
import { TbWorldUpload } from "react-icons/tb";
import { useParams } from "react-router-dom";
import {
  MdDeleteForever,
  MdOutlineLibraryAdd,
  MdAddCircleOutline,
} from "react-icons/md";
import Navbar from "../admin/Navbar";

const AllJobs = () => {
  const { companyId } = useParams();
  const [jobs, setJobs] = useState([]);
  const [popup, setPopup] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [fields, setFields] = useState([]);
  const [fieldOptions, setFieldOptions] = useState([]);
  const [postDate, setPostDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [postOption, setPostOption] = useState("");
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [isPosted, setIsPosted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHeaders, setSelectedHeaders] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [dynamicData, setDynamicData] = useState([]);
  const navigate = useNavigate();

  const getCompanies = async () => {
    try {
      const res = await axios.get("/company/companies");
      setCompanies(res.data);
    } catch (err) {
      console.error("Failed to fetch companies:", err);
    }
  };
  const fetchAllJobs = async () => {
    try {
      if (companyId) {
        const res = await axios.get(`/job/company/${companyId}`);
        // console.log(res.data);
        setJobs(res.data || []); // use .jobs only if your API wraps it like { jobs: [...] }
      } else {
        const res = await axios.get("/job");
        const { getjobs, dynamicFields } = res.data;
        setJobs(getjobs);
        setDynamicData(dynamicFields);
        // console.log(dynamicFields);
      }
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    }
  };
  const fetchJob = async (id) => {
    // console.log(id);
    try {
      const res = await axios.get(`/job/${id}`);
      const job = res.data;
      // Set form values from response
      const formatDate = (dateString) => {
        return new Date(dateString).toISOString().slice(0, 10);
      };
      setPostDate(job.postDate ? formatDate(job.postDate) : "");
      setExpiryDate(job.expiryDate ? formatDate(job.expiryDate) : "");
      setPostOption(job.visibility || "");
      setIsPosted(!!job.visibility);
    } catch (error) {
      console.error("failed to fetch job", error);
    }
  };
  const fetchFields = async () => {
    try {
      const res = await axios.get("/fields/all");
      setFields(res.data);
      console.log(res.data);
    } catch (err) {
      console.error("Failed to Fetch Fields", err);
    }
  };
  const fetchFieldsOption = async () => {
    try {
      const res = await axios.get("/fieldOption/all");
      setFieldOptions(res.data);
      // console.log(res.data);
    } catch (error) {
      console.error("Error in Fetching Field Options");
    }
  };
  const deleteJob = async (id) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await axios.delete(`/job/${id}`);
        toast.success("Job deleted successfully");
        fetchAllJobs();
      } catch (err) {
        console.error("Error deleting Job:", err);
        toast.error("Failed to delete Job");
      }
    }
  };
  const handlePopup = (jobId) => {
    setSelectedJobId(jobId);
    setPopup(true);
    fetchJob(jobId);
    // console.log(jobId, 123);
  };
  const filteredJobs = jobs.filter((job) =>
    [job.jobTitle, job.companyName, job.jobLocation]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );
  const handleRowClick = (e, id) => {
    // If the clicked element (or its parent) has data-no-nav, don't navigate
    const isActionClick = e.target.closest("[data-no-nav]");
    if (isActionClick) return;
    // console.log(id);
    navigate(`/job/jobdetail/${id}`);
  };
  const filteredFields = fields.filter((f) =>
  f.fieldLabel?.toLowerCase().includes(searchText?.toLowerCase() || "")
);
  const isAllSelected = filteredFields.every((f) =>
    selectedHeaders.includes(f.id)
  );
  const toggleHeader = (id) => {
    setSelectedHeaders((prev) =>
      prev.includes(id)
        ? prev.filter((fieldid) => fieldid !== id)
        : [...prev, id]
    );
  };
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedHeaders((prev) =>
        prev.filter((id) => !filteredFields.some((f) => f.id === id))
      );
    } else {
      const newSelected = [
        ...new Set([...selectedHeaders, ...filteredFields.map((f) => f.id)]),
      ];
      setSelectedHeaders(newSelected);
    }
  };
  const dynamicLookup = {};
  dynamicData.forEach((entry) => {
    const key = `${entry.jobId}-${entry.fieldId}`;
    dynamicLookup[key] = entry.value;
  });
  useEffect(() => {
    fetchAllJobs();
    getCompanies();
    fetchFields();
    fetchFieldsOption();
  }, []);

  return (
    <div className="container">
      <Navbar />

      <div className="admin-container">
        <nav className="df h10 al jcsb">
          <h3 className="logo ml10">All Jobs</h3>
          <div className="c-btn df al">
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              className="mr20"
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: "6px", width: "250px" }}
            />
            <RiListSettingsLine
              size={20}
              className="mr10 cursor-pointer"
              onClick={handlePopup}
            />
            <Link to="/Job">
              <MdOutlineLibraryAdd size={24} className="g mr10" />
            </Link>
            {/* onClick={handlePopup} */}
          </div>
        </nav>
        <div className="data-table">
          <table className="job-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Job Id</th>
                <th>Company Name</th>
                {selectedHeaders.map((id) => {
                  const label = fields.find((h) => h.id === id)?.fieldLabel;
                  return <th key={id}>{label}</th>;
                })}
                <th className="action-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job, index) => (
                  <tr
                    key={job.id}
                    onClick={(e) => handleRowClick(e, job.id)}
                    className="cursor-pointer hover"
                  >
                    <td>{index + 1}</td>
                    <td>2X0{job.id}</td>
                    <td>{job.companyName || "N/A"}</td>
                    {selectedHeaders.map((fieldId) => {
                      const key = `${job.id}-${fieldId}`;
                      const value = dynamicLookup[key] ?? "N/A";
                      return <td key={fieldId}>{value}</td>;
                    })}
                    <td className="f14" data-no-nav>
                      <div className="df jcsa dk">
                        <Link to={`/applicants/job/${job.id}`}>
                          <FaUser size={15} />
                        </Link>
                        <Link>
                          <TbWorldUpload onClick={() => handlePopup(job.id)} />
                        </Link>
                        <Link to={`/Job/${job.id}`}>
                          <FaEdit />
                        </Link>
                        <MdDeleteForever
                          className="applied-link"
                          color="red"
                          onClick={() => deleteJob(job.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={selectedHeaders.length + 4}>No jobs found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {popup && (
        <div className="test df al jc">
          <div className="box df al fdc jcsb ">
            <div className="w100">
              <div className="df fdr jcsb w100  al h10 b-border">
                <div className="df fdr g10 w30 h10 al jcsa">
                  <h3 className="">Select the Headers</h3>

                  <div>
                    <input
                      type="text"
                      className="h5"
                      placeholder="Search headers..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                  </div>
                </div>

                <div className="w15 h10 al df jcsa ">
                  <div className="">
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <input
                        className="big-checkbox"
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={toggleSelectAll}
                      />
                      Select All
                    </label>
                  </div>
                  <RiCloseFill
                    size={20}
                    onClick={() => setPopup(false)}
                    className="cursor-pointer"
                  />
                </div>
              </div>

              <div className=" w100 mt10 ml20 g20 select-field">
                {filteredFields.map((header) => (
                  <label
                    key={header.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <input
                      type="checkbox"
                      className="big-checkbox"
                      checked={selectedHeaders.includes(header.id)}
                      onChange={() => toggleHeader(header.id)}
                    />
                    {header.fieldLabel}
                  </label>
                ))}
              </div>
            </div>
            <div className="box-border w100 df al jce">
              <button className="s-btn b mr20" onClick={() => setPopup(false)}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllJobs;
