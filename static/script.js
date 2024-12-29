async function fetchJSONRPC(method, params = []) {
  const url = 'http://localhost:8332'; // Replace with actual JSON-RPC URL
  const headers = { 'Content-Type': 'application/json' };
  const body = JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 });

  try {
    const response = await fetch(url, { method: 'POST', headers, body });
    let res_json = await response.json();

    if (!response.ok) throw new Error(`${res_json["error"]}`);
    return res_json;
  } catch (error) {
    console.error(`Error fetching data for method ${method}:`, error);
    throw error;
  }
}

async function getBlockchainInfo() {
  try {
    const result = await fetchJSONRPC('getblockchaininfo');
    const { best_block, height, ibd, latest_block_time } = result.result;
    displayBlockchainInfo(best_block, height, ibd, latest_block_time);
  } catch (error) {
    console.log(error)
    document.getElementById('blockchain-info').innerHTML = '<p>Error fetching blockchain info. Please try again later.</p>';
  }
}

function displayBlockchainInfo(bestBlock, height, ibd, latestBlockTime) {
  const blockchainInfoContainer = document.getElementById('blockchain-info-data');
  blockchainInfoContainer.innerHTML = `
    <div class="info"><strong>Best Block Hash:</strong> ${bestBlock}</div>
    <div class="info"><strong>Best Block Height:</strong> ${height.toLocaleString()}</div>
    <div class="info"><strong>In Initial Block Download (IBD):</strong> ${ibd ? 'Yes' : 'No'}</div>
    <div class="info"><strong>Latest Block Time:</strong> ${new Date(latestBlockTime * 1000).toLocaleString()}</div>
  `;
}

async function getNodeInfo() {
  try {
    const result = await fetchJSONRPC('getpeerinfo');
    const peerCount = result.result.length;
    displayNodeInfo(peerCount);
  } catch (error) {
    console.error('Error fetching node info:', error);
    displayNodeInfo('N/A');
  }
}

function displayNodeInfo(peerCount) {
  const nodeInfoContainer = document.getElementById('node-info-data');
  nodeInfoContainer.innerHTML = `
    <div class="info"><strong>Number of Peers:</strong> ${peerCount}</div>
  `;
}

function showLoadingSpinner() {
  document.getElementById('loading-spinner-blockchain-info').style.display = 'block';
  document.getElementById('loading-spinner-nodeinfo').style.display = 'block';
}

function hideLoadingSpinner() {
  document.getElementById('loading-spinner-blockchain-info').style.display = 'none';
  document.getElementById('loading-spinner-nodeinfo').style.display = 'none';
}

async function updateInfo() {
  try {
    await getBlockchainInfo();
  } catch (error) {
    alert(error)
    console.error('Failed to fetch blockchain info:', error);
  }

  try {
    await getNodeInfo();
  } catch (error) {
    console.error('Failed to fetch node info:', error);
  }

  hideLoadingSpinner();
}

// Fetch data initially and set up auto-refresh
updateInfo();
setInterval(updateInfo, 5000);


// Handle theme toggle
function applyTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

function toggleTheme() {
  const themeSwitch = document.getElementById('theme-switch');
  console.log("here")
  themeSwitch.addEventListener('change', () => {
    const newTheme = themeSwitch.checked ? 'dark' : 'light';
    console.log("theme toggle")
    applyTheme(newTheme);
  });
}

// Set theme on page load
function initializeTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.body.setAttribute('data-theme', savedTheme);
  document.getElementById('theme-switch').checked = savedTheme === 'dark';
}

document.addEventListener('DOMContentLoaded', () => {
  const walletButton = document.getElementById('wallet-button');
  const walletFrame = document.getElementById('wallet-frame');
  const sendButton = document.getElementById('send-button');
  const descriptorInput = document.getElementById('descriptor-input');
  initializeTheme();
  toggleTheme();
  // Toggle wallet frame visibility
  walletButton.addEventListener('click', () => {
    descriptorInput.value = '';

    walletFrame.classList.toggle('visible');
  });

  function showMessage(message, isError = false) {
    const messageBox = document.getElementById('message-box');
    const messageText = document.getElementById('message-text');
    const closeMessageButton = document.getElementById('close-message-button');

    // Add status icon dynamically
    const statusIcon = document.getElementById("status-icon");
    statusIcon.textContent = isError ? '❌' : '✔️';

    // Update message content
    messageText.textContent = message;

    // Style based on success or error
    messageText.style.color = isError ? 'red' : 'green';

    // Clear any previous status icons
    const previousIcon = document.querySelector('.status-icon');
    if (previousIcon) {
      previousIcon.remove();
    }

    // Append the new status icon to the message content
    const messageContent = document.querySelector('.message-content');

    // Show the message box
    messageBox.style.display = 'flex';

    // Close button listener
    closeMessageButton.addEventListener('click', () => {
      messageBox.style.display = 'none';
    });
  }


  // Handle the send button click
  sendButton.addEventListener('click', async () => {
    const descriptor = descriptorInput.value.trim();
    if (!descriptor) {
      showMessage('Please enter a valid wallet descriptor.', true);
      return;
    }


    // Call the loaddescriptor RPC
    fetchJSONRPC('loaddescriptor', [descriptor])
      .then((response) => {
        showMessage('Wallet descriptor loaded successfully!');
      })
      .catch((error) => {
        showMessage(`florestad returned an error: ${error.message}`, true);
      })
    // Clear the input field and hide the frame
    descriptorInput.value = '';
    walletFrame.classList.remove('visible');
  });
});
