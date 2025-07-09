import React, { useEffect, useRef, useState } from "react";
import Navbar from "../admin/Navbar";
import { MdOutlineLibraryAdd, MdDeleteForever, MdCreate } from "react-icons/md";
import { FaEdit, FaWpforms } from "react-icons/fa";
import { LiaProjectDiagramSolid } from "react-icons/lia";
import { FiUsers } from "react-icons/fi";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function JobTemplate() {
  const [formType, setFormType] = useState("job");
  const [edited, setEdited] = useState(false);
  const [fields, setFields] = useState([]);
  const [fieldOptions, setFieldOptions] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [tempValues, setTempValues] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [selectedFieldIds, setSelectedFieldIds] = useState([]);
  const [fieldPositions, setFieldPositions] = useState({});
  const [fieldOrder, setFieldOrder] = useState([]);
  const [name, setName] = useState("");
  const [templateNames, setTemplateNames] = useState([]);
  const [templateFields, setTemplateFields] = useState([]);
  const [editTemplateId, setEditTemplateId] = useState(null);
  const [jobWorkflows, setJobWorkFlows] = useState([]);
  const [candidateWorkflows, setCandidateWorkflows] = useState([]);
  const [candidateForms, setCandidateForms] = useState([]);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();
  const [jobTemplateData, setJobTemplateData] = useState({
    jobWorkFlowId: "",
    candidateWorkFlowId: "",
    candidateFormId: "",
  });

  const fetchFields = async () => {
    try {
      const res = await axios.get(`/fields/template/${formType}`);
      setFields(res.data);
      if (!edited) {
        setFieldOrder([...new Set(res.data.map((f) => f.id))]);
      }
    } catch (err) {
      console.error("Failed to Fetch Fields", err);
    }
  };
  const fetchFieldsOption = async () => {
    try {
      const res = await axios.get("/fieldOption/all");
      setFieldOptions(res.data);
    } catch (error) {
      console.error("Error in Fetching Field Options");
    }
  };
  const fetchTemplate = async () => {
    try {
      const res = await axios.get(`/template/all/${formType}`);
      const { templates, templateFieldsdata } = res.data;
      setTemplateNames(templates);
      setTemplateFields(templateFieldsdata);

      // Set unique ordered field IDs
      const orderedFieldIds = templateFieldsdata
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((item) => item.fieldId);

      setFieldOrder([...new Set(orderedFieldIds)]);
    } catch (err) {
      console.error("failed to fetch template", err);
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
  // Merge fields for display, ensuring uniqueness
  const mergedFields = edited
    ? fieldOrder
        .map((fieldId) => {
          const field = fields.find((f) => f.id === fieldId);
          const templateField = templateFields.find(
            (t) => t.fieldId === fieldId
          );
          if (!field) return null;
          return { ...templateField, ...field };
        })
        .filter(Boolean)
    : fields
        .filter((f) =>
          f.fieldLabel.toLowerCase().includes(searchText.toLowerCase())
        )
        .filter(
          (f, idx, arr) => arr.findIndex((item) => item.id === f.id) === idx // Ensure unique fields
        );

  const fetchTemplateFields = async () => {
    try {
      await axios.get("/templateField/all");
    } catch (err) {
      console.error("failed to fetch template fields", err);
    }
  };
  const handleChange = (name, value) => {
    setTempValues((prev) => ({ ...prev, [name]: value }));
  };
  const handleTemplateChange = (e) => {
    const { name, value } = e.target;
    const intFields = [
      "jobWorkFlowId",
      "candidateWorkFlowId",
      "candidateFormId",
    ];
    const parsedValue = intFields.includes(name)
      ? parseInt(value, 10) || ""
      : value;

    setJobTemplateData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
  };
  const handleFieldSubmit = (e) => {
    e.preventDefault();
    setFormValues(tempValues);
    setIsVisible(false);
  };
  const handleSubmit = async () => {
    // console.log(jobTemplateData);

    try {
      await axios.post("/template", {
        fieldPositions,
        name,
        formType,
        fieldOrder,
        jobTemplateData,
      });
      toast.success("Template Created");
      fetchFields();
      fetchFieldsOption();
      fetchTemplate();
      fetchTemplateFields();
    } catch (err) {
      console.error("Failed to Create Template");
      toast.error("Template Creation Failed");
    }
    clearFunction();
  };
  const handleEditTemplate = (template) => {
    setName(template.name);
    setEditTemplateId(template.id);
    const selectedFields = templateFields.filter(
      (tf) => tf.templateId === template.id
    );
    const fieldIds = selectedFields.map((tf) => tf.fieldId);
    setSelectedFieldIds([...new Set(fieldIds)]);

    const positions = {};
    selectedFields.forEach((tf) => {
      positions[tf.fieldId] = tf.position;
    });
    setFieldPositions(positions);

    const orderedIds = selectedFields
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((f) => f.fieldId);

    setFieldOrder([...new Set(orderedIds)]);
    setJobTemplateData({
      jobWorkFlowId: template.jobWorkFlowId || "",
      candidateWorkFlowId: template.candidateWorkFlowId || "",
      candidateFormId: template.candidateTemplateId || "",
    });
    // setIsVisible(true);
    setEdited(true);
  };
  const handleUpdate = async () => {
    try {
      await axios.put(`/template/${editTemplateId}`, {
        name,
        fieldPositions,
        fieldOrder,
        jobTemplateData,
      });
      toast.success("Template updated successfully");
      clearFunction();
      fetchTemplate();
      fetchTemplateFields();
    } catch (err) {
      console.error("Failed to update template", err);
      toast.error("Template update failed");
    }
  };
  const toggleFieldSelection = (fieldId) => {
    if (selectedFieldIds.includes(fieldId)) {
      setSelectedFieldIds(selectedFieldIds.filter((id) => id !== fieldId));
      const updatedPositions = { ...fieldPositions };
      delete updatedPositions[fieldId];
      setFieldPositions(updatedPositions);
    } else {
      setSelectedFieldIds([...new Set([...selectedFieldIds, fieldId])]);
      setFieldPositions({ ...fieldPositions, [fieldId]: "" });
    }
  };

  const handleSelectAll = (isChecked) => {
    if (isChecked) {
      const allIds = fields.map((field) => field.id);
      setSelectedFieldIds([...new Set(allIds)]);
      const updatedPositions = {};
      allIds.forEach((id) => {
        updatedPositions[id] = fieldPositions[id] || "";
      });
      setFieldPositions(updatedPositions);
    } else {
      setSelectedFieldIds([]);
      setFieldPositions({});
    }
  };
  const moveRow = (index, direction) => {
    const newOrder = [...fieldOrder];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    [newOrder[index], newOrder[targetIndex]] = [
      newOrder[targetIndex],
      newOrder[index],
    ];
    setFieldOrder([...new Set(newOrder)]);
  };
  const handleDeleteTemplate = async (templateId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this template?"
    );
    if (!confirmDelete) return;
    try {
      await axios.delete(`/template/${templateId}`);
      toast.success("Template deleted successfully");
      fetchTemplate();
      fetchTemplateFields();
    } catch (err) {
      console.error("Failed to delete template:", err);
      toast.error("Failed to delete template");
    }
  };
  const clearFunction = () => {
    setEdited(false);
    setEditTemplateId(null);
    setFormValues({});
    setTempValues({});
    setName("");
    setSelectedFieldIds([]);
    setFieldPositions({});
    setFieldOrder([]);
    setIsVisible(false);
    setJobTemplateData({
      jobWorkFlowId: "",
      candidateWorkFlowId: "",
      candidateFormId: "",
    });
    // No navigate("/template") unless you want to always reload the route
  };
  const handleFieldCancel = () => {
    clearFunction();
  };
  useEffect(() => {
    if (!edited && fields.length > 0) {
      const uniqueIds = [...new Set(fields.map((f) => f.id))];
      setFieldOrder(uniqueIds);
    }
  }, [fields, edited]);
  useEffect(() => {
    setEdited(false);
    setEditTemplateId(null);
    setSelectedFieldIds([]);
    setFieldPositions({});
    setFieldOrder([]);
    setIsVisible(false);
    setTempValues({});
    setName("");
  }, [formType]);
  useEffect(() => {
    clearFunction();
    fetchFields();
    fetchFieldsOption();
    fetchTemplate();
    fetchJobWorkFlow();
    fetchCandidateWorkFlow();
    fetchCandidateForms();
  }, [formType]);

  return (
    <div className="container">
      <Navbar />
      <div className="admin-container">
        <nav className="h8 df al ml10 g10">
          <h3>Template</h3>
          <label className={`toggle-btn ${formType === "job" ? "active" : ""}`}>
            <input
              type="radio"
              value="job"
              checked={formType === "job"}
              onChange={() => setFormType("job")}
            />
            Job
          </label>
          <label
            className={`toggle-btn ${formType === "candidate" ? "active" : ""}`}
          >
            <input
              type="radio"
              value="candidate"
              checked={formType === "candidate"}
              onChange={() => setFormType("candidate")}
            />
            Candidate
          </label>
        </nav>
        <div className="df jcsa">
          <div className="template-card df  fdc">
            <div className="df jcsb  ">
              {edited ? <h3>Update Template</h3> : <h3>Create Template</h3>}
              <MdOutlineLibraryAdd
                size={24}
                className="g mr10 cursor-pointer"
                onClick={() => setIsVisible(true)}
              />
            </div>
            <div className="">
              <div>
                <div className="">
                  {formType === "job" && (
                    <div className="container1 b-border ">
                      <div>
                        <div className="input-selection mt5">
                          <label>
                            Job Workflow <span style={{ color: "red" }}>*</span>
                          </label>
                          <select
                            name="jobWorkFlowId"
                            value={jobTemplateData.jobWorkFlowId}
                            onChange={handleTemplateChange}
                          >
                            <option value="">Select Job Workflow</option>
                            {jobWorkflows.map((flow) => (
                              <option key={flow.id} value={flow.id}>
                                {flow.workFlowName}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="input-selection mt15 ">
                          <label>
                            Candidate Workflow{" "}
                            <span style={{ color: "red" }}>*</span>
                          </label>
                          <select
                            name="candidateWorkFlowId"
                            value={jobTemplateData.candidateWorkFlowId}
                            onChange={handleTemplateChange}
                          >
                            <option value="">Select Candidate Workflow</option>
                            {candidateWorkflows.map((flow) => (
                              <option key={flow.id} value={flow.id}>
                                {flow.workFlowName}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="input-selection mt5">
                        <label>
                          Candidate Form <span style={{ color: "red" }}>*</span>
                        </label>
                        <select
                          name="candidateFormId"
                          value={jobTemplateData.candidateFormId}
                          onChange={handleTemplateChange}
                        >
                          <option value="">Select Candidate Form</option>
                          {candidateForms.map((form) => (
                            <option key={form.id} value={form.id}>
                              {form.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                  <div className="job-form-wrapper">
                    <div className="job-form mt10">
                      <div className="left-column">
                        {fieldOrder
                          .map((id) => fields.find((f) => f.id === id))
                          .filter(
                            (field) =>
                              field &&
                              selectedFieldIds.includes(field.id) &&
                              fieldPositions[field.id] === "left"
                          )
                          .map((field) => (
                            <div
                              key={field.id}
                              className={`input ${
                                ["label", "header"].includes(field.fieldType)
                                  ? "static-field"
                                  : ""
                              }`}
                            >
                              {!["label", "header"].includes(
                                field.fieldType
                              ) && (
                                <label htmlFor={`field-${field.id}`}>
                                  {field.fieldLabel || field.label}
                                </label>
                              )}

                              {field.fieldType === "text" && (
                                <input
                                  id={`field-${field.id}`}
                                  type="text"
                                  value={tempValues[field.id] || ""}
                                  onChange={(e) =>
                                    handleChange(field.id, e.target.value)
                                  }
                                />
                              )}

                              {field.fieldType === "textarea" && (
                                <textarea
                                  id={`field-${field.id}`}
                                  value={tempValues[field.id] || ""}
                                  onChange={(e) =>
                                    handleChange(field.id, e.target.value)
                                  }
                                />
                              )}

                              {field.fieldType === "dropdown" && (
                                <select
                                  id={`field-${field.id}`}
                                  className="h5"
                                  value={tempValues[field.id] || ""}
                                  onChange={(e) =>
                                    handleChange(field.id, e.target.value)
                                  }
                                >
                                  <option value="">Select</option>
                                  {fieldOptions
                                    .filter(
                                      (opt) =>
                                        opt.fieldId === field.id && opt.status
                                    )
                                    .sort((a, b) => a.order - b.order)
                                    .map((opt) => (
                                      <option key={opt.id} value={opt.value}>
                                        {opt.value}
                                      </option>
                                    ))}
                                </select>
                              )}

                              {field.fieldType === "number" && (
                                <input
                                  id={`field-${field.id}`}
                                  type="number"
                                  value={tempValues[field.id] || ""}
                                  onChange={(e) =>
                                    handleChange(field.id, e.target.value)
                                  }
                                />
                              )}

                              {field.fieldType === "date" && (
                                <input
                                  id={`field-${field.id}`}
                                  type="date"
                                  value={tempValues[field.id] || ""}
                                  onChange={(e) =>
                                    handleChange(field.id, e.target.value)
                                  }
                                />
                              )}

                              {field.fieldType === "file" && (
                                <input
                                  id={`field-${field.id}`}
                                  type="file"
                                  onChange={(e) =>
                                    handleChange(field.id, e.target.files[0])
                                  }
                                />
                              )}

                              {field.fieldType === "checkbox" && (
                                <input
                                  id={`field-${field.id}`}
                                  type="checkbox"
                                  checked={tempValues[field.id] || false}
                                  onChange={(e) =>
                                    handleChange(field.id, e.target.checked)
                                  }
                                />
                              )}

                              {field.fieldType === "label" && (
                                <div className="field-label">
                                  {field.label || field.fieldLabel}
                                </div>
                              )}

                              {field.fieldType === "header" && (
                                <h3 className="field-header header-with-line">
                                  {field.label || field.fieldLabel}
                                </h3>
                              )}
                            </div>
                          ))}
                      </div>
                      <div className="right-column">
                        {fieldOrder
                          .map((id) => fields.find((f) => f.id === id))
                          .filter(
                            (field) =>
                              field &&
                              selectedFieldIds.includes(field.id) &&
                              fieldPositions[field.id] === "right"
                          )
                          .map((field) => (
                            <div
                              key={field.id}
                              className={`input ${
                                ["label", "header"].includes(field.fieldType)
                                  ? "static-field"
                                  : ""
                              }`}
                            >
                              {!["label", "header"].includes(
                                field.fieldType
                              ) && (
                                <label htmlFor={`field-${field.id}`}>
                                  {field.fieldLabel || field.label}
                                </label>
                              )}

                              {field.fieldType === "text" && (
                                <input
                                  id={`field-${field.id}`}
                                  type="text"
                                  value={tempValues[field.id] || ""}
                                  onChange={(e) =>
                                    handleChange(field.id, e.target.value)
                                  }
                                />
                              )}

                              {field.fieldType === "textarea" && (
                                <textarea
                                  id={`field-${field.id}`}
                                  value={tempValues[field.id] || ""}
                                  onChange={(e) =>
                                    handleChange(field.id, e.target.value)
                                  }
                                />
                              )}

                              {field.fieldType === "dropdown" && (
                                <select
                                  id={`field-${field.id}`}
                                  className="h5"
                                  value={tempValues[field.id] || ""}
                                  onChange={(e) =>
                                    handleChange(field.id, e.target.value)
                                  }
                                >
                                  <option value="">Select</option>
                                  {fieldOptions
                                    .filter(
                                      (opt) =>
                                        opt.fieldId === field.id && opt.status
                                    )
                                    .sort((a, b) => a.order - b.order)
                                    .map((opt) => (
                                      <option key={opt.id} value={opt.value}>
                                        {opt.value}
                                      </option>
                                    ))}
                                </select>
                              )}

                              {field.fieldType === "number" && (
                                <input
                                  id={`field-${field.id}`}
                                  type="number"
                                  value={tempValues[field.id] || ""}
                                  onChange={(e) =>
                                    handleChange(field.id, e.target.value)
                                  }
                                />
                              )}

                              {field.fieldType === "date" && (
                                <input
                                  id={`field-${field.id}`}
                                  type="date"
                                  value={tempValues[field.id] || ""}
                                  onChange={(e) =>
                                    handleChange(field.id, e.target.value)
                                  }
                                />
                              )}

                              {field.fieldType === "file" && (
                                <input
                                  id={`field-${field.id}`}
                                  type="file"
                                  onChange={(e) =>
                                    handleChange(field.id, e.target.files[0])
                                  }
                                />
                              )}

                              {field.fieldType === "checkbox" && (
                                <input
                                  id={`field-${field.id}`}
                                  type="checkbox"
                                  checked={tempValues[field.id] || false}
                                  onChange={(e) =>
                                    handleChange(field.id, e.target.checked)
                                  }
                                />
                              )}

                              {field.fieldType === "label" && (
                                <div className="field-label">
                                  {field.label || field.fieldLabel}
                                </div>
                              )}

                              {field.fieldType === "header" && (
                                <h3 className="field-header header-with-line">
                                  {field.label || field.fieldLabel}
                                </h3>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                   
                  </div>
                </div>
                {isVisible && (
                  <div className="test df al jc">
                    <div className="field-box df al jcsb fdc">
                      <div className="w100 df h10 al jcsb">
                        <div className="w25 ">
                          <label className="df ml10">
                            Template Name
                            <input
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="input-line ml0"
                              placeholder="Enter Name"
                            />
                          </label>
                        </div>
                        <div>
                          <h3>Available Fields</h3>
                        </div>
                        <div className="">
                          <input
                            type="text"
                            placeholder="Search fields..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="mr10"
                            style={{
                              width: "20vw",
                              padding: "8px",
                              fontSize: "13px",
                            }}
                          />
                        </div>
                      </div>

                      <div className="field-table-cantainer w100 df jc">
                        <table className="field-table w90">
                          <thead>
                            <tr>
                              <th>S.No</th>
                              <th className="df al g3">
                                Select All
                                <input
                                  type="checkbox"
                                  checked={
                                    mergedFields.length > 0 &&
                                    mergedFields.every((f) =>
                                      selectedFieldIds.includes(f.id)
                                    )
                                  }
                                  onChange={(e) =>
                                    handleSelectAll(e.target.checked)
                                  }
                                />
                              </th>
                              <th>Field Label</th>
                              <th>Field Type</th>
                              <th>Position</th>
                              <th>Order</th>
                            </tr>
                          </thead>
                          {fields.length > 0 ? (
                            <tbody>
                              {[...new Set(fieldOrder)].map(
                                (fieldId, index) => {
                                  const field = mergedFields.find(
                                    (f) => f.id === fieldId
                                  );
                                  if (!field) return null;

                                  return (
                                    <tr
                                      key={`${field.id}-${index}`}
                                      style={{ height: "10px" }}
                                    >
                                      <td>{index + 1}</td>
                                      <td>
                                        <input
                                          type="checkbox"
                                          checked={selectedFieldIds.includes(
                                            field.id
                                          )}
                                          onChange={() =>
                                            toggleFieldSelection(field.id)
                                          }
                                        />
                                      </td>
                                      <td>{field.fieldLabel}</td>
                                      <td>{field.fieldType}</td>
                                      <td>
                                        <div className="df al jc">
                                          <label className="df al g3">
                                            <input
                                              type="radio"
                                              name={`position-${field.id}`}
                                              value="left"
                                              disabled={
                                                !selectedFieldIds.includes(
                                                  field.id
                                                )
                                              }
                                              checked={
                                                fieldPositions[field.id] ===
                                                "left"
                                              }
                                              onChange={(e) =>
                                                setFieldPositions({
                                                  ...fieldPositions,
                                                  [field.id]: e.target.value,
                                                })
                                              }
                                            />
                                            Left
                                          </label>
                                          <label
                                            style={{ marginLeft: "10px" }}
                                            className="df al g3"
                                          >
                                            <input
                                              type="radio"
                                              name={`position-${field.id}`}
                                              value="right"
                                              disabled={
                                                !selectedFieldIds.includes(
                                                  field.id
                                                )
                                              }
                                              checked={
                                                fieldPositions[field.id] ===
                                                "right"
                                              }
                                              onChange={(e) =>
                                                setFieldPositions({
                                                  ...fieldPositions,
                                                  [field.id]: e.target.value,
                                                })
                                              }
                                            />
                                            Right
                                          </label>
                                        </div>
                                      </td>
                                      <td style={{ textAlign: "center" }}>
                                        <div className="df al jc g5">
                                          <button
                                            onClick={() => moveRow(index, -1)}
                                            disabled={index === 0}
                                            title="Move Up"
                                          >
                                            ⬆️
                                          </button>
                                          <button
                                            onClick={() => moveRow(index, 1)}
                                            disabled={
                                              index === fieldOrder.length - 1
                                            }
                                            title="Move Down"
                                          >
                                            ⬇️
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                }
                              )}
                            </tbody>
                          ) : (
                            <tr>
                              <td colSpan="6">No fields found</td>
                            </tr>
                          )}
                        </table>
                      </div>

                      <div className="df h10 al g10">
                        <button
                          className="gray btn mt20"
                          onClick={handleFieldCancel}
                        >
                          Cancel
                        </button>
                        <button
                          className="green btn mt20"
                          onClick={handleFieldSubmit}
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
               
            </div>
            {selectedFieldIds.length > 0 && (
                      <div className="h5 df al w100 jc ">
                        <div className="w15 df g10">
                          <button
                            type="button"
                            className="gray btn"
                            onClick={clearFunction}
                          >
                            Clear
                          </button>
                          {edited ? (
                            <button
                              type="submit"
                              onClick={handleUpdate}
                              className="b btn"
                            >
                              Update
                            </button>
                          ) : (
                            <button
                              type="submit"
                              onClick={handleSubmit}
                              className="b btn"
                            >
                              Submit
                            </button>
                          )}
                        </div>
                      </div>
                    )}
          </div>
          <div className="template-card2">
            <h3>Existing Template</h3>
            <div className="templates ">
              {templateNames.map((template) => {
                const relatedTemplateFields = templateFields.filter(
                  (tf) => tf.templateId === template.id
                );

                const fieldNames = relatedTemplateFields.map((tf) => {
                  const field = fields.find((f) => f.id === tf.fieldId);
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
                  <div>
                    {formType === "job" ? (
                      <div
                        key={template.id}
                        className="templates-list  cursor-pointer"
                        onClick={() => handleEditTemplate(template)}
                      >
                        <div className="ml10  w100">
                          <div className="h4 df al jcsb fdr  w95">
                            <h4>{template.name}</h4>
                            <div>
                              <MdDeleteForever
                                className="cursor-pointer"
                                onClick={() =>
                                  handleDeleteTemplate(template.id)
                                }
                                size={20}
                                color="red"
                                title="Delete Template"
                              />
                            </div>
                          </div>
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

                          <div className="field-color">
                            <p className="mt5">
                              <strong>Fields:</strong>{" "}
                              {fieldNames.length > 0
                                ? fieldNames.join(", ")
                                : "None"}
                            </p>
                          </div>
                        </div>
                        {/* <div className=" mr10  green ">
                      <FaEdit
                        size={16}
                        color="blue"
                        className="cursor-pointer"
                        onClick={() => handleEditTemplate(template)}
                        title="Edit Template"
                      />
                    </div> */}
                      </div>
                    ) : (
                      <div
                        key={template.id}
                        className="box-field  cursor-pointer"
                        onClick={() => handleEditTemplate(template)}
                      >
                        <div className="w100 ml10">
                          <div className="h4 df al jcsb fdr  w95">
                            <h4>{template.name}</h4>
                            <div>
                              <MdDeleteForever
                                className="cursor-pointer"
                                onClick={() =>
                                  handleDeleteTemplate(template.id)
                                }
                                size={20}
                                color="red"
                                title="Delete Template"
                              />
                            </div>
                          </div>
                          <div className="field-color">
                            <p className="mt5">
                              <strong>Fields:</strong>{" "}
                              {fieldNames.length > 0
                                ? fieldNames.join(", ")
                                : "None"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobTemplate;
