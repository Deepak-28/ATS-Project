import React, { useState, useEffect } from "react";
import "./DynamicFieldBuilder.css";
import axios from "axios";
import { MdOutlineLibraryAdd, MdDeleteForever } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import { TbLayoutGridAdd } from "react-icons/tb";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import Navbar from "../admin/Navbar";

const DynamicFieldBuilderPage = () => {
  const [formType, setFormType] = useState("job");
  const [fieldCode, setFieldCode] = useState("");
  const [fieldLabel, setFieldLabel] = useState("");
  const [fieldType, setFieldType] = useState("");
  const [isRequired, setIsRequired] = useState(null);
  const [isDuplicate, setIsDuplicate] = useState(null);
  const [isActive, setIsActive] = useState(null);
  const [options, setOptions] = useState("");
  const [fields, setFields] = useState([]);
  const { cid: companyId } = useParams();
  const [isVisible, setIsVisible] = useState(false);
  const [showOptionsPopup, setShowOptionsPopup] = useState(false);
  const [optionInput, setOptionInput] = useState("");
  const [optionList, setOptionList] = useState([]);
  const [optionOrder, setOptionOrder] = useState("");
  const [optionStatus, setOptionStatus] = useState(null);
  const [optionCode, setOptionCode] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState(null);
  const [editIndex, setEditIndex] = useState(null);

  const getFields = async () => {
    try {
      const res = await axios.get(`/fields/${companyId}/${formType}`);
      setFields(res.data);
    } catch (err) {
      console.error("Failed to fetch fields:", err);
    }
  };
  const fetchOptions = async (id) => {
    try {
      const res = await axios.get(`/fields/options/${id}`);
      // console.log(res.data);
      setOptionList(res.data);
    } catch (err) {
      console.error("Error fetching options:", err);
    }
  };
  const handleData = () => {
    // Reset form for new field
    setFieldLabel("");
    setFieldCode("");
    setFieldType("");
    setIsRequired(null);
    setOptions("");
    setIsEditing(false);
    setEditingFieldId(null);
    setIsVisible(true);
    setIsActive(null);
    setIsDuplicate(null);
  };
  const handleEdit = (field) => {
    setFormType(field.formType);
    setFieldCode(field.fieldCode);
    setFieldLabel(field.fieldLabel);
    setFieldType(field.fieldType);
    setIsRequired(field.isRequired);

    if (field.options && Array.isArray(field.options)) {
      setOptionList(field.options);
      setOptions(field.options.map((opt) => opt.value).join(", "));
    } else {
      setOptionList([]);
      setOptions("");
    }
    setIsActive(field.isActive ?? "Active");
    setIsDuplicate(field.isDuplicate ?? false);

    setEditingFieldId(field.id);
    setIsEditing(true);
    setIsVisible(true);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isDuplicate) {
      const duplicate = fields.find(
        (f) => f.fieldCode === fieldCode && f.id !== editingFieldId
      );
      if (duplicate) {
        toast.error("Field Code must be unique.");
        return;
      }
    }
    // Prepare options array only if fieldType supports options
    let preparedOptions = null;
    if (fieldType === "dropdown" || fieldType === "checkbox") {
      preparedOptions =
        optionList.length > 0
          ? optionList.map((opt) => ({
              id: opt.id,
              value: opt.value,
              order: opt.order || 0,
              status: opt.status || "Active",
              optionCode: opt.optionCode,
            }))
          : options.split(",").map((opt) => ({
              value: opt.trim(),
              order: 0,
              status: "Active",
              optionCode: opt.optionCode,
            }));
    }

    const fieldData = {
      formType,
      fieldCode,
      fieldLabel,
      fieldType,
      isRequired,
      companyId,
      isDuplicate,
      isActive,
      options: preparedOptions,
    };

    try {
      if (isEditing) {
        // console.log("Submitting data:", fieldData);
        await axios.put(`/fields/update/${editingFieldId}`, fieldData);
        toast.success("Field updated successfully");
      } else {
        const res = await axios.post("/fields/create", fieldData);
        toast.success("Field added successfully");
        setFields([...fields, res.data.field]); // Note: updated to res.data.field per backend
      }

      // Reset form
      setFieldLabel("");
      setFieldCode("");
      setFieldType("");
      setIsRequired(null);
      setIsActive(null);
      setIsDuplicate(null);
      setOptions("");
      setIsVisible(false);
      setIsEditing(false);
      setEditingFieldId(null);
      setOptionCode("");
      setOptionList([]);
      setOptionInput("");
      getFields(); // Refresh
    } catch (err) {
      console.error("Error submitting field:", err);
      toast.error("Failed to submit field");
    }
  };
  const handleDelete = async (id) => {
    try {
      //  setFields((prev) => prev.filter((f) => f.id !== id));
      await axios
        .delete(`/fields/${id}`)
        .then((res) => {
          toast.success("Field Deleted");
        })
        .catch((err) => {
          toast.error("err From Delete Field");
        });
    } catch (err) {
      console.error("Error deleting field:", err);
    }
    getFields();
  };
  const handleEditButton = () => {
    setShowOptionsPopup(true);
  };
  useEffect(() => {
    getFields();
  }, [formType]);
  useEffect(() => {
    if (editingFieldId != null) {
      // console.log(editingFieldId);
      fetchOptions(editingFieldId);
    }
  }, [editingFieldId]);

  return (
    <div className="container">
      <Navbar />
      <div className="admin-container">
        <nav className="df h10 al jcsb">
          <div className="df g10 al">
            <div className="df fdr jcsa w7">
              <TbLayoutGridAdd size={18}/>
            <h3>Field List</h3>
            </div>
            <label
              className={`toggle-btn ${formType === "job" ? "active" : ""}`}
            >
              <input
                type="radio"
                value="job"
                checked={formType === "job"}
                onChange={() => setFormType("job")}
              />
              Job
            </label>
            <label
              className={`toggle-btn ${
                formType === "candidate" ? "active" : ""
              }`}
            >
              <input
                type="radio"
                value="candidate"
                checked={formType === "candidate"}
                onChange={() => setFormType("candidate")}
              />
              Candidate
            </label>
          </div>

          <div className="c-btn ">
            <Link onClick={handleData}>
              <MdOutlineLibraryAdd size={24} className="g mr10" />
            </Link>
          </div>
        </nav>
        {/* Field List */}
        <div className="mt5">
          <div className="data-table">
            <table className="job-table mt8">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Field Code</th>
                  <th>Label</th>
                  <th>Type</th>
                  <th>Required</th>
                  <th>Form</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fields.length > 0 ? (
                  fields.map((field, index) => (
                    <tr key={field.id}>
                      <td>{index + 1}</td>
                      <td>{field.fieldCode || "-"}</td>
                      <td>{field.fieldLabel}</td>
                      <td>{field.fieldType}</td>
                      <td>{field.isRequired ? "Yes" : "No"}</td>
                      <td>{field.formType}</td>
                      <td>
                        <div className="job-actions w100">
                          <FaEdit
                            className="applied-link blue"
                            onClick={() => handleEdit(field)}
                          />
                          <MdDeleteForever
                            color="red"
                            className="applied-link"
                            onClick={() => handleDelete(field.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={fields.length + 7}>No Fields found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Form Popup */}
      {isVisible && (
        <div className="test df jc al">
          <div className="pop-box2">
            <div className="df fdc al jcsa h100">
              {isEditing ? (
                <h3 className="mt10 ">Field Update</h3>
              ) : (
                <h3 className="mt10 ">Field Create</h3>
              )}
              <form onSubmit={handleSubmit} className="dynamicform">
                <div className="df w100 jcsa ">
                  <div className="input">
                    <label>Type</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                    >
                      <option value="job">Job</option>
                      <option value="candidate">Candidate</option>
                    </select>
                  </div>
                  <div className="input ">
                    <label>Field Code</label>
                    <input
                      type="text"
                      value={fieldCode}
                      onChange={(e) => setFieldCode(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className=" df w100 jcsa">
                  <div className="input">
                    <label>Field Label</label>
                    <input
                      type="text"
                      value={fieldLabel}
                      onChange={(e) => setFieldLabel(e.target.value)}
                      required
                    />
                  </div>

                  {isEditing ? (
                    <div className="df jcsa al">
                      <div className="input">
                        <label>Field Type</label>
                        <select
                          value={fieldType}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFieldType(value);
                            if (value === "dropdown" || value === "checkbox") {
                              setShowOptionsPopup(true);
                            } else {
                              setOptionList([]);
                            }
                          }}
                        >
                          <option value="text">Text</option>
                          <option value="textarea">TextArea</option>
                          <option value="number">Number</option>
                          <option value="date">Date</option>
                          <option value="dropdown">Dropdown</option>
                          <option value="checkbox">Checkbox</option>
                          <option value="file">File</option>
                          <option value="label">Label</option>
                          <option value="header">Header</option>
                          <option value="location">Location</option>
                        </select>
                      </div>
                      {(fieldType === "dropdown" ||
                        fieldType === "checkbox") && (
                        <FaEdit
                          size={18}
                          onClick={handleEditButton}
                          className="applied-link blue ml10 mt15"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="df jcsa al ">
                      <div className="input">
                        <label>Field Type</label>
                        <select
                          value={fieldType}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFieldType(value);
                            if (value === "dropdown" || value === "checkbox") {
                              setShowOptionsPopup(true);
                            } else {
                              setOptionList([]);
                            }
                          }}
                        >
                          {" "}
                          <option value="">Please Select</option>
                          <option value="text">Text</option>
                          <option value="textarea">TextArea</option>
                          <option value="number">Number</option>
                          <option value="date">Date</option>
                          <option value="dropdown">Dropdown</option>
                          <option value="checkbox">Checkbox</option>
                          <option value="file">File</option>
                          <option value="label">Label</option>
                          <option value="header">Header</option>
                          <option value="location">Location</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <div className=" df jcsa  w100 ">
                  <div className="">
                    <label>Required:</label>
                    <div className="input-checkbox">
                      <div className="w3">
                        <label className="df jcsa">
                          <input
                            type="radio"
                            name="required"
                            value="yes"
                            checked={isRequired === true}
                            onChange={() => setIsRequired(true)}
                          />
                          Yes
                        </label>
                      </div>
                      <div className="w3">
                        <label className="df jcsa">
                          <input
                            type="radio"
                            name="required"
                            value="no"
                            checked={isRequired === false}
                            onChange={() => setIsRequired(false)}
                          />
                          No
                        </label>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label>Allow Duplicates:</label>
                    <div className="input-checkbox">
                      <div className="w3">
                        <label className="df jcsa">
                          <input
                            type="radio"
                            name="allowDuplicates "
                            value="Yes"
                            checked={isDuplicate === true}
                            onChange={() => setIsDuplicate(true)}
                          />
                          Yes
                        </label>
                      </div>
                      <div className="w3">
                        <label className="df jcsa">
                          <input
                            type="radio"
                            name="allowDuplicates"
                            value="No"
                            checked={isDuplicate === false}
                            onChange={() => setIsDuplicate(false)}
                          />
                          No
                        </label>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label>Status:</label>
                    <div className="input-checkbox">
                      <div className="w5 ">
                        <label className="df jcsa">
                          <input
                            type="radio"
                            name="status"
                            value="Active"
                            checked={isActive === true}
                            onChange={() => setIsActive(true)}
                          />
                          Active
                        </label>
                      </div>
                      <div className="w5">
                        <label className="df jcsb">
                          <input
                            type="radio"
                            name="status"
                            value="Inactive"
                            checked={isActive === false}
                            onChange={() => setIsActive(false)}
                          />
                          Inactive
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
              <div className="df jc al mb10">
                <div className="df al g10 w100 ">
                  <button
                    type="button"
                    className="gray btn"
                    onClick={() => setIsVisible(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="b btn"
                    onClick={handleSubmit}
                  >
                    {isEditing ? "Update" : "Submit"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showOptionsPopup && (
        <div className="test df jc al">
          <div className="pop-box2 df jc al">
            <form className="optionform">
              <div className="optiondiv">
                <h3>Option Create</h3>
                <div className=" df w100  jcsa">
                  <div className="input ">
                    <label>Option Code</label>
                    <input
                      type="text"
                      value={optionCode}
                      onChange={(e) => setOptionCode(e.target.value)}
                    />
                  </div>
                  <div className="input ">
                    <label>Option Value</label>
                    <input
                      type="text"
                      value={optionInput}
                      onChange={(e) => setOptionInput(e.target.value)}
                    />
                  </div>
                </div>
                <div className=" df w100 jcsa">
                  <div className="input">
                    <label>Order</label>
                    <input
                      type="number"
                      value={optionOrder}
                      onChange={(e) => setOptionOrder(e.target.value)}
                    />
                  </div>
                  <div className="input">
                    <label>
                      Status:
                      <div className="input-checkbox">
                        <div className="w5">
                          <label className="df jcsa al ">
                            <input
                              type="radio"
                              name="optionStatus"
                              value="Active"
                              checked={optionStatus === "Active"}
                              onChange={() => setOptionStatus("Active")}
                            />{" "}
                            Active
                          </label>
                        </div>
                        <div className="w5">
                          <label className="df jcsb al ">
                            <input
                              type="radio"
                              name="optionStatus"
                              value="Inactive"
                              checked={optionStatus === "Inactive"}
                              onChange={() => setOptionStatus("Inactive")}
                            />{" "}
                            Inactive
                          </label>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
                <button
                  className="btn b "
                  type="button"
                  onClick={() => {
                    if (optionInput.trim()) {
                      const newOption = {
                        value: optionInput.trim(),
                        order: optionOrder || 0,
                        status: optionStatus,
                        code: optionCode,
                      };

                      if (editIndex !== null) {
                        // Update existing option
                        const updated = [...optionList];
                        updated[editIndex] = newOption;
                        setOptionList(updated);
                        setEditIndex(null);
                      } else {
                        // Add new option
                        setOptionList([...optionList, newOption]);
                      }

                      // Clear inputs
                      setOptionCode("");
                      setOptionInput("");
                      setOptionOrder("");
                      setOptionStatus(null);
                    }
                  }}
                >
                  {editIndex !== null ? "Update" : "Add"}
                </button>

                <div className="optionflow">
                  <label>Options:</label>
                  <ul>
                    {optionList.map((opt, i) => (
                      <li key={i} className="df jcsb g10 al ">
                        <div>
                          <strong>Value:</strong> {opt.value},&nbsp;
                          <strong>Order:</strong> {opt.order},&nbsp;
                          <strong>Status:</strong> {opt.status}
                        </div>
                        <div className="df g10 al">
                          <FaEdit
                            title="Edit"
                            className="blue cursor-pointer"
                            size={16}
                            onClick={() => {
                              setOptionInput(opt.value);
                              setOptionCode(opt.code || "");
                              setOptionOrder(opt.order || 0);
                              setOptionStatus(opt.status || "Active");
                              setEditIndex(i);
                            }}
                          />
                           <MdDeleteForever
                            color="red"
                            className="applied-link"
                            size={17}
                             onClick={() =>
                              setOptionList(
                                optionList.filter((_, index) => index !== i)
                              )
                            }
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="df jc h5 al g10">
                <button
                  type="button"
                  className="gray btn"
                  onClick={() => setShowOptionsPopup(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="green btn"
                  onClick={() => setShowOptionsPopup(false)}
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicFieldBuilderPage;
