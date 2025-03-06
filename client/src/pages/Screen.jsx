import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import ReactPlayer from "react-player";
import peer from "../service/Peer";

const Screen = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const handleUserJoined = useCallback(({ username, id }) => {
    console.log("User joined", username, id);
    setRemoteSocketId(id);
  }, []);

  const handleCallUSer = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { offer, to: remoteSocketId });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({ offer, from }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setMyStream(stream);
      console.log("Incomming call", offer, from);
      const answer = await peer.getAnswer(offer);
      socket.emit("call:accepted", { answer, to: from });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ answer, from }) => {
      peer.setLocalDescription(answer);
      console.log("Call accepted", answer, from);
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoIncomming = useCallback(
    async ({ offer, from }) => {
      const answer = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { answer, to: from });
    },
    [socket]
  );

  const handleNegoFinal = useCallback(async ({ answer }) => {
    await peer.setLocalDescription(answer);
  }, []);

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);

    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  });

  useEffect(() => {
    peer.peer.addEventListener("track", (ev) => {
      const remoteStream = ev.streams;
      setRemoteStream(remoteStream[0]);
    });
  });

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoIncomming);
    socket.on("peer:nego:final", handleNegoFinal);
    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoIncomming);
      socket.off("peer:nego:final", handleNegoFinal);
    };
  }, [socket, handleUserJoined, handleCallAccepted, handleIncommingCall, handleNegoIncomming, handleNegoFinal]);

  return (
    <div>
      <h1>Room</h1>
      <h2>{remoteSocketId ? "Connected" : "No user Connected"}</h2>
      {myStream && <button onClick={sendStreams}>Send Stream</button>}
      {remoteSocketId && <button onClick={handleCallUSer}>Call</button>}
      <h1>My Stream</h1>
      {myStream && (
        <ReactPlayer height="300px" width="300px" url={myStream} playing />
      )}
      <h1>Remote Stream</h1>
      {remoteStream && (
        <ReactPlayer height="300px" width="300px" url={remoteStream} playing />
      )}
    </div>
  );
};

export default Screen;
