import React, { useEffect, useState } from "react";
import "./application.css";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { FaCloudUploadAlt } from "react-icons/fa";

function Application() {
  const { slug, jid, candidateId } = useParams();
  const [data, setData] = useState({});
  const [jobs, setJobs] = useState({});
  const [job, setJob] = useState({});
  const [applied, setApplied] = useState(false);
  const [resume, setResume] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [templateFields, setTemplateFields] = useState([]);
  const [fieldOptions, setFieldOptions] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  // console.log(templateFields);
  // console.log(selectedTemplateId);

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
      // console.log(jobData);

      setJob(jobData);
      setSelectedTemplateId(jobData.templateId);
      await fetchTemplate(jobData.templateId);
    } catch (err) {
      console.error("Error fetching job data:", err);
    }
  };
  const fetchTemplate = async (id) => {
    try {
      const res = await axios.get(`/template/fields/candidate/${id}`);
      const templateData = res.data;
      // console.log(res.data);
      setTemplateFields(templateData);
    } catch (err) {
      console.error("Error in Fetching Template", err);
    }
  };
  const handleCancel = () => {
    navigate(-1);
  };
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) {
      toast.error("No file selected.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size is too large.");
      return;
    }
    setResume(file);
    setSelectedFile(file);
  };
  const handleResume = async () => {
    setLoading(true);
    try {
      const fileEntry = Object.entries(formValues).find(
        ([_, value]) => value instanceof File
      );

      if (!fileEntry) {
        throw new Error("No file selected in dynamic fields.");
      }

      const [fileFieldId, file] = fileEntry;

      // Rename file
      const name = file.name.slice(0, file.name.lastIndexOf("."));
      const extension = file.name.slice(file.name.lastIndexOf("."));
      const newFileName = `${name}_${Date.now()}${extension}`;

      const renamedFile = new File([file], newFileName, {
        type: file.type,
      });

      const formData = new FormData();
      formData.append(fileFieldId, renamedFile);
      formData.append("data", JSON.stringify(data));

      Object.entries(formValues).forEach(([key, value]) => {
        if (value instanceof File && key !== fileFieldId) {
          formData.append(key, value);
        } else if (!(value instanceof File)) {
          formData.append(key, value);
        }
      });
      console.log(formData);


      await axios.put(`/user/${candidateId}/${jid}`, formData);

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
      toast.error("Job not found!");
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
  const companyName = job.companyName || "No Company";
  const experience = formValues["Experience"] || "N/A";
  const jobTitle = getDynamicField(job.formValues, [
    "title",
    "job title",
    "position",
  ]);
  const renderFields = (position) => {
    if (!templateFields.length || !selectedTemplateId) return null;

    const filtered = templateFields.filter(tf => tf.position?.toLowerCase() === "left");

//  const filtered = templateFields
//   .filter(
//     (tf) =>
//       tf.templateId === selectedTemplateId &&
//       tf.position?.toLowerCase() === position.toLowerCase()
//   )
//   .sort((a, b) => a.order - b.order);

return filtered.map((tf) => {
  const field = tf.field;
  if (!field) {
    console.warn("Missing field object:", tf); 
    return null;
  }

  const { id, fieldLabel, fieldType, isRequired } = field;
  const required = !!isRequired;
  const label = (
    <label htmlFor={id}>
      {fieldLabel}
      {required && <span style={{ color: "red" }}> *</span>}
    </label>
  );

  switch (fieldType) {
    case "header":
      return (
        <div key={id} className="input">
          <h3>{fieldLabel}</h3>
        </div>
      );
    case "text":
      return (
        <div key={id} className="input">
          {label}
          <input
            id={id}
            type="text"
            value={formValues[id] || ""}
            required={required}
            onChange={(e) =>
              setFormValues({ ...formValues, [id]: e.target.value })
            }
            className="input"
          />
        </div>
      );
    case "number":
      return (
        <div key={id} className="input">
          {label}
          <input
            id={id}
            type="number"
            value={formValues[id] || ""}
            required={required}
            onChange={(e) =>
              setFormValues({ ...formValues, [id]: e.target.value })
            }
            className="input"
          />
        </div>
      );
    case "textarea":
      return (
        <div key={id} className="input">
          {label}
          <textarea
            id={id}
            value={formValues[id] || ""}
            required={required}
            onChange={(e) =>
              setFormValues({ ...formValues, [id]: e.target.value })
            }
            className="form-control"
          />
        </div>
      );
    case "file":
      return (
        <div key={id} className="input">
          {label}
          <input
            id={id}
            type="file"
            required={required}
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setFormValues({ ...formValues, [id]: file });
                setSelectedFile(file);
              }
            }}
            className="input"
          />
          {formValues[id] && typeof formValues[id] === "object" && (
            <div style={{ fontSize: "0.9em", color: "#555" }}>
              Selected: {formValues[id].name}
            </div>
          )}
        </div>
      );
    default:
      return (
        <div key={id} className="form-group">
          <strong>Unknown field type: {fieldType}</strong>
        </div>
      );
  }
});

  };
// useEffect(() => {
//   console.log("Template Fields:", templateFields);
// }, [templateFields]);
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
        <div className="application_content ml20">
          <div className="a-job-header">
            <h3>{jobTitle}</h3>
            <p>{companyName}</p>
          </div>

          <div className="left-column">{renderFields("left")}</div>

          {/* <div className="right-column">{renderFields("right")}</div> */}
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
