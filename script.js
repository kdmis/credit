let sampleData = [];

let currentPage = 1;
const rowsPerPage = 20;
let filteredData = [];

const updateCurrentDate = () => {
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', options);
};

const updatePendingCount = () => {
  document.getElementById('pending-count').textContent = sampleData.length;
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

// Modified handleSearch function
const handleSearch = () => {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) {
    console.error('Search input element not found');
    return;
  }
  
  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    if (searchTerm === '') {
      filteredData = [...sampleData];
    } else {
      filteredData = sampleData.filter(row => {
        // Convert values to strings safely before using toLowerCase()
        const name = String(row.Name || '').toLowerCase();
        const formNo = String(row.FormNo || '').toLowerCase();
        const acNo = String(row.AcNo || '');
        
        return name.includes(searchTerm) || 
               formNo.includes(searchTerm) || 
               acNo.includes(searchTerm);
      });
    }
    currentPage = 1;
    renderTable();
  });
  
  // Add support for search button click and Enter key press
  const searchButton = document.getElementById('search-button'); // Assuming you have a search button
  if (searchButton) {
    searchButton.addEventListener('click', () => {
      const searchTerm = searchInput.value.toLowerCase().trim();
      performSearch(searchTerm);
    });
  }
  
  // Add Enter key support
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const searchTerm = searchInput.value.toLowerCase().trim();
      performSearch(searchTerm);
    }
  });
};

// Helper function to perform search
const performSearch = (searchTerm) => {
  if (searchTerm === '') {
    filteredData = [...sampleData];
  } else {
    filteredData = sampleData.filter(row => {
      // Convert values to strings safely before using toLowerCase()
      const name = String(row.Name || '').toLowerCase();
      const formNo = String(row.FormNo || '').toLowerCase();
      const acNo = String(row.AcNo || '');
      
      return name.includes(searchTerm) || 
             formNo.includes(searchTerm) || 
             acNo.includes(searchTerm);
    });
  }
  currentPage = 1;
  renderTable();
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
    const response = await fetch('https://script.google.com/macros/s/AKfycbx73CMmpDCceskHIFORGMzAIARmM1nA4v8Jz1F5s6sMr_-u5t7GT83zYbrqjWNkASg_XA/exec'); // 👈 Insert your Apps Script or API URL here
    const data = await response.json();

    sampleData = data || [];
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

async function markAsDone(acNo, formNo) {
  const loaderModal = document.getElementById('done-loader-modal');
  loaderModal.classList.add('active');

  try {
    const response = await fetch('https://script.google.com/macros/s/AKfycbx73CMmpDCceskHIFORGMzAIARmM1nA4v8Jz1F5s6sMr_-u5t7GT83zYbrqjWNkASg_XA/exec', {
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

    const text = await response.text();
    console.log("Raw response text:", text);

    let result = {};
    try {
      result = JSON.parse(text);
    } catch (jsonError) {
      console.error('Invalid JSON returned from server:', jsonError);
      alert('File Marked as Filled Successfully');
      return;
    }

    if (result.success) {
      alert(`Form No. ${formNo} marked as done successfully!`);
      sampleData = sampleData.filter(row => row.FormNo !== formNo);
      filteredData = filteredData.filter(row => row.FormNo !== formNo);
      renderTable();
      updatePendingCount();
    } else {
      alert(`Failed to mark as done: ${result.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error marking as done:', error);
    alert('Network or server error. Please try again.');
  } finally {
    loaderModal.classList.remove('active');
  }
}



// Make sure handleSearch is called after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  updateCurrentDate();
  initEventListeners();
  handleSearch(); // This should now work properly
  fetchData();
});
