import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { RiListSettingsLine, RiCloseFill } from "react-icons/ri";
import { FaUserTie } from "react-icons/fa";
import { LuUsers } from "react-icons/lu";
import { toast } from "react-hot-toast";
import "../Job/JobList.css";
import "./AdminPage.css";
import Navbar from "../admin/Navbar";

function Applicants() {
  const [applicants, setApplicants] = useState([]);
  const [fields, setFields] = useState([]);
  const [dynamicData, setDynamicData] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [popup, setPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();
  const cid = localStorage.getItem("cid");

  const path = window.location.pathname;
  const postSegment = path.split("/")[1];

  const [selectedHeaders, setSelectedHeaders] = useState(() => {
    const stored = localStorage.getItem("CandidateSelectedHeaders");
    return stored ? JSON.parse(stored) : [];
  });
  const fetchApplicants = async () => {
    try {
      if(cid){
        const res = await axios.get(`/user/applicants/${cid}`);
        setApplicants(res.data || []);
      }else{
        const res = await axios.get(`/user/${postSegment}`);
        setApplicants(res.data || []);
      }
      
      // console.log(res.data);
    } catch (err) {
      console.error("Failed to fetch applicants:", err);
      toast.error("Error fetching applicants");
    }
  };
  const fetchFields = async () => {
    try {
      const res = await axios.get("/fields/candidate");
      const { fields, dynamicData, location } = res.data;
      // console.log(res.data);
      
      setFields(fields || []);
      setDynamicData(dynamicData || []);
      setLocationData(location || []);
    } catch (err) {
      console.error("Failed to fetch fields:", err);
    }
  };
  const dynamicLookup = {};
  dynamicData.forEach((entry) => {
    const key =
      postSegment === "applicants"
        ? `${entry.candidateId}-${entry.jobId}-${entry.fieldId}`
        : `${entry.candidateId}-${entry.fieldId}`;
    dynamicLookup[key] = entry;
  });
  const locationLookup = {};
  locationData.forEach((loc) => {
    locationLookup[loc.fieldDataId] = loc;
  });
  const filteredApplicants = applicants.filter((applicant) =>
    `${applicant.firstname} ${applicant.lastname} ${applicant.email} ${applicant.ph_no}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );
  const allowedJobLabels = ["company name", "job title", "job id"];
  const filteredFields = fields.filter((f) => {
    const label = f.fieldLabel?.toLowerCase() || "";
    const matchesSearch = label.includes(searchText.toLowerCase());
    if (postSegment === "candidates") return matchesSearch;
    const isAllowedJobField = allowedJobLabels.includes(label);
    const isUsedByCandidate = dynamicData.some(
      (d) => d.fieldId === f.id && d.candidateId !== null
    );

    return matchesSearch && (isUsedByCandidate || isAllowedJobField);
  });
  const isAllSelected = filteredFields.every((f) =>
    selectedHeaders.includes(f.id)
  );
  const toggleHeader = (id) => {
    setSelectedHeaders((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
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
  const jobFieldLookup = {};
  dynamicData.forEach((entry) => {
    if (entry.candidateId === null && entry.jobId) {
      const key = `${entry.jobId}-${entry.fieldId}`;
      jobFieldLookup[key] = entry.value;
    }
  });
  const renderFieldValue = (applicant, fieldId) => {
    const label = fields
      .find((f) => f.id === fieldId)
      ?.fieldLabel?.toLowerCase();

    if (label === "job id") {
      return applicant.jobId || "N/A";
    }

    const key =
      postSegment === "applicants"
        ? `${applicant.candidateId}-${applicant.jobId}-${fieldId}`
        : `${applicant.id}-${fieldId}`;

    const entry = dynamicLookup[key];
    let value = "N/A";

    if (entry) {
      const loc = locationLookup[entry.id];
      if (loc) {
        value = [loc.countryName, loc.stateName, loc.cityName]
          .filter(Boolean)
          .join(", ");
      } else {
        value = entry.value || "N/A";
      }
    } else {
      const jobKey = `${applicant.jobId}-${fieldId}`;
      if (jobFieldLookup[jobKey]) {
        value = jobFieldLookup[jobKey];
      }
    }

    return value;
  };
  const handleApplicantClick = (e, jid, id) => {
    if (e.target.closest("[data-no-nav]")) return;
    navigate(`/applicants/${jid}/${id}`);
  };
  const handleCandidateClick = (e,id)=>{
     if (e.target.closest("[data-no-nav]")) return;
    navigate(`/applicants/${id}`);
  }
    const handleSaveField = () => {
      localStorage.setItem(
      "CandidateSelectedHeaders",
      JSON.stringify(selectedHeaders)
    );
     setPopup(false);
    }
  useEffect(() => {
    fetchApplicants();
    fetchFields();
  }, [postSegment]);
 
  return (
    <div className="container">
      <Navbar />
      <div className="admin-container">
        <div className="df h10 al jcsb">
          <div className="df fdr w10  jcsa al h100 ">
            {postSegment === "applicants" ?<div className="h100 df al"><FaUserTie size={18}/></div> :
            <div className="h100 df al"><LuUsers size={18}/></div> }
            
            
          <div className="h100  df al"><h3>All {postSegment}</h3></div>
          </div>
          <div>
            <input
              type="text"
              placeholder="Search applicants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mr10"
              style={{ padding: "6px", width: "250px" }}
            />
            {postSegment === "applicants" && (
              <RiListSettingsLine
                size={20}
                className="mr10 cursor-pointer"
                onClick={() => setPopup(true)}
              />
            )}
          </div>
        </div>
       <div className="data-table">
         <table className="job-table">
          <thead>
            <tr>
              <th>S.No</th>
              {postSegment === "applicants" && (
                <>
                  {/* <th>Job Id</th> */}
                  {!cid &&(
                    <th>Company</th>
                  ) }
                </>
              )}
              <th>Name</th>
              {selectedHeaders.map((id) => {
                const label = fields.find((f) => f.id === id)?.fieldLabel || id;
                return <th key={id}>{label}</th>;
              })}
              <th>Email</th>
              <th>Phone</th>
              {/* <th className="w15">Action</th> */}
            </tr>
          </thead>
          <tbody>
            {filteredApplicants.length > 0 ? (
              filteredApplicants.map((applicant, index) => (
                <tr
                  key={`${applicant.id}-${index}`}
                  onClick={(e) =>
                    postSegment === "applicants"
                      ? handleApplicantClick(
                          e,
                          applicant.jobId,
                          applicant.candidateId
                        )
                      : handleCandidateClick(e, applicant.id)
                  }
                  className="cursor-pointer hover"
                >
                  <td>{index + 1}</td>
                  {postSegment === "applicants" && (
                    <>
                      {/* <td>{applicant.jobId}</td> */}
                      {!cid && (
                        <td>{applicant.companyName}</td>
                      )}
                    </>
                  )}
                  <td>{`${applicant.firstname} ${applicant.lastname}`}</td>
                  {selectedHeaders.map((fieldId) => (
                    <td key={fieldId}>
                      {renderFieldValue(applicant, fieldId)}
                    </td>
                  ))}
                  <td>{applicant.email}</td>
                  <td>{applicant.ph_no}</td>
                  {/* <td data-no-nav >
                    <div className="w10">
                      <Link
                      to={`/applicants/${applicant.id}`}
                      state={{ from: "all" }}
                    >
                     <FaEye size={16}/>
                    </Link>
                    </div>
                  </td> */}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={selectedHeaders.length + 6}>No Records Found</td>
              </tr>
            )}
          </tbody>
        </table>
       </div>
      </div>

      {popup && (
        <div className="test df al jc">
          <div className="box df al fdc jcsb">
            <div className="w100">
              <div className="df fdr jcsb w100 al h10 b-border">
                <div className="df fdr g10 w35 h10 al">
                  <h3 className="ml10">Select the Headers</h3>
                  <input
                    type="text"
                    className="h5"
                    placeholder="Search headers..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ padding: "6px", width: "250px" }}
                  />
                </div>
                <div className="w10 h10 df jcsb">
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
                  <div className="w3 df jcsa al h5">
                    <RiCloseFill
                      size={20}
                      onClick={() => setPopup(false)}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              </div>
              <div className="w100 mt10 ml20 g20 select-field">
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

export default Applicants;
