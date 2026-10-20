import React, { useEffect, useState } from "react";

import AdminMenu from "./AdminMenu";
import axios from "axios";
import { toast } from "react-toastify";

const Users = () => {
  const [users, setUsers] = useState([]);

  // ব্যাকএন্ড থেকে সব ইউজার ডাটা নিয়ে আসার ফাংশন
  const getAllUsers = async () => {
    try {
      // VPS-এ দিলে এই URL আপনার ডোমেইন বা এনভায়রনমেন্ট ভ্যারিয়েবল থেকে আসবে
      const { data } = await axios.get("/api/v1/auth/all-users");
      if (data?.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong while fetching users");
    }
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  return (
    <>
      <div className="container dashboard-grid">
       
        <div className="content-area">
          <h1 className="page-title">All Registered Users ({users.length})</h1>

          <div className="table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((u, index) => (
                  <tr key={u._id}>
                    <td>{index + 1}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.phone}</td>
                    <td>
                      <span
                        className={`badge ${u.role === 1 ? "bg-admin" : "bg-user"}`}
                      >
                        {u.role === 1 ? "Admin" : "User"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-edit"
                        style={{
                          padding: "5px 10px",
                          fontSize: "12px",
                          background: "#333",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          (window.location.href = `mailto:${u.email}`)
                        }
                      >
                        Message
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default Users;
