import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { FaTimes } from "react-icons/fa";

import formulationsService from "../../services/formulations/formulationsService";
import updateFormulation from "../../services/formulations/updateFormulation";
import { useToast } from "../../context/ToastContext";

import FormulationInformation from "../../components/Formulations/FormulationInformation";
import RawMaterialsSection from "../../components/Formulations/RawMaterialsSection";
import FormulationActions from "../../components/Formulations/FormulationActions";

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

// ==========================================
// NORMALIZE RAW MATERIALS FOR COMPARISON
// ==========================================
function normalizeRawMaterials(materials) {
  return (materials ?? [])
    .map((rm) => ({
      code: (rm.code ?? "").trim().toUpperCase(),
      description: (rm.description ?? "").trim(),
      percentage: Number(rm.percentage ?? 0),
    }))
    .sort((a, b) => a.code.localeCompare(b.code));
}

function EditFormulation({ type = "Cosmetics" }) {
  const { sfg: sfgParam } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const normalizedType =
    type.toLowerCase() === "makeup" ? "Makeup" : "Cosmetics";

  const basePath =
    normalizedType === "Makeup" ? "/makeup" : "/cosmetics";

  const [formData, setFormData] = useState({ ...INITIAL_FORM });
  const [rawMaterials, setRawMaterials] = useState([{ ...INITIAL_RM }]);

  // ✅ الأصل للمقارنة
  const [originalData, setOriginalData] = useState(null);

  const [touched, setTouched] = useState({});
  const [isPreview, setIsPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [serverError, setServerError] = useState("");

  // ==========================================
  // LOAD FORMULATION BY SFG
  // ==========================================

  useEffect(() => {
    if (!sfgParam) {
      setLoadError("Missing SFG in the URL.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadFormulation() {
      setLoading(true);
      setLoadError("");

      try {
        const data = await formulationsService.getBySfg(
          sfgParam,
          controller.signal
        );

        const loadedForm = {
          sfg: data.sfg ?? "",
          parentCode: data.parentCode ?? "",
          description: data.description ?? "",
          status: data.status ?? "Still",
        };

        const loadedMaterials = (data.rawMaterials ?? []).map((rm) => ({
          code: rm.code ?? "",
          description: rm.description ?? "",
          percentage:
            rm.percentage !== undefined && rm.percentage !== null
              ? String(rm.percentage)
              : "",
        }));

        const safeMaterials = loadedMaterials.length
          ? loadedMaterials
          : [{ ...INITIAL_RM }];

        setFormData(loadedForm);
        setRawMaterials(safeMaterials);

        // ✅ نحفظ الأصل
        setOriginalData({
          parentCode: loadedForm.parentCode.trim(),
          description: loadedForm.description.trim(),
          rawMaterials: normalizeRawMaterials(loadedMaterials),
        });
      } catch (err) {
        if (controller.signal.aborted || err.code === "ERR_CANCELED") {
          return;
        }

        const status = err.response?.status;
        const message =
          status === 404
            ? `Formulation ${sfgParam} was not found.`
            : status === 403
              ? `You do not have permission to view this formulation.`
              : err.response?.data?.message ??
                "Failed to load formulation. Please try again.";

        setLoadError(message);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadFormulation();

    return () => controller.abort();
  }, [sfgParam]);

  // ==========================================
  // DETECT CHANGES
  // ==========================================

  const isDirty = useMemo(() => {
    if (!originalData) return false;

    const currentParentCode = formData.parentCode.trim();
    const currentDescription = formData.description.trim();

    if (currentParentCode !== originalData.parentCode) return true;
    if (currentDescription !== originalData.description) return true;

    const currentMaterials = normalizeRawMaterials(
      rawMaterials.map((rm) => ({
        code: rm.code,
        description: rm.description,
        percentage: Number(rm.percentage || 0),
      }))
    );

    return (
      JSON.stringify(currentMaterials) !==
      JSON.stringify(originalData.rawMaterials)
    );
  }, [formData, rawMaterials, originalData]);

  // ==========================================
  // VALIDATION
  // ==========================================

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

  const canSave = validation.valid && !saving && !loading;

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    if (name === "sfg") return;

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
    setRawMaterials((previous) => [...previous, { ...INITIAL_RM }]);
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
      parentCode: formData.parentCode.trim(),
      description: formData.description.trim(),
      rawMaterials: rawMaterials.map((rm) => ({
        code: rm.code.trim().toUpperCase(),
        description: rm.description.trim(),
        percentage: Number(rm.percentage),
      })),
    };

    try {
      // 1️⃣ تحديث الـ Formulation
      await updateFormulation(formData.sfg, payload, normalizedType);

      // 2️⃣ لو فيه تغيير حقيقي → نحوّل الحالة لـ Modification
      if (isDirty) {
        try {
          await formulationsService.changeStatus(
            formData.sfg,
            "Modification"
          );
        } catch (statusError) {
          console.warn(
            "Failed to change status to Modification:",
            statusError
          );

          // مش هنفشل العملية كلها — التعديل نفسه نجح
          // بس هنبلّغ المستخدم
          showToast(
            "warning",
            "Formulation updated, but status could not be changed to Modification."
          );
        }
      }

      showToast("success", "Formulation updated successfully.");

      navigate(basePath, {
        replace: true,
        state: { refresh: Date.now() },
      });
    } catch (err) {
      console.error("Failed to update formulation:", err);

      const status = err.response?.status;
      const data = err.response?.data;

      const apiErrors = data?.errors
        ? Object.values(data.errors).flat().filter(Boolean)
        : [];

      let message;

      if (status === 404) {
        message = data?.message || "Formulation was not found.";
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
          `You do not have permission to edit ${normalizedType} formulations.`;
      } else {
        message =
          data?.message ||
          data?.title ||
          "Failed to update the formulation. Please try again.";
      }

      setServerError(message);
      showToast("error", message);
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          Loading formulation {sfgParam}...
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-6xl">
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {loadError}
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => navigate(basePath)}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Back to {normalizedType}
          </button>
        </div>
      </div>
    );
  }

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
        isEditMode
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
        isEditMode
      />
    </div>
  );
}

export default EditFormulation;