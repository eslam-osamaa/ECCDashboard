
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { FaTimes } from "react-icons/fa";

import addFormulation from "../../services/formulations/addFormulation";
import { useToast } from "../../context/ToastContext";

import FormulationInformation from "../../components/Formulations/FormulationInformation";
import RawMaterialsSection from "../../components/Formulations/RawMaterialsSection";
import FormulationActions from "../../components/Formulations/FormulationActions";

const STATUS_OPTIONS = ["Still", "Uploading"];

const INITIAL_FORM = {
  sfg: "",
  parentCode: "",
  description: "",
  status: "Still",
};

const INITIAL_RM = {
  code: "",
  description: "",
  percentage: "",
};

function AddFormulation({ type = "Cosmetics" }) {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const normalizedType =
    type.toLowerCase() === "makeup" ? "Makeup" : "Cosmetics";

  const basePath =
    normalizedType === "Makeup" ? "/makeup" : "/cosmetics";

  const [formData, setFormData] = useState({ ...INITIAL_FORM });
  const [rawMaterials, setRawMaterials] = useState([{ ...INITIAL_RM }]);
  const [touched, setTouched] = useState({});
  const [isPreview, setIsPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  const totalPercentage = useMemo(
    () =>
      rawMaterials.reduce((total, rm) => {
        const value = Number(rm.percentage);

        return (
          total +
          (rm.percentage.trim() !== "" && Number.isFinite(value) ? value : 0)
        );
      }, 0),
    [rawMaterials]
  );

  const validateField = (name, value) => {
    const trimmed = value.trim();

    switch (name) {
      case "sfg":
        if (!trimmed) return "SFG Code is required.";

        if (!/^SFG\d{6}$/i.test(trimmed)) {
          return "Enter an SFG code followed by exactly 6 digits.";
        }

        return "";

      case "parentCode":
        return "";

      case "description":
        if (!trimmed) return "Description is required.";
        return "";

      case "status":
        if (!STATUS_OPTIONS.includes(value)) {
          return "Select a valid status.";
        }

        return "";

      default:
        return "";
    }
  };

  const validateRMField = (index, field, value) => {
    if (field === "code") {
      if (!value.trim()) return "RM Code is required.";

      if (!/^(RM\d{6}|C-RM\d{6})$/i.test(value.trim())) {
        return "Enter a valid RM code, e.g. RM000123 or C-RM000123.";
      }

      return "";
    }

    if (field === "description") {
      if (!value.trim()) return "RM Description is required.";
      return "";
    }

    if (field === "percentage") {
      if (value.trim() === "") return "Percentage is required.";

      const percentage = Number(value);

      if (!Number.isFinite(percentage) || percentage <= 0) {
        return "Enter a percentage greater than 0.";
      }

      if (percentage > 100) {
        return "Percentage cannot exceed 100%.";
      }

      return "";
    }

    return "";
  };

  const fieldErrors = useMemo(() => {
    const errors = {};

    Object.keys(formData).forEach((name) => {
      if (touched[name]) {
        errors[name] = validateField(name, formData[name]);
      }
    });

    return errors;
  }, [formData, touched]);

  const rmErrors = useMemo(
    () =>
      rawMaterials.map((rm, index) => {
        const errors = {};

        ["code", "description", "percentage"].forEach((field) => {
          const key = `rm-${index}-${field}`;

          if (touched[key]) {
            errors[field] = validateRMField(index, field, rm[field]);
          }
        });

        return errors;
      }),
    [rawMaterials, touched]
  );

  const validateAll = () => {
    const errors = {};

    Object.keys(formData).forEach((name) => {
      errors[name] = validateField(name, formData[name]);
    });

    const materialErrors = rawMaterials.map((rm, index) => {
      const rowErrors = {};

      ["code", "description", "percentage"].forEach((field) => {
        rowErrors[field] = validateRMField(index, field, rm[field]);
      });

      return rowErrors;
    });

    const hasFieldErrors = Object.values(errors).some(Boolean);

    const hasRMErrors = materialErrors.some((row) =>
      Object.values(row).some(Boolean)
    );

    const codes = rawMaterials
      .map((rm) => rm.code.trim().toUpperCase())
      .filter(Boolean);

    const hasDuplicateRM = new Set(codes).size !== codes.length;

    if (rawMaterials.length === 0) {
      return {
        valid: false,
        message: "Add at least one Raw Material.",
      };
    }

    if (hasFieldErrors || hasRMErrors) {
      return {
        valid: false,
        message: "Please fix the highlighted fields.",
      };
    }

    if (hasDuplicateRM) {
      return {
        valid: false,
        message: "Each Raw Material Code must be unique.",
      };
    }

    if (Math.abs(totalPercentage - 100) > 0.0001) {
      return {
        valid: false,
        message: "Total Raw Materials percentage must equal 100%.",
      };
    }

    return { valid: true, message: "" };
  };

  const validation = useMemo(
    () => validateAll(),
    [formData, rawMaterials, totalPercentage]
  );

  const canSave = validation.valid && !saving;

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setServerError("");
  };

  const handleFormBlur = (event) => {
    const { name } = event.target;

    setTouched((previous) => ({
      ...previous,
      [name]: true,
    }));
  };

  const handleRMChange = (index, field, value) => {
    setRawMaterials((previous) =>
      previous.map((rm, i) =>
        i === index ? { ...rm, [field]: value } : rm
      )
    );

    setServerError("");
  };

  const handleRMBlur = (index, field) => {
    const key = `rm-${index}-${field}`;

    setTouched((previous) => ({
      ...previous,
      [key]: true,
    }));
  };

  const handleRMPaste = (event, index, field) => {
    const pastedText = event.clipboardData.getData("text");

    if (!pastedText.includes("\n") && !pastedText.includes("\r")) {
      return;
    }

    event.preventDefault();

    const pastedValues = pastedText
      .split(/\r?\n/)
      .map((value) => value.trim())
      .filter(Boolean);

    if (!pastedValues.length) return;

    setRawMaterials((previous) => {
      const updated = previous.map((rm) => ({ ...rm }));

      pastedValues.forEach((value, offset) => {
        const targetIndex = index + offset;

        while (updated.length <= targetIndex) {
          updated.push({ ...INITIAL_RM });
        }

        updated[targetIndex][field] = value;
      });

      return updated;
    });

    setServerError("");
  };

  const addRawMaterial = () => {
    setRawMaterials((previous) => [
      ...previous,
      { ...INITIAL_RM },
    ]);
  };

  const removeRawMaterial = (index) => {
    setRawMaterials((previous) => {
      if (previous.length === 1) {
        return [{ ...INITIAL_RM }];
      }

      return previous.filter((_, i) => i !== index);
    });

    setTouched((previous) => {
      const updated = {};

      Object.entries(previous).forEach(([key, value]) => {
        const match = key.match(/^rm-(\d+)-(.+)$/);

        if (!match) {
          updated[key] = value;
          return;
        }

        const oldIndex = Number(match[1]);

        if (oldIndex < index) {
          updated[key] = value;
        } else if (oldIndex > index) {
          updated[`rm-${oldIndex - 1}-${match[2]}`] = value;
        }
      });

      return updated;
    });

    setServerError("");
  };

  const markAllTouched = () => {
    const nextTouched = {};

    Object.keys(formData).forEach((name) => {
      nextTouched[name] = true;
    });

    rawMaterials.forEach((_, index) => {
      ["code", "description", "percentage"].forEach((field) => {
        nextTouched[`rm-${index}-${field}`] = true;
      });
    });

    setTouched(nextTouched);
  };

  const handlePreview = () => {
    markAllTouched();

    const result = validateAll();

    if (!result.valid) {
      showToast("error", result.message);
      return;
    }

    setServerError("");
    setIsPreview(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToEdit = () => {
    setIsPreview(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async () => {
    markAllTouched();

    const result = validateAll();

    if (!result.valid) {
      setIsPreview(false);
      showToast("error", result.message);
      return;
    }

    setSaving(true);
    setServerError("");

    const payload = {
      sfg: formData.sfg.trim().toUpperCase(),
      parentCode: formData.parentCode.trim(),
      description: formData.description.trim(),
      status: formData.status,
      rawMaterials: rawMaterials.map((rm) => ({
        code: rm.code.trim().toUpperCase(),
        description: rm.description.trim(),
        percentage: Number(rm.percentage),
      })),
    };

    try {
      await addFormulation(payload, normalizedType);

      showToast("success", "Formulation created successfully.");
      navigate(basePath, { replace: true });
    } catch (err) {
      console.error("Failed to create formulation:", err);

      const status = err.response?.status;
      const data = err.response?.data;

      const apiErrors = data?.errors
        ? Object.values(data.errors).flat().filter(Boolean)
        : [];

      let message;

      if (status === 409) {
        message = data?.message || "This SFG already exists.";
      } else if (status === 400) {
        message =
          apiErrors.join(" ") ||
          data?.message ||
          data?.title ||
          "Please check the entered information.";
      } else if (status === 401) {
        message = "Your session has expired. Please log in again.";
      } else if (status === 403) {
        message =
          data?.message ||
          `You do not have permission to add ${normalizedType} formulations.`;
      } else {
        message =
          data?.message ||
          data?.title ||
          "Failed to save the formulation. Please try again.";
      }

      setServerError(message);
      showToast("error", message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      {serverError && (
        <div
          role="alert"
          className="mb-5 flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <p>{serverError}</p>

          <button
            type="button"
            aria-label="Dismiss error"
            onClick={() => setServerError("")}
            className="shrink-0 text-red-500 hover:text-red-800"
          >
            <FaTimes />
          </button>
        </div>
      )}

      <FormulationInformation
        formData={formData}
        onChange={handleFormChange}
        onBlur={handleFormBlur}
        fieldErrors={fieldErrors}
      />

      <RawMaterialsSection
        rawMaterials={rawMaterials}
        isPreview={isPreview}
        totalPercentage={totalPercentage}
        rmErrors={rmErrors}
        onAdd={addRawMaterial}
        onRemove={removeRawMaterial}
        onChange={handleRMChange}
        onBlur={handleRMBlur}
        onPaste={handleRMPaste}
      />

      <FormulationActions
        isPreview={isPreview}
        saving={saving}
        canSave={canSave}
        validationMessage={validation.message}
        onCancel={() => navigate(basePath)}
        onPreview={handlePreview}
        onBackToEdit={handleBackToEdit}
        onSave={handleSave}
      />
    </div>
  );
}

export default AddFormulation;