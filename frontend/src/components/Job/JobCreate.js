import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Country, State, City } from "country-state-city";
import { toast } from "react-hot-toast";
import axios from "axios";
import { FaEdit, FaWpforms } from "react-icons/fa";
import { LiaProjectDiagramSolid } from "react-icons/lia";
import { FiUsers } from "react-icons/fi";
import Navbar from "../admin/Navbar";

function JobCreate() {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [job, setJob] = useState({});
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [templateFields, setTemplateFields] = useState([]);
  const [allFields, setAllFields] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [fieldOptions, setFieldOptions] = useState([]);
  const [fieldLabel, setFieldLabel] = useState("");
  const [fieldType, setFieldType] = useState("text");
  const [position, setPosition] = useState("left");
  const [Fields, setFields] = useState([]);
  const [activeTab, setActiveTab] = useState("templates");
  const [editIndex, setEditIndex] = useState(null);
  const [workFlow, setWorkFlow] = useState([]);
  const [jobWorkflows, setJobWorkFlows] = useState([]);
  const [candidateWorkflows, setCandidateWorkflows] = useState([]);
  const [candidateForms, setCandidateForms] = useState([]);

  const getCompanies = async () => {
    try {
      const res = await axios.get("/company/companies");
      setCompanies(res.data);
      // console.log(res.data);
    } catch (err) {
      console.error("Failed to fetch companies:", err);
    }
  };
  const fetchFields = async () => {
    try {
      const res = await axios.get("/fields/job");
      setAllFields(res.data);
      // console.log(res.data);
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
  const fetchTemplate = async () => {
    try {
      const res = await axios.get("/template/job");
      const { data, templateFieldsdata } = res.data;
      // console.log(data);
      // console.log(templateFieldsdata);

      setTemplates(data);
      setTemplateFields(templateFieldsdata);
    } catch (err) {
      console.error("failed to fetch template", err);
    }
  };
  const fetchJobForEdit = async (id) => {
    try {
      // 1. Fetch job details
      const jobRes = await axios.get(`/job/edit/${id}`);
      setJob(jobRes.data);
      setSelectedTemplateId(jobRes.data.templateId);

      // 2. Fetch dynamic field values (includes location fields now)
      const fieldDataRes = await axios.get(`/fieldData/${id}`);
      const fieldValues = {};

      fieldDataRes.data.forEach((item) => {
        if (item.fieldType === "location") {
          const fid = item.fieldId;
          fieldValues[`${fid}_country`] = item.countryCode;
          fieldValues[`${fid}_countryName`] = item.countryName;
          fieldValues[`${fid}_state`] = item.stateCode;
          fieldValues[`${fid}_stateName`] = item.stateName;
          fieldValues[`${fid}_city`] = item.cityName;
        } else {
          fieldValues[item.fieldId] = item.value;
        }
      });

      setFormValues(fieldValues);
    } catch (err) {
      console.error("Error fetching job and field data", err);
      toast.error("Failed to load job data for edit");
    }
  };
  const fetchWorkFlow = async () => {
    try {
      const res = await axios.get("/workFlow/job");
      setWorkFlow(res.data);
      // console.log(res.data);
    } catch (err) {
      console.error("Error in fetching workflow", err);
    }
  };
  const fetchJobWorkFlow = async () => {
    try {
      const res = await axios.get("/workFlow/job");
      setJobWorkFlows(res.data);
    } catch (err) {
      console.error("Error in fetching workflow", err);
    }
  };
  const fetchCandidateWorkFlow = async () => {
    try {
      const res = await axios.get("/workFlow/applicant");
      setCandidateWorkflows(res.data);
    } catch (err) {
      console.error("Error in fetching candidate workflow", err);
    }
  };
  const fetchCandidateForms = async () => {
    try {
      const res = await axios.get("/template/candidate");
      setCandidateForms(res.data);
    } catch (err) {
      console.error("Error in fetching the candidate form", err);
    }
  };
  const handleInputChange = (e) => {
    const { id, value } = e.target;

    if (id === "companyId") {
      const selectedCompany = companies.find((c) => c.id == value);
      setJob((prev) => ({
        ...prev,
        companyId: value,
        companyName: selectedCompany?.name || "",
      }));
    } else if (id === "workflowId") {
      const selectedWorkflow = workFlow.find((w) => w.id == value);
      setJob((prev) => ({
        ...prev,
        workFlowId: value,
        // workFlowName: selectedWorkflow?.name || "",
      }));
    } else {
      setJob((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
  };
  const handleSubmit = async () => {
    try {
      const enrichedFields = Fields.map((field) => ({
        ...field,
        value: formValues[field.fieldLabel] || "",
      }));

      let newJobId = jobId;

      if (!jobId) {
        const res = await axios.post("/job/create", job);
        newJobId = res.data.id;
      } else {
        await axios.put(`/job/update/${jobId}`, job);
      }

      if (activeTab === "fields") {
        await axios.post("/job/manualFieldSubmit", {
          jobId: newJobId,
          Fields: enrichedFields,
        });
      } else {
        // Submit regular fields
        const payload = buildFieldDataPayload(newJobId);
        await axios.post("/fieldData/bulkCreate", payload);
      }

      // Handle location fields separately
      const locationFields = allFields.filter(
        (f) => f.fieldType === "location"
      );

      for (const field of locationFields) {
        const locationPayload = {
          jobId: newJobId,
          fieldId: field.id,
          countryCode: formValues[`${field.id}_country`] || "",
          countryName: formValues[`${field.id}_countryName`] || "",
          stateCode: formValues[`${field.id}_state`] || "",
          stateName: formValues[`${field.id}_stateName`] || "",
          cityName: formValues[`${field.id}_city`] || "",
        };

        if (
          locationPayload.countryCode &&
          locationPayload.stateCode &&
          locationPayload.cityName
        ) {
          await axios.post("/fieldData/location", locationPayload);
        }
      }

      toast.success("Job saved successfully");
      navigate("/alljobs");
    } catch (err) {
      toast.error("Error saving job");
      console.error(err);
    }

    clearFunction();
  };
  const buildFieldDataPayload = (id = jobId) => {
    return Object.entries(formValues).map(([fieldId, value]) => ({
      jobId: id,
      fieldId,
      value,
    }));
  };
  const handleAddField = () => {
    const newField = {
      id: Date.now(), // Add a unique ID here
      fieldLabel,
      fieldType,
      position,
    };

    setFields([...Fields, newField]);

    // Reset form input values
    setFieldLabel("");
    setFieldType("text");
    setPosition("left");
  };
  const handleManual = () => {
    setActiveTab("fields");
    setSelectedTemplateId([]);
  };
  const clearFunction = () => {
    setSelectedTemplateId([]);
    setTemplateFields([]);
    setAllFields([]);
    setFormValues({});
    setFieldOptions([]);
    navigate("/alljobs");
  };
  const handleFieldChange = (index, key, value) => {
    const updated = [...Fields];
    updated[index][key] = value;
    setFields(updated);
  };
  const handleManualFieldChange = (id, value) => {
    setFormValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  };
  const renderFieldInput = (field) => {
    const value = formValues[field.id] || "";
    const handleChange = (val) =>
      setFormValues({ ...formValues, [field.id]: val });

    switch (field.fieldType) {
      case "text":
      case "number":
      case "date":
        return (
          <input
            type={field.fieldType}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
          />
        );
      case "textarea":
        return (
          <textarea
            value={value}
            onChange={(e) => handleChange(e.target.value)}
          />
        );
      case "dropdown":
        return (
          <select value={value} onChange={(e) => handleChange(e.target.value)}>
            <option value="">Select</option>
            {(field.options || []).map((opt, i) => (
              <option key={i} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );
      case "checkbox":
        return (
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => handleChange(e.target.checked)}
          />
        );
      case "file":
        return (
          <input
            type="file"
            onChange={(e) => handleChange(e.target.files[0])}
          />
        );
      default:
        return null;
    }
  };
  const handleDeleteField = (index) => {
    const updated = [...Fields];
    updated.splice(index, 1); // remove 1 item at index
    setFields(updated);
    setEditIndex(null); // exit edit mode
  };
  const renderColumn = (position) =>
    Fields.map((field, index) => {
      if (field.position !== position) return null;

      const isEditing = editIndex === index;

      return (
        <div key={`${position}-${index}`} className="input mt5">
          {isEditing ? (
            <>
              <input
                type="text"
                value={field.fieldLabel}
                onChange={(e) =>
                  handleFieldChange(index, "fieldLabel", e.target.value)
                }
              />
              <select
                value={field.fieldType}
                onChange={(e) =>
                  handleFieldChange(index, "fieldType", e.target.value)
                }
              >
                <option value="text">Text</option>
                <option value="textarea">Textarea</option>
                <option value="dropdown">Dropdown</option>
                <option value="checkbox">Checkbox</option>
                <option value="file">File</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
              </select>
              <select
                value={field.position}
                onChange={(e) =>
                  handleFieldChange(index, "position", e.target.value)
                }
              >
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>

              <div className="mt5 ">
                <button className="b btn" onClick={() => setEditIndex(null)}>
                  Save
                </button>
                <button
                  onClick={() => handleDeleteField(index)}
                  className="btn r ml10"
                >
                  Delete
                </button>
              </div>
            </>
          ) : (
            <>
              <label className=" mt5">
                {field.fieldLabel}
                <FaEdit
                  className="cursor-pointer ml10 "
                  size={14}
                  color="blue"
                  onClick={() => setEditIndex(index)}
                  title="Edit Field"
                />
              </label>
              {renderFieldInput(field)}
            </>
          )}
        </div>
      );
    });
  const renderColumnFields = (columnPosition) => {
    return templateFields
      .filter(
        (tf) =>
          tf.templateId === selectedTemplateId && tf.position === columnPosition
      )
      .map((tf) => {
        const field = allFields.find((f) => f.id === tf.fieldId);
        const options = fieldOptions.filter((opt) => opt.fieldId === field?.id);

        if (!field) return null;

        const fieldValue = formValues[field.id] || "";

        const renderInput = () => {
          switch (field.fieldType) {
            case "text":
            case "date":
            case "number":
              return (
                <input
                  type={field.fieldType}
                  value={fieldValue}
                  onChange={(e) =>
                    setFormValues({ ...formValues, [field.id]: e.target.value })
                  }
                />
              );
            case "textarea":
              return (
                <textarea
                  value={fieldValue}
                  onChange={(e) =>
                    setFormValues({ ...formValues, [field.id]: e.target.value })
                  }
                />
              );
            case "dropdown":
              return (
                <select
                  value={fieldValue}
                  onChange={(e) =>
                    setFormValues({ ...formValues, [field.id]: e.target.value })
                  }
                >
                  <option value="">Select</option>
                  {options.map((opt) => (
                    <option key={opt.id} value={opt.value}>
                      {opt.value}
                    </option>
                  ))}
                </select>
              );
            case "checkbox":
              return (
                <input
                  type="checkbox"
                  checked={!!fieldValue}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      [field.id]: e.target.checked,
                    })
                  }
                />
              );
            case "file":
              return (
                <input
                  type="file"
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      [field.id]: e.target.files[0],
                    })
                  }
                />
              );
            case "location":
              const country = formValues[`${field.id}_country`] || "";
              const state = formValues[`${field.id}_state`] || "";
              const city = formValues[`${field.id}_city`] || "";

              return (
                <div className="df fdc g10">
                  <select
                    value={country}
                    onChange={(e) => {
                      const selectedCountry = Country.getCountryByCode(
                        e.target.value
                      );
                      setFormValues((prev) => ({
                        ...prev,
                        [`${field.id}_country`]: e.target.value,
                        [`${field.id}_countryName`]:
                          selectedCountry?.name || "",
                        [`${field.id}_state`]: "",
                        [`${field.id}_city`]: "",
                      }));
                    }}
                  >
                    <option value="">Select Country</option>
                    {Country.getAllCountries().map((c) => (
                      <option key={c.isoCode} value={c.isoCode}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={state}
                    onChange={(e) => {
                      const selectedState = State.getStateByCodeAndCountry(
                        e.target.value,
                        country
                      );
                      setFormValues((prev) => ({
                        ...prev,
                        [`${field.id}_state`]: e.target.value,
                        [`${field.id}_stateName`]: selectedState?.name || "",
                        [`${field.id}_city`]: "",
                      }));
                    }}
                  >
                    <option value="">Select State</option>
                    {State.getStatesOfCountry(country).map((s) => (
                      <option key={s.isoCode} value={s.isoCode}>
                        {s.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={city}
                    onChange={(e) =>
                      setFormValues({
                        ...formValues,
                        [`${field.id}_city`]: e.target.value,
                      })
                    }
                  >
                    <option value="">Select City</option>
                    {City.getCitiesOfState(country, state).map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              );
            default:
              return null;
          }
        };

        return (
          <div
            key={field.id}
            className={`form-input mt5 ${
              ["label", "header"].includes(field.fieldType)
                ? "static-field"
                : ""
            }`}
          >
            {field.fieldType === "header" && (
              <h3 className="field-header header-with-line">
                {field.label || field.fieldLabel}
              </h3>
            )}

            {field.fieldType === "label" && (
              <div className="field-label">
                {field.label || field.fieldLabel}
              </div>
            )}

            {!["label", "header"].includes(field.fieldType) && (
              <>
                <label>{field.fieldLabel}</label>
                {renderInput()}
              </>
            )}
          </div>
        );
      });
  };
  useEffect(() => {
    if (
      selectedTemplateId &&
      job.companyId &&
      job.templateId !== selectedTemplateId
    ) {
      setJob((prev) => ({
        ...prev,
        templateId: selectedTemplateId,
      }));
    }
  }, [selectedTemplateId, job.companyId]);
  useEffect(() => {
    getCompanies();
    fetchFields();
    fetchFieldsOption();
    fetchTemplate();
    fetchWorkFlow();
    fetchCandidateForms();
    fetchCandidateWorkFlow();
    fetchJobWorkFlow();
    // fetchTemplateFields();
    // fetchAllJobs();
    if (jobId) {
      fetchJobForEdit(jobId); // only run in edit mode
    }
  }, []);

  return (
    <div className="container">
      <Navbar />

      <div className="admin-container">
        <nav className="h8 df al ml10">
          {!jobId ? <h3>Create Job</h3> : <h3>Update Job</h3>}
        </nav>
        <div className="df jcsa">
          <div className="template-card df  jcsb fdc ">
            <div className="df jcsb fdc">
              <div className="job-form-wrapper ">
                {activeTab === "templates" && selectedTemplateId && (
                  <div className="job-form  mt10 ">
                    {/* Left Column */}
                    <div className="left-column ">
                      <div className="form-input mt5">
                        <label>Company</label>
                        <select
                          id="companyId"
                          value={job.companyId || ""}
                          onChange={handleInputChange}
                          className="h5"
                        >
                          <option value="">Select a company</option>
                          {companies.map((company) => (
                            <option key={company.id} value={company.id}>
                              {company.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      {renderColumnFields("left")}
                    </div>
                    {/* Right Column */}
                    <div className="right-column">
                      {renderColumnFields("right")}
                    </div>
                  </div>
                )}
                {activeTab === "fields" && (
                  <div className="template-fields mt10">
                    <div className="df g30">
                      <div className="column">{renderColumn("left")}</div>
                      <div className="column">{renderColumn("right")}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="h5 df al  jc mt10 ">
              <div className="w15 df g10">
                <button
                  type="button"
                  className="gray btn"
                  onClick={clearFunction}
                >
                  Cancel
                </button>
                {!jobId ? (
                  <button onClick={handleSubmit} className="b btn">
                    Submit
                  </button>
                ) : (
                  <button onClick={handleSubmit} className="b btn">
                    Update
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="template-card2 df al  jc fdc">
            <div className="tab">
              {/* <button
                className={activeTab === "fields" ? "active-toggle" : ""}
                onClick={handleManual}
              >
                Manual
              </button> */}
              <button
                className={activeTab === "templates" ? "active-toggle" : ""}
                onClick={() => setActiveTab("templates")}
              >
                Templates
              </button>
            </div>
            <div className=" ">
              {activeTab === "fields" && (
                <div>
                  <div className="input ">
                    <label>Field Label</label>
                    <input
                      type="text"
                      value={fieldLabel}
                      onChange={(e) => setFieldLabel(e.target.value)}
                      required
                    />
                  </div>
                  <div className="df jcsa al mt10 ">
                    <div className="input">
                      <label>Field Type</label>
                      <select
                        value={fieldType}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFieldType(value);
                        }}
                      >
                        <option value="text">Text</option>
                        <option value="textarea">TextArea</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="dropdown">Dropdown</option>
                        <option value="checkbox">Checkbox</option>
                        <option value="file">File</option>
                      </select>
                    </div>
                  </div>

                  <div className="df jcsa al  mt10 h5 fdc g10  ">
                    <div className="df jcsa w100  al">
                      {" "}
                      <strong>Position:</strong>
                      <label>
                        <input
                          type="radio"
                          name="position"
                          value="left"
                          checked={position === "left"}
                          onChange={() => setPosition("left")}
                        />{" "}
                        Left
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="position"
                          value="right"
                          checked={position === "right"}
                          onChange={() => setPosition("right")}
                        />
                        Right
                      </label>
                    </div>
                  </div>
                  <div className="w100 df jc mt20">
                    <button
                      className="s-btn b"
                      onClick={handleAddField}
                      type="button"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              )}
              {activeTab === "templates" && (
                <div className="templates df fdc ">
                  {templates.map((template) => {
                    const relatedTemplateFields = templateFields.filter(
                      (tf) => tf.templateId === template.id
                    );

                    const fieldNames = relatedTemplateFields.map((tf) => {
                      const field = allFields.find((f) => f.id === tf.fieldId);
                      return field ? field.fieldLabel : "Unknown Field";
                    });
                    const jobWorkflow = jobWorkflows.find(
                      (jw) => jw.id === template.jobWorkFlowId
                    );
                    const candidateWorkflow = candidateWorkflows.find(
                      (cw) => cw.id === template.candidateWorkFlowId
                    );
                    const candidateForm = candidateForms.find(
                      (cf) => cf.id === template.candidateTemplateId
                    );
                    return (
                      <div
                        key={template.id}
                        className={`templates-list df g10 al  jcsb ${
                          selectedTemplateId === template.id ? "selected" : ""
                        }`}
                        style={{
                          border:
                            selectedTemplateId === template.id
                              ? "2px solid #3498db"
                              : "",
                          cursor: "pointer",
                          padding: "0.5rem",
                          borderRadius: "5px",
                        }}
                        onClick={() => setSelectedTemplateId(template.id)}
                      >
                        <div className="ml10">
                          <h4>{template.name}</h4>
                          <p className="mt5">
                            <LiaProjectDiagramSolid className="mr3" />
                            Job:{" "}
                            {jobWorkflow ? jobWorkflow.workFlowName : "N/A"}
                          </p>
                          <p className="mt5">
                            <FiUsers className="mr3" />
                            Candidate:{" "}
                            {candidateWorkflow
                              ? candidateWorkflow.workFlowName
                              : "N/A"}
                          </p>
                          <p className="mt5">
                            <FaWpforms className="mr3" />
                            Form: {candidateForm ? candidateForm.name : "N/A"}
                          </p>
                          <p className="mt5 field-color">
                            <strong>Fields:</strong>{" "}
                            {fieldNames.length > 0
                              ? fieldNames.join(", ")
                              : "None"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobCreate;
