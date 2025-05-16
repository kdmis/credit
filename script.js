let sampleData = [];
let filteredData = [];
let currentPage = 1;
const rowsPerPage = 20;

const updateCurrentDate = () => {
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', options);
};

const updatePendingCount = () => {
  document.getElementById('pending-count').textContent = filteredData.length;
};

const renderTable = () => {
  const tableBody = document.getElementById('data-table-body');
  const noDataMessage = document.getElementById('no-data-message');
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, filteredData.length);

  tableBody.innerHTML = '';

  if (filteredData.length === 0) {
    noDataMessage.style.display = 'block';
    document.getElementById('page-info').textContent = `Showing 0 to 0 of 0 entries`;
    return;
  }

  noDataMessage.style.display = 'none';

  for (let i = startIndex; i < endIndex; i++) {
    const row = filteredData[i];
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.AcNo}</td>
      <td>${row.FormNo}</td>
      <td>${row.Name}</td>
      <td><span class="status-badge status-pending">Pending</span></td>
      <td>
        <button class="action-button done-button" onclick="markAsDone('${row.AcNo}', '${row.FormNo}')">Done</button>
      </td>
    `;
    tableBody.appendChild(tr);
  }

  document.getElementById('page-info').textContent = `Showing ${startIndex + 1} to ${endIndex} of ${filteredData.length} entries`;
  updatePagination();
};

const updatePagination = () => {
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginationButtons = document.getElementById('pagination-buttons');

  const prevButton = document.getElementById('prev-page');
  const nextButton = document.getElementById('next-page');
  paginationButtons.innerHTML = '';
  paginationButtons.appendChild(prevButton);

  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement('button');
    button.className = `page-button ${i === currentPage ? 'active' : ''}`;
    button.textContent = i;
    button.addEventListener('click', () => {
      currentPage = i;
      renderTable();
    });
    paginationButtons.appendChild(button);
  }

  paginationButtons.appendChild(nextButton);
  prevButton.classList.toggle('disabled', currentPage === 1);
  nextButton.classList.toggle('disabled', currentPage === totalPages || totalPages === 0);
};

const handleSearch = () => {
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-button');

  const performSearch = (searchTerm) => {
    if (!searchTerm) {
      filteredData = [...sampleData];
    } else {
      const lowerSearch = searchTerm.toLowerCase();
      filteredData = sampleData.filter(row =>
        String(row.Name || '').toLowerCase().includes(lowerSearch) ||
        String(row.FormNo || '').toLowerCase().includes(lowerSearch) ||
        String(row.AcNo || '').includes(lowerSearch)
      );
    }
    currentPage = 1;
    renderTable();
  };

  searchInput.addEventListener('input', (e) => {
    performSearch(e.target.value.trim());
  });

  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSearch(searchInput.value.trim());
    }
  });

  if (searchButton) {
    searchButton.addEventListener('click', () => {
      performSearch(searchInput.value.trim());
    });
  }
};

const initEventListeners = () => {
  document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderTable();
    }
  });

  document.getElementById('next-page').addEventListener('click', () => {
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      renderTable();
    }
  });
};

const fetchData = async () => {
  const loader = document.getElementById('loader');
  loader.style.display = 'block';

  try {
    const response = await fetch('https://script.google.com/macros/s/AKfycby8XEcXvhv4W6FO4R4mk4A4Epf0-YnLoQcCjOLCJAtMGEax1CPTEFyCywXMudTZ4brU/exec');
    const data = await response.json();

    sampleData = Array.isArray(data) ? data : [];
    filteredData = [...sampleData];
    updatePendingCount();
    renderTable();
  } catch (error) {
    console.error('Failed to fetch data:', error);
    document.getElementById('no-data-message').textContent = 'Failed to load data.';
    document.getElementById('no-data-message').style.display = 'block';
  } finally {
    loader.style.display = 'none';
  }
};

const markAsDone = async (acNo, formNo) => {
  const loaderModal = document.getElementById('done-loader-modal');
  loaderModal.classList.add('active');

  try {
    const response = await fetch('https://script.google.com/macros/s/AKfycby8XEcXvhv4W6FO4R4mk4A4Epf0-YnLoQcCjOLCJAtMGEax1CPTEFyCywXMudTZ4brU/exec', {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'markAsDone',
        accountNumber: acNo
      })
    });

    alert(`Form No. ${formNo} marked as done successfully!`);
    sampleData = sampleData.filter(row => row.FormNo !== formNo);
    filteredData = filteredData.filter(row => row.FormNo !== formNo);
    renderTable();
    updatePendingCount();
  } catch (error) {
    console.error('Error marking as done:', error);
    alert('Network or server error. Please try again.');
  } finally {
    loaderModal.classList.remove('active');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  updateCurrentDate();
  initEventListeners();
  handleSearch();
  fetchData();
});
