let reportData = JSON.parse(localStorage.getItem("dealerReports")) || [];

document.getElementById("sentDate").addEventListener("change", calculateDays);
document.getElementById("replyDate").addEventListener("change", calculateDays);

function calculateDays() {
  const sent = new Date(document.getElementById("sentDate").value);
  const reply = new Date(document.getElementById("replyDate").value);
  if (sent && reply && reply >= sent) {
    const days = Math.floor((reply - sent) / (1000 * 60 * 60 * 24));
    document.getElementById("daysTaken").value = days;
  } else {
    document.getElementById("daysTaken").value = "";
  }
}

document.getElementById("trackerForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const bm = document.getElementById("branchManager").value.trim();
  const zm = document.getElementById("zonalManager").value.trim();
  if (bm === zm) return alert("Branch Manager and Zonal Manager must be different.");

  const fileInput = document.getElementById("screenshotUpload").files[0];

  if (fileInput) {
    const reader = new FileReader();
    reader.onload = function (e) {
      saveData(e.target.result); // base64 image
    };
    reader.readAsDataURL(fileInput);
  } else {
    const currentIndex = document.getElementById("editingIndex").value;
    const existingImage = currentIndex !== "" ? reportData[currentIndex]["Screenshot Path"] : "";
    saveData(existingImage);
  }
});

function saveData(base64Image) {
  const index = document.getElementById("editingIndex").value;
  const timestamp = new Date().toLocaleString();

  const data = {
    "Branch Code": document.getElementById("branchCode").value,
    "Branch Manager": document.getElementById("branchManager").value,
    "Zonal Manager": document.getElementById("zonalManager").value,
    "Observation Subject": document.getElementById("observationSubject").value,
    "Sent Date": document.getElementById("sentDate").value,
    "Reply Date": document.getElementById("replyDate").value,
    "Days Taken": document.getElementById("daysTaken").value,
    "Reply Mail": document.getElementById("replyMail").value,
    "Action Taken": document.getElementById("actionTaken").value,
    "Branch Status": document.getElementById("branchActive").value,
    "Screenshot Captured": document.getElementById("screenshotCaptured").value,
    "Screenshot Path": base64Image,
    "Last Modified": timestamp
  };

  if (index !== "") {
    reportData[index] = data;
    alert("Data updated successfully!");
  } else {
    reportData.push(data);
    alert("Data saved successfully!");
  }

  localStorage.setItem("dealerReports", JSON.stringify(reportData));
  document.getElementById("trackerForm").reset();
  document.getElementById("editingIndex").value = '';
  renderTable();
}

function renderTable() {
  const tbody = document.querySelector("#dataTable tbody");
  tbody.innerHTML = "";

  reportData.forEach((data, i) => {
    const row = tbody.insertRow();

    const keys = [
      "Branch Code", "Branch Manager", "Zonal Manager", "Observation Subject",
      "Sent Date", "Reply Date", "Days Taken", "Reply Mail", "Action Taken",
      "Branch Status", "Screenshot Captured", "Screenshot Path", "Last Modified"
    ];

    keys.forEach(key => {
      const cell = row.insertCell();
      if (key === "Screenshot Path" && data[key]) {
        const link = document.createElement("a");
        link.href = data[key];  // base64 image
        link.target = "_blank";
        link.innerText = "View Screenshot";
        cell.appendChild(link);
      } else {
        cell.textContent = data[key] || "";
      }
    });

    const editCell = row.insertCell();
    const btn = document.createElement("button");
    btn.className = "edit-button";
    btn.textContent = "Edit";
    btn.onclick = () => loadForm(i);
    editCell.appendChild(btn);
  });
}

function loadForm(i) {
  const data = reportData[i];
  document.getElementById("editingIndex").value = i;
  document.getElementById("branchCode").value = data["Branch Code"];
  document.getElementById("branchManager").value = data["Branch Manager"];
  document.getElementById("zonalManager").value = data["Zonal Manager"];
  document.getElementById("observationSubject").value = data["Observation Subject"];
  document.getElementById("sentDate").value = data["Sent Date"];
  document.getElementById("replyDate").value = data["Reply Date"];
  document.getElementById("daysTaken").value = data["Days Taken"];
  document.getElementById("replyMail").value = data["Reply Mail"];
  document.getElementById("actionTaken").value = data["Action Taken"];
  document.getElementById("branchActive").value = data["Branch Status"];
  document.getElementById("screenshotCaptured").value = data["Screenshot Captured"];
}

document.getElementById("downloadBtn").addEventListener("click", function () {
  if (reportData.length === 0) return alert("No data available");

  const headers = Object.keys(reportData[0]).join(",");
  const rows = reportData.map(d => Object.values(d).map(v => `"${v}"`).join(","));
  const csv = [headers, ...rows].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "DealerObservationReport.csv";
  link.click();
});

window.onload = renderTable;
