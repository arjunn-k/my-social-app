import { useEffect, useMemo, useState } from "react";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function ProfileHeader({
  profile,
  isOwnProfile,
  isFollowing,
  onProfileChange,
  onFollowStateChange
}) {
  const { refreshCurrentUser } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [formState, setFormState] = useState({
    displayName: profile.displayName || "",
    bio: profile.bio || "",
    username: profile.username || "",
    profilePicture: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const initials = useMemo(
    () => (profile.displayName || profile.username || "P").slice(0, 1).toUpperCase(),
    [profile.displayName, profile.username]
  );

  useEffect(() => {
    setFormState({
      displayName: profile.displayName || "",
      bio: profile.bio || "",
      username: profile.username || "",
      profilePicture: null
    });
  }, [profile.bio, profile.displayName, profile.username]);

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await api.delete(`/users/${profile._id}/follow`);
        onProfileChange({
          ...profile,
          followersCount: Math.max(0, profile.followersCount - 1)
        });
        onFollowStateChange(false);
      } else {
        await api.post(`/users/${profile._id}/follow`);
        onProfileChange({
          ...profile,
          followersCount: profile.followersCount + 1
        });
        onFollowStateChange(true);
      }
      await refreshCurrentUser();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update follow state");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("displayName", formState.displayName);
      formData.append("bio", formState.bio);
      formData.append("username", formState.username);
      if (formState.profilePicture) {
        formData.append("profilePicture", formState.profilePicture);
      }

      const { data } = await api.patch("/users/me", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      onProfileChange(data.user);
      await refreshCurrentUser();
      setEditing(false);
      if (isOwnProfile && data.user.username !== profile.username) {
        navigate(`/profile/${data.user.username}`, { replace: true });
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="glass-card overflow-hidden">
      <div className="bg-ink px-6 py-10 text-white">
        <p className="text-xs uppercase tracking-[0.35em] text-gold">Profile</p>
        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-4">
            {profile.profilePicture?.url ? (
              <img
                src={profile.profilePicture.url}
                alt={profile.username}
                className="h-20 w-20 rounded-3xl object-cover ring-4 ring-white/20"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-coral text-3xl font-bold">
                {initials}
              </div>
            )}

            <div>
              <h1 className="font-display text-4xl">
                {profile.displayName || profile.username}
              </h1>
              <p className="mt-1 text-sm text-white/70">@{profile.username}</p>
            </div>
          </div>

          <div className="flex gap-3">
            {isOwnProfile ? (
              <button
                type="button"
                onClick={() => setEditing((value) => !value)}
                className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white hover:text-ink"
              >
                {editing ? "Close editor" : "Edit profile"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFollow}
                className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white hover:text-ink"
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 px-6 py-6 md:grid-cols-[1.3fr_0.9fr]">
        <div>
          <p className="text-sm leading-7 text-slate">{profile.bio || "No bio added yet."}</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-sand p-4 text-center">
            <p className="text-2xl font-bold text-ink">{profile.postsCount}</p>
            <p className="text-xs uppercase tracking-[0.2em] text-slate">Posts</p>
          </div>
          <div className="rounded-2xl bg-sand p-4 text-center">
            <p className="text-2xl font-bold text-ink">{profile.followersCount}</p>
            <p className="text-xs uppercase tracking-[0.2em] text-slate">Followers</p>
          </div>
          <div className="rounded-2xl bg-sand p-4 text-center">
            <p className="text-2xl font-bold text-ink">{profile.followingCount}</p>
            <p className="text-xs uppercase tracking-[0.2em] text-slate">Following</p>
          </div>
        </div>
      </div>

      {editing && (
        <form onSubmit={handleSubmit} className="border-t border-black/5 px-6 py-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-slate">
              <span className="mb-2 block font-medium text-ink">Display name</span>
              <input
                className="input"
                value={formState.displayName}
                onChange={(event) =>
                  setFormState((state) => ({ ...state, displayName: event.target.value }))
                }
              />
            </label>
            <label className="text-sm text-slate">
              <span className="mb-2 block font-medium text-ink">Username</span>
              <input
                className="input"
                value={formState.username}
                onChange={(event) =>
                  setFormState((state) => ({ ...state, username: event.target.value.toLowerCase() }))
                }
              />
            </label>
          </div>

          <label className="mt-4 block text-sm text-slate">
            <span className="mb-2 block font-medium text-ink">Bio</span>
            <textarea
              className="input min-h-24 resize-none"
              value={formState.bio}
              onChange={(event) =>
                setFormState((state) => ({ ...state, bio: event.target.value }))
              }
            />
          </label>

          <label className="mt-4 block text-sm text-slate">
            <span className="mb-2 block font-medium text-ink">Profile picture</span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) =>
                setFormState((state) => ({
                  ...state,
                  profilePicture: event.target.files?.[0] || null
                }))
              }
            />
          </label>

          <button type="submit" disabled={loading} className="btn-primary mt-5">
            {loading ? "Saving..." : "Save profile"}
          </button>
        </form>
      )}

      {error && <p className="px-6 pb-6 text-sm text-coral">{error}</p>}
    </section>
  );
}

export default ProfileHeader;

