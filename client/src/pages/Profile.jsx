import React, { useState } from "react";
import { toast } from "react-toastify";

const Profile = ({ user, onUpdateUser }) => {
  const [formData, setFormData] = useState({
    username: user.username || "",
    email: user.email || "",
    age: user.age || "",
    height: user.height || "",
    weight: user.weight || "",
    goal: user.goal || "Maintain",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const userId = user.id || user._id;
      const res = await fetch(`http://localhost:5000/users/update/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: formData.email,
          age: Number(formData.age) || null,
          height: Number(formData.height) || null,
          weight: Number(formData.weight) || null,
          goal: formData.goal,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to update profile");

      onUpdateUser({
        id: data.user._id || data.user.id,
        username: data.user.username,
        email: data.user.email,
        age: data.user.age,
        height: data.user.height,
        weight: data.user.weight,
        goal: data.user.goal,
      });
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    }
  };

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-4 text-success">My Profile</h2>
      <div className="card shadow rounded-3 p-4">
        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Username</label>
            <input
              type="text"
              className="form-control"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Email</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Age */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Age</label>
            <input
              type="number"
              className="form-control"
              name="age"
              value={formData.age}
              onChange={handleChange}
            />
          </div>

          {/* Height */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Height (cm)</label>
            <input
              type="number"
              className="form-control"
              name="height"
              value={formData.height}
              onChange={handleChange}
            />
          </div>

          {/* Weight */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Weight (kg)</label>
            <input
              type="number"
              className="form-control"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
            />
          </div>

          {/* Goal */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Goal</label>
            <select
              className="form-select"
              name="goal"
              value={formData.goal}
              onChange={handleChange}
            >
              <option value="Maintain">Maintain Weight</option>
              <option value="Lose">Lose Weight</option>
              <option value="Gain">Gain Weight</option>
            </select>
          </div>

          <button type="submit" className="btn btn-success w-100">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
