"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingUser, setLoadingUser] = useState(null); // NEW
  const router = useRouter();

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin-users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // HANDLE VIEW WITH LOADING
  const handleView = (id) => {
    setLoadingUser(id);

    setTimeout(() => {
      router.push(`/admin/dashboard/users/${id}`);
    }, 300);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Users</h1>

      {loading ? (
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 text-sm">Loading...</p>
          </div>
        </div>
      ) : users.length === 0 ? (
        <p className="text-gray-400">No users found</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th>Email</th>
                <th>Subscription</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className={`border-t transition ${
                    loadingUser === user.id
                      ? "opacity-60 pointer-events-none"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <td className="p-3 font-medium">{user.name}</td>
                  <td>{user.email}</td>

                  <td>
                    {user.subscriptionId ? (
                      <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-500">
                        Free
                      </span>
                    )}
                  </td>

                  <td>
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "--"}
                  </td>

                  <td>
                    <button
                      onClick={() => handleView(user.id)}
                      disabled={loadingUser === user.id}
                      className="text-emerald-600 hover:underline"
                    >
                      {loadingUser === user.id ? "Opening..." : "View"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}