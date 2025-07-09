import React, { useEffect, useState } from "react";
import "./application.css";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { FaCloudUploadAlt } from "react-icons/fa";

function Application() {
  const { slug, jid, candidateId } = useParams();
  const [data, setData] = useState({});
  const [jobs, setJobs] = useState([]);
  const [job, setJob] = useState({});
  const [applied, setApplied] = useState(false);
  const [resume, setResume] = useState({});
  const [selectedFile, setSelectedFile] = useState({});
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [templateFields, setTemplateFields] = useState([]);
  const [fieldOptions, setFieldOptions] = useState([]);
  const [allFields, setAllFields] = useState([]);
  const [formValues, setFormValues] = useState({});
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
      // console.log(jobData.templateId);
      setSelectedTemplateId(jobData.templateId);
      fetchTemplate(jobData.templateId);
    } catch (err) {
      console.error("Error fetching job data:", err);
    }
  };
  const fetchTemplate = async (id) => {
    try {
      const res = await axios.get(`/template/candidate/${id}`);
      const templateData = res.data;
      setSelectedTemplateId(templateData.candidateTemplateId);

      fetchTemplateFields(templateData.candidateTemplateId);
    } catch (err) {
      console.error("Error in Fetching Template", err);
    }
  };
  const fetchTemplateFields = async (id) => {
    try {
      const res = await axios.get(`/templateField/all/${id}`);
      const data = res.data;
      setTemplateFields(data);
      // console.log("templateFields", data);
    } catch (err) {
      console.error("Error in fetching fields", err);
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
  const companyName = job.companyName || "No Company";
  const experience = formValues["Experience"] || "N/A";
  const jobTitle = getDynamicField(formValues, [
    "title",
    "job title",
    "position",
  ]);
  const renderFields = (position) => {
    if (!templateFields.length || !selectedTemplateId) return null;

    const filtered = templateFields.filter(
      (tf) =>
        String(tf.templateId) === String(selectedTemplateId) &&
        tf.position?.toLowerCase() === position.toLowerCase()
    );

    return filtered.map((tf) => {
      const field = tf.field;
      if (!field) return null;

      return (
        <div key={field.id} className="input mt5">
          <label>{field.fieldLabel}</label>
          {field.fieldType === "text" && (
            <input
              type="text"
              value={formValues[field.id] || ""}
              onChange={(e) =>
                setFormValues({ ...formValues, [field.id]: e.target.value })
              }
            />
          )}
          {field.fieldType === "dropdown" && (
            <select
              value={formValues[field.id] || ""}
              onChange={(e) =>
                setFormValues({ ...formValues, [field.id]: e.target.value })
              }
            >
              <option value="">Select</option>
              {(field.options || []).map((opt, idx) => (
                <option key={idx} value={opt.value || opt}>
                  {opt.value || opt}
                </option>
              ))}
            </select>
          )}
          {field.fieldType === "file" && (
            <input
              type="file"
              onChange={(e) =>
                setFormValues({ ...formValues, [field.id]: e.target.files[0] })
              }
            />
          )}
        </div>
      );
    });
  };
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
          <div className="right-column">{renderFields("right")}</div>
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
