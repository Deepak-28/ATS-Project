import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ApplicantsByJob.css";
import Navbar from "../admin/Navbar";
import { RiListSettingsLine, RiCloseFill } from "react-icons/ri";

function ApplicantsByJob() {
  const { jobId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [popup, setPopup] = useState(false);
  const [fields, setFields] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchText, setSearchText] = useState("");
  const [selectedHeaders, setSelectedHeaders] = useState(() => {
    const stored = localStorage.getItem("selectedHeaders");
    return stored ? JSON.parse(stored) : [];
  });
  const [dynamicData, setDynamicData] = useState([]);
  const navigate = useNavigate();

  const fetchApplicants = async () => {
    try {
      const res = await axios.get(`/application/job/${jobId}`);
      const { dynamicData,  applicants } = res.data;
      setApplicants(applicants);
      setDynamicData(dynamicData);
    } catch (err) {
      console.error("Failed to fetch applicants:", err);
    }
  };
  const fetchJob = async () => {
    try {
      const res = await axios.get(`/job/${jobId}`);
      const jobData = res.data;
      setFormValues(jobData.formValues);
      // console.log(jobData.formValues);
    } catch (error) {
      console.error("failed to fetch job", error);
    }
  };
  const fetchFields = async () => {
    try {
      const res = await axios.get(`/fields/all/`);
      // console.log(res.data);
      setFields(res.data || []);
    } catch (err) {
      console.error("Failed to Fetch Fields", err);
    }
  };
  const handleRowClick = (e, id) => {
    // If the clicked element (or its parent) has data-no-nav, don't navigate
    const isActionClick = e.target.closest("[data-no-nav]");
    if (isActionClick) return;

    navigate(`/applicants/${jobId}/${id}`);
  };
  const getDynamicField = (formValues, keywords) => {
    return (
      Object.entries(formValues || {}).find(([label]) =>
        keywords.some((keyword) => new RegExp(keyword, "i").test(label))
      )?.[1] || "Not provided"
    );
  };
  const filteredApplicants = applicants.filter((applicant) =>
    [applicant.user.user_id, applicant.user.firstname, applicant.user.lastname]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );
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
  const jobTitle = getDynamicField(formValues, [
    "title",
    "job title",
    "position",
  ]);
  const handleSaveField = () => {
    localStorage.setItem("selectedHeaders", JSON.stringify(selectedHeaders));
    setPopup(false);
  };
  useEffect(() => {
    fetchApplicants();
    fetchJob();
    fetchFields();
  }, []);

  return (
    <div className="container">
      <Navbar />
      <div className="admin-container">
        <nav className="df h10 al">
          <h3 className="ml10 w100">
            {" "}
            <Link
              to="/alljobs"
              style={{ textDecoration: "none", color: "blue" }}
            >
              All Jobs
            </Link>
            {" / "}Applicants for{" "}
            <span style={{ fontStyle: "italic", fontWeight: "normal" }}>
              {jobTitle}
            </span>
          </h3>
          <input
            type="text"
            placeholder="Search applicants..."
            value={searchTerm}
            className="mr20"
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: "6px", width: "250px" }}
          />
          <RiListSettingsLine
            size={20}
            className="mr10 cursor-pointer"
            onClick={() => setPopup(true)}
          />
        </nav>
        <div className="data-table">
          <table className="job-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Applicant ID</th>
                <th>User Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Applied On</th>
                {selectedHeaders.map((id) => {
                  const field = fields.find((f) => f.id === id);
                  return <th key={id}>{field?.fieldLabel || id}</th>;
                })}
                {/* <th>Action</th> */}
              </tr>
            </thead>
            <tbody>
              {filteredApplicants.length > 0 ? (
                filteredApplicants.map((app, index) => (
                  <tr
                    key={app.id}
                    onClick={(e) => handleRowClick(e, app.candidateId)}
                    className="cursor-pointer hover"
                  >
                    <td>{index + 1}</td>
                    <td>{app.user.user_id}</td>
                    <td>
                      {app.user.firstname} {app.user.lastname}
                    </td>
                    <td>{app.user.email}</td>
                    <td>{app.status}</td>
                    <td>
                      {app.createdAt
                        ? new Date(app.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    {selectedHeaders.map((id) => {
                      const numericFieldId = parseInt(id); // Ensure proper comparison
                      const field = dynamicData.find(
                        (d) =>
                          d.candidateId === app.candidateId &&
                          d.fieldId === numericFieldId
                      );

                      let displayValue = field?.value || "Not provided";

                      if (field && field.location) {
                        const { countryName, stateName, cityName } =
                          field.location || {};
                        displayValue = [countryName, stateName, cityName]
                          .filter((x) => !!x)
                          .join(", ");
                      }

                      return <td key={id}>{displayValue}</td>;
                    })}

                    {/* <td data-no-nav>
                    <Link
                      to={`/applicants/${jobId}/${app.candidateId}`}
                      state={{ from: "job", jobId }}
                    >
                      View
                    </Link>
                  </td> */}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7 + selectedHeaders.length}>
                    No applicants found.
                  </td>
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
              <button className="s-btn b mr20" onClick={handleSaveField}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApplicantsByJob;
