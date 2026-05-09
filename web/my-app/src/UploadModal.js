import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./uploadmodal.css";
import { FaGithub, FaImage, FaChevronLeft, FaChevronRight, FaCheck } from "react-icons/fa";
import { addProj } from "./projects.js";
import { checkUploadEligibility, getSettings } from "./DashSettings.js";
import { getUser } from "./auth.js";
import { getUploadOptions } from "./configs.js";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase.js";

const CLOUDINARY_CLOUD = "df4nquqin";
const CLOUDINARY_PRESET = "snqtqhha";

const STEPS = ["Basics", "Details", "Media"];

function UploadModal({ onClose }) {
  const [user] = useAuthState(auth);
  const [step, setStep] = useState(0);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [github, setGithub] = useState("");
  const [tag, setTag] = useState("");
  const [category, setCategory] = useState("");
  const [techStack, setTechStack] = useState([]);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [autoApproved, setAutoApproved] = useState(false);
  const fileRef = useRef();

  const [uploadAllowed, setUploadAllowed] = useState(true);
  const [dailyLimitReached, setDailyLimitReached] = useState(false);
  const [dailyLimit, setDailyLimit] = useState(3);
  const [checkingSettings, setCheckingSettings] = useState(true);

  const [options, setOptions] = useState({ tags: [], categories: [], techStacks: [] });
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    if (!user) return;

    Promise.all([
      checkUploadEligibility(user.uid),
      getSettings(),
    ]).then(([eligibility, settings]) => {
      const limit = settings?.maxProjectsPerUserPerDay ?? 3;
      setDailyLimit(limit);

      if (eligibility === "uploads-closed") {
        setUploadAllowed(false);
      } else if (eligibility === "daily-limit-reached") {
        setDailyLimitReached(true);
      }

      setCheckingSettings(false);
    });
  }, [user]);

  useEffect(() => {
    getUploadOptions().then((data) => {
      if (data && data !== "get-options-fail") {
        setOptions({
          tags: data.tags || [],
          categories: data.categories || [],
          techStacks: data.techStacks || [],
        });
      }
      setLoadingOptions(false);
    });
  }, []);

  const toggleTech = (tech) => {
    setTechStack((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
    setErrors((p) => ({ ...p, techStack: null }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_PRESET);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
      { method: "POST", body: formData }
    );
    const data = await res.json();
    return data.secure_url;
  };

  const validateStep = (s) => {
    const e = {};
    if (s === 0) {
      if (!name.trim()) e.name = "Project name is required";
      if (!description.trim()) e.description = "Description is required";
      if (!github.trim()) e.github = "GitHub link is required";
      else if (!github.trim().startsWith("https://github.com/"))
        e.github = "Must start with https://github.com/";
    }
    if (s === 1) {
      if (!tag) e.tag = "Please select a tag";
      if (!category) e.category = "Please select a category";
      if (techStack.length === 0) e.techStack = "Select at least one technology";
    }
    if (s === 2) {
      if (!image) e.image = "Please add a project image";
    }
    return e;
  };

  const handleNext = () => {
    const e = validateStep(step);
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setErrors({});
    setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    const e = validateStep(2);
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSubmitting(true);
    try {
      const imgUrl = await uploadToCloudinary(image);
      const userData = await getUser(user.uid);
      const year = userData?.year ?? null;

      const result = await addProj(
        name, description, user.uid, year, techStack, category, github, imgUrl, [tag]
      );

      if (result === "daily-limit-reached") {
        setDailyLimitReached(true);
      } else if (result === "uploads-closed") {
        setUploadAllowed(false);
      } else if (result === "add-fail") {
        setErrors({ submit: "Something went wrong. Please try again." });
      } else {
        setAutoApproved(result.status === "approved");
        setSuccess(true);
        setTimeout(() => onClose(), 2000);
      }
    } catch {
      setErrors({ submit: "Upload failed. Please try again." });
    }
    setSubmitting(false);
  };

  const showDailyLimit    = !checkingSettings && uploadAllowed && dailyLimitReached && !success;
  const showUploadsClosed = !checkingSettings && !uploadAllowed && !success;

  return createPortal(
    <div
      className="um-overlay"
      onClick={(e) => e.target.classList.contains("um-overlay") && onClose()}
    >
      <div className="um-modal">

        <div className="um-header">
          <h2 className="um-title">Upload Project</h2>
          <div className="um-stepper">
            {STEPS.map((s, i) => (
              <React.Fragment key={s}>
                <div className="um-stepper-item">
                  <div className={`um-stepper-dot ${i === step ? "active" : ""} ${i < step ? "done" : ""}`}>
                    {i < step ? <FaCheck size={8} /> : i + 1}
                  </div>
                  <span className={`um-stepper-label ${i === step ? "active" : ""} ${i < step ? "done" : ""}`}>
                    {s}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`um-stepper-line ${i < step ? "done" : ""}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="um-body">
          {checkingSettings ? (
            <div className="um-options-loading">
              <div className="um-spinner" />
              <span>Loading...</span>
            </div>

          ) : showUploadsClosed ? (
            <div className="um-success">
              <div className="um-success-icon" style={{ backgroundColor: "#c0392b" }}>✕</div>
              <p className="um-success-title">Uploads are closed</p>
              <p className="um-success-sub">
                Project submissions are currently disabled. Please check back later.
              </p>
            </div>

          ) : showDailyLimit ? (
            <div className="um-success">
              <div className="um-success-icon" style={{ backgroundColor: "#e67e22" }}>🚫</div>
              <p className="um-success-title">Daily limit reached</p>
              <p className="um-success-sub">
                You've submitted {dailyLimit} project{dailyLimit !== 1 ? "s" : ""} today —
                that's your daily maximum. Come back tomorrow to upload more!
              </p>
            </div>

          ) : success ? (
            <div className="um-success">
              <div className="um-success-icon">✓</div>
              <p className="um-success-title">Project submitted!</p>
              <p className="um-success-sub">
                {autoApproved
                  ? "Your project is now live."
                  : "An admin will review it shortly."}
              </p>
            </div>

          ) : (
            <>
              {step === 0 && (
                <div className="um-step-content">
                  <div className="um-field">
                    <label className="um-label">Project Name <span className="um-req">*</span></label>
                    <input
                      className={`um-input ${errors.name ? "um-input-error" : ""}`}
                      placeholder="e.g. AI Robotics Research"
                      value={name}
                      onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: null })); }}
                    />
                    {errors.name && <span className="um-error">{errors.name}</span>}
                  </div>

                  <div className="um-field">
                    <label className="um-label">Description <span className="um-req">*</span></label>
                    <textarea
                      className={`um-textarea ${errors.description ? "um-input-error" : ""}`}
                      placeholder="Tell us about your project..."
                      value={description}
                      onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: null })); }}
                      rows={5}
                      maxLength={500}
                    />
                    <span className="um-char-count">{description.length}/500</span>
                    {errors.description && <span className="um-error">{errors.description}</span>}
                  </div>

                  <div className="um-field">
                    <label className="um-label">
                      <FaGithub className="um-icon" /> GitHub Link <span className="um-req">*</span>
                    </label>
                    <input
                      className={`um-input ${errors.github ? "um-input-error" : ""}`}
                      placeholder="https://github.com/username/repo"
                      value={github}
                      onChange={(e) => { setGithub(e.target.value); setErrors((p) => ({ ...p, github: null })); }}
                    />
                    {errors.github && <span className="um-error">{errors.github}</span>}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="um-step-content">
                  {loadingOptions ? (
                    <div className="um-options-loading">
                      <div className="um-spinner" />
                      <span>Loading options...</span>
                    </div>
                  ) : (
                    <>
                      <div className="um-field">
                        <label className="um-label">Tag <span className="um-req">*</span></label>
                        <div className="um-chips">
                          {options.tags.map((t) => (
                            <button key={t} type="button"
                              className={`um-chip ${tag === t ? "um-chip-active" : ""}`}
                              onClick={() => { setTag(t); setErrors((p) => ({ ...p, tag: null })); }}
                            >{t}</button>
                          ))}
                        </div>
                        {errors.tag && <span className="um-error">{errors.tag}</span>}
                      </div>

                      <div className="um-field">
                        <label className="um-label">Category <span className="um-req">*</span></label>
                        <div className="um-chips">
                          {options.categories.map((c) => (
                            <button key={c} type="button"
                              className={`um-chip ${category === c ? "um-chip-active" : ""}`}
                              onClick={() => { setCategory(c); setErrors((p) => ({ ...p, category: null })); }}
                            >{c}</button>
                          ))}
                        </div>
                        {errors.category && <span className="um-error">{errors.category}</span>}
                      </div>

                      <div className="um-field">
                        <label className="um-label">
                          Tech Stack <span className="um-req">*</span>
                          {techStack.length > 0 && (
                            <span className="um-count">{techStack.length} selected</span>
                          )}
                        </label>
                        <div className="um-chips">
                          {options.techStacks.map((tech) => (
                            <button key={tech} type="button"
                              className={`um-chip um-chip-sm ${techStack.includes(tech) ? "um-chip-active" : ""}`}
                              onClick={() => toggleTech(tech)}
                            >{tech}</button>
                          ))}
                        </div>
                        {errors.techStack && <span className="um-error">{errors.techStack}</span>}
                      </div>
                    </>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="um-step-content">
                  <div className="um-field">
                    <label className="um-label">
                      <FaImage className="um-icon" /> Project Image <span className="um-req">*</span>
                    </label>
                    <div
                      className={`um-dropzone ${errors.image ? "um-input-error" : ""}`}
                      onClick={() => fileRef.current.click()}
                    >
                      {imagePreview ? (
                        <>
                          <img src={imagePreview} alt="Preview" className="um-preview-img" />
                          <div className="um-preview-overlay">Click to change</div>
                        </>
                      ) : (
                        <div className="um-dropzone-inner">
                          <div className="um-dropzone-icon"><FaImage /></div>
                          <p className="um-dropzone-text">Click to upload image</p>
                          <span className="um-dropzone-hint">PNG, JPG up to 5MB</span>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleImage}
                    />
                    {errors.image && <span className="um-error">{errors.image}</span>}
                  </div>

                  <div className="um-summary">
                    <p className="um-summary-title">Summary</p>
                    <div className="um-summary-row"><span>Name</span><span>{name}</span></div>
                    <div className="um-summary-row"><span>GitHub</span><span className="um-summary-link">{github}</span></div>
                    <div className="um-summary-row"><span>Tag</span><span>{tag}</span></div>
                    <div className="um-summary-row"><span>Category</span><span>{category}</span></div>
                    <div className="um-summary-row"><span>Stack</span><span>{techStack.join(", ")}</span></div>
                  </div>

                  {errors.submit && <p className="um-submit-error">{errors.submit}</p>}
                </div>
              )}
            </>
          )}
        </div>

        {!checkingSettings && uploadAllowed && !dailyLimitReached && !success && (
          <div className="um-footer">
            {step > 0 ? (
              <button className="um-btn-back" onClick={handleBack}>
                <FaChevronLeft size={12} /> Back
              </button>
            ) : (
              <button className="um-btn-cancel" onClick={onClose}>Cancel</button>
            )}
            {step < 2 ? (
              <button
                className="um-btn-next"
                onClick={handleNext}
                disabled={step === 1 && loadingOptions}
              >
                Next <FaChevronRight size={12} />
              </button>
            ) : (
              <button className="um-btn-submit" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Uploading..." : "Submit Project"}
              </button>
            )}
          </div>
        )}

        {!checkingSettings && (showDailyLimit || showUploadsClosed) && (
          <div className="um-footer">
            <button className="um-btn-cancel" onClick={onClose}>Close</button>
          </div>
        )}

      </div>
    </div>,
    document.body
  );
}

export default UploadModal;