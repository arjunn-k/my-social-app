import { useEffect, useState } from "react";
import api from "../../api/client";

function CommentList({ postId, currentUsername, postAuthorUsername, onCommentCountChange }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const { data } = await api.get(`/comments/post/${postId}`);
        setComments(data.comments);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Unable to load comments");
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  const handleCreateComment = async (event) => {
    event.preventDefault();
    if (!content.trim()) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const { data } = await api.post("/comments", { postId, content });
      const nextComments = [data.comment, ...comments];
      setComments(nextComments);
      setContent("");
      onCommentCountChange(nextComments.length);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      const nextComments = comments.filter((comment) => comment._id !== commentId);
      setComments(nextComments);
      onCommentCountChange(nextComments.length);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to delete comment");
    }
  };

  return (
    <div className="mt-4 rounded-3xl bg-sand/70 p-4">
      <form onSubmit={handleCreateComment} className="mb-4 flex gap-3">
        <input
          className="input"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Add a thoughtful comment"
          maxLength={300}
        />
        <button type="submit" disabled={submitting} className="btn-primary shrink-0">
          Reply
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-slate">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-slate">No comments yet.</p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment._id} className="rounded-2xl bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {comment.author.displayName || comment.author.username}
                  </p>
                  <p className="text-xs text-slate">@{comment.author.username}</p>
                </div>
                {(comment.author.username === currentUsername ||
                  postAuthorUsername === currentUsername) && (
                  <button
                    type="button"
                    className="text-xs font-semibold uppercase tracking-[0.2em] text-coral"
                    onClick={() => handleDeleteComment(comment._id)}
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="mt-3 text-sm leading-6 text-ink">{comment.content}</p>
            </div>
          ))}
        </div>
      )}

      {error && <p className="mt-3 text-sm text-coral">{error}</p>}
    </div>
  );
}

export default CommentList;
