const API = "http://127.0.0.1:5000";

const dashboardState = {
  semesters: [],
  editingSemester: null
};

async function apiRequest(path, options = {}) {
  const response = await fetch(API + path, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

function setMessage(elementId, message, type = "") {
  const element = document.getElementById(elementId);
  if (!element) {
    return;
  }

  element.textContent = message || "";
  element.className = "form-message" + (type ? ` ${type}` : "");
}

function switchAuthTab(showLogin) {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const loginTab = document.getElementById("loginTab");
  const registerTab = document.getElementById("registerTab");

  if (!loginForm || !registerForm || !loginTab || !registerTab) {
    return;
  }

  loginForm.classList.toggle("hidden", !showLogin);
  registerForm.classList.toggle("hidden", showLogin);
  loginForm.classList.toggle("fade-panel", showLogin);
  registerForm.classList.toggle("fade-panel", !showLogin);
  loginTab.classList.toggle("active", showLogin);
  registerTab.classList.toggle("active", !showLogin);
}

function createSubjectRow(index) {
  return `
    <tr>
      <td>${index}</td>
      <td><input type="text" placeholder="Subject ${index}"></td>
      <td><input type="number" min="0" step="0.5" placeholder="Credits"></td>
      <td>
        <select>
          <option>O</option>
          <option>A+</option>
          <option>A</option>
          <option>B+</option>
          <option>B</option>
          <option>C</option>
        </select>
      </td>
    </tr>
  `;
}

function renumberTable(tableId) {
  const table = document.getElementById(tableId);
  if (!table) {
    return;
  }

  Array.from(table.querySelectorAll("tbody tr")).forEach((row, index) => {
    row.cells[0].textContent = index + 1;
    const nameInput = row.cells[1].querySelector("input");
    if (nameInput && !nameInput.value.trim()) {
      nameInput.placeholder = `Subject ${index + 1}`;
    }
  });
}

function addSubjectRow(tableId) {
  const table = document.getElementById(tableId);
  if (!table) {
    return;
  }

  const tbody = table.querySelector("tbody");
  const index = tbody.rows.length + 1;
  tbody.insertAdjacentHTML("beforeend", createSubjectRow(index));
}

function removeSubjectRow(tableId) {
  const table = document.getElementById(tableId);
  if (!table) {
    return;
  }

  const tbody = table.querySelector("tbody");
  if (tbody.rows.length > 1) {
    tbody.deleteRow(tbody.rows.length - 1);
    renumberTable(tableId);
  }
}

function getSubjects(tableId) {
  const table = document.getElementById(tableId);
  if (!table) {
    return [];
  }

  return Array.from(table.querySelectorAll("tbody tr")).map((row, index) => ({
    name: row.cells[1].querySelector("input").value.trim() || `Subject ${index + 1}`,
    credit: Number(row.cells[2].querySelector("input").value),
    grade: row.cells[3].querySelector("select").value
  }));
}

function fillSubjectTable(tableId, subjects) {
  const table = document.getElementById(tableId);
  if (!table) {
    return;
  }

  const tbody = table.querySelector("tbody");
  const rows = subjects.length ? subjects : [{ name: "", credit: "", grade: "O" }];

  tbody.innerHTML = rows.map((subject, index) => `
    <tr>
      <td>${index + 1}</td>
      <td><input type="text" placeholder="Subject ${index + 1}" value="${subject.name || ""}"></td>
      <td><input type="number" min="0" step="0.5" placeholder="Credits" value="${subject.credit ?? ""}"></td>
      <td>
        <select>
          <option ${subject.grade === "O" ? "selected" : ""}>O</option>
          <option ${subject.grade === "A+" ? "selected" : ""}>A+</option>
          <option ${subject.grade === "A" ? "selected" : ""}>A</option>
          <option ${subject.grade === "B+" ? "selected" : ""}>B+</option>
          <option ${subject.grade === "B" ? "selected" : ""}>B</option>
          <option ${subject.grade === "C" ? "selected" : ""}>C</option>
        </select>
      </td>
    </tr>
  `).join("");
}

function renderResult(prefix, data) {
  const container = document.getElementById(`${prefix}_result`);
  if (!container) {
    return;
  }

  document.getElementById(`${prefix === "calculator" ? "calc" : "dash"}_sgpa`).textContent = data.sgpa;
  document.getElementById(`${prefix === "calculator" ? "calc" : "dash"}_cgpa`).textContent = data.cgpa;
  document.getElementById(`${prefix === "calculator" ? "calc" : "dash"}_percentage`).textContent = data.percentage;
  container.style.display = "grid";
}

async function calculateForTable(options) {
  const payload = {
    subjects: getSubjects(options.tableId),
    prev_cgpa: Number(document.getElementById(options.prevCgpaId).value),
    prev_credits: Number(document.getElementById(options.prevCreditsId).value),
    formula: document.getElementById(options.formulaId).value
  };

  const data = await apiRequest("/calculate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  renderResult(options.resultPrefix, data);
  setMessage(options.messageId, "Calculated successfully.", "success");
}

async function handleRegister(event) {
  event.preventDefault();

  const payload = {
    name: document.getElementById("reg_name").value.trim(),
    email: document.getElementById("reg_email").value.trim(),
    phone: document.getElementById("reg_phone").value.trim(),
    college: document.getElementById("reg_college").value.trim(),
    course: document.getElementById("reg_course").value.trim(),
    register_no: document.getElementById("reg_regno").value.trim(),
    username: document.getElementById("reg_username").value.trim(),
    password: document.getElementById("reg_password").value
  };

  try {
    const data = await apiRequest("/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setMessage("register_msg", data.warning ? `${data.message}. ${data.warning}` : data.message, "success");
    switchAuthTab(true);
  } catch (error) {
    setMessage("register_msg", error.message, "error");
  }
}

async function handleLogin(event) {
  event.preventDefault();

  try {
    const data = await apiRequest("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: document.getElementById("login_username").value.trim(),
        password: document.getElementById("login_password").value
      })
    });

    localStorage.setItem("student_id", data.student_id);
    localStorage.setItem("student_name", data.name);
    window.location.href = "dashboard.html";
  } catch (error) {
    setMessage("login_msg", error.message, "error");
  }
}

function switchDashboardPanel(panelId) {
  document.querySelectorAll(".sidebar-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.panel === panelId);
  });

  ["profilePanel", "semesterPanel", "historyPanel"].forEach((id) => {
    const section = document.getElementById(id);
    if (section) {
      section.classList.toggle("hidden", id !== panelId);
    }
  });
}

function getStudentId() {
  return Number(localStorage.getItem("student_id") || 0);
}

function updateSidebarSummary() {
  const summary = document.getElementById("sidebarSummary");
  if (!summary) {
    return;
  }

  const totalSemesters = dashboardState.semesters.length;
  const lastSemester = dashboardState.semesters[dashboardState.semesters.length - 1];
  const latestCgpa = lastSemester ? lastSemester.cgpa : 0;
  summary.textContent = `Saved semesters: ${totalSemesters}. Latest CGPA: ${latestCgpa}. Edit any semester from the saved-semester panel.`;
}

async function loadSemesterContext() {
  const studentId = getStudentId();
  const semesterInput = document.getElementById("semester");
  if (!studentId || !semesterInput || !semesterInput.value) {
    return;
  }

  const semesterNo = Number(semesterInput.value);

  try {
    const data = await apiRequest(`/semester-context/${studentId}/${semesterNo}`);
    document.getElementById("prev_cgpa").value = data.previous_cgpa;
    document.getElementById("prev_credits").value = data.previous_credits;
  } catch (error) {
    setMessage("semester_msg", error.message, "error");
  }
}

function setSemesterMode(editSemester = null) {
  dashboardState.editingSemester = editSemester;
  const title = document.getElementById("semesterPanelTitle");
  const saveButton = document.getElementById("saveSemesterBtn");
  const cancelButton = document.getElementById("cancelEditBtn");

  if (!title || !saveButton || !cancelButton) {
    return;
  }

  if (editSemester) {
    title.textContent = `Edit Semester ${editSemester}`;
    saveButton.textContent = "Update Semester";
    cancelButton.classList.remove("hidden");
  } else {
    title.textContent = "Semester Editor";
    saveButton.textContent = "Save Semester";
    cancelButton.classList.add("hidden");
  }
}

function resetSemesterForm(nextSemester = null) {
  fillSubjectTable("dashboardSubjectTable", []);
  document.getElementById("dashboard_result").style.display = "none";
  document.getElementById("semester").value = nextSemester || "";
  document.getElementById("formula").value = "9.5";
  document.getElementById("prev_cgpa").value = 0;
  document.getElementById("prev_credits").value = 0;
  setMessage("semester_msg", "");
  setSemesterMode(null);

  if (nextSemester) {
    loadSemesterContext();
  }
}

function renderHistory() {
  const container = document.getElementById("semesterHistory");
  if (!container) {
    return;
  }

  if (!dashboardState.semesters.length) {
    container.innerHTML = `<div class="empty-state">No semester has been saved yet. Start from the Semester Data panel.</div>`;
    document.getElementById("stat_total_semesters").textContent = 0;
    document.getElementById("stat_latest_cgpa").textContent = 0;
    document.getElementById("stat_total_credits").textContent = 0;
    updateSidebarSummary();
    return;
  }

  const lastSemester = dashboardState.semesters[dashboardState.semesters.length - 1];
  document.getElementById("stat_total_semesters").textContent = dashboardState.semesters.length;
  document.getElementById("stat_latest_cgpa").textContent = lastSemester.cgpa;
  document.getElementById("stat_total_credits").textContent = lastSemester.total_credits;

  container.innerHTML = dashboardState.semesters.map((semester) => `
    <div class="semester-item">
      <div class="semester-top">
        <div>
          <h4>Semester ${semester.semester_no}</h4>
          <div class="meta-row">
            <div class="meta-chip">SGPA: ${semester.sgpa}</div>
            <div class="meta-chip">CGPA: ${semester.cgpa}</div>
            <div class="meta-chip">Credits: ${semester.total_credits}</div>
          </div>
        </div>
        <button class="secondary-btn" type="button" onclick="editSemester(${semester.semester_no})">Edit Data</button>
      </div>

      <details class="subject-details">
        <summary>View subject-wise data</summary>
        <div class="subject-mini">
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Credit</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              ${semester.subjects.map((subject) => `
                <tr>
                  <td>${subject.subject_name}</td>
                  <td>${subject.credit}</td>
                  <td>${subject.grade}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  `).join("");

  updateSidebarSummary();
}

function populateProfile(profile) {
  document.getElementById("profile_name").value = profile.name || "";
  document.getElementById("profile_email").value = profile.email || "";
  document.getElementById("profile_phone").value = profile.phone || "";
  document.getElementById("profile_college").value = profile.college || "";
  document.getElementById("profile_course").value = profile.course || "";
  document.getElementById("profile_regno").value = profile.register_no || "";
  document.getElementById("profile_username").value = profile.username || "";
  document.getElementById("welcomeText").textContent = `Welcome ${profile.name || localStorage.getItem("student_name") || "Student"}`;
}

async function loadDashboard() {
  const studentId = getStudentId();
  if (!studentId) {
    window.location.href = "index.html";
    return;
  }

  try {
    const profileData = await apiRequest(`/student/${studentId}`);
    const dashboardData = await apiRequest(`/dashboard/${studentId}`);

    populateProfile(profileData.profile);
    dashboardState.semesters = dashboardData.semesters;
    renderHistory();

    const nextSemester = dashboardState.semesters.length
      ? Number(dashboardState.semesters[dashboardState.semesters.length - 1].semester_no) + 1
      : 1;

    resetSemesterForm(nextSemester);
  } catch (error) {
    setMessage("semester_msg", error.message, "error");
  }
}

async function saveProfile(event) {
  event.preventDefault();

  const studentId = getStudentId();
  const payload = {
    name: document.getElementById("profile_name").value.trim(),
    email: document.getElementById("profile_email").value.trim(),
    phone: document.getElementById("profile_phone").value.trim(),
    college: document.getElementById("profile_college").value.trim(),
    course: document.getElementById("profile_course").value.trim(),
    register_no: document.getElementById("profile_regno").value.trim()
  };

  try {
    const data = await apiRequest(`/student/${studentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    localStorage.setItem("student_name", payload.name);
    setMessage("profile_msg", data.message, "success");
    document.getElementById("welcomeText").textContent = `Welcome ${payload.name}`;
  } catch (error) {
    setMessage("profile_msg", error.message, "error");
  }
}

async function saveSemesterData() {
  const studentId = getStudentId();
  const semesterNo = Number(document.getElementById("semester").value);
  const payload = {
    student_id: studentId,
    semester: semesterNo,
    subjects: getSubjects("dashboardSubjectTable")
  };

  try {
    const path = dashboardState.editingSemester ? "/update-semester" : "/save-semester";
    const method = dashboardState.editingSemester ? "PUT" : "POST";

    const data = await apiRequest(path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setMessage("semester_msg", data.message, "success");
    await loadDashboard();
    switchDashboardPanel("historyPanel");
  } catch (error) {
    setMessage("semester_msg", error.message, "error");
  }
}

function editSemester(semesterNo) {
  const semester = dashboardState.semesters.find((item) => Number(item.semester_no) === Number(semesterNo));
  if (!semester) {
    return;
  }

  document.getElementById("semester").value = semester.semester_no;
  document.getElementById("formula").value = "9.5";
  fillSubjectTable("dashboardSubjectTable", semester.subjects.map((subject) => ({
    name: subject.subject_name,
    credit: subject.credit,
    grade: subject.grade
  })));
  setSemesterMode(semester.semester_no);
  switchDashboardPanel("semesterPanel");
  loadSemesterContext();
  document.getElementById("dashboard_result").style.display = "none";
  setMessage("semester_msg", `Editing Semester ${semester.semester_no}.`, "success");
}

function logout() {
  localStorage.removeItem("student_id");
  localStorage.removeItem("student_name");
  window.location.href = "index.html";
}

function initLandingPage() {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  if (!loginForm || !registerForm) {
    return;
  }

  document.getElementById("loginTab").addEventListener("click", () => switchAuthTab(true));
  document.getElementById("registerTab").addEventListener("click", () => switchAuthTab(false));
  document.getElementById("switchToRegister").addEventListener("click", () => switchAuthTab(false));
  loginForm.addEventListener("submit", handleLogin);
  registerForm.addEventListener("submit", handleRegister);
}

function initCalculatorPage() {
  if (!document.getElementById("calculatorSubjectTable")) {
    return;
  }

  document.getElementById("calcAddSubject").addEventListener("click", () => addSubjectRow("calculatorSubjectTable"));
  document.getElementById("calcRemoveSubject").addEventListener("click", () => removeSubjectRow("calculatorSubjectTable"));
  document.getElementById("directCalculateBtn").addEventListener("click", async () => {
    try {
      await calculateForTable({
        tableId: "calculatorSubjectTable",
        prevCgpaId: "calc_prev_cgpa",
        prevCreditsId: "calc_prev_credits",
        formulaId: "calc_formula",
        resultPrefix: "calculator",
        messageId: "calculator_msg"
      });
    } catch (error) {
      setMessage("calculator_msg", error.message, "error");
    }
  });
}

function initDashboardPage() {
  if (!document.getElementById("dashboardSubjectTable")) {
    return;
  }

  document.querySelectorAll(".sidebar-btn").forEach((button) => {
    button.addEventListener("click", () => switchDashboardPanel(button.dataset.panel));
  });

  document.getElementById("profileForm").addEventListener("submit", saveProfile);
  document.getElementById("dashAddSubject").addEventListener("click", () => addSubjectRow("dashboardSubjectTable"));
  document.getElementById("dashRemoveSubject").addEventListener("click", () => removeSubjectRow("dashboardSubjectTable"));
  document.getElementById("semester").addEventListener("change", () => {
    loadSemesterContext();
    if (!dashboardState.editingSemester) {
      setMessage("semester_msg", "Previous CGPA and credits loaded automatically.", "success");
    }
  });
  document.getElementById("calculateSemesterBtn").addEventListener("click", async () => {
    try {
      await calculateForTable({
        tableId: "dashboardSubjectTable",
        prevCgpaId: "prev_cgpa",
        prevCreditsId: "prev_credits",
        formulaId: "formula",
        resultPrefix: "dashboard",
        messageId: "semester_msg"
      });
    } catch (error) {
      setMessage("semester_msg", error.message, "error");
    }
  });
  document.getElementById("saveSemesterBtn").addEventListener("click", saveSemesterData);
  document.getElementById("cancelEditBtn").addEventListener("click", () => {
    const nextSemester = dashboardState.semesters.length
      ? Number(dashboardState.semesters[dashboardState.semesters.length - 1].semester_no) + 1
      : 1;
    resetSemesterForm(nextSemester);
  });
  document.getElementById("logoutBtn").addEventListener("click", logout);

  loadDashboard();
}

document.addEventListener("DOMContentLoaded", () => {
  initLandingPage();
  initCalculatorPage();
  initDashboardPage();
});

