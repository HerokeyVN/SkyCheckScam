document.addEventListener('DOMContentLoaded', function() {
    const scamReportForm = document.getElementById('scamReportForm');
    const formStatus = document.getElementById('formStatus');
    
    if (scamReportForm) {
        scamReportForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
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
            
            const submitBtn = document.getElementById('submitReportBtn');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<div class="loading-spinner"></div> Submitting...';
            formStatus.innerHTML = '<div class="info-message"><i class="bi bi-info-circle"></i> Submitting your report...</div>';
            
            // Increment report counter
            fetch('https://counterapi.com/api/skycheck.scam/report')
                .catch(error => console.log('Counter API increment error:', error));
            
            const formData = new FormData(scamReportForm);
            
            const iframe = document.createElement('iframe');
            iframe.name = 'hidden-iframe';
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
            
            const hiddenForm = document.createElement('form');
            hiddenForm.method = 'POST';
            hiddenForm.action = 'https://docs.google.com/forms/u/0/d/e/1FAIpQLSe_msUldJy3GKEih3JnUfBU5rThfpjM1pnM9ZYR5-Isn923tQ/formResponse';
            hiddenForm.target = 'hidden-iframe';
            
            for (const [name, value] of formData.entries()) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = name;
                input.value = value;
                hiddenForm.appendChild(input);
            }
            
            document.body.appendChild(hiddenForm);
            
            iframe.onload = function() {
                formStatus.innerHTML = '<div class="success-message"><i class="bi bi-check-circle"></i> Report submitted successfully!</div>';
                submitBtn.innerHTML = '<i class="bi bi-check"></i> Submitted';
                scamReportForm.reset();
                
                setTimeout(() => {
                    document.body.removeChild(iframe);
                    document.body.removeChild(hiddenForm);
                    
                    setTimeout(() => {
                        submitBtn.innerHTML = originalBtnText;
                        submitBtn.disabled = false;
                    }, 3000);
                }, 500);
            };
            
            iframe.onerror = function() {
                formStatus.innerHTML = '<div class="error-message"><i class="bi bi-exclamation-triangle"></i> Something went wrong. Please try again.</div>';
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                
                document.body.removeChild(iframe);
                document.body.removeChild(hiddenForm);
            };
            
            hiddenForm.submit();
        });
    }

    fetchRecentReports();

    function fetchRecentReports() {
        const reportsContainer = document.querySelector('.reports-grid');
        if (!reportsContainer) return;

        reportsContainer.innerHTML = '<div class="loading-reports">Loading recent reports... <div class="loading-spinner"></div></div>';
        
        const spreadsheetId = '17f8OmVVMdY_BdOdiOQfjaTjgyehtex23gaJNTVsRK6c';
        
        const script = document.createElement('script');
        script.id = 'googleSheetsScript';
        
        window.google = {};
        google.visualization = {
            Query: {
                setResponse: function(jsonString) {
                    if (typeof jsonString == 'string') {
                        useBackupData();
                        return;
                    }
                    
                    try {
                        const response = jsonString;
                        
                        if (response && response.table && response.table.rows) {
                            const reports = [];
                            
                            const headerMapping = {
                                'Dấu thời gian': 'timestamp',
                                'Contact Information of Scammer': 'contactInfo',
                                'Type of scam': 'scamType',
                                'Description of the Incident': 'description',
                                'Related Warning Articles or Reports': 'warningLinks',
                                'Evidence URL (Optional)': 'evidenceUrl',
                                'Your Contact (Optional)': 'reporterContact'
                            };
                            
                            const originalHeaders = response.table.cols.map(col => col.label);
                            
                            for (let i = response.table.rows.length - 1; i >= 0; i--) {
                                const row = response.table.rows[i];
                                const report = {};
                                
                                row.c.forEach((cell, index) => {
                                    if (!cell) return;
                                    
                                    const columnName = originalHeaders[index];
                                    const standardHeader = headerMapping[columnName] || columnName;
                                    
                                    if (standardHeader === 'timestamp') {
                                        if (cell.v && typeof cell.v === 'string' && cell.v.startsWith('Date(')) {
                                            if (cell.f) {
                                                report[standardHeader] = cell.f;
                                            } else {
                                                const dateParams = cell.v.substring(5, cell.v.length - 1).split(',').map(Number);
                                                const dateObj = new Date(
                                                    dateParams[0],
                                                    dateParams[1] - 1,
                                                    dateParams[2],
                                                    dateParams[3] || 0,
                                                    dateParams[4] || 0,
                                                    dateParams[5] || 0
                                                );
                                                report[standardHeader] = dateObj.toLocaleString();
                                            }
                                        } else if (cell.v) {
                                            report[standardHeader] = cell.v;
                                        }
                                    } else {
                                        report[standardHeader] = cell.v || '';
                                    }
                                });
                                
                                reports.push(report);
                            }
                            
                            displayReports(reports);
                        } else {
                            useBackupData();
                        }
                    } catch (error) {
                        console.error('Error parsing Google Sheets response:', error);
                        useBackupData();
                    }
                    
                    const scriptElement = document.getElementById('googleSheetsScript');
                    if (scriptElement) {
                        scriptElement.remove();
                    }
                }
            }
        };
        
        script.onerror = function() {
            useBackupData();
        };
        
        script.src = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&callback=handleGoogleSheetsResponse`;
        
        document.body.appendChild(script);
        
        setTimeout(() => {
            if (document.getElementById('googleSheetsScript')) {
                useBackupData();
            }
        }, 5000);
    }
    
    function useBackupData() {
        console.log('Using backup data for recent reports');
        
        const backupReports = [
            {
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toString(),
                scamType: 'Account Theft',
                description: 'User reported that after sharing login details for a season pass trade, they lost access to their account.',
                contactInfo: 'facebook.com/fake.account.123'
            },
            {
                timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toString(),
                scamType: 'Payment Without Delivery',
                description: 'Trader took payment but never delivered the promised seasonal candles.',
                contactInfo: '+84 987 654 321'
            },
            {
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toString(),
                scamType: 'Fake Screenshots/Evidence',
                description: 'User provided edited screenshots as proof of item delivery.',
                contactInfo: 'sky.scammer@email.com'
            },
            {
                timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toString(),
                scamType: 'Other',
                description: 'Scammers are now asking for "temporary account access" to gift items.',
                contactInfo: 'discord:user#1234'
            }
        ];
        
        displayReports(backupReports);
    }
    
    function displayReports(reports) {
        document.getElementById('statReportsMonth').innerText = reports.length;
        const reportsContainer = document.querySelector('.reports-grid');
        if (!reportsContainer) return;
        
        const recentReports = reports.slice(0, 8);
        
        reportsContainer.innerHTML = '';
        
        if (recentReports.length === 0) {
            reportsContainer.innerHTML = '<div class="no-reports">No recent reports found.</div>';
            return;
        }
        
        recentReports.forEach(report => {
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

            let reportTime = 'Unknown time';
            try {
                if (report.timestamp) {
                    if (report.timestamp.includes('/')) {
                        const dateParts = report.timestamp.split(' ')[0].split('/');
                        const timeParts = report.timestamp.split(' ')[1].split(':');
                        
                        const dateObj = new Date(
                            parseInt(dateParts[2]),
                            parseInt(dateParts[1]) - 1,
                            parseInt(dateParts[0]),
                            parseInt(timeParts[0]),
                            parseInt(timeParts[1]),
                            parseInt(timeParts[2] || 0)
                        );
                        reportTime = formatTimeAgo(dateObj);
                    } else {
                        reportTime = formatTimeAgo(new Date(report.timestamp));
                    }
                }
            } catch (e) {
                console.error('Error formatting time:', e, report.timestamp);
            }
            
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
});
