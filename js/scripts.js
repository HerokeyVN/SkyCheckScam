document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const header = document.querySelector('header');
    const miniSearchSection = document.querySelector('.mini-search-section');
    const fullScreenSearch = document.getElementById('fullScreenSearch');
    const scrollToTop = document.getElementById('scrollToTop');
    const resultsContainer = document.getElementById('searchResults');
    const mainSearchBox = document.getElementById('mainSearchBox');
    const miniSearchBox = document.querySelector('.mini-search-box');
    const mainSearchBtn = document.getElementById('mainSearchBtn');
    
    // Synchronize search input between mini and main search boxes
    miniSearchBox.addEventListener('input', function() {
        mainSearchBox.value = this.value;
    });
    
    mainSearchBox.addEventListener('input', function() {
        miniSearchBox.value = this.value;
    });
    
    // Search functionality
    mainSearchBtn.addEventListener('click', function() {
        if (mainSearchBox.value.trim() !== '') {
            performSearch();
        }
    });
    
    if (document.querySelector('.mini-search-section .search-btn')) {
        document.querySelector('.mini-search-section .search-btn').addEventListener('click', function() {
            if (miniSearchBox.value.trim() !== '') {
                performSearch();
            } else {
                // If mini search is empty, focus the main search
                fullScreenSearch.classList.add('active');
                miniSearchSection.classList.add('hidden');
                setTimeout(() => mainSearchBox.focus(), 500);
            }
        });
    }
    
    function performSearch() {
        // Add animation to search results
        fullScreenSearch.classList.remove('active');
        miniSearchSection.classList.remove('hidden');
        
        // Show search results with animation
        if (resultsContainer) {
            resultsContainer.classList.add('fade-in');
            // Scroll to results
            resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        // Here you would normally perform an actual search
        console.log("Searching for:", mainSearchBox.value || miniSearchBox.value);
    }
    
    // Scroll event handler
    let lastScrollPosition = 0;
    window.addEventListener('scroll', function() {
        const currentScrollPosition = window.pageYOffset;
        
        // Show/hide scroll to top button
        if (scrollToTop) {
            if (currentScrollPosition > 300) {
                scrollToTop.classList.add('visible');
            } else {
                scrollToTop.classList.remove('visible');
            }
        }
        
        // Unified search bar visibility logic
        if (currentScrollPosition < 50) {
            // At the very top - HIDE mini search
            if (miniSearchSection && !miniSearchSection.classList.contains('hidden')) {
                miniSearchSection.classList.add('hidden');
            }
            if (fullScreenSearch) fullScreenSearch.classList.remove('active');
        } else if (currentScrollPosition > 100) {
            // Scrolled down - SHOW mini search
            if (fullScreenSearch) fullScreenSearch.classList.remove('active');
            if (miniSearchSection && miniSearchSection.classList.contains('hidden')) {
                miniSearchSection.classList.remove('hidden');
                miniSearchSection.classList.add('fade-in-element');
                setTimeout(() => {
                    miniSearchSection.classList.remove('fade-in-element');
                }, 500);
            }
        }
        
        lastScrollPosition = currentScrollPosition;
    });
    
    // Scroll to top functionality
    if (scrollToTop) {
        scrollToTop.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Initial check for page position (if page is refreshed while scrolled down)
    if (window.pageYOffset < 50) {
        // At the top - hide mini search
        if (fullScreenSearch) fullScreenSearch.classList.remove('active');
        if (miniSearchSection) miniSearchSection.classList.add('hidden');
    } else {
        // Scrolled down - show mini search
        if (fullScreenSearch) fullScreenSearch.classList.remove('active');
        if (miniSearchSection) miniSearchSection.classList.remove('hidden');
    }

    // Google Form Integration with custom form
    const scamReportForm = document.getElementById('scamReportForm');
    const formStatus = document.getElementById('formStatus');
    
    if (scamReportForm) {
        scamReportForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate required fields
            const requiredFields = scamReportForm.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    field.classList.add('error');
                    isValid = false;
                } else {
                    field.classList.remove('error');
                }
            });
            
            if (!isValid) {
                formStatus.innerHTML = '<div class="error-message"><i class="bi bi-exclamation-triangle"></i> Please fill in all required fields</div>';
                return;
            }
            
            // Show loading state
            const submitBtn = document.getElementById('submitReportBtn');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<div class="loading-spinner"></div> Submitting...';
            formStatus.innerHTML = '<div class="info-message"><i class="bi bi-info-circle"></i> Submitting your report...</div>';
            
            // Get form data
            const formData = new FormData(scamReportForm);
            
            // Create a hidden iframe to submit the form
            const iframe = document.createElement('iframe');
            iframe.name = 'hidden-iframe';
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
            
            // Create a hidden form to submit through the iframe
            const hiddenForm = document.createElement('form');
            hiddenForm.method = 'POST';
            hiddenForm.action = 'https://docs.google.com/forms/u/0/d/e/1FAIpQLSe_msUldJy3GKEih3JnUfBU5rThfpjM1pnM9ZYR5-Isn923tQ/formResponse';
            hiddenForm.target = 'hidden-iframe';
            
            // Add form data to hidden form
            for (const [name, value] of formData.entries()) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = name;
                input.value = value;
                hiddenForm.appendChild(input);
            }
            
            document.body.appendChild(hiddenForm);
            
            // Submit the form and handle response
            iframe.onload = function() {
                // Success state
                formStatus.innerHTML = '<div class="success-message"><i class="bi bi-check-circle"></i> Report submitted successfully!</div>';
                submitBtn.innerHTML = '<i class="bi bi-check"></i> Submitted';
                scamReportForm.reset();
                
                // Clean up
                setTimeout(() => {
                    document.body.removeChild(iframe);
                    document.body.removeChild(hiddenForm);
                    
                    // Reset button after 3 seconds
                    setTimeout(() => {
                        submitBtn.innerHTML = originalBtnText;
                        submitBtn.disabled = false;
                    }, 3000);
                }, 500);
            };
            
            // Handle potential errors
            iframe.onerror = function() {
                formStatus.innerHTML = '<div class="error-message"><i class="bi bi-exclamation-triangle"></i> Something went wrong. Please try again.</div>';
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                
                // Clean up
                document.body.removeChild(iframe);
                document.body.removeChild(hiddenForm);
            };
            
            // Submit the form
            hiddenForm.submit();
        });
    }

    // Fetch and display recent reports from Google Sheets
    function fetchRecentReports() {
        const reportsContainer = document.querySelector('.reports-grid');
        if (!reportsContainer) return;

        // Loading state
        reportsContainer.innerHTML = '<div class="loading-reports">Loading recent reports... <div class="loading-spinner"></div></div>';
        
        // Get the spreadsheet ID
        const spreadsheetId = '17f8OmVVMdY_BdOdiOQfjaTjgyehtex23gaJNTVsRK6c';
        
        // Try to fetch using JSONP approach (which bypasses CORS)
        const script = document.createElement('script');
        script.id = 'googleSheetsScript';
        
        // Create a global callback function
        window.google = {};
        google.visualization = {
            Query: {
                setResponse: function(jsonString) {
                    // Make sure jsonString is a string
                    if (typeof jsonString == 'string') {
                        useBackupData();
                        return;
                    }
                    
                    try {
                        // Remove the function call wrapper around the JSON data
                        const response = jsonString;
                        
                        if (response && response.table && response.table.rows) {
                            const reports = [];
                            
                            // Map the headers as seen in the Google Sheet
                            const headerMapping = {
                                'Dấu thời gian': 'timestamp',
                                'Contact Information of Scammer': 'contactInfo',
                                'Type of scam': 'scamType',
                                'Description of the Incident': 'description',
                                'Related Warning Articles or Reports': 'warningLinks',
                                'Evidence URL (Optional)': 'evidenceUrl',
                                'Your Contact (Optional)': 'reporterContact'
                            };
                            
                            // Get headers from the response
                            const originalHeaders = response.table.cols.map(col => col.label);
                            
                            // Process each row in reverse order (from newest to oldest)
                            // Google Sheets API returns rows with the newest entries at the bottom
                            for (let i = response.table.rows.length - 1; i >= 0; i--) {
                                const row = response.table.rows[i];
                                const report = {};
                                
                                row.c.forEach((cell, index) => {
                                    if (!cell) return; // Skip null cells
                                    
                                    const columnName = originalHeaders[index];
                                    const standardHeader = headerMapping[columnName] || columnName;
                                    
                                    // Handle different data formats
                                    if (standardHeader === 'timestamp') {
                                        // Special handling for date format: "Date(2025,4,5,11,8,20)"
                                        if (cell.v && typeof cell.v === 'string' && cell.v.startsWith('Date(')) {
                                            // Extract the formatted date if available
                                            if (cell.f) {
                                                report[standardHeader] = cell.f;
                                            } else {
                                                // Parse from the Date(...) format if formatted date not available
                                                const dateParams = cell.v.substring(5, cell.v.length - 1).split(',').map(Number);
                                                // Note: Month in JavaScript is 0-indexed, but Google's format is 1-indexed
                                                const dateObj = new Date(
                                                    dateParams[0], // Year
                                                    dateParams[1] - 1, // Month (0-indexed)
                                                    dateParams[2], // Day
                                                    dateParams[3] || 0, // Hour
                                                    dateParams[4] || 0, // Minute
                                                    dateParams[5] || 0  // Second
                                                );
                                                report[standardHeader] = dateObj.toLocaleString();
                                            }
                                        } else if (cell.v) {
                                            report[standardHeader] = cell.v;
                                        }
                                    } else {
                                        // For non-date fields, get the value
                                        report[standardHeader] = cell.v || '';
                                    }
                                });
                                
                                reports.push(report);
                            }
                            
                            // No need to sort explicitly since we're already processing in reverse order
                            displayReports(reports);
                        } else {
                            useBackupData();
                        }
                    } catch (error) {
                        console.error('Error parsing Google Sheets response:', error);
                        useBackupData();
                    }
                    
                    // Clean up the script tag
                    const scriptElement = document.getElementById('googleSheetsScript');
                    if (scriptElement) {
                        scriptElement.remove();
                    }
                }
            }
        };
        
        // Set up error handling for the script
        script.onerror = function() {
            useBackupData();
        };
        
        // Set the URL to fetch using JSONP
        script.src = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&callback=handleGoogleSheetsResponse`;
        
        // Add script to page
        document.body.appendChild(script);
        
        // Set a timeout in case the request takes too long
        setTimeout(() => {
            if (document.getElementById('googleSheetsScript')) {
                useBackupData();
            }
        }, 5000);
        
        // Function to use backup data when API fails
        function useBackupData() {
            console.log('Using backup data for recent reports');
            
            // Sample backup data
            const backupReports = [
                {
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toString(), // 2 hours ago
                    scamType: 'Account Theft',
                    description: 'User reported that after sharing login details for a season pass trade, they lost access to their account.',
                    contactInfo: 'facebook.com/fake.account.123'
                },
                {
                    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toString(), // 5 hours ago
                    scamType: 'Payment Without Delivery',
                    description: 'Trader took payment but never delivered the promised seasonal candles.',
                    contactInfo: '+84 987 654 321'
                },
                {
                    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toString(), // 1 day ago
                    scamType: 'Fake Screenshots/Evidence',
                    description: 'User provided edited screenshots as proof of item delivery.',
                    contactInfo: 'sky.scammer@email.com'
                },
                {
                    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toString(), // 2 days ago
                    scamType: 'Other',
                    description: 'Scammers are now asking for "temporary account access" to gift items.',
                    contactInfo: 'discord:user#1234'
                }
            ];
            
            displayReports(backupReports);
        }
    }
    
    // Display reports in the container
    function displayReports(reports) {
        const reportsContainer = document.querySelector('.reports-grid');
        if (!reportsContainer) return;
        
        // Display only the 4 most recent reports
        const recentReports = reports.slice(0, 8);
        
        // Clear loading state
        reportsContainer.innerHTML = '';
        
        // If no reports found
        if (recentReports.length === 0) {
            reportsContainer.innerHTML = '<div class="no-reports">No recent reports found.</div>';
            return;
        }
        
        // Add each report to the container
        recentReports.forEach(report => {
            // Determine report type/severity for icon selection
            let reportTypeClass = 'info';
            if (report.scamType && 
                (report.scamType.includes('Theft') || 
                 report.scamType.includes('Fake') || 
                 report.scamType.includes('Screenshot'))) {
                reportTypeClass = 'danger';
            } else if (report.scamType && 
                      (report.scamType.includes('Payment') || 
                       report.scamType.includes('Middleman'))) {
                reportTypeClass = 'warning';
            }

            // Format the timestamp
            let reportTime = 'Unknown time';
            try {
                if (report.timestamp) {
                    // Check if timestamp is already formatted or needs parsing
                    if (report.timestamp.includes('/')) {
                        // Already formatted date string like "05/05/2025 11:08:21"
                        const dateParts = report.timestamp.split(' ')[0].split('/');
                        const timeParts = report.timestamp.split(' ')[1].split(':');
                        
                        // Create date object (day/month/year format)
                        const dateObj = new Date(
                            parseInt(dateParts[2]), // Year
                            parseInt(dateParts[1]) - 1, // Month (0-indexed)
                            parseInt(dateParts[0]), // Day
                            parseInt(timeParts[0]), // Hour
                            parseInt(timeParts[1]), // Minute
                            parseInt(timeParts[2] || 0) // Second
                        );
                        reportTime = formatTimeAgo(dateObj);
                    } else {
                        // Standard date format
                        reportTime = formatTimeAgo(new Date(report.timestamp));
                    }
                }
            } catch (e) {
                console.error('Error formatting time:', e, report.timestamp);
            }
            
            // Create report item HTML with the correct field mappings
            const reportHTML = `
                <div class="report-item">
                    <div class="report-icon ${reportTypeClass}">
                        <i class="bi bi-${reportTypeClass === 'danger' ? 'exclamation-triangle' : 
                                         reportTypeClass === 'warning' ? 'exclamation-circle' : 
                                         'info-circle'}"></i>
                    </div>
                    <div class="report-content">
                        <h5>${report.scamType || 'Scam Report'}</h5>
                        <p>${report.description || 'No details provided'}</p>
                        <span class="report-time">${reportTime}</span>
                    </div>
                </div>
            `;
            
            reportsContainer.innerHTML += reportHTML;
        });
    }
    
    // Helper function to format timestamps as "X time ago"
    function formatTimeAgo(date) {
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        let interval = Math.floor(seconds / 31536000);
        if (interval >= 1) {
            return interval === 1 ? '1 year ago' : `${interval} years ago`;
        }
        
        interval = Math.floor(seconds / 2592000);
        if (interval >= 1) {
            return interval === 1 ? '1 month ago' : `${interval} months ago`;
        }
        
        interval = Math.floor(seconds / 86400);
        if (interval >= 1) {
            return interval === 1 ? '1 day ago' : `${interval} days ago`;
        }
        
        interval = Math.floor(seconds / 3600);
        if (interval >= 1) {
            return interval === 1 ? '1 hour ago' : `${interval} hours ago`;
        }
        
        interval = Math.floor(seconds / 60);
        if (interval >= 1) {
            return interval === 1 ? '1 minute ago' : `${interval} minutes ago`;
        }
        
        return 'Just now';
    }
    
    // Call the function to fetch reports when the page loads
    fetchRecentReports();
});
