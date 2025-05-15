$(document).ready(function () {
  let currentTab = "personnel";

  function loadData() {
    $("#searchInp").val(""); // Clear search input on table refresh
  
    if (currentTab === "personnel") {
      $("#filterBtn").prop("disabled", false).removeClass("disabled");
      loadPersonnel(() => {
        applySearchFilter();
        applyDropdownFilter();
      });
    } else {
      $("#filterBtn").prop("disabled", true).addClass("disabled");
      currentTab === "departments" ? loadDepartments() : loadLocations();
    }
    
  }
  

  function applySearchFilter() {
    const search = $("#searchInp").val().toLowerCase();
    $("tbody tr").each(function () {
      $(this).toggle($(this).text().toLowerCase().includes(search));
    });
  }

  function applyDropdownFilter() {
    const dept = $("#filterDepartment").val().toLowerCase();
    const loc = $("#filterLocation").val().toLowerCase();
    $("#personnelTableBody tr").each(function () {
      const text = $(this).text().toLowerCase();
      const show = (!dept || text.includes(dept)) && (!loc || text.includes(loc));
      $(this).toggle(show);
    });
  }

  function populateFilterDropdowns() {
    $.get("php/getAllDepartments.php", function (res) {
      const dept = $("#filterDepartment").empty().append('<option value="">All Departments</option>');
      res.data.forEach(d => dept.append(`<option value="${d.name}">${d.name}</option>`));
    });
    $.get("php/getAllLocations.php", function (res) {
      const loc = $("#filterLocation").empty().append('<option value="">All Locations</option>');
      res.data.forEach(l => loc.append(`<option value="${l.name}">${l.name}</option>`));
    });
  }

  function loadPersonnel(callback = () => {}) {
    $.get("php/getAll.php?type=personnel", function (res) {
      const tbody = document.getElementById("personnelTableBody");
      tbody.innerHTML = ""; // Clear current table rows
  
      const frag = document.createDocumentFragment();
  
      res.data.forEach(p => {
        if (!p.firstName && !p.lastName) return;
  
        const row = document.createElement("tr");
  
        const name = document.createElement("td");
        name.textContent = `${p.lastName}, ${p.firstName}`;
        row.appendChild(name);
  
        const jobTitle = document.createElement("td");
        jobTitle.className = "d-none d-sm-table-cell";
        jobTitle.textContent = p.jobTitle;
        row.appendChild(jobTitle);
  
        const email = document.createElement("td");
        email.className = "d-none d-md-table-cell";
        email.textContent = p.email;
        row.appendChild(email);
  
        const department = document.createElement("td");
        department.className = "d-none d-md-table-cell";
        department.textContent = p.department;
        row.appendChild(department);
  
        const location = document.createElement("td");
        location.textContent = p.location;
        row.appendChild(location);
  
        const actions = document.createElement("td");
        actions.className = "text-end";
  
        const editBtn = document.createElement("button");
        editBtn.className = "btn btn-link text-warning p-0 edit-personnel";
        editBtn.setAttribute("data-id", p.id);
        editBtn.setAttribute("data-bs-toggle", "modal");
        editBtn.setAttribute("data-bs-target", "#editPersonnelModal");
        editBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
  
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn btn-link text-danger p-0 delete-personnel";
        deleteBtn.setAttribute("data-id", p.id);
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
  
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        row.appendChild(actions);
  
        frag.appendChild(row);
      });
  
      tbody.appendChild(frag);
      callback();
    }, "json");
  }
  

  function loadDepartments() {
    $.get("php/getAllDepartments.php", function (res) {
      const tbody = document.getElementById("departmentTableBody");
      tbody.innerHTML = "";
  
      const frag = document.createDocumentFragment();
  
      res.data.forEach(d => {
        const row = document.createElement("tr");
  
        const name = document.createElement("td");
        name.textContent = d.name;
        row.appendChild(name);
  
        const location = document.createElement("td");
        location.textContent = d.locationName;
        row.appendChild(location);
  
        const actions = document.createElement("td");
        actions.className = "text-end";
  
        const editBtn = document.createElement("button");
        editBtn.className = "btn btn-link text-warning p-0 edit-department";
        editBtn.setAttribute("data-id", d.id);
        editBtn.setAttribute("data-bs-toggle", "modal");
        editBtn.setAttribute("data-bs-target", "#editDepartmentModal");
        editBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
  
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn btn-link text-danger p-0 delete-department";
        deleteBtn.setAttribute("data-id", d.id);
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
  
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        row.appendChild(actions);
  
        frag.appendChild(row);
      });
  
      tbody.appendChild(frag);
    });
  }

  function loadLocations() {
    $.get("php/getAllLocations.php", function (res) {
      const tbody = document.getElementById("locationTableBody");
      tbody.innerHTML = "";
  
      const frag = document.createDocumentFragment();
  
      res.data.forEach(l => {
        const row = document.createElement("tr");
  
        const name = document.createElement("td");
        name.textContent = l.name;
        row.appendChild(name);
  
        const actions = document.createElement("td");
        actions.className = "text-end";
  
        const editBtn = document.createElement("button");
        editBtn.className = "btn btn-link text-warning p-0 edit-location";
        editBtn.setAttribute("data-id", l.id);
        editBtn.setAttribute("data-bs-toggle", "modal");
        editBtn.setAttribute("data-bs-target", "#editLocationModal");
        editBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
  
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn btn-link text-danger p-0 delete-location";
        deleteBtn.setAttribute("data-id", l.id);
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
  
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        row.appendChild(actions);
  
        frag.appendChild(row);
      });
  
      tbody.appendChild(frag);
    });
  }
  

  // === Event Bindings ===
  $("#personnelBtn").click(() => { currentTab = "personnel"; loadData(); });
  $("#departmentsBtn").click(() => { currentTab = "departments"; loadData(); });
  $("#locationsBtn").click(() => { currentTab = "locations"; loadData(); });
  $("#refreshBtn").click(loadData);
  $("#searchInp").on("input", applySearchFilter);
  $("#filterBtn").click(() => { populateFilterDropdowns(); $("#filterModal").modal("show"); });
  $("#filterDepartment").on("change", function () {
    $("#filterLocation").val(""); // Clear location filter
    applyDropdownFilter();
  });
  
  $("#filterLocation").on("change", function () {
    $("#filterDepartment").val(""); // Clear department filter
    applyDropdownFilter();
  });
  

  $("#addBtn").click(() => {
    if (currentTab === "personnel") {
      $("#editPersonnelForm")[0].reset();
      $("#editPersonnelEmployeeID").val("");
      populateDepartments("#editPersonnelDepartment");
      $("#editPersonnelModal").modal("show");
    } else if (currentTab === "departments") {
      $("#editDepartmentForm")[0].reset();
      $("#editDepartmentID").val("");
      populateLocations("#editDepartmentLocation");
      $("#editDepartmentModal").modal("show");
    } else {
      $("#editLocationForm")[0].reset();
      $("#editLocationID").val("");
      $("#editLocationModal").modal("show");
    }
  });

  // === Populate Dropdowns for Edit Forms ===
  function populateDepartments(selector) {
    $.get("php/getAllDepartments.php", function (res) {
      const select = $(selector).empty();
      res.data.forEach(d => select.append(`<option value="${d.id}">${d.name}</option>`));
    });
  }

  function populateLocations(selector) {
    $.get("php/getAllLocations.php", function (res) {
      const select = $(selector).empty();
      res.data.forEach(l => select.append(`<option value="${l.id}">${l.name}</option>`));
    });
  }

  // === Submits ===
  $("#editPersonnelForm").submit(function (e) {
    e.preventDefault();
    const data = {
      id: $("#editPersonnelEmployeeID").val(),
      firstName: $("#editPersonnelFirstName").val(),
      lastName: $("#editPersonnelLastName").val(),
      jobTitle: $("#editPersonnelJobTitle").val(),
      email: $("#editPersonnelEmailAddress").val(),
      departmentID: $("#editPersonnelDepartment").val()
    };
    const url = data.id ? "php/updatePersonnel.php" : "php/insertPersonnel.php";
    $.post(url, data, () => {
      $("#editPersonnelModal").modal("hide");
      loadPersonnel(applySearchFilter);
    });
  });

  $("#editDepartmentForm").submit(function (e) {
    e.preventDefault();
    const data = {
      id: $("#editDepartmentID").val(),
      name: $("#editDepartmentName").val(),
      locationID: $("#editDepartmentLocation").val()
    };
    const url = data.id ? "php/updateDepartment.php" : "php/insertDepartment.php";
    $.post(url, data, () => {
      $("#editDepartmentModal").modal("hide");
      loadDepartments();
    });
  });

  $("#editLocationForm").submit(function (e) {
    e.preventDefault();
    const data = {
      id: $("#editLocationID").val(),
      name: $("#editLocationName").val()
    };
    const url = data.id ? "php/updateLocation.php" : "php/insertLocation.php";
    $.post(url, data, () => {
      $("#editLocationModal").modal("hide");
      loadLocations();
    });
  });

  // === Edit buttons ===
  $(document).on("click", ".edit-personnel", function () {
    const id = $(this).data("id");
    $.get("php/getPersonnelByID.php", { id }, function (res) {
      const p = res.data;
      $("#editPersonnelEmployeeID").val(p.id);
      $("#editPersonnelFirstName").val(p.firstName);
      $("#editPersonnelLastName").val(p.lastName);
      $("#editPersonnelJobTitle").val(p.jobTitle);
      $("#editPersonnelEmailAddress").val(p.email);
      populateDepartments("#editPersonnelDepartment");
      setTimeout(() => {
        $("#editPersonnelDepartment").val(p.departmentID);
      }, 200);
    });
  });

  $(document).on("click", ".edit-department", function () {
    const id = $(this).data("id");
    $.get("php/getDepartmentByID.php", { id }, function (res) {
      const d = res.data[0];
      $("#editDepartmentID").val(d.id);
      $("#editDepartmentName").val(d.name);
      populateLocations("#editDepartmentLocation");
      setTimeout(() => {
        $("#editDepartmentLocation").val(d.locationID);
      }, 200);
    });
  });

  $(document).on("click", ".edit-location", function () {
    const id = $(this).data("id");
    $.get("php/getLocationByID.php", { id }, function (res) {
      const l = res.data;
      $("#editLocationID").val(l.id);
      $("#editLocationName").val(l.name);
    });
  });

 // === Updated Delete Buttons with Name Display ===
 $(document).on("click", ".delete-personnel", function () {
  const id = $(this).data("id");
  $.get("php/getPersonnelByID.php", { id }, function (res) {
    const p = res.data;
    $("#deletePersonnelForm input[name='id']").val(p.id);
    $("#deletePersonnelModal .modal-body p").html(`Are you sure you want to delete <strong>${p.lastName}, ${p.firstName}</strong>?`);
    $("#deletePersonnelModal").modal("show");
  });
});


$(document).on("click", ".delete-department", function () {
  const id = $(this).data("id");

  $.get("php/checkDeletable.php", { type: "department", id }, function (res) {
    if (res.allowed) {
      // Show confirm modal
      $("#confirmDeleteDepartmentForm input[name='id']").val(id);
      $("#confirmDeleteDeptName").text(res.name);
      $("#confirmDeleteDepartmentModal").modal("show");
    } else {
      // Show CANNOT delete modal with dynamic name and count
      $("#cantDeleteDeptName").text(res.name || "Unknown");
      $("#personnelCount").text(res.count || 0);
      $("#cantDeleteDepartmentModal").modal("show");
    }
  }, "json");
});


$("#confirmDeleteDepartmentForm").submit(function (e) {
  e.preventDefault();
  const id = $(this).find("input[name='id']").val();
  $.post("php/deleteDepartmentByID.php", { id }, function () {
    $("#confirmDeleteDepartmentModal").modal("hide");
    loadDepartments();
  });
});





$(document).on("click", ".delete-location", function () {
  const id = $(this).data("id");
  $.get("php/getLocationByID.php", { id }, function (res) {
    const l = res.data;
    $("#deleteLocationForm input[name='id']").val(l.id);
    $("#deleteLocationModal .modal-body p").html(`Are you sure you want to delete <strong>${l.name}</strong>?`);
    $("#deleteLocationModal").modal("show");
  });
});

// === Deletion Submit Handlers ===
$("#deletePersonnelForm").submit(function (e) {
  e.preventDefault();
  const id = $(this).find("input[name='id']").val();
  $.post("php/deletePersonnel.php", { id }, function () {
    $("#deletePersonnelModal").modal("hide");
    loadData();
  });
});

$("#deleteDepartmentForm").submit(function (e) {
  e.preventDefault();
  const id = $(this).find("input[name='id']").val();
  $.post("php/deleteDepartmentByID.php", { id }, function () {
    $("#deleteDepartmentModal").modal("hide");
    loadDepartments();
  });
});

$("#deleteLocationForm").submit(function (e) {
  e.preventDefault();
  const id = $(this).find("input[name='id']").val();
  $.post("php/deleteLocation.php", { id }, function () {
    $("#deleteLocationModal").modal("hide");
    loadLocations();
  });
});

//  show.bs.modal: Populate dropdowns 
$('#addPersonnelModal').on('show.bs.modal', function () {
  populateDepartments('#addPersonnelDepartment');
});
$('#editPersonnelModal').on('show.bs.modal', function () {
  populateDepartments('#editPersonnelDepartment');
});
$('#addDepartmentModal').on('show.bs.modal', function () {
  populateLocations('#addDepartmentLocation');
});
$('#editDepartmentModal').on('show.bs.modal', function () {
  populateLocations('#editDepartmentLocation');
});

$("#addBtn").click(() => {
  if (currentTab === "personnel") {
    $("#editPersonnelForm")[0].reset();
    $("#editPersonnelEmployeeID").val("");
    populateDepartments("#editPersonnelDepartment");
    $("#editPersonnelModal .modal-title").text("Add Employee"); 
    $("#editPersonnelModal").modal("show");
  } else if (currentTab === "departments") {
    $("#editDepartmentForm")[0].reset();
    $("#editDepartmentID").val("");
    populateLocations("#editDepartmentLocation");
    $("#editDepartmentModal .modal-title").text("Add Department"); 
    $("#editDepartmentModal").modal("show");
  } else {
    $("#editLocationForm")[0].reset();
    $("#editLocationID").val("");
    $("#editLocationModal .modal-title").text("Add Location"); 
    $("#editLocationModal").modal("show");
  }
});


//  hidden.bs.modal: Reset forms 
[
  '#addPersonnelModal',
  '#editPersonnelModal',
  '#addDepartmentModal',
  '#editDepartmentModal',
  '#editLocationModal',
  '#deletePersonnelModal',
  '#deleteDepartmentModal',
  '#deleteLocationModal'
].forEach(modalID => {
  $(modalID).on('hidden.bs.modal', function () {
    this.querySelector('form')?.reset();
  });
});


  loadData();
});
