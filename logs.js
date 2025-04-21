document.addEventListener('DOMContentLoaded', () => {
    const logList = document.getElementById('log-list');
    const clearLogsBtn = document.getElementById('clear-logs-btn');
    const LOCAL_STORAGE_KEY = 'calorieTrackerMultiDayData'; // Use the same key

    function displayLogs() {
        // Load data from localStorage
        const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        let appData = null;

        // Clear previous logs first
        logList.innerHTML = '';

        if (storedData) {
            try {
                appData = JSON.parse(storedData);
            } catch (e) {
                console.error("Error parsing stored log data:", e);
                logList.innerHTML = '<li>Error loading log data.</li>';
                return;
            }
        }

        if (!appData || !appData.logs || Object.keys(appData.logs).length === 0) {
            logList.innerHTML = '<li>No log history found.</li>';
            return;
        }

        // Sort day keys numerically
        const sortedDayKeys = Object.keys(appData.logs).map(Number).sort((a, b) => a - b);

        // Iterate through sorted days and display logs
        sortedDayKeys.forEach(dayKey => {
            const dayLog = appData.logs[dayKey.toString()];
            if (!dayLog || !dayLog.items) return;

            let calIn = 0;
            let calOut = 0;
            dayLog.items.forEach(item => {
                if (item.calories > 0) calIn += item.calories;
                else calOut += Math.abs(item.calories);
            });

            const netCal = calIn - calOut;

            const li = document.createElement('li');
            li.classList.add('log-entry');

            const daySpan = document.createElement('span');
            daySpan.classList.add('log-day');
            daySpan.textContent = `Day ${dayKey}`;

            const netCalSpan = document.createElement('span');
            netCalSpan.classList.add('log-net-calories');
            netCalSpan.textContent = `${netCal >= 0 ? '+' : ''}${netCal} kcal`;
            netCalSpan.classList.add(netCal >= 0 ? 'positive' : 'negative');

            li.appendChild(daySpan);
            li.appendChild(netCalSpan);
            logList.appendChild(li);
        });
    }

    // Add event listener for the clear button
    if (clearLogsBtn) {
        clearLogsBtn.addEventListener('click', () => {
            // Confirm with the user
            if (window.confirm('Are you sure you want to delete all log history? This action cannot be undone.')) {
                // Clear localStorage
                localStorage.removeItem(LOCAL_STORAGE_KEY);

                // Update the display immediately
                displayLogs(); // This will now show "No log history found"

                alert('Log history cleared.');
            }
        });
    }

    // Initial display of logs on page load
    displayLogs();
}); 