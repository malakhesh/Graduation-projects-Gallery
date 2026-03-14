import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import "./uploadmodal.css";
import { FaGithub, FaImage, FaTag } from "react-icons/fa";
import { addProj } from "./projects.js";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase.js";

const TAGS = ["Business", "Education", "E-commerce", "Entertainment", "Blog"];
const CLOUDINARY_CLOUD = "df4nquqin";
const CLOUDINARY_PRESET = "snqtqhha";

function UploadModal({ onClose }) {
  const [user] = useAuthState(auth);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [github, setGithub] = useState("");
  const [tag, setTag] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef();

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
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    return data.secure_url;
  };

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Project name is required";
    if (!description.trim()) e.description = "Description is required";
    if (!github.trim()) e.github = "GitHub link is required";
    else if (!github.trim().startsWith("https://github.com/"))
      e.github = "Must be a valid GitHub link (https://github.com/...)";
    if (!tag) e.tag = "Please select a tag";
    if (!image) e.image = "Please add a project image";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSubmitting(true);

    try {
      const imgUrl = await uploadToCloudinary(image);
      const result = await addProj(
        name,
        description,
        user.uid,
        null,
        null,
        github,
        imgUrl,
        [tag]
      );

      if (result === "add-fail") {
        setErrors({ submit: "Something went wrong. Please try again." });
      } else {
        setSuccess(true);
        setTimeout(() => onClose(), 1500);
      }
    } catch {
      setErrors({ submit: "Image upload failed. Please try again." });
    }

    setSubmitting(false);
  };

  return createPortal(
    <div className="um-overlay" onClick={(e) => e.target.classList.contains("um-overlay") && onClose()}>
      <div className="um-modal">

        <div className="um-header">
          <h2 className="um-title">Upload Project</h2>
        </div>

        {success ? (
          <div className="um-body" style={{ alignItems: "center", justifyContent: "center", minHeight: 200 }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: "rgb(104, 68, 42)", textAlign: "center" }}>
              🎉 Project submitted for review!
            </p>
            <p style={{ fontSize: 13, color: "rgb(164, 132, 109)", textAlign: "center" }}>
              An admin will approve it shortly.
            </p>
          </div>
        ) : (
          <div className="um-body">

            <div className="um-field">
              <label className="um-label">Project Name <span className="um-required">*required</span></label>
              <input
                className={`um-input ${errors.name ? 'um-input-error' : ''}`}
                placeholder="e.g. AI Robotics Research"
                value={name}
                onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: null })); }}
              />
              {errors.name && <span className="um-error">{errors.name}</span>}
            </div>

            <div className="um-field">
              <label className="um-label">Description <span className="um-required">*required</span></label>
              <textarea
                className="um-textarea"
                placeholder="Tell us about your project..."
                value={description}
                onChange={e => { setDescription(e.target.value); setErrors(p => ({ ...p, description: null })); }}
                rows={4}
                maxLength={500}
              />
              <span className="um-char-count">{description.length}/500</span>
              {errors.description && <span className="um-error">{errors.description}</span>}
            </div>

            <div className="um-field">
              <label className="um-label"><FaGithub className="um-label-icon" /> GitHub Link <span className="um-required">*required</span></label>
              <input
                className={`um-input ${errors.github ? 'um-input-error' : ''}`}
                placeholder="https://github.com/username/repo"
                value={github}
                onChange={e => { setGithub(e.target.value); setErrors(p => ({ ...p, github: null })); }}
              />
              {errors.github && <span className="um-error">{errors.github}</span>}
            </div>

            <div className="um-field">
              <label className="um-label"><FaTag className="um-label-icon" /> Tag <span className="um-required">*required</span></label>
              <div className="um-tags">
                {TAGS.map(t => (
                  <button
                    key={t}
                    className={`um-tag-btn ${tag === t ? 'um-tag-selected' : ''}`}
                    onClick={() => { setTag(t); setErrors(p => ({ ...p, tag: null })); }}
                    type="button"
                  >
                    {t}
                  </button>
                ))}
              </div>
              {errors.tag && <span className="um-error">{errors.tag}</span>}
            </div>

            <div className="um-field">
              <label className="um-label"><FaImage className="um-label-icon" /> Project Image <span className="um-required">*required</span></label>
              <div
                className={`um-image-drop ${errors.image ? 'um-input-error' : ''}`}
                onClick={() => fileRef.current.click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="um-image-preview" />
                ) : (
                  <div className="um-image-placeholder">
                    <FaImage className="um-image-icon" />
                    <p>Click to upload an image</p>
                    <span>PNG, JPG up to 5MB</span>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImage} />
              {errors.image && <span className="um-error">{errors.image}</span>}
            </div>

            {errors.submit && (
              <p style={{ fontSize: 13, color: "#c0392b", textAlign: "center" }}>{errors.submit}</p>
            )}

          </div>
        )}

        <div className="um-footer">
          <button className="um-btn-cancel" onClick={onClose}>Cancel</button>
          {!success && (
            <button className="um-btn-upload" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Uploading..." : "Upload"}
            </button>
          )}
        </div>

      </div>
    </div>
  , document.body);
}

export default UploadModal;