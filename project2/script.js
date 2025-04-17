$(document).ready(function () {

  // ========== INITIAL LOAD ==========
  loadPersonnel();
  loadDepartments();

  // ========== PERSONNEL ==========
  function loadPersonnel() {
    $.ajax({
      url: 'php/getAll.php',
      type: 'GET',
      dataType: 'json',
      success: function (response) {
        const personnel = response.data;
        let rows = '';
        personnel.forEach(person => {
          rows += `
            <tr>
              <td>${person.firstName} ${person.lastName}</td>
              <td>${person.email}</td>
              <td>${person.jobTitle}</td>
              <td>${person.department}</td>
              <td>${person.location}</td>
              <td><button class="btn btn-sm btn-warning" data-id="${person.id}" data-bs-toggle="modal" data-bs-target="#editPersonnelModal">Edit</button></td>
              <td><button class="btn btn-sm btn-danger deletePersonnelBtn" data-id="${person.id}">Delete</button></td>
            </tr>
          `;
        });
        $('#personnelTableBody').html(rows);
      }
    });


    
  }

  $('#editPersonnelModal').on('show.bs.modal', function (event) {
    const button = $(event.relatedTarget);
    const id = button.data('id');

    $.ajax({
      url: 'php/getAllDepartments.php',
      type: 'GET',
      dataType: 'json',
      success: function (response) {
        const options = response.data.map(dept => `<option value="${dept.id}">${dept.name}</option>`);
        $('#department').html(options.join(""));

        if (id) {
          $.ajax({
            url: 'php/getPersonnelByID.php',
            type: 'GET',
            data: { id },
            dataType: 'json',
            success: function (data) {
              const person = data.data;
              $('#personnelId').val(person.id);
              $('#firstName').val(person.firstName);
              $('#lastName').val(person.lastName);
              $('#email').val(person.email);
              $('#jobTitle').val(person.jobTitle);
              $('#department').val(person.departmentID);
            }
          });
        } else {
          $('#editPersonnelForm')[0].reset();
          $('#personnelId').val('');
        }
      }
    });
  });

  $('#editPersonnelForm').submit(function (e) {
    e.preventDefault();
    const isEdit = $('#personnelId').val() !== '';
    const url = isEdit ? 'php/updatePersonnel.php' : 'php/insertPersonnel.php';

    $.ajax({
      url,
      type: 'POST',
      data: $(this).serialize(),
      success: function () {
        $('#editPersonnelModal').modal('hide');
        loadPersonnel();
      }
    });
  });

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

  // ========== DEPARTMENTS ==========
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
              <td>${dept.locationName}</td>
              <td><button class="btn btn-sm btn-warning editDepartmentBtn" data-id="${dept.id}" data-bs-toggle="modal" data-bs-target="#departmentModal">Edit</button></td>
              <td><button class="btn btn-sm btn-danger deleteDepartmentBtn" data-id="${dept.id}">Delete</button></td>
            </tr>
          `;
        });
        $('#departmentTableBody').html(rows);
      }
    });
  }

  $('#departmentModal').on('show.bs.modal', function (event) {
    const button = $(event.relatedTarget);
    const id = button.data('id');

    $.ajax({
      url: 'php/getAllLocations.php',
      type: 'GET',
      dataType: 'json',
      success: function (response) {
        const options = response.data.map(loc => `<option value="${loc.id}">${loc.name}</option>`);
        $('#departmentLocation').html(options.join(""));
    
        if (id) {
          $.ajax({
            url: 'php/getDepartmentByID.php',
            type: 'GET',
            data: { id },
            dataType: 'json',
            success: function (res) {
              const dept = res.data;
              $('#departmentId').val(dept.id);
              $('#departmentName').val(dept.name);
              $('#departmentLocation').val(dept.locationID);
              $('#departmentModalLabel').text('Edit Department');
            }
          });
        } else {
          $('#departmentForm')[0].reset();
          $('#departmentId').val('');
          $('#departmentModalLabel').text('Add Department');
        }
      }
    
    
    });
  });

  $('#departmentForm').submit(function (e) {
    e.preventDefault();
    const isEdit = $('#departmentId').val() !== '';
    const url = isEdit ? 'php/updateDepartment.php' : 'php/insertDepartment.php';

    $.ajax({
      url,
      type: 'POST',
      data: $(this).serialize(),
      success: function () {
        $('#departmentModal').modal('hide');
        loadDepartments();
      }
    });
  });

  $(document).on('click', '.deleteDepartmentBtn', function () {
    const id = $(this).data('id');
    if (confirm('Are you sure you want to delete this department?')) {
      $.ajax({
        url: 'php/deleteDepartmentByID.php',
        type: 'POST',
        data: { id },
        success: function (response) {
          if (response.status.code === "200") {
            loadDepartments();
          } else {
            alert("Delete failed: " + response.status.description);
          }
        }
      });
    }
  });

  // ========== LOCATIONS ==========
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
              <td><button class="btn btn-sm btn-warning editLocationBtn" data-id="${loc.id}" data-bs-toggle="modal" data-bs-target="#locationModal">Edit</button></td>
              <td><button class="btn btn-sm btn-danger deleteLocationBtn" data-id="${loc.id}">Delete</button></td>
            </tr>
          `;
        });
        $('#locationTableBody').html(rows);
      }
    });
  }

  $('#locationModal').on('show.bs.modal', function (event) {
    const button = $(event.relatedTarget);
    const id = button.data('id');

    if (id) {
      $.ajax({
        url: 'php/getLocationByID.php',
        type: 'GET',
        data: { id },
        dataType: 'json',
        success: function (res) {
          const loc = res.data;
          $('#locationId').val(loc.id);
          $('#locationName').val(loc.name);
          $('#locationModalLabel').text('Edit Location');
        }
      });
    } else {
      $('#locationForm')[0].reset();
      $('#locationId').val('');
      $('#locationModalLabel').text('Add Location');
    }
  });

  $('#locationForm').submit(function (e) {
    e.preventDefault();
    const isEdit = $('#locationId').val() !== '';
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
            alert("Delete failed: " + response.status.description);
          }
        }
      });
    }
  });

  loadLocationsTable(); 

$('a[data-bs-target="#locations"]').on('shown.bs.tab', function () {
  loadLocationsTable(); 
});



  // ========== EMPLOYEES TAB ==========
  $('button[data-bs-target="#employees"]').on('shown.bs.tab', function () {

    $.ajax({
      url: 'php/getAll.php',
      type: 'GET',
      dataType: 'json',
      success: function (response) {
        const names = response.data.map(person => `
          <li class="list-group-item">${person.firstName} ${person.lastName}</li>
        `);
        $('#employeeNamesList').html(names.join(''));
      },
      error: function () {
        $('#employeeNamesList').html('<li class="list-group-item text-danger">Failed to load employees</li>');
      }
    });
  });


});





