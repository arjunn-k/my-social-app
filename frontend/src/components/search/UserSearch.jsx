import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";

function UserSearch() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!query.trim()) {
        setUsers([]);
        return;
      }

      setLoading(true);
      try {
        const { data } = await api.get("/users/search", {
          params: { q: query, limit: 5 }
        });
        setUsers(data.users);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <section className="glass-card p-5">
      <h2 className="font-display text-2xl text-ink">Find people</h2>
      <p className="mt-1 text-sm text-slate">Search by username or display name.</p>

      <input
        className="input mt-4"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search users"
      />

      <div className="mt-4 space-y-3">
        {loading && <p className="text-sm text-slate">Searching...</p>}
        {!loading &&
          users.map((user) => (
            <Link
              key={user._id}
              to={`/profile/${user.username}`}
              className="block rounded-2xl bg-sand p-4 transition hover:bg-gold/20"
            >
              <p className="font-semibold text-ink">{user.displayName || user.username}</p>
              <p className="text-sm text-slate">@{user.username}</p>
            </Link>
          ))}
      </div>
    </section>
  );
}

export default UserSearch;

