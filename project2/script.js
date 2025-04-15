// ========== Load All Personnel ==========
function loadPersonnel() {
  $.ajax({
    url: 'php/getAll.php',
    type: 'GET',
    dataType: 'json',
    success: function (response) {
      const data = response.data;
      let rows = '';

      $.each(data, function (i, person) {
        rows += `
          <tr>
            <td>${person.firstName} ${person.lastName}</td>
            <td>${person.email || ''}</td>
            <td>${person.jobTitle || ''}</td>
            <td>${person.department || ''}</td>
            <td>${person.location || ''}</td>
            <td>
              <button class="btn btn-sm btn-warning editPersonnelBtn" 
                      data-id="${person.id}" 
                      data-bs-toggle="modal" 
                      data-bs-target="#addPersonnelModal">
                Edit
              </button>
              <button class="btn btn-sm btn-danger deletePersonnelBtn" 
                      data-id="${person.id}">
                Delete
              </button>
            </td>
          </tr>`;
      });

      $('#personnelTableBody').html(rows);
    }
  });
}

// ========== Load All Departments ==========
function loadDepartmentsTable() {
  $.ajax({
    url: 'php/getAllDepartments.php',
    type: 'GET',
    dataType: 'json',
    success: function (response) {
      const departments = response.data;
      let rows = '';

      departments.forEach(dept => {
        rows += `
          <tr>
            <td>${dept.name}</td>
            <td>${dept.locationName}</td>
            <td>
              <button class="btn btn-sm btn-warning editDepartmentBtn" 
                      data-id="${dept.id}" 
                      data-bs-toggle="modal" 
                      data-bs-target="#departmentModal">Edit</button>
              <button class="btn btn-sm btn-danger deleteDepartmentBtn" 
                      data-id="${dept.id}">Delete</button>
            </td>
          </tr>`;
      });

      $('#departmentTableBody').html(rows);
    }
  });
}


// Load departments and render in table
function loadDepartments() {
  $.ajax({
    url: 'php/getAllDepartments.php',
    type: 'GET',
    dataType: 'json',
    success: function (response) {
      const departments = response.data;
      let rows = '';

      departments.forEach(dept => {
        rows += `
          <tr>
            <td>${dept.name}</td>
            <td>${dept.locationName || ''}</td>
            <td>
              <button class="btn btn-sm btn-warning editDepartmentBtn" data-id="${dept.id}" data-bs-toggle="modal" data-bs-target="#departmentModal">Edit</button>
              <button class="btn btn-sm btn-danger deleteDepartmentBtn" data-id="${dept.id}">Delete</button>
            </td>
          </tr>
        `;
      });

      $('#departmentTableBody').html(rows);
    },
    error: function () {
      console.error('Failed to load departments.');
    }
  });
}
function loadDepartmentDropdown() {
  $.ajax({
    url: 'php/getAllDepartments.php',
    type: 'GET',
    dataType: 'json',
    success: function (response) {
      const departments = response.data;
      const options = departments.map(dept =>
        `<option value="${dept.id}">${dept.name}</option>`
      );
      $('#personnelDepartment').html(options);
    }
  });
}


// ========== Load Locations ==========
function loadLocations() {
  $.ajax({
    url: 'php/getAllLocations.php',
    type: 'GET',
    dataType: 'json',
    success: function (response) {
      const locations = response.data;
      const options = locations.map(loc => `<option value="${loc.id}">${loc.name}</option>`);
      $('#personnelLocation').html(options);
      $('#departmentLocation').html(options);
    }
  });
}

// ========== Reset Personnel Modal ==========
$('#addPersonnelModal').on('show.bs.modal', function (e) {
  if (!$(e.relatedTarget).hasClass('editPersonnelBtn')) {
    $('#personnelForm')[0].reset();
    $('#personnelID').val('');
    $('#addPersonnelLabel').text('Add Employee');
  }
  loadDepartmentDropdown();  // ✅ This populates the dropdown correctly
  loadLocations();
});


// ========== Reset Department Modal ==========
$('#departmentModal').on('show.bs.modal', function (e) {
  if (!$(e.relatedTarget).hasClass('editDepartmentBtn')) {
    $('#departmentForm')[0].reset();
    $('#departmentID').val('');
    $('#departmentModalLabel').text('Add Department');
  }
  loadLocations();
});

// ========== Submit Personnel Form ==========
$('#personnelForm').submit(function (e) {
  e.preventDefault();
  const isEdit = $('#personnelID').val() !== '';
  const url = isEdit ? 'php/updatePersonnel.php' : 'php/insertPersonnel.php';

  $.ajax({
    url,
    type: 'POST',
    data: $(this).serialize(),
    success: function () {
      $('#addPersonnelModal').modal('hide');
      loadPersonnel();
    }
  });
});

// ========== Submit Department Form ==========
$('#departmentForm').submit(function (e) {
  e.preventDefault();
  const isEdit = $('#departmentID').val() !== '';
  const url = isEdit ? 'php/updateDepartment.php' : 'php/insertDepartment.php';

  $.ajax({
    url,
    type: 'POST',
    data: $(this).serialize(),
    success: function () {
      $('#departmentModal').modal('hide');
      loadDepartmentsTable();
    }
  });
});

// ========== Edit Personnel ==========
$(document).on('click', '.editPersonnelBtn', function () {
  const id = $(this).data('id');

  $.ajax({
    url: 'php/getPersonnelByID.php',
    type: 'GET',
    data: { id },
    dataType: 'json',
    success: function (response) {
      const person = response.data.personnel[0];
      $('#personnelID').val(person.id);
      $('#personnelFirstName').val(person.firstName);
      $('#personnelLastName').val(person.lastName);
      $('#personnelEmail').val(person.email);
      $('#personnelJobTitle').val(person.jobTitle);
      $('#personnelDepartment').val(person.departmentID);
      $('#addPersonnelLabel').text('Edit Employee');
    }
  });
});

// ========== Edit Department ==========
$(document).on('click', '.editDepartmentBtn', function () {
  const id = $(this).data('id');

  $.ajax({
    url: 'php/getDepartmentByID.php',
    type: 'GET',
    data: { id },
    dataType: 'json',
    success: function (res) {
      const dept = res.data;
      $('#departmentID').val(dept.id);
      $('#departmentName').val(dept.name);
      $('#departmentLocation').val(dept.locationID);
      $('#departmentModalLabel').text('Edit Department');
    }
  });
});

// ========== Delete Personnel ==========
$(document).on('click', '.deletePersonnelBtn', function () {
  const id = $(this).data('id');

  if (confirm('Are you sure you want to delete this employee?')) {
    $.ajax({
      url: 'php/deletePersonnel.php',
      type: 'POST',
      data: { id },
      success: function () {
        loadPersonnel();
      }
    });
  }
});

// Delete department
$(document).on('click', '.deleteDepartmentBtn', function () {
  const id = $(this).data('id');

  if (confirm('Are you sure you want to delete this department?')) {
    $.ajax({
      url: 'php/deleteDepartmentByID.php',
      type: 'POST',
      data: { id: id },
      success: function (response) {
        if (response.status.code === "200") {
          loadDepartments();
        } else {
          alert('Delete failed: ' + response.status.description);
        }
      },
      error: function () {
        alert('Error occurred while deleting.');
      }
    });
  }
});


// ========== Tab Switching (load departments when tab is clicked) ==========
$('a[data-bs-target="#departments"]').on('shown.bs.tab', function () {
  loadDepartmentsTable();
});

// ========== Live Search ==========
$('#searchPersonnel').on('input', function () {
  const searchTerm = $(this).val().toLowerCase();
  $('#personnelTableBody tr').each(function () {
    const rowText = $(this).text().toLowerCase();
    $(this).toggle(rowText.includes(searchTerm));
  });
});

// ====================
// Load All Locations
// ====================
function loadLocationsTable() {
  $.ajax({
    url: 'php/getAllLocations.php',
    type: 'GET',
    dataType: 'json',
    success: function (response) {
      const locations = response.data;
      let rows = '';

      locations.forEach(loc => {
        rows += `
          <tr>
            <td>${loc.name}</td>
            <td>
              <button class="btn btn-sm btn-warning editLocationBtn" data-id="${loc.id}" data-bs-toggle="modal" data-bs-target="#locationModal">Edit</button>
              <button class="btn btn-sm btn-danger deleteLocationBtn" data-id="${loc.id}">Delete</button>
            </td>
          </tr>
        `;
      });

      $('#locationTableBody').html(rows);
    },
    error: function () {
      console.error('Failed to load locations.');
    }
  });
}


// ====================
// Show Location Modal
// ====================
$('#locationModal').on('show.bs.modal', function (e) {
  if (!$(e.relatedTarget).hasClass('editLocationBtn')) {
    $('#locationForm')[0].reset();
    $('#locationID').val('');
    $('#locationModalLabel').text('Add Location');
  }
});

// ====================
// Submit Location Form
// ====================
$('#locationForm').submit(function (e) {
  e.preventDefault();
  const isEdit = $('#locationID').val() !== '';
  const url = isEdit ? 'php/updateLocation.php' : 'php/insertLocation.php';

  $.ajax({
    url,
    type: 'POST',
    data: $(this).serialize(),
    success: function () {
      $('#locationModal').modal('hide');
      loadLocationsTable();
    }
  });
});

// ====================
// Edit Location
// ====================
$(document).on('click', '.editLocationBtn', function () {
  const id = $(this).data('id');
  $.ajax({
    url: 'php/getLocationByID.php',
    type: 'GET',
    data: { id },
    dataType: 'json',
    success: function (res) {
      const loc = res.data;
      $('#locationID').val(loc.id);
      $('#locationName').val(loc.name);
      $('#locationModalLabel').text('Edit Location');
    }
  });
});

// ====================
// Delete Location
// ====================
$(document).on('click', '.deleteLocationBtn', function () {
  const id = $(this).data('id');

  if (confirm('Are you sure you want to delete this location?')) {
    $.ajax({
      url: 'php/deleteLocation.php',
      type: 'POST',
      data: { id },
      success: function (response) {
        if (response.status.code === "200") {
          loadLocationsTable();
        } else {
          alert(response.status.description);
        }
      },
      error: function () {
        alert('An error occurred while deleting the location.');
      }
    });
  }
});

// ====================
// Load Locations When Tab Is Shown
// ====================
$('a[data-bs-target="#locations"]').on('shown.bs.tab', function () {
  loadLocationsTable();
});



// ========== On Page Load ==========
$(document).ready(function () {
  loadLocationsTable();
  loadPersonnel();
  loadLocations(); // preload for modals
  loadDepartments(); 
});
