import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    room: "",
  });

  const socket = useSocket();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    socket.emit("room:join", formData);
    setFormData({
      username: "",
      room: "",
    });
  };

  const handleJoin = useCallback((data) => {
    const { username, room } = data;
    navigate(`/screen/${room}`);
  }, [navigate]);

  useEffect(() => {
    socket.on("room:join", handleJoin);
    return () => {
      socket.off("room:join");
    };
  }, [socket, handleJoin]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-red-500 mb-8">Join</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-sm"
      >
        <div className="mb-4">
          <label
            htmlFor="username"
            className="block text-gray-700 font-bold mb-2"
          >
            Username:
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="room" className="block text-gray-700 font-bold mb-2">
            Room:
          </label>
          <input
            type="text"
            id="room"
            name="room"
            value={formData.room}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-700"
        >
          Join
        </button>
      </form>
    </div>
  );
};

export default Home;
