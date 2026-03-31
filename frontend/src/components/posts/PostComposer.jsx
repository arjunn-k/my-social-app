import { useState } from "react";
import api from "../../api/client";

function PostComposer({ onPostCreated }) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("content", content);
      if (image) {
        formData.append("image", image);
      }

      const { data } = await api.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setContent("");
      setImage(null);
      onPostCreated(data.post);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to create post");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl text-ink">Share an update</h2>
          <p className="text-sm text-slate">Text, image, or both. Keep it meaningful.</p>
        </div>
      </div>

      <textarea
        className="input min-h-28 resize-none"
        placeholder="What is worth sharing today?"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        maxLength={500}
      />

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="text-sm text-slate">
          <span className="mb-2 block font-medium text-ink">Attach image</span>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setImage(event.target.files?.[0] || null)}
            className="block w-full text-sm text-slate"
          />
        </label>

        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Posting..." : "Publish"}
        </button>
      </div>

      {image && <p className="mt-2 text-sm text-moss">Selected: {image.name}</p>}
      {error && <p className="mt-3 text-sm text-coral">{error}</p>}
    </form>
  );
}

export default PostComposer;

