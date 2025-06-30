import React, { useEffect, useRef, useState } from "react";
import Navbar from "../admin/Navbar";
import { MdOutlineLibraryAdd, MdDeleteForever, MdCreate } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function JobTemplate() {
  const [formType, setFormType] = useState("job");
  const [edited, setEdited] = useState(false);
  const [fields, setFields] = useState([]);
  const [fieldOptions, setFieldOptions] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [selectedFieldIds, setSelectedFieldIds] = useState([]);
  const [fieldPositions, setFieldPositions] = useState({});
  const [fieldOrder, setFieldOrder] = useState([]);
  const [name, SetName] = useState("");
  const [templateName, setTemplateName] = useState([]);
  const [templatefields, setTemplateFields] = useState([]);
  const [templatePositions, setTemplatePositions] = useState("");
  const [editTemplateId, setEditTemplateId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  const fetchFields = async () => {
    try {
      const res = await axios.get(`/fields/template/${formType}`);
      setFields(res.data);
      // console.log(res.data);
      //  Safe default for non-edit mode
      if (!edited) {
        setFieldOrder(res.data.map((f) => f.id));
      }
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
      const res = await axios.get(`/template/all/${formType}`);
      const { templates, templateFieldsdata } = res.data;
      // console.log(templates);
      // console.log(templateFieldsdata);
      setTemplateName(templates);
      setTemplateFields(templateFieldsdata);
      const orderedFieldIds = templateFieldsdata
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) // safely sort even if order is null
        .map((item) => item.fieldId);

      setFieldOrder(orderedFieldIds);
    } catch (err) {
      console.error("failed to fetch template", err);
    }
  };
const mergedFields = edited
  ? fieldOrder.map((fieldId) => {
      const field = fields.find((f) => f.id === fieldId);
      const templateField = templatefields.find((t) => t.fieldId === fieldId);
      if (!field) return null;
      return {
        ...templateField,
        ...field, // field comes second to preserve field.id
      };
    }).filter(Boolean)
  : fields.filter((f) =>
      f.fieldLabel.toLowerCase().includes(searchText.toLowerCase())
    );
  const fetchTemplateFields = async () => {
    try {
      const res = await axios.get("/templateField/all");
      console.log(res.data);
      // setTemplateFields(res.data);
    } catch (err) {
      console.error("failed to fetch template fields", err);
    }
  };
  const handleChange = (name, value) => {
    setFormValues({ ...formValues, [name]: value });
  };
  const handleSubmit = async () => {
    try {
      await axios.post("/template", {
        fieldPositions,
        name,
        formType,
        fieldOrder,
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
    SetName(template.name);
    setEditTemplateId(template.id);

    const selectedFields = templatefields.filter(
      (tf) => tf.templateId === template.id
    );

    const fieldIds = selectedFields.map((tf) => tf.fieldId);
    setSelectedFieldIds(fieldIds);

    const positions = {};
    selectedFields.forEach((tf) => {
      positions[tf.fieldId] = tf.position;
    });
    setFieldPositions(positions);
    const orderedIds = selectedFields
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((f) => f.fieldId);
    setFieldOrder(orderedIds);
    setIsVisible(true);
    setEdited(true);
  };
  const handleUpdate = async () => {
    try {
      await axios.put(`/template/${editTemplateId}`, {
        name,
        fieldPositions,
        fieldOrder
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
      setSelectedFieldIds([...selectedFieldIds, fieldId]);
      setFieldPositions({
        ...fieldPositions,
        [fieldId]: "left", // default to left when selected
      });
    }
  };
  const handleSelectAll = (isChecked) => {
    if (isChecked) {
      const allIds = fields.map((field) => field.id);
      setSelectedFieldIds(allIds);

      // Set default positions for all selected fields (if not already set)
      const updatedPositions = {};
      allIds.forEach((id) => {
        updatedPositions[id] = fieldPositions[id] || "left";
      });
      setFieldPositions(updatedPositions);
    } else {
      setSelectedFieldIds([]);
      setFieldPositions({});
    }
  };
  const leftFields = fieldOrder
    .map((id) => fields.find((f) => f.id === id))
    .filter(
      (field) =>
        field &&
        fieldPositions[field.id] === "left" &&
        selectedFieldIds.includes(field.id)
    );

  const rightFields = fieldOrder
    .map((id) => fields.find((f) => f.id === id))
    .filter(
      (field) =>
        field &&
        fieldPositions[field.id] === "right" &&
        selectedFieldIds.includes(field.id)
    );

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
    SetName("");
    setSelectedFieldIds([]);
    setFieldPositions({});
    setFieldOrder([]);
    setIsVisible(false);
    navigate("/template");
  };
  const moveRow = (index, direction) => {
    const newOrder = [...fieldOrder];
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= newOrder.length) return;

    [newOrder[index], newOrder[targetIndex]] = [
      newOrder[targetIndex],
      newOrder[index],
    ];

    setFieldOrder(newOrder);
  };
  const initialized = useRef(false);

  useEffect(() => {
    if (!edited && mergedFields.length > 0 && !initialized.current) {
      setFieldOrder(mergedFields.map((f) => f.id));
      initialized.current = true;
    }
  }, [mergedFields, edited]);

  useEffect(() => {
    fetchFields();
    fetchFieldsOption();
    fetchTemplate();
    // fetchTemplateFields();
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
          <div className="template-card df jcsb fdc">
            <div className="df jcsb">
              <h3>Create Template</h3>
              <MdOutlineLibraryAdd
                size={24}
                className="g mr10 cursor-pointer"
                onClick={() => setIsVisible(true)}
              />
            </div>
            <div className="">
              <div>
                <div className="df jcsb fdc">
                  <div className="job-form">
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
                            {!["label", "header"].includes(field.fieldType) && (
                              <label htmlFor={`field-${field.id}`}>
                                {field.fieldLabel || field.label}
                              </label>
                            )}

                            {field.fieldType === "text" && (
                              <input
                                id={`field-${field.id}`}
                                type="text"
                                value={formValues[field.id] || ""}
                                onChange={(e) =>
                                  handleChange(field.id, e.target.value)
                                }
                              />
                            )}

                            {field.fieldType === "textarea" && (
                              <textarea
                                id={`field-${field.id}`}
                                value={formValues[field.id] || ""}
                                onChange={(e) =>
                                  handleChange(field.id, e.target.value)
                                }
                              />
                            )}

                            {field.fieldType === "dropdown" && (
                              <select
                                id={`field-${field.id}`}
                                className="h5"
                                value={formValues[field.id] || ""}
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
                                value={formValues[field.id] || ""}
                                onChange={(e) =>
                                  handleChange(field.id, e.target.value)
                                }
                              />
                            )}

                            {field.fieldType === "date" && (
                              <input
                                id={`field-${field.id}`}
                                type="date"
                                value={formValues[field.id] || ""}
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
                                checked={formValues[field.id] || false}
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
                              <h3 className="field-header">
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
                            {!["label", "header"].includes(field.fieldType) && (
                              <label htmlFor={`field-${field.id}`}>
                                {field.fieldLabel || field.label}
                              </label>
                            )}

                            {field.fieldType === "text" && (
                              <input
                                id={`field-${field.id}`}
                                type="text"
                                value={formValues[field.id] || ""}
                                onChange={(e) =>
                                  handleChange(field.id, e.target.value)
                                }
                              />
                            )}

                            {field.fieldType === "textarea" && (
                              <textarea
                                id={`field-${field.id}`}
                                value={formValues[field.id] || ""}
                                onChange={(e) =>
                                  handleChange(field.id, e.target.value)
                                }
                              />
                            )}

                            {field.fieldType === "dropdown" && (
                              <select
                                id={`field-${field.id}`}
                                className="h5"
                                value={formValues[field.id] || ""}
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
                                value={formValues[field.id] || ""}
                                onChange={(e) =>
                                  handleChange(field.id, e.target.value)
                                }
                              />
                            )}

                            {field.fieldType === "date" && (
                              <input
                                id={`field-${field.id}`}
                                type="date"
                                value={formValues[field.id] || ""}
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
                                checked={formValues[field.id] || false}
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
                              <h3 className="field-header">
                                {field.label || field.fieldLabel}
                              </h3>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
                {isVisible && (
                  <div className="test df al jc">
                    <div className="field-box df al jcsb fdc">
                      <div className="w100 df h10 al jcsb">
                        <div>
                          <label className="df ml10">
                            Template Name
                            <input
                              type="text"
                              value={name}
                              onChange={(e) => SetName(e.target.value)}
                              className="input-line ml0"
                            />
                            <MdCreate size={24} />
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

                      <table className="job-table w90">
                        <thead>
                          <tr>
                            <th>S.No</th>
                            <th className="df jc">
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
                                className="ml10"
                              />
                            </th>
                            <th>Field Label</th>
                            <th>Field Type</th>
                            <th style={{ textAlign: "center" }}>Position</th>
                            <th style={{ textAlign: "center" }}>Order</th>
                          </tr>
                        </thead>
                        <tbody>
                          {fieldOrder.map((fieldId, index) => {
                            const field = mergedFields.find(
                              (f) => f.id === fieldId
                            );
                            if (!field) return null;

                            return (
                              <tr key={field.id}>
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
                                <td style={{ textAlign: "center" }}>
                                  {selectedFieldIds.includes(field.id) && (
                                    <div className="df al jc">
                                      <label>
                                        <input
                                          type="radio"
                                          name={`position-${field.id}`}
                                          value="left"
                                          checked={
                                            fieldPositions[field.id] === "left"
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
                                      <label style={{ marginLeft: "10px" }}>
                                        <input
                                          type="radio"
                                          name={`position-${field.id}`}
                                          value="right"
                                          checked={
                                            fieldPositions[field.id] === "right"
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
                                  )}
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
                                      disabled={index === fieldOrder.length - 1}
                                      title="Move Down"
                                    >
                                      ⬇️
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>

                      <div className="df h10 al g10">
                        <button
                          className="gray btn mt20"
                          onClick={() => setIsVisible(false)}
                        >
                          Cancel
                        </button>
                        <button
                          className="green btn mt20"
                          onClick={() => setIsVisible(false)}
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="h5 df al  jc mr10 mb10 ">
              <div className="w15 df g10">
                <button
                  type="button"
                  className="gray btn"
                  onClick={clearFunction}
                >
                  Cancel
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
          </div>
          <div className="template-card2 df al jc fdc">
            <h3>Existing Template</h3>
            <div className="templates df fdc ">
              {templateName.map((template) => {
                const relatedTemplateFields = templatefields.filter(
                  (tf) => tf.templateId === template.id
                );

                const fieldNames = relatedTemplateFields.map((tf) => {
                  const field = fields.find((f) => f.id === tf.fieldId);
                  return field ? field.fieldLabel : "Unknown Field";
                });

                return (
                  <div
                    key={template.id}
                    className="templates-list df g10 al  jcsb"
                  >
                    <div className="ml10">
                      <h4>{template.name}</h4>
                      <p className="mt5">
                        <strong>Fields:</strong>{" "}
                        {fieldNames.length > 0 ? fieldNames.join(", ") : "None"}
                      </p>
                    </div>
                    <div className="df al g5 mr10 ">
                      <FaEdit
                        size={16}
                        color="blue"
                        className="cursor-pointer"
                        onClick={() => handleEditTemplate(template)}
                        title="Edit Template"
                      />
                      <MdDeleteForever
                        className="cursor-pointer"
                        onClick={() => handleDeleteTemplate(template.id)}
                        size={20}
                        color="red"
                        title="Delete Template"
                      />
                    </div>
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
