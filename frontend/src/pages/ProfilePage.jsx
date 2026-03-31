import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";
import PostCard from "../components/posts/PostCard";
import ProfileHeader from "../components/profile/ProfileHeader";
import useInfiniteScroll from "../hooks/useInfiniteScroll";
import { useAuth } from "../context/AuthContext";

function ProfilePage() {
  const { username } = useParams();
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProfileData = useCallback(
    async (nextPage = 1, replace = false) => {
      try {
        setLoading(true);
        const [profileResponse, postsResponse] = await Promise.all([
          api.get(`/users/${username}`),
          api.get(`/posts/user/${username}`, { params: { page: nextPage, limit: 6 } })
        ]);

        setProfile(profileResponse.data.user);
        setIsFollowing(profileResponse.data.isFollowing);
        const incomingPosts = postsResponse.data.posts;
        setPosts((existing) => (replace ? incomingPosts : [...existing, ...incomingPosts]));
        setHasMore(postsResponse.data.pagination.hasMore);
        setPage(nextPage);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Unable to load profile");
      } finally {
        setLoading(false);
      }
    },
    [username]
  );

  useEffect(() => {
    fetchProfileData(1, true);
  }, [fetchProfileData]);

  const sentinelRef = useInfiniteScroll({
    hasMore,
    loading,
    onLoadMore: () => fetchProfileData(page + 1)
  });

  const isOwnProfile = currentUser?.username === username;

  if (loading && !profile) {
    return <p className="text-sm text-slate">Loading profile...</p>;
  }

  if (!profile) {
    return <p className="text-sm text-coral">{error || "Profile not found"}</p>;
  }

  return (
    <div className="space-y-6">
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
        onProfileChange={setProfile}
        onFollowStateChange={setIsFollowing}
      />

      <section className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            currentUser={currentUser}
            onUpdatePost={(updatedPost) =>
              setPosts((existing) =>
                existing.map((item) => (item._id === updatedPost._id ? updatedPost : item))
              )
            }
            onDeletePost={(postId) =>
              setPosts((existing) => existing.filter((item) => item._id !== postId))
            }
          />
        ))}

        {loading && <p className="text-sm text-slate">Loading posts...</p>}
        {!loading && posts.length === 0 && (
          <div className="glass-card p-6 text-sm text-slate">No posts yet for this profile.</div>
        )}
        <div ref={sentinelRef} className="h-10" />
      </section>
    </div>
  );
}

export default ProfilePage;

