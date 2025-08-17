// --- Firebase config ---
const firebaseConfig = {
  apiKey: "AIzaSyClWdKLkHuztjNXvuKpKj_gU__aTE5t0tM",
  authDomain: "void-4a875.firebaseapp.com",
  databaseURL: "https://void-4a875-default-rtdb.firebaseio.com",
  projectId: "void-4a875",
  storageBucket: "void-4a875.appspot.com",
  messagingSenderId: "926820312943",
  appId: "1:926820312943:web:0f03e8c795b4ea84bb6a9a",
  measurementId: "G-W8JBNNFQ0J"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// --- Admins list ---
const ADMINS = [
  "TheChosenOne",
  "TheTanertantan",
  "thegramcracker",
  "TheUnc"
];

// --- Admin powers logic ---
function setAdminPower(admin, hasPower) {
  db.ref('adminPowers/' + admin).set(hasPower);
}
function getAdminPower(admin, callback) {
  db.ref('adminPowers/' + admin).once('value', snap => {
    callback(snap.val() !== false); // default true
  });
}

// --- Name prompt overlay logic ---
function showNameOverlay() {
  document.getElementById("name-overlay").style.display = "flex";
  document.getElementById("user-name-input").focus();
}
function hideNameOverlay() {
  document.getElementById("name-overlay").style.display = "none";
}
function getUserName() {
  return localStorage.getItem("void_username");
}
function setUserName(name) {
  localStorage.setItem("void_username", name);
  addUserToDB(name);
}
function addUserToDB(username) {
  db.ref('users/' + username).set({
    blocked: false,
    message: ""
  });
}

// --- Blocked logic with custom message ---
function blockUserInDB(username, message) {
  db.ref('users/' + username).update({
    blocked: true,
    message: message
  });
}
function unblockUserInDB(username) {
  db.ref('users/' + username).update({
    blocked: false,
    message: ""
  });
}

// --- Troll message logic ---
function setTrollMessage(username, message) {
  db.ref('trolls/' + username).set(message);
}
function removeTrollMessage(username) {
  db.ref('trolls/' + username).remove();
}

// --- Listen for block status and troll messages ---
function listenForBlockStatus(username) {
  db.ref('users/' + username).on('value', (snapshot) => {
    const data = snapshot.val();
    if (data && data.blocked) {
      document.body.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;height:100vh;width:100vw;background:#fff;">
          <div style="text-align:center;">
            <div style="font-family:'Orbitron',sans-serif;font-size:2.2rem;color:#ff2222;font-weight:bold;margin-bottom:18px;">Access Blocked</div>
            <div style="font-family:'Orbitron',sans-serif;font-size:1.2rem;color:#111;">${data.message || "Access denied."}</div>
          </div>
        </div>
      `;
    }
  });
  db.ref('trolls/' + username).on('value', (snapshot) => {
    const msg = snapshot.val();
    if (msg) {
      alert(msg);
      removeTrollMessage(username);
    }
  });
}

// --- On page load ---
window.addEventListener("DOMContentLoaded", function () {
  let username = getUserName();
  if (!username) {
    showNameOverlay();
  } else {
    addUserToDB(username);
    listenForBlockStatus(username);
  }

  // Name overlay confirm
  document.getElementById("user-name-confirm").onclick = function () {
    const name = document.getElementById("user-name-input").value.trim();
    if (!name) return alert("Please enter your name.");
    setUserName(name);
    hideNameOverlay();
    listenForBlockStatus(name);
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
    if (!ADMINS.includes(adminName)) {
      document.getElementById("admin-verify-log").textContent = "Incorrect admin name.";
      return;
    }
    getAdminPower(adminName, hasPower => {
      if (!hasPower) {
        document.getElementById("admin-verify-log").textContent = "Admin powers removed.";
        return;
      }
      document.getElementById("admin-verify").style.display = "none";
      openAdminPanel(adminName);
    });
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
  document.getElementById("admin-panel").style.display = "block";
  renderAdminUsersList(adminName);
  renderAdminPowersSection(adminName);

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
  db.ref('users').once('value', (snapshot) => {
    const users = snapshot.val() || {};
    const listDiv = document.getElementById("admin-users-list");
    listDiv.innerHTML = "";
    const userKeys = Object.keys(users);
    if (!userKeys.length) {
      listDiv.innerHTML = "<div class='no-users'>No users yet.</div>";
      return;
    }
    userKeys.forEach(user => {
      const data = users[user];
      const isBlockedUser = data.blocked;
      const row = document.createElement("div");
      row.className = "user-row";
      let controls = "";
      if (!ADMINS.includes(user)) {
        controls = `
          <input type="text" placeholder="Block message" value="${data.message || ""}" id="msg-${user}">
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
      if (!ADMINS.includes(user)) {
        row.querySelector("button").onclick = () => {
          if (isBlockedUser) {
            unblockUserInDB(user);
          } else {
            const msg = row.querySelector(`#msg-${user}`).value || "Access denied.";
            blockUserInDB(user, msg);
          }
          setTimeout(() => renderAdminUsersList(adminName), 500);
        };
      }
      listDiv.appendChild(row);
    });
  });
}

// --- Admin powers section ---
function renderAdminPowersSection(adminName) {
  const section = document.getElementById("admin-powers-section");
  if (adminName !== "TheChosenOne") {
    section.innerHTML = "";
    return;
  }
  db.ref('adminPowers').once('value', snap => {
    const powers = snap.val() || {};
    section.innerHTML = "<h3 style='color:#ff2222;'>Admin Powers</h3>";
    ADMINS.forEach(admin => {
      if (admin === "TheChosenOne") return;
      const hasPower = powers[admin] !== false;
      section.innerHTML += `
        <div style="margin-bottom:8px;">
          <span style="color:#fff;font-weight:bold;">${admin}</span>
          <button onclick="setAdminPower('${admin}', ${!hasPower})" style="margin-left:10px;padding:4px 12px;border-radius:6px;border:none;background:${hasPower ? '#ff2222' : '#33eaff'};color:#fff;cursor:pointer;">
            ${hasPower ? "Remove Power" : "Restore Power"}
          </button>
        </div>
      `;
    });
  });
}
