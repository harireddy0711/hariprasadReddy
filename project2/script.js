$(document).ready(function () {
  let currentTab = "personnel";

  // Search filter logic
  function applySearchFilter() {
    const search = $("#searchInp").val().toLowerCase();
    $("tbody tr").each(function () {
      $(this).toggle($(this).text().toLowerCase().includes(search));
    });
  }

  // epartment + location filter logic
  function applyDropdownFilter() {
    const selectedDept = $("#filterDepartment").val().toLowerCase();
    const selectedLoc = $("#filterLocation").val().toLowerCase();

    $("tbody#personnelTableBody tr").each(function () {
      const row = $(this).text().toLowerCase();
      const matchesDept = !selectedDept || row.includes(selectedDept);
      const matchesLoc = !selectedLoc || row.includes(selectedLoc);
      $(this).toggle(matchesDept && matchesLoc);
    });

    $("#filterModal").modal("hide");
  }

  // Load table data based on active tab
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

  function populateFilterDropdowns() {
    $.get("php/getAllDepartments.php", function (res) {
      const select = $("#filterDepartment").empty().append(`<option value="">All Departments</option>`);
      res.data.forEach(dept => select.append(`<option value="${dept.name}">${dept.name}</option>`));
    });

    $.get("php/getAllLocations.php", function (res) {
      const select = $("#filterLocation").empty().append(`<option value="">All Locations</option>`);
      res.data.forEach(loc => select.append(`<option value="${loc.name}">${loc.name}</option>`));
    });
  }

  function loadPersonnel(callback = () => {}) {
    $.get("php/getAll.php?type=personnel", function (data) {
      const tbody = $("#personnelTableBody").empty();
      data.data.forEach(person => {
        if (!person.firstName && !person.lastName) return;
        tbody.append(`
          <tr>
            <td>${person.firstName || ""} ${person.lastName || ""}</td>
            <td>${person.jobTitle || ""}</td>
            <td>${person.email || ""}</td>
            <td>${person.department || ""}</td>
            <td>${person.location || ""}</td>
            <td><button class="btn btn-warning btn-sm edit-personnel" data-id="${person.id}">Edit</button></td>
            <td><button class="btn btn-danger btn-sm delete-personnel" data-id="${person.id}">Delete</button></td>
          </tr>
        `);
      });
      callback();
    }, "json");
  }

  function loadDepartments() {
    $.get("php/getAllDepartments.php", function (res) {
      const tbody = $("#departmentTableBody").empty();
      res.data.forEach(dept => {
        tbody.append(`
          <tr>
            <td>${dept.name}</td>
            <td>${dept.locationName}</td>
            <td><button class="btn btn-warning btn-sm edit-department" data-id="${dept.id}">Edit</button></td>
            <td><button class="btn btn-danger btn-sm delete-department" data-id="${dept.id}">Delete</button></td>
          </tr>
        `);
      });
    });
  }

  function loadLocations() {
    $.get("php/getAllLocations.php", function (res) {
      const tbody = $("#locationTableBody").empty();
      res.data.forEach(loc => {
        tbody.append(`
          <tr>
            <td>${loc.name}</td>
            <td><button class="btn btn-warning btn-sm edit-location" data-id="${loc.id}">Edit</button></td>
            <td><button class="btn btn-danger btn-sm delete-location" data-id="${loc.id}">Delete</button></td>
          </tr>
        `);
      });
    });
  }

  // === Events ===
  $("#personnelBtn").click(() => { currentTab = "personnel"; loadData(); });
  $("#departmentsBtn").click(() => { currentTab = "departments"; loadData(); });
  $("#locationsBtn").click(() => { currentTab = "locations"; loadData(); });
  $("#refreshBtn").click(loadData);
  $("#searchInp").on("input", applySearchFilter);

  $("#filterBtn").click(() => {
    populateFilterDropdowns();
    $("#filterModal").modal("show");
  });

  $("#applyFilterBtn").click(applyDropdownFilter);

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

  function populateDepartments(selector) {
    $.get("php/getAllDepartments.php", function (res) {
      const select = $(selector).empty();
      res.data.forEach(dept => {
        select.append(`<option value="${dept.id}">${dept.name}</option>`);
      });
    });
  }

  function populateLocations(selector) {
    $.get("php/getAllLocations.php", function (res) {
      const select = $(selector).empty();
      res.data.forEach(loc => {
        select.append(`<option value="${loc.id}">${loc.name}</option>`);
      });
    });
  }

  // === Form Submits ===
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

  // === Edit Clicks ===
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
      $("#editPersonnelModal").modal("show");
    });
  });

  $(document).on("click", ".edit-department", function () {
    const id = $(this).data("id");
    $.get("php/getDepartmentByID.php", { id }, function (res) {
      const d = res.data;
      $("#editDepartmentID").val(d.id);
      $("#editDepartmentName").val(d.name);
      populateLocations("#editDepartmentLocation");
      setTimeout(() => {
        $("#editDepartmentLocation").val(d.locationID);
      }, 200);
      $("#editDepartmentModal").modal("show");
    });
  });

  $(document).on("click", ".edit-location", function () {
    const id = $(this).data("id");
    $.get("php/getLocationByID.php", { id }, function (res) {
      const l = res.data;
      $("#editLocationID").val(l.id);
      $("#editLocationName").val(l.name);
      $("#editLocationModal").modal("show");
    });
  });

  // === Delete ===
  $(document).on("click", ".delete-personnel", function () {
    const id = $(this).data("id");
    if (confirm("Delete this personnel?")) {
      $.post("php/deletePersonnel.php", { id }, () => loadPersonnel(applySearchFilter));
    }
  });

  $(document).on("click", ".delete-department", function () {
    const id = $(this).data("id");
    if (confirm("Delete this department?")) {
      $.post("php/deleteDepartmentByID.php", { id }, loadDepartments);
    }
  });

  $(document).on("click", ".delete-location", function () {
    const id = $(this).data("id");
    if (confirm("Delete this location?")) {
      $.post("php/deleteLocation.php", { id }, loadLocations);
    }
  });

  // Init
  loadData();
});
