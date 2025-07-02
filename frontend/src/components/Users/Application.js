import React, { useEffect, useState } from "react";
import "./application.css";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { FaCloudUploadAlt } from "react-icons/fa";

function Application() {
  const {slug, jid, candidateId } = useParams();
  const [data, setData] = useState({});
  const [jobs, setJobs] = useState([]);
  const [job, setJob] = useState({});
  const [applied, setApplied] = useState(false);
  const [resume, setResume] = useState({});
  const [selectedFile, setSelectedFile] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const Experience = ["0-1", "1-3", "3-5", "5-7", "7-10", "10-15", "15+"];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const handleUser = async () => {
    try {
      const res = await axios.get(`/user/applicant/${candidateId}`);
      const udata = res.data;
      const originalName = await extractOriginalName(udata.resume);
      udata.resume = originalName;
      setData(udata);
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };
  const handleInput = (e) => {
    const { id, value } = e.target;
    setData({ ...data, [id]: value });
  };
  const getJobs = async () => {
    try {
      const res = await axios.get(`/job/${jid}`);
      const jobData = res.data;
      setJob(jobData);
      console.log(jobData);

      // if (jobData.applied) {
      //     const appliedUsers = JSON.parse(jobData.applied);
      //     const uidNum = Number(candidateId);
      //     setApplied(appliedUsers.includes(uidNum));
      // } else {
      //     setApplied(false);
      // }
    } catch (err) {
      console.error("Error fetching job data:", err);
    }
  };
  const handleCancel = () => {
    navigate(-1);
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
    setResume(file);
    setSelectedFile(file);
  };
  const handleResume = async () => {
    setLoading(true);
    try {
      if (!selectedFile || !selectedFile.name) {
        throw new Error("No file selected.");
      }

      const name = selectedFile.name.slice(
        0,
        selectedFile.name.lastIndexOf(".")
      );
      const extension = selectedFile.name.slice(
        selectedFile.name.lastIndexOf(".")
      );
      const newFileName = `${name}_${Date.now()}${extension}`;

      const renamedFile = new File([selectedFile], newFileName, {
        type: selectedFile.type,
      });

      const formData = new FormData();
      formData.append("resume", renamedFile);
      formData.append("data", JSON.stringify(data));

    
      await axios.put(`/user/${candidateId}/${jid}`, formData);

      // Update the "applied" field in the job
      await axios.put(`/application/update`, {
        candidateId: Number(candidateId),
        jobId: Number(jid),
        status: "applied", 
      });

      setApplied(true);
      toast.success("Applied Successfully");
      navigate(`/careers/${slug}`);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };
  const extractOriginalName = (renamedFileName) => {
    if (renamedFileName && typeof renamedFileName === "string") {
      const dotIndex = renamedFileName.lastIndexOf(".");
      const nameWithTimestamp = renamedFileName.slice(0, dotIndex); // resume_1713xxxx
      const ext = renamedFileName.slice(dotIndex); // .pdf

      // Find last underscore and trim everything after
      const lastUnderscore = nameWithTimestamp.lastIndexOf("_");
      const originalName = nameWithTimestamp.slice(0, lastUnderscore) + ext;
      return originalName;
    }
    return "No File Selected";
  };
  const resumename = (name) => {
    if (selectedFile && selectedFile.name) {
      return selectedFile.name;
    }
    return name || "No file selected";
  };
  const getUpdatedAppliedList = () => {
    const appliedUsers = jobs.applied ? JSON.parse(jobs.applied) : [];
    return JSON.stringify([...appliedUsers, Number(candidateId)]);
  };
  const handleError = (err) => {
    if (err.response?.status === 404) {
      toast.success("Job not found!");
    } else {
      console.error("Apply failed:", err);
      toast.error("Application failed. Please try again.");
    }
  };
  const getDynamicField = (formValues, keywords) => {
    return (
      Object.entries(formValues || {}).find(([label]) =>
        keywords.some((keyword) => new RegExp(keyword, "i").test(label))
      )?.[1] || "Not provided"
    );
  };
  const formValues = job.formValues || {};
  const companyName = job.companyName || "No Company";
  const experience = formValues["Experience"] || "N/A";
  const jobTitle = getDynamicField(formValues, [
    "title",
    "job title",
    "position",
  ]);
  useEffect(() => {
    handleUser();
    getJobs();
  }, []);

  return (
    <div className="application_container df jcsb fdc">
      <div>
        <div className="top-nav">
        <img src="/logo.png" alt="logo" className="logo" />
      </div>
        <div className="application_content">
        <div className="a-job-header">
          <h3>{jobTitle}</h3>
          <p>{companyName}</p>
        </div>
        <div className="input_box">
          <label>First Name</label>
          <input
            type="text"
            id="firstname"
            placeholder="First Name"
            onChange={handleInput}
            value={data.firstname || ""}
            required
          />
        </div>
        <div className="input_box">
          <label>Last Name</label>
          <input
            type="text"
            id="lastname"
            placeholder="Last Name"
            onChange={handleInput}
            value={data.lastname || ""}
            required
          />
        </div>
        <div className="input_box">
          <label>Email</label>
          <input
            type="email"
            id="email"
            placeholder="Email"
            onChange={handleInput}
            value={data.email || ""}
            required
          />
        </div>
        <div className="input_box">
          <label>Skills</label>
          <input
            type="text"
            id="skills"
            placeholder="Skills"
            onChange={handleInput}
            value={data.skills || ""}
            required
          />
        </div>
        <div className="input_box">
          <label>Experience</label>
          <select
            className="job-exp"
            id="experience"
            onChange={handleInput}
            value={data.experience || ""}
          >
            <option>Select Option</option>
            {Experience.map((item, index) => (
              <option value={item} key={index}>
                {item} year
              </option>
            ))}
          </select>
        </div>
        <div className="input_box">
          <label>Education</label>
          <input
            type="text"
            id="education"
            placeholder="Education"
            onChange={handleInput}
            value={data.education || ""}
            required
          />
        </div>
        <div className="input_box resume">
          <label>Resume</label>
          <div className="resume_box">
            <label htmlFor="resume" className="resume_upload">
              {" "}
              <FaCloudUploadAlt />
            </label>
            <input
              type="file"
              id="resume"
              accept=".pdf"
              onChange={handleFile}
              required
            />
            {data.resume && (
              <p className="uploaded-filename">{resumename(data.resume)}</p>
            )}
          </div>
        </div>
        
      </div>
      </div>
      <div className="w100 df jc g10 mb10 ">
          <button className="gray btn" onClick={handleCancel}>
            Cancel
          </button>
          <button className="btn b" onClick={handleResume} disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
    </div>
  );
}

export default Application;
