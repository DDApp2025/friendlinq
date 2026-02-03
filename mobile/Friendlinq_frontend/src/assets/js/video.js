// DOM elements.
var roomSelectionContainer,
  roomInput,
  connectButton,
  videoChatContainer,
  localVideoComponent,
  remoteVideoComponent,
  rloaderComponent,
  closeComponent = null;

roomSelectionContainer = document.getElementById("video-chat-container");
roomInput = document.getElementById("room-input");
connectButton = document.getElementById("connect-button");

videoChatContainer = document.getElementById("video-chat-container");
localVideoComponent = document.getElementById("local-video");
remoteVideoComponent = document.getElementById("remote-video");
rloaderComponent = document.getElementById("loader");
closeComponent = document.getElementById("Disconnect");

// Variables.
//live
var socket = io("https://rearguardwebsocket.devdevelopment.net/");
//local
// var socket = io("http://localhost:3000/");
var mediaConstraints = {
  audio: true,
  video: { width: 1280, height: 720 },
};
var localStream;
var remoteStream;
var isRoomCreator;
var rtcPeerConnection; // Connection between the local device and the remote peer.
var roomId;

// Free public STUN servers provided by Google.
var iceServers = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
  ],
};

closeComponent.addEventListener("click", () => {
  socket.emit("call-disconnect", roomId);
  //roomId = null;
  localStream.getVideoTracks()[0].stop();
  localStream.getAudioTracks()[0].stop();
  remoteVideoComponent.src = "";
  localVideoComponent.src = "";
  rtcPeerConnection.close();
  rtcPeerConnection.onicecandidate = null;
  rtcPeerConnection.onaddstream = null;
  localStream = null;
  remoteStream = null;
  var url = window.location.origin;
  window.location.href = url;
});

videoChatContainer.addEventListener("load", createRoom());

// SOCKET EVENT CALLBACKS =====================================================
socket.on("room_created", async (data) => {
  console.log("Socket event callback: room_created");
  await setLocalStream(mediaConstraints);
  isRoomCreator = true;
});

socket.on("room_joined", async () => {
  console.log("Socket event callback: room_joined");

  await setLocalStream(mediaConstraints);
  socket.emit("start_call", roomId);
});

socket.on("call-disconnected", async (data) => {
  console.log("Socket event disconnectd: room_created", data);

  if (roomId === data) {
    localStream.getVideoTracks()[0].stop();
    localStream.getAudioTracks()[0].stop();
    remoteVideoComponent.src = "";
    localVideoComponent.src = "";
    rtcPeerConnection.close();
    rtcPeerConnection.onicecandidate = null;
    rtcPeerConnection.onaddstream = null;
    localStream = null;
    remoteStream = null;
    var url = window.location.origin;
    window.location.href = url;
  }
});

socket.on("full_room", () => {
  console.log("Socket event callback: full_room");
});

socket.on("start_call", async () => {
  console.log("Socket event callback: start_call");

  if (isRoomCreator) {
    rtcPeerConnection = new RTCPeerConnection(iceServers);
    addLocalTracks(rtcPeerConnection);
    rtcPeerConnection.ontrack = setRemoteStream;
    rtcPeerConnection.onicecandidate = sendIceCandidate;
    await createOffer(rtcPeerConnection);
  }
});

socket.on("webrtc_offer", async (event) => {
  console.log("Socket event callback: webrtc_offer");

  if (!isRoomCreator) {
    rtcPeerConnection = new RTCPeerConnection(iceServers);
    addLocalTracks(rtcPeerConnection);
    rtcPeerConnection.ontrack = setRemoteStream;
    rtcPeerConnection.onicecandidate = sendIceCandidate;
    rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event));
    await createAnswer(rtcPeerConnection);
  }
});

socket.on("webrtc_answer", (event) => {
  console.log("Socket event callback: webrtc_answer");

  rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event));
});

socket.on("webrtc_ice_candidate", (event) => {
  console.log("Socket event callback: webrtc_ice_candidate");

  // ICE candidate configuration.
  var candidate = new RTCIceCandidate({
    sdpMLineIndex: event.label,
    candidate: event.candidate,
  });

  rtcPeerConnection.addIceCandidate(candidate);
});

function createRoom() {
  var userId = localStorage.getItem("callingUserId");
  roomId = userId;
  if (userId == null) {
    joinRoom(JSON.parse(sessionStorage.getItem("loggedInUser"))._id);
  } else {
    socket.emit("join", userId);
    showVideoConference();
  }
}
function createDuplicateRoom() {
  let r = Math.random().toString(36).substring(7);
  var userId = localStorage.getItem("callingUserId");
  roomId = userId + r;
  if (userId == null) {
    joinRoom(JSON.parse(sessionStorage.getItem("loggedInUser"))._id);
  } else {
    socket.emit("join", userId);

    showVideoConference();
  }
}
// FUNCTIONS ==================================================================
function joinRoom(room) {
  if (room === "") {
    alert("Please type a room ID");
  } else {
    roomId = room;
    socket.emit("join", room);
    showVideoConference();
  }
}

function showVideoConference() {
  roomSelectionContainer.style = "display: none";
  videoChatContainer.style = "display: block";
}

async function setLocalStream(mediaConstraints) {
  var stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
  } catch (error) {
    console.error("Could not get user media", error);
  }

  localStream = stream;
  localVideoComponent.srcObject = stream;
}

function addLocalTracks(rtcPeerConnection) {
  localStream.getTracks().forEach((track) => {
    rtcPeerConnection.addTrack(track, localStream);
  });
}

async function createOffer(rtcPeerConnection) {
  var sessionDescription;
  try {
    sessionDescription = await rtcPeerConnection.createOffer();
    rtcPeerConnection.setLocalDescription(sessionDescription);
  } catch (error) {
    console.error(error);
  }

  socket.emit("webrtc_offer", {
    type: "webrtc_offer",
    sdp: sessionDescription,
    roomId,
  });
}

async function createAnswer(rtcPeerConnection) {
  var sessionDescription;
  try {
    sessionDescription = await rtcPeerConnection.createAnswer();
    rtcPeerConnection.setLocalDescription(sessionDescription);
  } catch (error) {
    console.error(error);
  }

  socket.emit("webrtc_answer", {
    type: "webrtc_answer",
    sdp: sessionDescription,
    roomId,
  });
  rloaderComponent.style.display = "none";
}

function setRemoteStream(event) {
  remoteVideoComponent.srcObject = event.streams[0];
  remoteStream = event.stream;
}

function sendIceCandidate(event) {
  if (event.candidate) {
    socket.emit("webrtc_ice_candidate", {
      roomId,
      label: event.candidate.sdpMLineIndex,
      candidate: event.candidate.candidate,
    });
  }
}
