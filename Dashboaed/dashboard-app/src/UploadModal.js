import React, { useState, useRef } from "react";
import "./uploadmodal.css";
import { FaGithub, FaImage, FaTag } from "react-icons/fa";

const TAGS = ["Business", "Education", "E-commerce", "Entertainment", "Blog"];

function UploadModal({ onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [github, setGithub] = useState("");
  const [tag, setTag] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef();

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Project name is required";
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
    await onSubmit({ name, description, github, tag, image });
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="um-overlay" onClick={(e) => e.target.classList.contains("um-overlay") && onClose()}>
      <div className="um-modal">

        <div className="um-header">
          <h2 className="um-title">Upload Project</h2>
        </div>

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
              onChange={e => setDescription(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <span className="um-char-count">{description.length}/500</span>
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

        </div>

        <div className="um-footer">
          <button className="um-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="um-btn-upload" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Uploading..." : "Upload"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default UploadModal;