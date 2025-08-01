import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaEdit, FaBriefcase } from "react-icons/fa";
import { RiListSettingsLine, RiCloseFill } from "react-icons/ri";
import { TbWorldUpload } from "react-icons/tb";
import { useParams } from "react-router-dom";
import { MdDeleteForever, MdOutlineLibraryAdd } from "react-icons/md";
import Navbar from "../admin/Navbar";

const AllJobs = () => {
  const { companyId } = useParams();
  const [jobs, setJobs] = useState([]);
  const [JobId, setJobId] = useState("");
  const [popup, setPopup] = useState(false);
  const [fields, setFields] = useState([]);
  const [postOption, setPostOption] = useState("");
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [isPosted, setIsPosted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchText, setSearchText] = useState("");
  const [dynamicData, setDynamicData] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [isVisibility, setIsVisibilty] = useState(false);
  const [selectedHeaders, setSelectedHeaders] = useState(() => {
    const stored = localStorage.getItem("JobselectedHeaders");
    return stored ? JSON.parse(stored) : [];
  });
  const [options, setOptions] = useState([]);
  const [formData, setFormData] = useState([]);
  const navigate = useNavigate();
  const cid = localStorage.getItem("cid");
  const today = new Date().toISOString().split("T")[0];
  const role = localStorage.getItem("role");

  const fetchAllJobs = async () => {
    try {
      if (companyId) {
        const res = await axios.get(`/job/company/${companyId}`);
        const { jobs, dynamicFields } = res.data;
        // console.log(res.data);

        setJobs(jobs);
        setDynamicData(dynamicFields);
      } else if (cid) {
        const res = await axios.get(`/job/company/${cid}`);
        const { jobs, dynamicFields } = res.data;
        setJobs(jobs);
        setDynamicData(dynamicFields);
      } else {
        const res = await axios.get("/job");
        const { getjobs, dynamicFields, locationData } = res.data;
        // console.log(res.data);
        setLocationData(locationData || []);
        setJobs(getjobs);
        setDynamicData(dynamicFields);
      }
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    }
  };
  const fetchJob = async (jobId) => {
    try {
      const res = await axios.get(`/job/${jobId}`);
      const job = res.data;
      setJobId(job.id);
      setPostOption(job.visibility || "");
      setIsPosted(!!job.visibility);
    } catch (error) {
      console.error("failed to fetch job", error);
    }
  };
  const fetchFields = async () => {
    try {
      const res = await axios.get("/fields/job");
      setFields(res.data);
    } catch (err) {
      console.error("Failed to Fetch Fields", err);
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
  const getPortal = async () => {
    try {
      const res = await axios.get("/portal");
      const portal = res.data;
      // const portalNames = portal.map((p) => p.Name);
      const initialForm = portal.map((p) => ({
        id: p.id,
        name: p.Name,
        postDate: "",
        expiryDate: "",
        postOption: "",
      }));
      setFormData(initialForm);

      setOptions(portal);
    } catch (err) {
      console.error("failed to get portal", err);
    }
  };
  const getPostOption = async (id) => {
    try {
      const res = await axios.get(`/postOption/${id}`);

      const formatted = res.data.map((item) => ({
        ...item,
        postDate: item.postDate?.slice(0, 10) || "",
        expiryDate: item.expiryDate?.slice(0, 10) || "",
        postOption: item.postOption || "",
        status: item.status || "unposted", // important
      }));

      setFormData(formatted);
    } catch (err) {
      console.error("Error in fetching Post Options", err);
    }
  };
  const handleFormChange = (index, field, value) => {
    const updatedForm = [...formData];
    updatedForm[index][field] = value;
    setFormData(updatedForm);
  };
  const handleRowPostToggle = async (index) => {
    const row = formData[index];

    if (!row.postDate || !row.expiryDate || !row.postOption) {
      toast.error("Please complete all fields before posting.");
      return;
    }

    const updatedForm = [...formData];
    const newStatus = row.status === "posted" ? "unposted" : "posted";

    try {
      await axios.post(`/job/post/single`, {
        jobId: selectedJobId,
        postOption: row.postOption,
        postDate: row.postDate,
        expiryDate: row.expiryDate,
        status: newStatus,
      });

      updatedForm[index].status = newStatus;
      setFormData(updatedForm);

      toast.success(
        `${newStatus === "posted" ? "Posted" : "Unposted"}: ${row.postOption}`
      );
    } catch (err) {
      console.error("Failed to toggle post status:", err);
      toast.error("Failed to update post status.");
    }
  };
  const handleSubmit = () => {
    if (!Array.isArray(formData) || formData.length === 0) {
      toast.error("Please fill in at least one post option.");
      return;
    }
    let hasAtLeastOneValidRow = false;

    for (let i = 0; i < formData.length; i++) {
      const { postDate, expiryDate, postOption } = formData[i];

      const isAnyFilled = postDate || expiryDate || postOption;

      if (isAnyFilled) {
        if (!postDate || !expiryDate || !postOption) {
          toast.error(`Please complete all fields for row ${i + 1}`);
          return;
        }
        hasAtLeastOneValidRow = true;
      }
    }
    if (!hasAtLeastOneValidRow) {
      toast.error("Please complete at least one option to post.");
      return;
    }
    // Submit only fully filled rows
    const filteredFormData = formData.filter(
      (f) => f.postDate && f.expiryDate && f.postOption
    );
    const jobVisibilityData = {
      jobId: selectedJobId,
      formData: filteredFormData,
    };
    axios
      .post(`/job/visibility/${selectedJobId}`, jobVisibilityData)
      .then((res) => {
        toast.success("Job posted successfully!");
        setIsPosted(true);
        getPostOption(selectedJobId);
        clearFunction();
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to post job.");
      });
  };
  const handleUnpost = async () => {
    try {
      await axios.put(`/job/unpost/${JobId}`);
      toast.success("Job unposted");
      clearFunction();
    } catch (err) {
      console.error("Error unposting job", err);
    }
  };
  const handlePopup = async (jobId) => {
    setSelectedJobId(jobId);

    await fetchJob(jobId);

    const portalRes = await axios.get("/portal");
    const portals = portalRes.data;

    const postOptionRes = await axios.get(`/postOption/${jobId}`);
    const postedOptions = postOptionRes.data;

    const formatted = portals.map((p) => {
      const existing = postedOptions.find((o) => o.postOption === p.Name);

      return {
        id: p.id,
        name: p.Name,
        postOption: existing?.postOption || "",
        postDate: existing?.postDate?.slice(0, 10) || "",
        expiryDate: existing?.expiryDate?.slice(0, 10) || "",
        status: existing?.status || "unposted",
      };
    });

    setOptions(portals); // always use full list
    setFormData(formatted); // mix of posted and unposted
    setIsVisibilty(true);
  };
  const dynamicLookup = {};
  dynamicData.forEach((entry) => {
    const key = `${entry.jobId}-${entry.fieldId}`;
    dynamicLookup[key] = entry.value;
  });
  const locationLookup = {};
  locationData.forEach((loc) => {
    if (loc.fieldDataId) {
      locationLookup[loc.fieldDataId] = loc;
    }
  });

  const filteredJobs = jobs.filter((job) => {
    const jobIdStr = String(job.id);
    const customId = `2X${jobIdStr.padStart(5, "0")}`;
    const looseId = `2X0${job.id}`;
    const staticParts = [
      job.companyName ?? "",
      job.jobLocation ?? "",
      job.companyId ?? "",
      customId,
      jobIdStr,
      looseId,
    ];

    const dynamicParts = selectedHeaders.map((fieldId) => {
      if (fieldId === "companyName") return "";
      const key = `${job.id}-${fieldId}`;
      return dynamicLookup[key] ?? "";
    });

    const fullSearchString = [...staticParts, ...dynamicParts]
      .join(" ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

    return fullSearchString.includes(searchTerm.toLowerCase());
  });
  const handleRowClick = (e, id) => {
    // If the clicked element (or its parent) has data-no-nav, don't navigate
    const isActionClick = e.target.closest("[data-no-nav]");
    if (isActionClick) return;
    navigate(`/job/jobdetail/${id}`);
  };
  const extendedFields = [
    { id: "companyName", fieldLabel: "Company Name" },
    ...fields,
  ];
  const filteredFields = extendedFields.filter((f) =>
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
  const handleSaveField = () => {
    localStorage.setItem("JobselectedHeaders", JSON.stringify(selectedHeaders));
    setPopup(false);
  };
  const clearFunction = () => {
    setIsVisibilty(false);
    setPostOption("");
    setIsPosted(false);
  };
  useEffect(() => {
    fetchAllJobs();
    fetchFields();
    getPortal();
  }, []);
  return (
    <div className="container">
      <Navbar />
      <div className="admin-container">
        <nav className="df h10 al jcsb">
          <h3 className="logo w10 df jcsa">
            <FaBriefcase /> All Jobs
          </h3>
          <div className="c-btn df al">
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              className="mr20"
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: "6px", width: "250px" }}
            />
            <MdOutlineLibraryAdd
              size={24}
              className="g mr10 cursor-pointer"
              onClick={() => navigate("/Job")}
            />
            <RiListSettingsLine
              size={20}
              className="mr10 cursor-pointer"
              onClick={() => setPopup(true)}
            />
          </div>
        </nav>
        <div className="data-table">
          <table className="job-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Job Id</th>
                {selectedHeaders.map((id) => {
                  const label =
                    extendedFields.find((h) => h.id === id)?.fieldLabel || id;
                  return <th key={id}>{label}</th>;
                })}
                <th>Status</th>
                <th className="w10 ">Actions</th>
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
                    {selectedHeaders.map((fieldId) => {
                      let value = "N/A";

                      if (fieldId === "companyName") {
                        value = job.companyName || "N/A";
                      } else {
                        // Find the first fieldData entry for this fieldId + jobId
                        const fieldDataEntries = dynamicData.filter(
                          (entry) =>
                            entry.jobId === job.id && entry.fieldId === fieldId
                        );

                        // Pick the one that has a matching locationData entry
                        let matchedFieldData = null;
                        for (const entry of fieldDataEntries) {
                          if (locationLookup[entry.id]) {
                            matchedFieldData = entry;
                            break;
                          }
                        }

                        if (matchedFieldData) {
                          const location = locationLookup[matchedFieldData.id];
                          value = [
                            location.countryName,
                            location.stateName,
                            location.cityName,
                          ]
                            .filter(Boolean)
                            .join(", ");
                        } else {
                          // Fall back to the first matching value if no location attached
                          const fallback = fieldDataEntries[0];
                          value = fallback?.value || "N/A";
                        }
                      }

                      const shouldTruncate =
                        typeof value === "string" && value.length > 50;

                      return (
                        <td key={fieldId}>
                          <div
                            className={shouldTruncate ? "truncate-cell" : ""}
                            title={typeof value === "string" ? value : ""}
                          >
                            {value}
                          </div>
                        </td>
                      );
                    })}

                    <td>{job.status || "N/A"}</td>
                    <td className="f14" data-no-nav>
                      <div className="job-actions">
                        <FaUser
                          color="blue"
                          onClick={() => navigate(`/applicants/job/${job.id}`)}
                        />
                        <TbWorldUpload
                          color="#6610f2"
                          onClick={() => handlePopup(job.id)}
                        />

                        <FaEdit
                          color="blue"
                          onClick={() => navigate(`/Job/${job.id}`)}
                        />
                        {role !== "recruiter" && (
                          <MdDeleteForever
                            className="applied-link"
                            color="red"
                            onClick={() => deleteJob(job.id)}
                          />
                        )}
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
                <div className="df fdr g10 w35 h10 al ">
                  <h3 className="ml10">Select the Headers</h3>
                  <div>
                    <input
                      type="text"
                      className="h5"
                      placeholder="Search headers..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      style={{ padding: "6px", width: "250px" }}
                    />
                  </div>
                </div>
                <div className="w10 h10  df jcsb ">
                  <div className="df al">
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
                  <div className=" w3 df jcsa al  h5">
                    <RiCloseFill
                      size={20}
                      onClick={() => setPopup(false)}
                      className="cursor-pointer"
                    />
                  </div>
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
              <button className="s-btn b mr20" onClick={handleSaveField}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {isVisibility && (
        <div className="test df al jc">
          <div className="post-box df jcsb al fdc">
            <div className="w90 df fdc  mt20 g10">
              {postOption ? <h3>Job Unpost</h3> : <h3>Job Post</h3>}

              <div className="df fdc w100 g10">
                {" "}
                {formData.map((entry, index) => (
                  <div key={entry.id} className="df fdr w100 g10 al">
                    {" "}
                    <label className="input fdc mt10">
                      Post Date:
                      <input
                        type="date"
                        value={entry.postDate}
                        min={today}
                        onChange={(e) =>
                          handleFormChange(index, "postDate", e.target.value)
                        }
                      />
                    </label>
                    <label className="input fdc mt10">
                      Expiry Date:
                      <input
                        type="date"
                        value={entry.expiryDate}
                        min={today}
                        onChange={(e) =>
                          handleFormChange(index, "expiryDate", e.target.value)
                        }
                      />
                    </label>
                    <label className="input fdc mt10">
                      Post Option:
                      <select
                        value={entry.postOption}
                        onChange={(e) =>
                          handleFormChange(index, "postOption", e.target.value)
                        }
                      >
                        <option value="">Select Option</option>
                        {options.map((opt) => {
                          const isUsedElsewhere = formData.some(
                            (item, i) =>
                              i !== index && item.postOption === opt.Name
                          );
                          return (
                            <option
                              key={opt.id}
                              value={opt.Name}
                              disabled={isUsedElsewhere}
                            >
                              {opt.Name}
                            </option>
                          );
                        })}
                      </select>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="box-border w100 df jce ae g10 mb20">
              <button
                type="button"
                className="gray s-btn mr10"
                onClick={clearFunction}
              >
                Cancel
              </button>
              {isPosted ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleUnpost()}
                    className="orange s-btn mr30"
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
          </div>
        </div>
      )}
    </div>
  );
};

export default AllJobs;
