// --- Admins list ---
const ADMINS = [
  "TheChosenOne",
  "TheTanertantan",
  "thegramcracker",
  "TheUnc"
];

// --- One-time username popup ---
let username = localStorage.getItem("interstellar_username");
if (!username) {
  username = prompt("Enter your username (one-time):");
  if (!username || !username.trim()) {
    username = "guest";
  }
  localStorage.setItem("interstellar_username", username.trim());
}
username = username.trim();

// --- Blocked logic ---
function getBlockedUsers() {
  return JSON.parse(localStorage.getItem("interstellar_blocked_users") || "[]");
}
function setBlockedUsers(list) {
  localStorage.setItem("interstellar_blocked_users", JSON.stringify(list));
}
function isBlocked(username) {
  return getBlockedUsers().includes(username);
}
function blockUser(username) {
  const list = getBlockedUsers();
  if (!list.includes(username)) {
    list.push(username);
    setBlockedUsers(list);
  }
}
function updateBlockedList() {
  const list = getBlockedUsers();
  document.getElementById('blocked-list').innerHTML =
    list.length
      ? "Blocked users:<br>" + list.map(n => `<span>${n}</span>`).join(", ")
      : "No users blocked.";
}

// --- White screen for blocked users ---
if (isBlocked(username)) {
  document.body.innerHTML = ""; // Remove all content
  document.body.style.background = "#fff";
  const msg = document.createElement("div");
  msg.id = "blocked-message";
  msg.innerHTML = "<h2>You have been blocked.</h2><p>Access denied.</p>";
  document.body.appendChild(msg);
  msg.style.display = "block";
  throw new Error("Blocked"); // Stop further JS
}

// --- Admin Dot and Panel (visible to all, but only loads for admins) ---
document.getElementById('admin-dot').onclick = function() {
  const adminName = prompt("Enter admin name to verify:");
  if (ADMINS.includes(adminName)) {
    document.getElementById('admin-panel').style.display = 'block';
    document.getElementById('admin-name').textContent = adminName;
    // Only TheChosenOne can open the chosenone panel
    if (adminName === "TheChosenOne") {
      document.getElementById('open-chosenone').style.display = 'block';
    } else {
      document.getElementById('open-chosenone').style.display = 'none';
    }
    document.getElementById('close-admin-panel').onclick = function() {
      document.getElementById('admin-panel').style.display = 'none';
    };
    // TheChosenOne panel logic
    if (adminName === "TheChosenOne") {
      document.getElementById('open-chosenone').onclick = function() {
        document.getElementById('chosenone-panel').style.display = 'block';
        updateBlockedList();
      };
      document.getElementById('close-chosenone-panel').onclick = function() {
        document.getElementById('chosenone-panel').style.display = 'none';
      };
      document.getElementById('block-user-btn').onclick = function() {
        const name = document.getElementById('block-user-name').value.trim();
        if (!name) return alert("Enter a username.");
        blockUser(name);
        updateBlockedList();
        alert(`Blocked ${name}.`);
      };
    }
    document.getElementById('incorrect-admin').style.display = 'none';
  } else {
    document.getElementById('incorrect-admin').style.display = 'block';
    setTimeout(() => {
      document.getElementById('incorrect-admin').style.display = 'none';
    }, 2000);
  }
};
