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
    
    // Add references to the content search elements
    const contentSearchBox = document.getElementById('contentSearchBox');
    const contentSearchBtn = document.getElementById('contentSearchBtn');
    
    // Variables to store scammer data
    let scammerData = [];
    let isScammerDataLoaded = false;
    let isLoadingScammerData = false;
    
    // Connect content search box to mini and main search boxes
    if (contentSearchBox) {
        contentSearchBox.addEventListener('input', function() {
            if (mainSearchBox) mainSearchBox.value = this.value;
            if (miniSearchBox) miniSearchBox.value = this.value;
        });
    }
    
    // Add click event for content search button
    if (contentSearchBtn) {
        contentSearchBtn.addEventListener('click', function() {
            if (contentSearchBox) {
                const searchTerm = contentSearchBox.value.trim();
                if (searchTerm.length > 6) {
                    performCombinedSearch();
                } else if (searchTerm !== '') {
                    showMinimumLengthWarning();
                }
            }
        });
    }
    
    // Synchronize search input between mini and main search boxes
    miniSearchBox.addEventListener('input', function() {
        mainSearchBox.value = this.value;
        if (contentSearchBox) contentSearchBox.value = this.value;
    });
    
    mainSearchBox.addEventListener('input', function() {
        miniSearchBox.value = this.value;
        if (contentSearchBox) contentSearchBox.value = this.value;
    });
    
    // Search functionality - updated to include scammer search and minimum character validation
    mainSearchBtn.addEventListener('click', function() {
        const searchTerm = mainSearchBox.value.trim();
        if (searchTerm.length > 6) {
            performCombinedSearch();
        } else if (searchTerm !== '') {
            showMinimumLengthWarning();
        }
    });
    
    if (document.querySelector('.mini-search-section .search-btn')) {
        document.querySelector('.mini-search-section .search-btn').addEventListener('click', function() {
            const searchTerm = miniSearchBox.value.trim();
            if (searchTerm.length > 6) {
                performCombinedSearch();
            } else if (searchTerm !== '') {
                showMinimumLengthWarning();
            } else {
                // If mini search is empty, focus the main search
                fullScreenSearch.classList.add('active');
                miniSearchSection.classList.add('hidden');
                setTimeout(() => mainSearchBox.focus(), 500);
            }
        });
    }
    
    // Function to show minimum length warning
    function showMinimumLengthWarning() {
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <h4 class="section-title"><i class="bi bi-shield-exclamation"></i> Search Results</h4>
                <div class="search-warning">
                    <i class="bi bi-exclamation-triangle"></i>
                    <p>Vui lòng nhập từ khóa tìm kiếm nhiều hơn 6 ký tự</p>
                    <p><strong>Please enter more than 6 characters to search</strong></p>
                </div>
            `;
            
            // Scroll to results
            resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    
    // Add keyboard event listener for search on Enter key with validation
    mainSearchBox.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            const searchTerm = this.value.trim();
            if (searchTerm.length > 6) {
                performCombinedSearch();
            } else if (searchTerm !== '') {
                showMinimumLengthWarning();
            }
        }
    });
    
    miniSearchBox.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            const searchTerm = this.value.trim();
            if (searchTerm.length > 6) {
                performCombinedSearch();
            } else if (searchTerm !== '') {
                showMinimumLengthWarning();
            }
        }
    });
    
    // Add Enter key event for content search box with validation
    if (contentSearchBox) {
        contentSearchBox.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                const searchTerm = this.value.trim();
                if (searchTerm.length > 6) {
                    performCombinedSearch();
                } else if (searchTerm !== '') {
                    showMinimumLengthWarning();
                }
            }
        });
    }
    
    // Function to fetch scammer data from GitHub repository
    async function fetchScammerData() {
        try {
            // First, fetch the index file
            const indexResponse = await fetch('https://raw.githubusercontent.com/HerokeyVN/SkyCheckScam/refs/heads/main/data/index.json');
            const indexData = await indexResponse.json();
            
            // Array to store all data
            let allScammers = [];
            
            // Fetch each data file mentioned in the index
            for (const file of indexData.files) {
                const fileUrl = `https://raw.githubusercontent.com/HerokeyVN/SkyCheckScam/refs/heads/main/data/${file.fileName}`;
                try {
                    const response = await fetch(fileUrl);
                    const fileData = await response.json();
                    
                    // Add scammers from this file to our complete list
                    if (fileData && fileData.data) {
                        allScammers = allScammers.concat(fileData.data);
                    }
                } catch (error) {
                    console.error(`Error fetching file ${file.fileName}:`, error);
                }
            }
            
            return allScammers;
        } catch (error) {
            console.error("Error fetching scammer data:", error);
            return [];
        }
    }
    
    // Function to normalize Vietnamese text for searching
    function normalizeVietnameseText(text) {
        if (!text) return '';
        
        // Convert to lowercase
        let normalizedText = String(text).toLowerCase();
        
        // Replace Vietnamese characters with their non-diacritical equivalents
        const vietnameseMap = {
            'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a', 
            'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
            'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
            'đ': 'd',
            'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
            'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
            'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
            'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
            'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
            'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
            'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
            'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
            'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y'
        };
        
        for (const char in vietnameseMap) {
            normalizedText = normalizedText.replace(
                new RegExp(char, 'g'), 
                vietnameseMap[char]
            );
        }
        
        return normalizedText;
    }
    
    // Function to search for scammers
    function searchScammers(scammers, searchQuery) {
        if (!searchQuery || searchQuery.trim() === '') {
            return [];
        }
        
        const normalizedQuery = normalizeVietnameseText(searchQuery.trim());
        
        return scammers.filter(scammer => {
            // Search in all common fields
            if (scammer.fbName && normalizeVietnameseText(scammer.fbName).includes(normalizedQuery)) {
                return true;
            }
            
            if (scammer.realName && normalizeVietnameseText(scammer.realName).includes(normalizedQuery)) {
                return true;
            }
            
            if (scammer.phone && normalizeVietnameseText(scammer.phone).includes(normalizedQuery)) {
                return true;
            }
            
            if (scammer.mail && normalizeVietnameseText(scammer.mail).includes(normalizedQuery)) {
                return true;
            }
            
            // Search in bank information
            if (scammer.bank && scammer.bank.length) {
                for (const bankInfo of scammer.bank) {
                    if (bankInfo.bankName && normalizeVietnameseText(bankInfo.bankName).includes(normalizedQuery)) {
                        return true;
                    }
                    
                    if (bankInfo.bankNumber && normalizeVietnameseText(bankInfo.bankNumber).includes(normalizedQuery)) {
                        return true;
                    }
                    
                    if (bankInfo.name && normalizeVietnameseText(bankInfo.name).includes(normalizedQuery)) {
                        return true;
                    }
                }
            }
            
            // Search in Facebook UIDs
            if (scammer.fbUID && scammer.fbUID.length) {
                for (const uid of scammer.fbUID) {
                    if (normalizeVietnameseText(uid).includes(normalizedQuery)) {
                        return true;
                    }
                }
            }
            
            return false;
        });
    }
    
    // Combined search function that includes scammer search
    async function performCombinedSearch() {
        // Get search term
        const searchTerm = mainSearchBox.value.trim() || miniSearchBox.value.trim() || 
                          (contentSearchBox ? contentSearchBox.value.trim() : '');
        
        // Double-check minimum length requirement
        if (searchTerm.length <= 6) {
            showMinimumLengthWarning();
            return;
        }
        
        // Hide full screen search and show mini search
        fullScreenSearch.classList.remove('active');
        miniSearchSection.classList.remove('hidden');
        
        // Show loading indicator in results area
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="search-loading">
                    <div class="loading-spinner"></div>
                    <p>Searching...</p>
                </div>
            `;
            // Scroll to results
            resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        // Check if we need to load scammer data
        if (!isScammerDataLoaded && !isLoadingScammerData) {
            isLoadingScammerData = true;
            try {
                scammerData = await fetchScammerData();
                isScammerDataLoaded = true;
            } catch (error) {
                console.error("Error loading scammer data:", error);
            } finally {
                isLoadingScammerData = false;
            }
        }
        
        // Perform scammer search
        let scammerResults = [];
        if (isScammerDataLoaded) {
            scammerResults = searchScammers(scammerData, searchTerm);
        }
        
        // Display results
        displayCombinedResults(scammerResults, searchTerm);
        
        // Log search for reference
        console.log("Search performed for:", searchTerm);
    }
    
    // Function to display combined search results
    function displayCombinedResults(scammerResults, searchTerm) {
        if (!resultsContainer) return;
        
        // Clear previous results
        resultsContainer.innerHTML = '';
        
        // Create container for results
        const resultsContent = document.createElement('div');
        resultsContent.className = 'search-results-content fade-in';
        
        // Add search header
        resultsContent.innerHTML = `
            <div class="search-header">
                <h2>Search Results for "<span class="search-term">${searchTerm}</span>"</h2>
            </div>
        `;
        
        // Add scammer results section
        const scammerSection = document.createElement('div');
        scammerSection.className = 'scammer-results-section';
        
        if (isScammerDataLoaded) {
            scammerSection.innerHTML = `
                <div class="section-header">
                    <h3>Scammer Database Results</h3>
                    <span class="result-count">${scammerResults.length} result(s)</span>
                </div>
            `;
            
            if (scammerResults.length > 0) {
                // Create scammer cards
                const scammerGrid = document.createElement('div');
                scammerGrid.className = 'scammer-results-list';
                
                scammerResults.forEach(scammer => {
                    const scammerCard = createScammerCard(scammer);
                    scammerGrid.appendChild(scammerCard);
                });
                
                scammerSection.appendChild(scammerGrid);
            } else {
                const noResults = document.createElement('div');
                noResults.className = 'no-results';
                noResults.innerHTML = '<p>No scammers found matching your search criteria.</p>';
                scammerSection.appendChild(noResults);
            }
        } else {
            scammerSection.innerHTML = `
                <div class="section-header">
                    <h3>Scammer Database</h3>
                </div>
                <div class="loading-message">
                    <div class="loading-spinner"></div>
                    <p>Loading scammer database...</p>
                </div>
            `;
        }
        
        resultsContent.appendChild(scammerSection);
        
        // Add to main results container with animation
        resultsContainer.appendChild(resultsContent);
        resultsContainer.classList.add('fade-in');
    }
    
    // Function to create a scammer card element
    function createScammerCard(scammer) {
        const scammerCard = document.createElement('div');
        scammerCard.className = 'scammer-card';
        
        // Build bank information HTML
        let bankInfoHTML = '';
        if (scammer.bank && scammer.bank.length) {
            bankInfoHTML = '<div class="bank-info"><h4>Bank Information</h4><ul>';
            scammer.bank.forEach(bank => {
                let bankDetails = [];
                if (bank.bankName) bankDetails.push(`<strong>Bank:</strong> ${bank.bankName}`);
                if (bank.bankNumber) bankDetails.push(`<strong>Number:</strong> ${bank.bankNumber}`);
                if (bank.name) bankDetails.push(`<strong>Name:</strong> ${bank.name}`);
                
                if (bankDetails.length > 0) {
                    bankInfoHTML += `<li>${bankDetails.join(' - ')}</li>`;
                }
            });
            bankInfoHTML += '</ul></div>';
        }
        
        // Build Facebook UIDs HTML
        let fbUIDHTML = '';
        if (scammer.fbUID && scammer.fbUID.length) {
            fbUIDHTML = '<div class="fb-uid-info"><h4>Facebook IDs</h4><ul>';
            scammer.fbUID.forEach(uid => {
                fbUIDHTML += `<li><a href="https://www.facebook.com/${uid}" target="_blank" rel="noopener noreferrer">${uid}</a></li>`;
            });
            fbUIDHTML += '</ul></div>';
        }
        
        // Build warning links HTML
        let warningsHTML = '';
        if (scammer.linkWarn) {
            const links = scammer.linkWarn.split('\n').filter(link => link.trim() !== '');
            if (links.length > 0) {
                warningsHTML = '<div class="warnings-info"><h4>Warning Links</h4><ul>';
                links.forEach(link => {
                    warningsHTML += `<li><a href="${link}" target="_blank" rel="noopener noreferrer">${link}</a></li>`;
                });
                warningsHTML += '</ul></div>';
            }
        }
        
        // Compile full scammer card HTML
        scammerCard.innerHTML = `
            <div class="scammer-header">
                <h3>${scammer.fbName || scammer.realName || 'Unknown Scammer'}</h3>
                <span class="scammer-id">${scammer.id}</span>
            </div>
            <div class="scammer-details">
                ${scammer.fbName ? `<p><strong>Facebook Name:</strong> ${scammer.fbName}</p>` : ''}
                ${scammer.realName ? `<p><strong>Real Name:</strong> ${scammer.realName}</p>` : ''}
                ${scammer.phone ? `<p><strong>Phone:</strong> ${scammer.phone}</p>` : ''}
                ${scammer.mail ? `<p><strong>Email:</strong> ${scammer.mail}</p>` : ''}
                ${bankInfoHTML}
                ${fbUIDHTML}
                ${warningsHTML}
            </div>
        `;
        
        return scammerCard;
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
});
