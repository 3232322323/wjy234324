// --- Admins list ---
const ADMINS = [
  "TheChosenOne",
  "TheTanertantan",
  "thegramcracker",
  "TheUnc"
];

// --- Name prompt overlay logic ---
function showNameOverlay() {
  document.getElementById("name-overlay").style.display = "flex";
  document.getElementById("user-name-input").focus();
}
function hideNameOverlay() {
  document.getElementById("name-overlay").style.display = "none";
}
function getAllUsers() {
  return JSON.parse(localStorage.getItem("void_all_users") || "[]");
}
function addUser(name) {
  let users = getAllUsers();
  if (!users.includes(name)) {
    users.push(name);
    localStorage.setItem("void_all_users", JSON.stringify(users));
  }
}
function getUserName() {
  return localStorage.getItem("void_username");
}
function setUserName(name) {
  localStorage.setItem("void_username", name);
  addUser(name);
}

// --- Blocked logic with custom message ---
function getBlockedUsers() {
  return JSON.parse(localStorage.getItem("void_blocked_users") || "[]");
}
function setBlockedUsers(list) {
  localStorage.setItem("void_blocked_users", JSON.stringify(list));
}
function isBlocked(username) {
  return getBlockedUsers().includes(username);
}
function blockUser(username, message) {
  const list = getBlockedUsers();
  if (!list.includes(username)) {
    list.push(username);
    setBlockedUsers(list);
  }
  if (message) setBlockMessage(username, message);
}
function unblockUser(username) {
  let list = getBlockedUsers();
  list = list.filter(u => u !== username);
  setBlockedUsers(list);
  removeBlockMessage(username);
}
function setBlockMessage(username, message) {
  let messages = JSON.parse(localStorage.getItem("void_blocked_messages") || "{}");
  messages[username] = message;
  localStorage.setItem("void_blocked_messages", JSON.stringify(messages));
}
function getBlockMessage(username) {
  let messages = JSON.parse(localStorage.getItem("void_blocked_messages") || "{}");
  return messages[username] || "Access denied.";
}
function removeBlockMessage(username) {
  let messages = JSON.parse(localStorage.getItem("void_blocked_messages") || "{}");
  delete messages[username];
  localStorage.setItem("void_blocked_messages", JSON.stringify(messages));
}

// --- Troll message logic ---
function setTrollMessage(username, message) {
  let trolls = JSON.parse(localStorage.getItem("void_troll_messages") || "{}");
  trolls[username] = message;
  localStorage.setItem("void_troll_messages", JSON.stringify(trolls));
}
function getTrollMessage(username) {
  let trolls = JSON.parse(localStorage.getItem("void_troll_messages") || "{}");
  return trolls[username];
}
function removeTrollMessage(username) {
  let trolls = JSON.parse(localStorage.getItem("void_troll_messages") || "{}");
  delete trolls[username];
  localStorage.setItem("void_troll_messages", JSON.stringify(trolls));
}

// --- Show overlays if needed ---
function checkBlocked() {
  const username = getUserName();
  if (username && isBlocked(username)) {
    // Show only a white screen with a black message
    document.body.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;height:100vh;width:100vw;background:#fff;">
        <div style="text-align:center;">
          <div style="font-family:'Orbitron',sans-serif;font-size:2.2rem;color:#ff2222;font-weight:bold;margin-bottom:18px;">Access Blocked</div>
          <div style="font-family:'Orbitron',sans-serif;font-size:1.2rem;color:#111;">${getBlockMessage(username)}</div>
        </div>
      </div>
    `;
    document.body.style.background = "#fff";
    document.body.style.overflow = "hidden";
    throw new Error("Blocked");
  }
}
function checkTroll() {
  const username = getUserName();
  const msg = getTrollMessage(username);
  if (msg) {
    alert(msg);
    removeTrollMessage(username);
  }
}

// --- On page load ---
window.addEventListener("DOMContentLoaded", function () {
  // Name prompt
  let username = getUserName();
  if (!username) {
    showNameOverlay();
  } else {
    addUser(username);
    checkBlocked();
    checkTroll();
  }

  // Name overlay confirm
  document.getElementById("user-name-confirm").onclick = function () {
    const name = document.getElementById("user-name-input").value.trim();
    if (!name) return alert("Please enter your name.");
    setUserName(name);
    hideNameOverlay();
    checkBlocked();
    checkTroll();
    // Update admin panel if open
    if (document.getElementById("admin-panel").style.display === "flex") {
      renderAdminUsersList();
    }
  };
  document.getElementById("user-name-input").addEventListener("keydown", function (e) {
    if (e.key === "Enter") document.getElementById("user-name-confirm").click();
  });

  // Admin dot click
  document.getElementById("admin-dot").onclick = function () {
    document.getElementById("admin-verify").style.display = "flex";
    document.getElementById("admin-name-input").focus();
    document.getElementById("admin-verify-log").textContent = "";
  };

  // Admin verify
  document.getElementById("admin-verify-btn").onclick = function () {
    const adminName = document.getElementById("admin-name-input").value.trim();
    if (ADMINS.includes(adminName)) {
      document.getElementById("admin-verify").style.display = "none";
      openAdminPanel(adminName);
    } else {
      document.getElementById("admin-verify-log").textContent = "Incorrect admin name.";
    }
  };
  document.getElementById("admin-name-input").addEventListener("keydown", function (e) {
    if (e.key === "Enter") document.getElementById("admin-verify-btn").click();
  });
  document.getElementById("close-admin-verify").onclick = function () {
    document.getElementById("admin-verify").style.display = "none";
  };

  // Admin panel close
  document.getElementById("close-admin-btn").onclick = function () {
    document.getElementById("admin-panel").style.display = "none";
  };
});

// --- Admin Panel Logic ---
function openAdminPanel(adminName) {
  document.getElementById("admin-panel").style.display = "flex";
  renderAdminUsersList(adminName);

  // Send troll message
  document.getElementById("send-troll-btn").onclick = function () {
    const user = document.getElementById("troll-user-input").value.trim();
    const msg = document.getElementById("troll-message-input").value.trim();
    if (!user || !msg) return alert("Enter a user and a message.");
    setTrollMessage(user, msg);
    document.getElementById("admin-panel-log").textContent = `Troll message sent to ${user}.`;
    setTimeout(() => document.getElementById("admin-panel-log").textContent = "", 2000);
  };
}

// --- Render users for block/unblock ---
function renderAdminUsersList(adminName) {
  const users = getAllUsers();
  const blocked = getBlockedUsers();
  const messages = JSON.parse(localStorage.getItem("void_blocked_messages") || "{}");
  const listDiv = document.getElementById("admin-users-list");
  listDiv.innerHTML = "";
  if (!users.length) {
    listDiv.innerHTML = "<div class='no-users'>No users yet.</div>";
    return;
  }
  users.forEach(user => {
    const isBlockedUser = blocked.includes(user);
    const row = document.createElement("div");
    row.className = "user-row";
    // Admins can't block/unblock themselves or other admins
    let controls = "";
    if (!ADMINS.includes(user)) {
      controls = `
        <input type="text" placeholder="Block message" value="${messages[user] ? messages[user] : ""}" id="msg-${user}">
        <span class="status ${isBlockedUser ? "blocked" : "unblocked"}">${isBlockedUser ? "Blocked" : "Unblocked"}</span>
        <button class="${isBlockedUser ? "unblock-btn" : "block-btn"}">${isBlockedUser ? "Unblock" : "Block"}</button>
      `;
    } else {
      controls = `<span style="margin-left:10px;color:#888;font-size:1em;">(admin)</span>`;
    }
    row.innerHTML = `
      <span class="username">${user}</span>
      ${controls}
    `;
    // Block/Unblock button
    if (!ADMINS.includes(user)) {
      row.querySelector("button").onclick = () => {
        if (isBlockedUser) {
          unblockUser(user);
        } else {
          const msg = row.querySelector(`#msg-${user}`).value || "Access denied.";
          blockUser(user, msg);
        }
        renderAdminUsersList(adminName);
      };
    }
    listDiv.appendChild(row);
  });
}
