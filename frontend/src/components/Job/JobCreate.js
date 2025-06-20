import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import { MdOutlineLibraryAdd } from "react-icons/md";
import Navbar from "../admin/Navbar";
import { FaEdit } from "react-icons/fa";

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
  // console.log(selectedTemplateId);

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
      const res = await axios.get("/template/all");
      // console.log(res.data);
      setTemplates(res.data);
    } catch (err) {
      console.error("failed to fetch template", err);
    }
  };
  const fetchTemplateFields = async () => {
    try {
      const res = await axios.get("/templateField/all");
      // console.log(res.data);
      setTemplateFields(res.data);
    } catch (err) {
      console.error("failed to fetch template fields", err);
    }
  };
  const fetchJobForEdit = async (id) => {
    // const id = 1;
    try {
      // 1. Fetch job details
      const jobRes = await axios.get(`/job/edit/${id}`);
      setJob(jobRes.data);
      setSelectedTemplateId(jobRes.data.templateId);
      // console.log(jobRes.data.templateId);

      // 2. Fetch dynamic field values
      const fieldDataRes = await axios.get(`/fieldData/${id}`);
      const fieldValues = {};
      fieldDataRes.data.forEach((item) => {
        fieldValues[item.fieldId] = item.value;
      });
      setFormValues(fieldValues);
    } catch (err) {
      console.error("Error fetching job and field data", err);
      toast.error("Failed to load job data for edit");
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
        templateId: selectedTemplateId || "",
      }));
    } else {
      setJob((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
  };
  const handleSubmit = async () => {
    console.log(job);

    try {
      // Step 1: Merge form values into Fields
      const enrichedFields = Fields.map((field) => ({
        ...field,
        value: formValues[field.fieldLabel] || "", // Capture user input
      }));

      if (jobId) {
        // UPDATE existing job
        await axios.put(`/job/update/${jobId}`, job);

        if (activeTab === "fields") {
          // Manual fields update
          await axios.post("/job/manualFieldSubmit", {
            jobId,
            Fields: enrichedFields,
          });
        } else {
          // Template-based update
          await axios.put("/fieldData/bulkUpdate", buildFieldDataPayload());
        }

        toast.success("Job updated successfully");
      } else {
        // CREATE new job
        const res = await axios.post("/job/create", job);
        const newJobId = res.data.id;
        console.log("New Job ID:", newJobId);

        if (activeTab === "fields") {
          // Manual field creation
          await axios.post("/job/manualFieldSubmit", {
            jobId: newJobId,
            Fields: enrichedFields,
          });
        } else {
          // Template field creation
          const payload = buildFieldDataPayload(newJobId);
          await axios.post("/fieldData/bulkCreate", payload);
        }

        toast.success("Job created successfully");
      }

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
      id: Date.now(), // 👈 Add a unique ID here
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
    // console.log(updated);
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
    fetchTemplateFields();
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
        <div className="template-container">
          <div className="template-card df jcsb fdc ">
            <div className="df jcsb fdc">
              <div className="job-form">
                {activeTab === "templates" && selectedTemplateId && (
                  <div className="template-fields ml15 ">
                    {/* <h4>Template Fields</h4> */}

                    {/* Left Column */}
                    <div className="left-column">
                      <div className="input mt5">
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
                      {/* <h5>Left</h5> */}
                      {templateFields
                        .filter(
                          (tf) =>
                            tf.templateId === selectedTemplateId &&
                            tf.position === "left"
                        )
                        .map((tf) => {
                          const field = allFields.find(
                            (f) => f.id === tf.fieldId
                          );
                          const options = fieldOptions.filter(
                            (opt) => opt.fieldId === field?.id
                          );
                          if (!field) return null;

                          return (
                            <div key={field.id} className="input mt5">
                              <label>{field.fieldLabel}</label>
                              {field.fieldType === "text" && (
                                <input
                                  type="text"
                                  value={formValues[field.id] || ""}
                                  onChange={(e) =>
                                    setFormValues({
                                      ...formValues,
                                      [field.id]: e.target.value,
                                    })
                                  }
                                />
                              )}
                              {field.fieldType === "textarea" && (
                                <textarea
                                  value={formValues[field.id] || ""}
                                  onChange={(e) =>
                                    setFormValues({
                                      ...formValues,
                                      [field.id]: e.target.value,
                                    })
                                  }
                                />
                              )}
                              {field.fieldType === "dropdown" && (
                                <select
                                  value={formValues[field.id] || ""}
                                  onChange={(e) =>
                                    setFormValues({
                                      ...formValues,
                                      [field.id]: e.target.value,
                                    })
                                  }
                                >
                                  <option value="">Select</option>
                                  {options.map((opt) => (
                                    <option key={opt.id} value={opt.value}>
                                      {opt.value}
                                    </option>
                                  ))}
                                </select>
                              )}
                              {field.fieldType === "checkbox" && (
                                <input
                                  type="checkbox"
                                  checked={formValues[field.id] || false}
                                  onChange={(e) =>
                                    setFormValues({
                                      ...formValues,
                                      [field.id]: e.target.checked,
                                    })
                                  }
                                />
                              )}
                              {field.fieldType === "file" && (
                                <input
                                  type="file"
                                  onChange={(e) =>
                                    setFormValues({
                                      ...formValues,
                                      [field.id]: e.target.files[0], // storing the File object
                                    })
                                  }
                                />
                              )}
                              {field.fieldType === "number" && (
                                <input
                                  type="number"
                                  value={formValues[field.id] || ""}
                                  onChange={(e) =>
                                    setFormValues({
                                      ...formValues,
                                      [field.id]: e.target.value,
                                    })
                                  }
                                />
                              )}
                              {field.fieldType === "date" && (
                                <input
                                  type="date"
                                  value={formValues[field.id] || ""}
                                  onChange={(e) =>
                                    setFormValues({
                                      ...formValues,
                                      [field.id]: e.target.value,
                                    })
                                  }
                                />
                              )}
                            </div>
                          );
                        })}
                    </div>

                    {/* Right Column */}
                    <div className="right-column">
                      {/* <h5>Right</h5> */}
                      {templateFields
                        .filter(
                          (tf) =>
                            tf.templateId === selectedTemplateId &&
                            tf.position === "right"
                        )
                        .map((tf) => {
                          const field = allFields.find(
                            (f) => f.id === tf.fieldId
                          );
                          const options = fieldOptions.filter(
                            (opt) => opt.fieldId === field?.id
                          );
                          if (!field) return null;

                          return (
                            <div key={field.id} className="input mt5">
                              <label>{field.fieldLabel}</label>
                              {field.fieldType === "text" && (
                                <input
                                  type="text"
                                  value={formValues[field.id] || ""}
                                  onChange={(e) =>
                                    setFormValues({
                                      ...formValues,
                                      [field.id]: e.target.value,
                                    })
                                  }
                                />
                              )}
                              {field.fieldType === "textarea" && (
                                <textarea
                                  value={formValues[field.id] || ""}
                                  onChange={(e) =>
                                    setFormValues({
                                      ...formValues,
                                      [field.id]: e.target.value,
                                    })
                                  }
                                />
                              )}
                              {field.fieldType === "dropdown" && (
                                <select
                                  value={formValues[field.id] || ""}
                                  onChange={(e) =>
                                    setFormValues({
                                      ...formValues,
                                      [field.id]: e.target.value,
                                    })
                                  }
                                >
                                  <option value="">Select</option>
                                  {options
                                    .filter((opt) => opt.fieldId === field.id) // Filter by matching field ID
                                    .map((opt) => (
                                      <option key={opt.id} value={opt.value}>
                                        {opt.value}
                                      </option>
                                    ))}
                                </select>
                              )}

                              {field.fieldType === "checkbox" && (
                                <input
                                  type="checkbox"
                                  checked={formValues[field.id] || false}
                                  onChange={(e) =>
                                    setFormValues({
                                      ...formValues,
                                      [field.id]: e.target.checked,
                                    })
                                  }
                                />
                              )}
                              {field.fieldType === "file" && (
                                <input
                                  type="file"
                                  onChange={(e) =>
                                    setFormValues({
                                      ...formValues,
                                      [field.id]: e.target.files[0], // storing the File object
                                    })
                                  }
                                />
                              )}
                              {field.fieldType === "date" && (
                                <input
                                  type="date"
                                  value={formValues[field.id] || ""}
                                  onChange={(e) =>
                                    setFormValues({
                                      ...formValues,
                                      [field.id]: e.target.value,
                                    })
                                  }
                                />
                              )}
                              {field.fieldType === "number" && (
                                <input
                                  type="number"
                                  value={formValues[field.id] || ""}
                                  onChange={(e) =>
                                    setFormValues({
                                      ...formValues,
                                      [field.id]: e.target.value,
                                    })
                                  }
                                />
                              )}
                            </div>
                          );
                        })}
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
            <div className="h5 df al  jc ">
              <div className="w15 df g10">
                <button
                  type="button"
                  className="gray s-btn"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </button>
                {!jobId ? (
                  <button onClick={handleSubmit} className="b s-btn">
                    Submit
                  </button>
                ) : (
                  <button onClick={handleSubmit} className="b s-btn">
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
            <div className="templates df fdc mt20 ">
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
                <div className="df al fdc">
                  {templates.map((template) => {
                    const relatedTemplateFields = templateFields.filter(
                      (tf) => tf.templateId === template.id
                    );

                    const fieldNames = relatedTemplateFields.map((tf) => {
                      const field = allFields.find((f) => f.id === tf.fieldId);
                      return field ? field.fieldLabel : "Unknown Field";
                    });

                    return (
                      <div
                        key={template.id}
                        className={`templates-list df g10 al jcsb ${
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
