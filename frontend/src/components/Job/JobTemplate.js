import React, { useEffect, useState } from "react";
import Navbar from "../admin/Navbar";
import { MdOutlineLibraryAdd, MdDeleteForever, MdCreate } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function JobTemplate() {
  const [edited, setEdited] = useState(false);
  const [fields, setFields] = useState([]);
  const [fieldOptions, setFieldOptions] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [selectedFieldIds, setSelectedFieldIds] = useState("");
  const [fieldPositions, setFieldPositions] = useState({});
  const [name, SetName] = useState("");
  const [templateName, setTemplateName] = useState([]);
  const [templatefields, setTemplateFields] = useState([]);
  const [templatePositions, setTemplatePositions] = useState("");
  const [editTemplateId, setEditTemplateId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  const fetchFields = async () => {
    try {
      const res = await axios.get("/fields/job");
      setFields(res.data);
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
      console.log(res.data);
      setTemplateName(res.data);
    } catch (err) {
      console.error("failed to fetch template", err);
    }
  };
  const fetchTemplateFields = async () => {
    try {
      const res = await axios.get("/templateField/all");
      console.log(res.data);
      setTemplateFields(res.data);
    } catch (err) {
      console.error("failed to fetch template fields", err);
    }
  };
  const handleChange = (name, value) => {
    setFormValues({ ...formValues, [name]: value });
  };
  const handleSubmit = async () => {
    try {
      await axios.post("/template", { fieldPositions, name });
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
    setEdited(true);
    SetName(template.name); // Set template name
    setEditTemplateId(template.id); // Store template id being edited

    // Filter the fields for this template from templateFields
    const selectedFields = templatefields.filter(
      (tf) => tf.templateId === template.id
    );

    // Extract fieldIds
    const fieldIds = selectedFields.map((tf) => tf.fieldId);
    setSelectedFieldIds(fieldIds);

    // Set their positions
    const positions = {};
    selectedFields.forEach((tf) => {
      positions[tf.fieldId] = tf.position;
    });
    setFieldPositions(positions);

    // Show the template field UI (if hidden)
    setIsVisible(true);
  };
  const handleUpdate = async () => {
    try {
      await axios.put(`/template/${editTemplateId}`, {
        name,
        fieldPositions,
      });
      toast.success("Template updated successfully");
      // clearFunction();
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
  const leftFields = fields.filter(
    (field) =>
      selectedFieldIds.includes(field.id) && fieldPositions[field.id] === "left"
  );
  const rightFields = fields.filter(
    (field) =>
      selectedFieldIds.includes(field.id) &&
      fieldPositions[field.id] === "right"
  );
  const handleDeleteTemplate = async (templateId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this template?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`/template/${templateId}`);
      toast.success("Template deleted successfully");

      // Refresh templates and templateFields
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
    setIsVisible(false);
    navigate(-1);
  };
  useEffect(() => {
    fetchFields();
    fetchFieldsOption();
    fetchTemplate();
    fetchTemplateFields();
  }, []);
  return (
    <div className="container">
      <Navbar />
      <div className="admin-container">
        <nav className="h8 df al ml10">
          <h3>Template</h3>
        </nav>
        <div className="template-container">
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
                    {/* Left Column */}
                    <div className="left-column">
                      {leftFields.map((field) => (
                        <div key={field.id} className="input">
                          <label>{field.fieldLabel}</label>

                          {field.fieldType === "text" && (
                            <input
                              type="text"
                              value={formValues[field.id] || ""}
                              onChange={(e) =>
                                handleChange(field.id, e.target.value)
                              }
                            />
                          )}

                          {field.fieldType === "textarea" && (
                            <textarea
                              value={formValues[field.id] || ""}
                              onChange={(e) =>
                                handleChange(field.id, e.target.value)
                              }
                            />
                          )}

                          {field.fieldType === "dropdown" && (
                            <select
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
                              type="number"
                              value={formValues[field.id] || ""}
                              onChange={(e) =>
                                handleChange(field.id, e.target.value)
                              }
                            />
                          )}

                          {field.fieldType === "date" && (
                            <input
                              type="date"
                              value={formValues[field.id] || ""}
                              onChange={(e) =>
                                handleChange(field.id, e.target.value)
                              }
                            />
                          )}

                          {field.fieldType === "file" && (
                            <input
                              type="file"
                              onChange={(e) =>
                                handleChange(field.id, e.target.files[0])
                              }
                            />
                          )}

                          {field.fieldType === "checkbox" && (
                            <input
                              type="checkbox"
                              checked={formValues[field.id] || false}
                              onChange={(e) =>
                                handleChange(field.id, e.target.checked)
                              }
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="right-column">
                      {rightFields.map((field) => (
                        <div key={field.id} className="input">
                          <label>{field.fieldLabel}</label>

                          {field.fieldType === "text" && (
                            <input
                              type="text"
                              value={formValues[field.id] || ""}
                              onChange={(e) =>
                                handleChange(field.id, e.target.value)
                              }
                            />
                          )}

                          {field.fieldType === "textarea" && (
                            <textarea
                              value={formValues[field.id] || ""}
                              onChange={(e) =>
                                handleChange(field.id, e.target.value)
                              }
                            />
                          )}

                          {field.fieldType === "dropdown" && (
                            <select
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
                              type="number"
                              value={formValues[field.id] || ""}
                              onChange={(e) =>
                                handleChange(field.id, e.target.value)
                              }
                            />
                          )}

                          {field.fieldType === "date" && (
                            <input
                              type="date"
                              value={formValues[field.id] || ""}
                              onChange={(e) =>
                                handleChange(field.id, e.target.value)
                              }
                            />
                          )}

                          {field.fieldType === "file" && (
                            <input
                              type="file"
                              onChange={(e) =>
                                handleChange(field.id, e.target.files[0])
                              }
                            />
                          )}

                          {field.fieldType === "checkbox" && (
                            <input
                              type="checkbox"
                              checked={formValues[field.id] || false}
                              onChange={(e) =>
                                handleChange(field.id, e.target.checked)
                              }
                            />
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
                          /><MdCreate size={24}/>
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
                                  selectedFieldIds.length === fields.length &&
                                  fields.length > 0
                                }
                                onChange={(e) =>
                                  handleSelectAll(e.target.checked)
                                }
                                className="ml10"
                              />
                            </th>
                            <th>Field Label</th>
                            <th>Field Type</th>
                            <th>Position</th>
                          </tr>
                        </thead>
                        <tbody>
                          {fields
                            .filter((field) =>
                              field.fieldLabel
                                .toLowerCase()
                                .includes(searchText.toLowerCase())
                            )
                            .map((field, index) => (
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
                                <td>
                                  {selectedFieldIds.includes(field.id) && (
                                    <div className="df al">
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
                              </tr>
                            ))}
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
                    className="templates-list df g10 al jcsb"
                  >
                    <div className="ml10">
                      <h4>{template.name}</h4>
                      <p className="mt5">
                        <strong>Fields:</strong>{" "}
                        {fieldNames.length > 0 ? fieldNames.join(", ") : "None"}
                      </p>
                    </div>
                    <div className="df al g5 ">
                      <FaEdit
                        size={16}
                        color="blue"
                        className="cursor-pointer"
                        onClick={() => handleEditTemplate(template)}
                        title="Edit Template"
                      />
                      <MdDeleteForever
                        className="mr10 cursor-pointer"
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
