document.addEventListener('DOMContentLoaded', function () {
  const serviceRows = document.querySelectorAll('.service-row');

  serviceRows.forEach(row => {
    const checkbox = row.querySelector('input[type="checkbox"]');
    const select = row.querySelector('select');
    // Initial state: disable select if checkbox not checked
    select.disabled = !checkbox.checked;

    // Event handler: when checkbox is toggled
    checkbox.addEventListener('change', function () {
      select.disabled = !this.checked;

      if (this.checked) {
        const serviceName = this.getAttribute('data-name');
        alert('You selected: ' + this.value + ' - ' + serviceName);
      }
      // When select option changes
      select.addEventListener('change', function () {
        const selectedStaff = this.value;
        alert('You selected staff: ' + selectedStaff);
      });
    });
  });
});