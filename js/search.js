document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('header');
    const miniSearchSection = document.querySelector('.mini-search-section');
    const fullScreenSearch = document.getElementById('fullScreenSearch');
    const scrollToTop = document.getElementById('scrollToTop');
    const resultsContainer = document.getElementById('searchResults');
    const mainSearchBox = document.getElementById('mainSearchBox');
    const miniSearchBox = document.querySelector('.mini-search-box');
    const mainSearchBtn = document.getElementById('mainSearchBtn');
    const contentSearchBox = document.getElementById('contentSearchBox');
    const contentSearchBtn = document.getElementById('contentSearchBtn');
    let scammerData = [];
    let legitimateData = [];
    let isScammerDataLoaded = false;
    let isLegitimateDataLoaded = false;
    let isLoadingScammerData = false;
    let isLoadingLegitimateData = false;

    if (contentSearchBox) {
        contentSearchBox.addEventListener('input', function() {
            if (mainSearchBox) mainSearchBox.value = this.value;
            if (miniSearchBox) miniSearchBox.value = this.value;
        });
    }

    if (contentSearchBtn) {
        contentSearchBtn.addEventListener('click', function() {
            if (contentSearchBox) {
                const searchTerm = contentSearchBox.value.trim();
                if (searchTerm.length > 3) {
                    performCombinedSearch();
                } else if (searchTerm !== '') {
                    showMinimumLengthWarning();
                }
            }
        });
    }

    miniSearchBox.addEventListener('input', function() {
        mainSearchBox.value = this.value;
        if (contentSearchBox) contentSearchBox.value = this.value;
    });

    mainSearchBox.addEventListener('input', function() {
        miniSearchBox.value = this.value;
        if (contentSearchBox) contentSearchBox.value = this.value;
    });

    mainSearchBtn.addEventListener('click', function() {
        const searchTerm = mainSearchBox.value.trim();
        if (searchTerm.length > 3) {
            performCombinedSearch();
        } else if (searchTerm !== '') {
            showMinimumLengthWarning();
        }
    });

    if (document.querySelector('.mini-search-section .search-btn')) {
        document.querySelector('.mini-search-section .search-btn').addEventListener('click', function() {
            const searchTerm = miniSearchBox.value.trim();
            if (searchTerm.length > 3) {
                performCombinedSearch();
            } else if (searchTerm !== '') {
                showMinimumLengthWarning();
            } else {
                fullScreenSearch.classList.add('active');
                miniSearchSection.classList.add('hidden');
                setTimeout(() => mainSearchBox.focus(), 500);
            }
        });
    }

    function showMinimumLengthWarning() {
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <h4 class="section-title"><i class="bi bi-shield-exclamation"></i> Search Results</h4>
                <div class="search-warning">
                    <i class="bi bi-exclamation-triangle"></i>
                    <p>Vui lòng nhập từ khóa tìm kiếm nhiều hơn 4 ký tự</p>
                    <p><strong>Please enter more than 4 characters to search</strong></p>
                </div>
            `;
            resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    mainSearchBox.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            const searchTerm = this.value.trim();
            if (searchTerm.length > 3) {
                performCombinedSearch();
            } else if (searchTerm !== '') {
                showMinimumLengthWarning();
            }
        }
    });

    miniSearchBox.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            const searchTerm = this.value.trim();
            if (searchTerm.length > 3) {
                performCombinedSearch();
            } else if (searchTerm !== '') {
                showMinimumLengthWarning();
            }
        }
    });

    if (contentSearchBox) {
        contentSearchBox.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                const searchTerm = this.value.trim();
                if (searchTerm.length > 3) {
                    performCombinedSearch();
                } else if (searchTerm !== '') {
                    showMinimumLengthWarning();
                }
            }
        });
    }

    async function fetchScammerData() {
        try {
            const indexResponse = await fetch('https://raw.githubusercontent.com/HerokeyVN/SkyCheckScam/refs/heads/main/data/index.json');
            const indexData = await indexResponse.json();
            let allScammers = [];
            for (const file of indexData.files) {
                const fileUrl = `https://raw.githubusercontent.com/HerokeyVN/SkyCheckScam/refs/heads/main/data/${file.fileName}`;
                try {
                    const response = await fetch(fileUrl);
                    const fileData = await response.json();
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

    async function fetchLegitimateData() {
        try {
            const response = await fetch('https://raw.githubusercontent.com/HerokeyVN/SkyCheckScam/refs/heads/main/data/legit.json');
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error("Error fetching legitimate users data:", error);
            return [];
        }
    }

    function normalizeVietnameseText(text) {
        if (!text) return '';
        let normalizedText = String(text).toLowerCase();
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

    function searchScammers(scammers, searchQuery) {
        if (!searchQuery || searchQuery.trim() === '') {
            return [];
        }
        const normalizedQuery = normalizeVietnameseText(searchQuery.trim());
        return scammers.filter(scammer => {
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

    function searchLegitimateUsers(legitUsers, searchQuery) {
        if (!searchQuery || searchQuery.trim() === '') {
            return [];
        }
        const normalizedQuery = normalizeVietnameseText(searchQuery.trim());
        return legitUsers.filter(user => {
            if (user.fbName && normalizeVietnameseText(user.fbName).includes(normalizedQuery)) {
                return true;
            }
            if (user.service && user.service.length) {
                for (const service of user.service) {
                    if (normalizeVietnameseText(service).includes(normalizedQuery)) {
                        return true;
                    }
                }
            }
            if (user.bank && user.bank.length) {
                for (const bankInfo of user.bank) {
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
            if (user.fbUID && user.fbUID.length) {
                for (const uid of user.fbUID) {
                    if (normalizeVietnameseText(uid).includes(normalizedQuery)) {
                        return true;
                    }
                }
            }
            return false;
        });
    }

    async function performCombinedSearch() {
        const searchTerm = mainSearchBox.value.trim() || miniSearchBox.value.trim() || 
                          (contentSearchBox ? contentSearchBox.value.trim() : '');
        if (searchTerm.length <= 3) {
            showMinimumLengthWarning();
            return;
        }
        
        fullScreenSearch.classList.remove('active');
        miniSearchSection.classList.remove('hidden');
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="search-loading">
                    <div class="loading-spinner"></div>
                    <p>Searching...</p>
                </div>
            `;
            resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        // Check if the search term is a Facebook URL and extract UID if it is
        let finalSearchTerm = searchTerm;
        let extractedUID = null;
        let extractedName = null;
        let needsManualExtraction = false;
        
        if (isFacebookURL(searchTerm)) {
            try {
                const fbData = await extractFacebookUID(searchTerm);
                if (fbData && fbData.uid) {
                    finalSearchTerm = fbData.uid;
                    extractedUID = fbData.uid;
                    extractedName = fbData.name;
                    needsManualExtraction = fbData.needsManualExtraction;
                    console.log("Extracted Facebook UID:", fbData.uid);
                } else {
                    needsManualExtraction = true;
                }
            } catch (error) {
                console.error("Error extracting Facebook UID:", error);
                needsManualExtraction = true;
            }
        }
        
        // Load scammer data if not already loaded
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
        
        // Load legitimate users data if not already loaded
        if (!isLegitimateDataLoaded && !isLoadingLegitimateData) {
            isLoadingLegitimateData = true;
            try {
                legitimateData = await fetchLegitimateData();
                isLegitimateDataLoaded = true;
            } catch (error) {
                console.error("Error loading legitimate users data:", error);
            } finally {
                isLoadingLegitimateData = false;
            }
        }
        
        let scammerResults = [];
        if (isScammerDataLoaded) {
            scammerResults = searchScammers(scammerData, finalSearchTerm);
        }
        
        let legitimateResults = [];
        if (isLegitimateDataLoaded) {
            legitimateResults = searchLegitimateUsers(legitimateData, finalSearchTerm);
        }
        
        displayCombinedResults(scammerResults, legitimateResults, searchTerm, extractedUID, needsManualExtraction);
        console.log("Search performed for:", searchTerm);
    }

    function isFacebookURL(str) {
        return str.includes('facebook.com/') || str.includes('fb.com/');
    }
    
    async function extractFacebookUID(url) {
        try {
            url = url.trim();
            
            if (!url.startsWith('http')) {
                url = 'https://' + url;
            }
            
            const idPattern = /facebook\.com\/profile\.php\?id=(\d+)/i;
            const idMatch = url.match(idPattern);
            if (idMatch && idMatch[1]) {
                return {
                    uid: idMatch[1],
                    name: null,
                    needsManualExtraction: false
                };
            }
            
            const usernamePattern = /facebook\.com\/([a-z0-9_.]+)|fb\.com\/([a-z0-9_.]+)/i;
            const usernameMatch = url.match(usernamePattern);
            
            if (usernameMatch) {
                const username = usernameMatch[1] || usernameMatch[2];
                
                const nonProfilePaths = ['pages', 'groups', 'events', 'photos', 'watch', 'gaming', 'marketplace'];
                if (nonProfilePaths.includes(username.toLowerCase())) {
                    return {
                        uid: null,
                        name: null,
                        needsManualExtraction: true
                    };
                }
                
                return {
                    uid: username,
                    name: null,
                    needsManualExtraction: true
                };
            }
            
            return {
                uid: null,
                name: null,
                needsManualExtraction: true
            };
        } catch (error) {
            console.error("Error extracting Facebook UID:", error);
            return {
                uid: null,
                name: null,
                needsManualExtraction: true
            };
        }
    }

    function displayCombinedResults(scammerResults, legitimateResults, searchTerm, extractedUID, needsManualExtraction) {
        if (!resultsContainer) return;
        resultsContainer.innerHTML = '';
        const resultsContent = document.createElement('div');
        resultsContent.className = 'search-results-content fade-in';
        let searchHeader = `
            <div class="search-header">
                <h2>${getTranslation('searchResultsFor')} "<span class="search-term">${searchTerm}</span>"</h2>
            </div>
        `;
        
        if (isFacebookURL(searchTerm)) {
            if (extractedUID && !isNaN(extractedUID)) {
                searchHeader += `<div class="uid-extraction-notice">
                    <p><i class="bi bi-info-circle"></i> ${getTranslation('searchingWithUID')} ${extractedUID}</p>
                </div>`;
            } else {
                searchHeader += `
                    <div class="uid-extraction-notice uid-suggestion" style="background-color: #fff3cd; color: #856404; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #ffeeba; text-align: center;">
                        <h4 style="color: #856404; margin-top: 0;"><i class="bi bi-exclamation-triangle" style="font-size: 1.5rem;"></i> Facebook UID Needed</h4>
                        <p style="color: #856404;">${getTranslation('fbUidExtractionSuggestion')}</p>
                        <a href="https://id.traodoisub.com/" target="_blank" class="btn" style="background: #007bff; color: white; text-decoration: none; display: inline-block; padding: 8px 20px; margin: 10px auto; border-radius: 4px; font-weight: bold;">
                            <i class="bi bi-box-arrow-up-right"></i> ${getTranslation('visitUidTool')}
                        </a>
                        <p style="color: #6c757d; font-size: 0.9rem; font-style: italic;">Copy your Facebook URL, paste it in the tool, then search with the numeric ID</p>
                    </div>
                `;
            }
        }
        
        resultsContent.innerHTML = searchHeader;
        
        const legitimateSection = document.createElement('div');
        legitimateSection.className = 'legitimate-results-section';
        if (isLegitimateDataLoaded) {
            legitimateSection.innerHTML = `
                <div class="section-header" style="margin-top: 20px;">
                    <h3 style="color: #42b883;">Trusted Users Results</h3>
                    <span class="result-count" style="background-color: rgba(66, 184, 131, 0.2); color: #42b883;">${legitimateResults.length} result(s)</span>
                </div>
            `;
            if (legitimateResults.length > 0) {
                const legitimateGrid = document.createElement('div');
                legitimateGrid.className = 'scammer-results-list';
                legitimateResults.forEach(user => {
                    const userCard = createLegitimateUserCard(user);
                    legitimateGrid.appendChild(userCard);
                });
                legitimateSection.appendChild(legitimateGrid);
            } else {
                const noResults = document.createElement('div');
                noResults.className = 'no-results';
                noResults.innerHTML = '<p>No trusted users found matching your search criteria.</p>';
                legitimateSection.appendChild(noResults);
            }
        } else {
            legitimateSection.innerHTML = `
                <div class="section-header" style="margin-top: 20px;">
                    <h3 style="color: #42b883;">Trusted Users</h3>
                </div>
                <div class="loading-message">
                    <div class="loading-spinner"></div>
                    <p>Loading trusted users database...</p>
                </div>
            `;
        }
        resultsContent.appendChild(legitimateSection);
        
        const scammerSection = document.createElement('div');
        scammerSection.className = 'scammer-results-section';
        if (isScammerDataLoaded) {
            scammerSection.innerHTML = `
                <div class="section-header" style="margin-top: 30px;">
                    <h3>Scammer Database Results</h3>
                    <span class="result-count">${scammerResults.length} result(s)</span>
                </div>
            `;
            if (scammerResults.length > 0) {
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
        resultsContainer.appendChild(resultsContent);
        resultsContainer.classList.add('fade-in');
    }

    function createLegitimateUserCard(user) {
        const userCard = document.createElement('div');
        userCard.className = 'scammer-card';
        userCard.style.border = '1px solid rgba(66, 184, 131, 0.5)';
        
        let bankInfoHTML = '';
        if (user.bank && user.bank.length) {
            bankInfoHTML = '<div class="bank-info"><h4 style="color: #42b883;">Bank Information</h4><ul>';
            user.bank.forEach(bank => {
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
        
        let fbUIDHTML = '';
        if (user.fbUID && user.fbUID.length) {
            fbUIDHTML = '<div class="fb-uid-info"><h4 style="color: #42b883;">Facebook IDs</h4><ul>';
            user.fbUID.forEach(uid => {
                fbUIDHTML += `<li><a href="https://www.facebook.com/${uid}" target="_blank" rel="noopener noreferrer">${uid}</a></li>`;
            });
            fbUIDHTML += '</ul></div>';
        }
        
        let serviceHTML = '';
        if (user.service && user.service.length) {
            serviceHTML = '<div class="service-info"><h4 style="color: #42b883;">Trusted Services</h4><ul>';
            user.service.forEach(service => {
                serviceHTML += `<li>${service}</li>`;
            });
            serviceHTML += '</ul></div>';
        }
        
        userCard.innerHTML = `
            <div class="scammer-header" style="background-color: rgba(66, 184, 131, 0.2);">
                <h3>${user.fbName || 'Trusted User'}</h3>
                <span class="scammer-id" style="background-color: #42b883;">${user.id}</span>
            </div>
            <div class="scammer-details">
                ${user.fbName ? `<p><strong>Facebook Name:</strong> ${user.fbName}</p>` : ''}
                <div style="background-color: rgba(66, 184, 131, 0.1); padding: 10px; border-radius: 5px; margin: 10px 0;">
                    <p style="color: #42b883; font-weight: bold; margin: 0;">
                        <i class="bi bi-check-circle" style="margin-right: 5px;"></i>
                        This is a verified trusted user
                    </p>
                </div>
                ${serviceHTML}
                ${bankInfoHTML}
                ${fbUIDHTML}
            </div>
        `;
        return userCard;
    }

    function createScammerCard(scammer) {
        const scammerCard = document.createElement('div');
        scammerCard.className = 'scammer-card';
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
        let fbUIDHTML = '';
        if (scammer.fbUID && scammer.fbUID.length) {
            fbUIDHTML = '<div class="fb-uid-info"><h4>Facebook IDs</h4><ul>';
            scammer.fbUID.forEach(uid => {
                fbUIDHTML += `<li><a href="https://www.facebook.com/${uid}" target="_blank" rel="noopener noreferrer">${uid}</a></li>`;
            });
            fbUIDHTML += '</ul></div>';
        }
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

    function getTranslation(key) {
        const currentLang = localStorage.getItem('language') || 'en';
        return translations[currentLang][key] || translations.en[key] || key;
    }

    let lastScrollPosition = 0;
    window.addEventListener('scroll', function() {
        const currentScrollPosition = window.pageYOffset;
        if (scrollToTop) {
            if (currentScrollPosition > 300) {
                scrollToTop.classList.add('visible');
            } else {
                scrollToTop.classList.remove('visible');
            }
        }
        if (currentScrollPosition < 50) {
            if (miniSearchSection && !miniSearchSection.classList.contains('hidden')) {
                miniSearchSection.classList.add('hidden');
            }
            if (fullScreenSearch) fullScreenSearch.classList.remove('active');
        } else if (currentScrollPosition > 100) {
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

    if (scrollToTop) {
        scrollToTop.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    if (window.pageYOffset < 50) {
        if (fullScreenSearch) fullScreenSearch.classList.remove('active');
        if (miniSearchSection) miniSearchSection.classList.add('hidden');
    } else {
        if (fullScreenSearch) fullScreenSearch.classList.remove('active');
        if (miniSearchSection) miniSearchSection.classList.remove('hidden');
    }
});
