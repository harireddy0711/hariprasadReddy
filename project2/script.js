$(document).ready(function () {
  let currentTab = "personnel";

  function loadData() {
    if (currentTab === "personnel") {
      $("#filterBtn").show();
      loadPersonnel(() => {
        applySearchFilter();
        applyDropdownFilter();
      });
    } else {
      $("#filterBtn").hide();
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
      const tbody = $("#personnelTableBody").empty();
      res.data.forEach(p => {
        if (!p.firstName && !p.lastName) return;
        tbody.append(`
          <tr>
            <td>${p.firstName} ${p.lastName}</td>
            <td>${p.jobTitle || ""}</td>
            <td>${p.email || ""}</td>
            <td>${p.department || ""}</td>
            <td>${p.location || ""}</td>
            <td>
              <button class="btn btn-link text-warning p-0 edit-personnel" data-id="${p.id}" data-bs-toggle="modal" data-bs-target="#editPersonnelModal">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
            </td>
            <td>
              <button class="btn btn-link text-danger p-0 delete-personnel" data-id="${p.id}">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </td>
          </tr>
        `);
      });
      callback();
    }, "json");
  }

  function loadDepartments() {
    $.get("php/getAllDepartments.php", function (res) {
      const tbody = $("#departmentTableBody").empty();
      res.data.forEach(d => {
        tbody.append(`
          <tr>
            <td>${d.name}</td>
            <td>${d.locationName}</td>
            <td>
              <button class="btn btn-link text-warning p-0 edit-department" data-id="${d.id}" data-bs-toggle="modal" data-bs-target="#editDepartmentModal">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
            </td>
            <td>
              <button class="btn btn-link text-danger p-0 delete-department" data-id="${d.id}">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </td>
          </tr>
        `);
      });
    });
  }

  function loadLocations() {
    $.get("php/getAllLocations.php", function (res) {
      const tbody = $("#locationTableBody").empty();
      res.data.forEach(l => {
        tbody.append(`
          <tr>
            <td>${l.name}</td>
            <td>
              <button class="btn btn-link text-warning p-0 edit-location" data-id="${l.id}" data-bs-toggle="modal" data-bs-target="#editLocationModal">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="btn btn-link text-danger p-0 delete-location" data-id="${l.id}">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </td>
          </tr>
        `);
      });
    });
  }

  // === Event Bindings ===
  $("#personnelBtn").click(() => { currentTab = "personnel"; loadData(); });
  $("#departmentsBtn").click(() => { currentTab = "departments"; loadData(); });
  $("#locationsBtn").click(() => { currentTab = "locations"; loadData(); });
  $("#refreshBtn").click(loadData);
  $("#searchInp").on("input", applySearchFilter);
  $("#filterDepartment, #filterLocation").on("change", applyDropdownFilter);
  $("#filterBtn").click(() => { populateFilterDropdowns(); $("#filterModal").modal("show"); });

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

  // === Delete Buttons with Validation ===
function checkBeforeDelete(type, id, callback) {
  $.get("php/checkDeletable.php", { type, id }, function (res) {
    if (res.allowed) {
      $("#confirmDeleteModal")
        .data("type", type)
        .data("id", id)
        .modal("show");
    } else {
      $("#warningModal").modal("show");
    }
  }, "json");
}

$(document).on("click", ".delete-personnel", function () {
  const id = $(this).data("id");
  $("#confirmDeleteModal").data("type", "personnel").data("id", id).modal("show");
});

$(document).on("click", ".delete-department", function () {
  const id = $(this).data("id");
  checkBeforeDelete("department", id);
});

$(document).on("click", ".delete-location", function () {
  const id = $(this).data("id");
  checkBeforeDelete("location", id);
});

// Final deletion action triggered from confirm modal
$("#confirmDeleteBtn").click(function () {
  const type = $("#confirmDeleteModal").data("type");
  const id = $("#confirmDeleteModal").data("id");

  const endpoints = {
    personnel: "php/deletePersonnel.php",
    department: "php/deleteDepartmentByID.php",
    location: "php/deleteLocation.php"
  };

  $.post(endpoints[type], { id }, function () {
    $("#confirmDeleteModal").modal("hide");
    loadData();
  });
});

  loadData();
});
