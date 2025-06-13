import React, { useState } from "react";

function DynamicForm() {
  const [formValues, setFormValues] = useState({});
  const [mode, setMode] = useState("template"); // "template" or "manual"
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);

  // Mock data for example
  const [templateFields, setTemplateFields] = useState([
    { templateId: 1, fieldId: 1, position: "left" },
    { templateId: 1, fieldId: 2, position: "right" }
  ]);

  const [allFields, setAllFields] = useState([
    { id: 1, fieldLabel: "First Name", fieldType: "text" },
    { id: 2, fieldLabel: "Date of Birth", fieldType: "date" }
  ]);

  const [fieldOptions, setFieldOptions] = useState([]); // for dropdowns

  // Manual fields added by user
  const [fields, setFields] = useState([]);
  const [fieldLabel, setFieldLabel] = useState("");
  const [fieldType, setFieldType] = useState("text");
  const [position, setPosition] = useState("left");

  const handleAddField = () => {
    const newField = { fieldLabel, fieldType, position };
    setFields([...fields, newField]);
    setFieldLabel("");
    setFieldType("text");
    setPosition("left");
  };

  const renderField = (field, options = []) => {
    const fieldKey = field.id || field.fieldLabel;
    const value = formValues[fieldKey] || "";

    const onChange = (e) => {
      const val =
        field.fieldType === "checkbox"
          ? e.target.checked
          : field.fieldType === "file"
          ? e.target.files[0]
          : e.target.value;

      setFormValues({
        ...formValues,
        [fieldKey]: val,
      });
    };

    switch (field.fieldType) {
      case "text":
        return <input type="text" value={value} onChange={onChange} />;
      case "textarea":
        return <textarea value={value} onChange={onChange} />;
      case "number":
        return <input type="number" value={value} onChange={onChange} />;
      case "date":
        return <input type="date" value={value} onChange={onChange} />;
      case "file":
        return <input type="file" onChange={onChange} />;
      case "checkbox":
        return <input type="checkbox" checked={value} onChange={onChange} />;
      case "dropdown":
        return (
          <select value={value} onChange={onChange}>
            <option value="">Select</option>
            {options.map((opt) => (
              <option key={opt.id} value={opt.value}>
                {opt.value}
              </option>
            ))}
          </select>
        );
      default:
        return null;
    }
  };

  return (
    <div className="form-wrapper">
      {/* Mode selection */}
      <div>
        <label>
          <input
            type="radio"
            value="template"
            checked={mode === "template"}
            onChange={() => setMode("template")}
          />
          Use Template
        </label>
        <label>
          <input
            type="radio"
            value="manual"
            checked={mode === "manual"}
            onChange={() => setMode("manual")}
          />
          Manual Entry
        </label>
      </div>

      {/* Manual Field Creator */}
      {mode === "manual" && (
        <div className="manual-field-creator">
          <input
            type="text"
            placeholder="Field Label"
            value={fieldLabel}
            onChange={(e) => setFieldLabel(e.target.value)}
          />
          <select
            value={fieldType}
            onChange={(e) => setFieldType(e.target.value)}
          >
            <option value="text">Text</option>
            <option value="textarea">Textarea</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
            <option value="file">File</option>
            <option value="checkbox">Checkbox</option>
          </select>
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          >
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
          <button onClick={handleAddField}>Add Field</button>
        </div>
      )}

      {/* Render Fields */}
      <div className="df g20 mt10">
        {/* Left Column */}
        <div className="column">
          {(mode === "template"
            ? templateFields.filter(
                (tf) =>
                  tf.templateId === selectedTemplateId &&
                  tf.position === "left"
              ).map((tf) => {
                const field = allFields.find((f) => f.id === tf.fieldId);
                const options = fieldOptions.filter(
                  (opt) => opt.fieldId === field?.id
                );
                if (!field) return null;
                return (
                  <div key={field.id} className="input mt5">
                    <label>{field.fieldLabel}</label>
                    {renderField(field, options)}
                  </div>
                );
              })
            : fields
                .filter((field) => field.position === "left")
                .map((field, index) => (
                  <div key={index} className="input mt5">
                    <label>{field.fieldLabel}</label>
                    {renderField(field)}
                  </div>
                )))}
        </div>

        {/* Right Column */}
        <div className="column">
          {(mode === "template"
            ? templateFields.filter(
                (tf) =>
                  tf.templateId === selectedTemplateId &&
                  tf.position === "right"
              ).map((tf) => {
                const field = allFields.find((f) => f.id === tf.fieldId);
                const options = fieldOptions.filter(
                  (opt) => opt.fieldId === field?.id
                );
                if (!field) return null;
                return (
                  <div key={field.id} className="input mt5">
                    <label>{field.fieldLabel}</label>
                    {renderField(field, options)}
                  </div>
                );
              })
            : fields
                .filter((field) => field.position === "right")
                .map((field, index) => (
                  <div key={index} className="input mt5">
                    <label>{field.fieldLabel}</label>
                    {renderField(field)}
                  </div>
                )))}
        </div>
      </div>
    </div>
  );
}

export default DynamicForm;
