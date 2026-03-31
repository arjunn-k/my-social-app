import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import CommentList from "./CommentList";

function PostCard({ post, currentUser, onUpdatePost, onDeletePost }) {
  const [showComments, setShowComments] = useState(false);
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(post.content);
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isOwner = currentUser?._id === post.author._id || currentUser?.id === post.author._id;

  useEffect(() => {
    setContent(post.content);
  }, [post.content]);

  const handleLike = async () => {
    try {
      const { data } = await api.post(`/posts/${post._id}/like`);
      onUpdatePost(data.post);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update like");
    }
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("content", content);
      if (image) {
        formData.append("image", image);
      }

      const { data } = await api.patch(`/posts/${post._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      onUpdatePost(data.post);
      setEditing(false);
      setImage(null);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update post");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/posts/${post._id}`);
      onDeletePost(post._id);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to delete post");
    }
  };

  return (
    <article className="glass-card overflow-hidden p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link to={`/profile/${post.author.username}`} className="text-lg font-semibold text-ink">
            {post.author.displayName || post.author.username}
          </Link>
          <p className="text-xs uppercase tracking-[0.25em] text-slate">
            @{post.author.username}
          </p>
        </div>

        {isOwner && (
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-secondary py-2"
              onClick={() => setEditing((value) => !value)}
            >
              {editing ? "Cancel" : "Edit"}
            </button>
            <button type="button" className="btn-secondary py-2" onClick={handleDelete}>
              Delete
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleUpdate} className="mt-4 space-y-3">
          <textarea
            className="input min-h-28 resize-none"
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setImage(event.target.files?.[0] || null)}
          />
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? "Saving..." : "Save changes"}
          </button>
        </form>
      ) : (
        <>
          {post.content && <p className="mt-4 text-sm leading-7 text-ink">{post.content}</p>}
          {post.image?.url && (
            <img
              src={post.image.url}
              alt="Post attachment"
              className="mt-4 max-h-[28rem] w-full rounded-3xl object-cover"
            />
          )}
        </>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
        <button type="button" onClick={handleLike} className="btn-secondary py-2">
          {post.isLiked ? "Unlike" : "Like"} ({post.likesCount})
        </button>
        <button
          type="button"
          onClick={() => setShowComments((value) => !value)}
          className="btn-secondary py-2"
        >
          Comments ({post.commentsCount})
        </button>
      </div>

      {showComments && (
        <CommentList
          postId={post._id}
          currentUsername={currentUser?.username}
          postAuthorUsername={post.author.username}
          onCommentCountChange={(count) => onUpdatePost({ ...post, commentsCount: count })}
        />
      )}

      {error && <p className="mt-3 text-sm text-coral">{error}</p>}
    </article>
  );
}

export default PostCard;

