// Configuration for API endpoints
const API_CONFIG = {
    // Automatically detect if we're in development or production
    baseURL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3001/api'  // Local development
        : 'https://domyvitalii-production.up.railway.app/api', // Production
    
    // Fallback for debugging
    get apiUrl() {
        console.log('Using API URL:', this.baseURL);
        return this.baseURL;
    }
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('Environment detected:', window.location.hostname);
    console.log('API URL will be:', API_CONFIG.apiUrl);
    
    // Custom Dropdown functionality
    function initializeCustomDropdowns() {
        const dropdownButtons = document.querySelectorAll('.custom-dropdown-button');
        
        dropdownButtons.forEach(button => {
            const dropdownId = button.getAttribute('data-dropdown');
            const dropdownMenu = document.getElementById(dropdownId);
            const dropdownText = button.querySelector('.dropdown-text');
            const options = dropdownMenu.querySelectorAll('.dropdown-option');
            
            // Set initial selected option
            const firstOption = options[0];
            if (firstOption) {
                firstOption.classList.add('selected');
                // Add has-selection class for initial state
                button.classList.add('has-selection');
            }
            
            // Toggle dropdown on button click
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // Close all other dropdowns
                closeAllDropdowns();
                
                // Toggle current dropdown
                const isOpen = dropdownMenu.classList.contains('show');
                if (!isOpen) {
                    dropdownMenu.classList.add('show');
                    button.classList.add('active');
                } else {
                    dropdownMenu.classList.remove('show');
                    button.classList.remove('active');
                }
            });
            
            // Handle option selection
            options.forEach(option => {
                option.addEventListener('click', function(e) {
                    e.stopPropagation();
                    
                    // Remove selected class from all options
                    options.forEach(opt => opt.classList.remove('selected'));
                    
                    // Add selected class to clicked option
                    this.classList.add('selected');
                    
                    // Update button text
                    dropdownText.textContent = this.textContent;
                    
                    // Add has-selection class to make text darker
                    button.classList.add('has-selection');
                    
                    // Close dropdown
                    dropdownMenu.classList.remove('show');
                    button.classList.remove('active');
                    
                    // Store selected value (for form submission)
                    button.setAttribute('data-selected-value', this.getAttribute('data-value'));
                });
            });
            
            // Handle keyboard navigation
            button.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    button.click();
                } else if (e.key === 'Escape') {
                    dropdownMenu.classList.remove('show');
                    button.classList.remove('active');
                }
            });
        });
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.custom-dropdown-container')) {
                closeAllDropdowns();
            }
        });
        
        // Close dropdowns on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeAllDropdowns();
            }
        });
        
        function closeAllDropdowns() {
            const allDropdownMenus = document.querySelectorAll('.custom-dropdown-menu');
            const allDropdownButtons = document.querySelectorAll('.custom-dropdown-button');
            
            allDropdownMenus.forEach(menu => menu.classList.remove('show'));
            allDropdownButtons.forEach(button => button.classList.remove('active'));
        }
    }
    
    // Initialize custom dropdowns
    initializeCustomDropdowns();
    
    // Tab switching functionality for overlap items
    function initializeOverlapTabs() {
        const tab1 = document.querySelector('.overlap-item-1');
        const tab2 = document.querySelector('.overlap-item-2');
        const tabContent1 = document.getElementById('tab-content-1');
        const tabContent2 = document.getElementById('tab-content-2');
        
        console.log('Initializing tabs:', { tab1, tab2, tabContent1, tabContent2 });
        
        // Set initial state - show tab 1, hide tab 2
        if (tab1 && tabContent1 && tabContent2) {
            tab1.classList.add('active');
            tabContent1.style.display = 'flex';
            tabContent1.style.opacity = '1';
            tabContent1.style.visibility = 'visible';
            tabContent2.style.display = 'none';
        }
        
        // Tab 1 click handler
        if (tab1) {
            tab1.addEventListener('click', function() {
                console.log('Tab 1 clicked');
                // Switch active states
                tab1.classList.add('active');
                tab2.classList.remove('active');
                
                // Show tab 1 content, hide tab 2
                if (tabContent1 && tabContent2) {
                    tabContent1.style.display = 'flex';
                    tabContent1.style.opacity = '1';
                    tabContent1.style.visibility = 'visible';
                    tabContent1.style.transform = 'none';
                    
                    tabContent2.style.display = 'none';
                }
            });
        }
        
        // Tab 2 click handler
        if (tab2) {
            tab2.addEventListener('click', function() {
                console.log('Tab 2 clicked');
                // Switch active states
                tab2.classList.add('active');
                tab1.classList.remove('active');
                
                // Show tab 2 content, hide tab 1
                if (tabContent1 && tabContent2) {
                    tabContent2.style.display = 'flex';
                    tabContent2.style.opacity = '1';
                    tabContent2.style.visibility = 'visible';
                    tabContent2.style.transform = 'none';
                    
                    tabContent1.style.display = 'none';
                }
            });
        }
    }
    
    // Initialize overlap tabs
    initializeOverlapTabs();
    
    // Inquiry form submission handler
    function initializeInquiryForm() {
        const inquirySubmitBtn = document.getElementById('inquirySubmitBtn');
        const emailInput = document.getElementById('inquiry-email');
        const interestSelect = document.getElementById('inquiry-interest');
        
        if (inquirySubmitBtn) {
            inquirySubmitBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Get form values
                const email = emailInput.value.trim();
                const interest = interestSelect.value;
                
                // Basic validation
                if (!email) {
                    showNotification('Prosím zadejte váš email', 'error');
                    emailInput.focus();
                    return;
                }
                
                if (!isValidEmail(email)) {
                    showNotification('Prosím zadejte platný email', 'error');
                    emailInput.focus();
                    return;
                }
                
                if (!interest) {
                    showNotification('Prosím vyberte, co vás zajímá', 'error');
                    interestSelect.focus();
                    return;
                }
                
                // Prepare data for API
                const inquiryData = {
                    email: email,
                    type: 'GENERAL',
                    message: `Zájem o: ${interest}`,
                    interestType: interest
                };
                
                // Send to backend API
                fetch(`${API_CONFIG.apiUrl}/inquiries`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(inquiryData)
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    showNotification('Zájem byl zaregistrován! Brzy se vám ozveme.', 'success');
                    console.log('Interest submitted successfully:', data);
                    
                    // Store data for form page as backup
                    sessionStorage.setItem('inquiryData', JSON.stringify(inquiryData));
                })
                .catch(error => {
                    console.error('Error submitting interest:', error);
                    showNotification('Chyba při odesílání. Zkuste to prosím znovu.', 'error');
                    
                    // Store in sessionStorage as fallback
                    sessionStorage.setItem('inquiryData', JSON.stringify(inquiryData));
                });
                
                // Show success message and redirect
                showNotification('Přesměrování na formulář...', 'success');
                
                // Add loading state to button
                const originalText = inquirySubmitBtn.innerHTML;
                inquirySubmitBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="animate-spin">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-dasharray="31.416" stroke-dashoffset="31.416">
                            <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                            <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                        </circle>
                    </svg>
                    Načítání...
                `;
                inquirySubmitBtn.disabled = true;
                
                // Simulate redirect to inquiry form page
                setTimeout(() => {
                    // In a real application, you would redirect to your inquiry form page
                    // For now, we'll redirect to the admin dashboard or create a dedicated page
                    
                    // You can change this URL to point to your actual inquiry form page
                    const formPageUrl = determineFormPageUrl(interest);
                    
                    showNotification('Otevírání formuláře...', 'info');
                    
                    // Open in new tab so users don't lose their place
                    window.open(formPageUrl, '_blank');
                    
                    // Reset form
                    emailInput.value = '';
                    interestSelect.value = '';
                    inquirySubmitBtn.innerHTML = originalText;
                    inquirySubmitBtn.disabled = false;
                    
                    // Switch back to search tab
                    const tab1 = document.querySelector('.overlap-item-1');
                    const tab2 = document.querySelector('.overlap-item-2');
                    const tabContent1 = document.getElementById('tab-content-1');
                    const tabContent2 = document.getElementById('tab-content-2');
                    
                    if (tab1 && tab2) {
                        tab1.classList.add('active');
                        tab2.classList.remove('active');
                        tabContent2.style.display = 'none';
                        tabContent1.style.display = 'flex';
                        tabContent1.style.opacity = '1';
                        tabContent1.style.transform = 'translateY(0)';
                    }
                }, 1500);
            });
        }
        
        function determineFormPageUrl(interest) {
            // Based on the admin dashboard structure you have
            const baseUrl = './admin-dashboard/index.html';
            
            switch(interest) {
                case 'buying':
                    return `${baseUrl}#/inquiries/new?type=buying`;
                case 'selling':
                    return `${baseUrl}#/properties/new`;
                case 'consulting':
                    return `${baseUrl}#/inquiries/new?type=consulting`;
                case 'investment':
                    return `${baseUrl}#/inquiries/new?type=investment`;
                default:
                    return `${baseUrl}#/inquiries/new`;
            }
        }
    }
    
    // Initialize inquiry form
    initializeInquiryForm();
    
    // Banner close functionality
    const closeBannerBtn = document.getElementById('closeBanner');
    const banner = document.getElementById('banner');
    
    if (closeBannerBtn && banner) {
        closeBannerBtn.addEventListener('click', function() {
            banner.style.transition = 'all 0.3s ease';
            banner.style.opacity = '0';
            banner.style.transform = 'translateY(-100%)';
            
            setTimeout(() => {
                banner.style.display = 'none';
            }, 300);
        });
    }
    
    // Hamburger menu functionality
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuClose = document.getElementById('mobileMenuClose');
    const body = document.body;
    
    function closeMobileMenu() {
        hamburgerBtn.classList.remove('active');
        mobileMenu.classList.remove('active');
        body.style.overflow = '';
    }
    
    if (hamburgerBtn && mobileMenu) {
        hamburgerBtn.addEventListener('click', function() {
            // Toggle active classes
            hamburgerBtn.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            if (mobileMenu.classList.contains('active')) {
                body.style.overflow = 'hidden';
            } else {
                body.style.overflow = '';
            }
        });
        
        // Close button functionality
        if (mobileMenuClose) {
            mobileMenuClose.addEventListener('click', closeMobileMenu);
        }
        
        // Close menu when clicking on mobile nav links
        const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', function() {
                closeMobileMenu();
                
                // Update active state
                mobileNavLinks.forEach(navLink => navLink.classList.remove('active'));
                this.classList.add('active');
            });
        });
        
        // Close menu when clicking outside
        mobileMenu.addEventListener('click', function(e) {
            if (e.target === mobileMenu) {
                closeMobileMenu();
            }
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
                closeMobileMenu();
            }
        });
    }
    
    // Tab switching functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const searchForm = document.querySelector('.search-form');
    
    tabButtons.forEach((button, index) => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update search form content based on selected tab
            updateSearchForm(index);
        });
    });
    
    function updateSearchForm(tabIndex) {
        const searchContent = document.querySelector('.search-bar');
        
        if (tabIndex === 0) {
            // Naše nabídka tab - Property search bar
            searchContent.innerHTML = `
                <div class="search-filter">
                    <div class="filter-icon">🏠</div>
                    <select id="property-type" class="filter-input">
                        <option value="">Typ nemovitosti</option>
                        <option value="apartment">Byt</option>
                        <option value="house">Dům</option>
                        <option value="villa">Vila</option>
                        <option value="land">Pozemek</option>
                        <option value="commercial">Komerční</option>
                    </select>
                </div>
                
                <div class="search-divider"></div>
                
                <div class="search-filter">
                    <div class="filter-icon">📍</div>
                    <select id="province" class="filter-input">
                        <option value="">Provincie</option>
                        <option value="lombardy">Lombardie</option>
                        <option value="tuscany">Toskánsko</option>
                        <option value="veneto">Benátsko</option>
                        <option value="liguria">Ligurie</option>
                        <option value="umbria">Umbrie</option>
                        <option value="marche">Marche</option>
                        <option value="abruzzo">Abruzzo</option>
                        <option value="sicily">Sicílie</option>
                        <option value="sardinia">Sardinie</option>
                    </select>
                </div>
                
                <div class="search-divider"></div>
                
                <div class="search-filter price-filter">
                    <div class="filter-icon">💰</div>
                    <div class="price-range-display">
                        <span class="price-label">Rozpočet</span>
                        <div class="price-values">
                            <span id="price-display">100 000 - 500 000 EUR</span>
                        </div>
                    </div>
                    <div class="price-dropdown">
                        <div class="price-controls">
                            <div class="price-input-group">
                                <input type="number" id="price-min" placeholder="Od" class="price-input-small">
                                <span>-</span>
                                <input type="number" id="price-max" placeholder="Do" class="price-input-small">
                                <span class="price-unit">EUR</span>
                            </div>
                            <div class="price-slider-container">
                                <input type="range" id="price-range-min" min="50000" max="2000000" value="100000" class="price-slider">
                                <input type="range" id="price-range-max" min="50000" max="2000000" value="500000" class="price-slider">
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Initialize price range functionality after DOM update
            setTimeout(initializePriceRange, 100);
            setTimeout(initializePriceDropdown, 100);
            
        } else {
            // Nezávazná poptávka tab - Contact form in horizontal layout
            searchContent.innerHTML = `
                <div class="search-filter">
                    <div class="filter-icon">👤</div>
                    <input type="text" id="inquiry-name" placeholder="Vaše jméno" class="filter-input">
                </div>
                
                <div class="search-divider"></div>
                
                <div class="search-filter">
                    <div class="filter-icon">📧</div>
                    <input type="email" id="inquiry-email" placeholder="Váš email" class="filter-input">
                </div>
                
                <div class="search-divider"></div>
                
                <div class="search-filter">
                    <div class="filter-icon">💰</div>
                    <select id="inquiry-budget" class="filter-input">
                        <option value="">Rozpočet</option>
                        <option value="50000-150000">50k - 150k EUR</option>
                        <option value="150000-300000">150k - 300k EUR</option>
                        <option value="300000-500000">300k - 500k EUR</option>
                        <option value="500000-1000000">500k - 1M EUR</option>
                        <option value="1000000+">Nad 1M EUR</option>
                    </select>
                </div>
            `;
        }
    }
    
    // Search functionality
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('search-btn')) {
            e.preventDefault();
            const activeTab = document.querySelector('.tab-btn.active');
            const isOfferTab = activeTab.textContent.includes('nabídka');
            
            if (isOfferTab) {
                handlePropertySearch();
            } else {
                handleInquirySubmission();
            }
        }
    });
    
    function handlePropertySearch() {
        const propertyType = document.getElementById('property-type')?.value || '';
        const province = document.getElementById('province')?.value || '';
        const priceMin = document.getElementById('price-min')?.value || '';
        const priceMax = document.getElementById('price-max')?.value || '';
        
        // Build search criteria
        const criteria = [];
        if (propertyType) criteria.push(`Typ: ${getPropertyTypeName(propertyType)}`);
        if (province) criteria.push(`Provincie: ${getProvinceName(province)}`);
        if (priceMin || priceMax) {
            const priceRange = `${priceMin || '0'} - ${priceMax || '∞'} EUR`;
            criteria.push(`Cena: ${priceRange}`);
        }
        
        if (criteria.length > 0) {
            showNotification(`Vyhledávám nemovitosti: ${criteria.join(', ')}`, 'success');
            console.log('Search criteria:', { propertyType, province, priceMin, priceMax });
        } else {
            showNotification('Prosím vyberte alespoň jeden filtr pro vyhledávání', 'error');
        }
    }
    
    function handleInquirySubmission() {
        const name = document.getElementById('inquiry-name')?.value.trim() || '';
        const email = document.getElementById('inquiry-email')?.value.trim() || '';
        const phone = document.getElementById('inquiry-phone')?.value.trim() || '';
        const budget = document.getElementById('inquiry-budget')?.value || '';
        const message = document.getElementById('inquiry-message')?.value.trim() || '';

        if (name && email) {
            if (isValidEmail(email)) {
                // Show loading state
                showNotification('Odesílání poptávky...', 'info');
                
                // Prepare data for API
                const inquiryData = {
                    name: name,
                    email: email,
                    phone: phone || null,
                    message: message || `Zájem o nemovitosti v kategorii: ${budget}`,
                    type: 'PROPERTY',
                    budgetRange: budget || null
                };
                
                // Send to backend API
                fetch(`${API_CONFIG.apiUrl}/inquiries`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(inquiryData)
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    showNotification('Poptávka byla úspěšně odeslána! Brzy se vám ozveme.', 'success');
                    console.log('Inquiry submitted successfully:', data);
                    
                    // Clear form
                    document.getElementById('inquiry-name').value = '';
                    document.getElementById('inquiry-email').value = '';
                    if (document.getElementById('inquiry-phone')) document.getElementById('inquiry-phone').value = '';
                    if (document.getElementById('inquiry-budget')) document.getElementById('inquiry-budget').value = '';
                    if (document.getElementById('inquiry-message')) document.getElementById('inquiry-message').value = '';
                })
                .catch(error => {
                    console.error('Error submitting inquiry:', error);
                    showNotification('Chyba při odesílání poptávky. Zkuste to prosím znovu.', 'error');
                });
            } else {
                showNotification('Prosím zadejte platnou emailovou adresu', 'error');
            }
        } else {
            showNotification('Prosím vyplňte jméno a email', 'error');
        }
    }
    
    function getPropertyTypeName(value) {
        const types = {
            'apartment': 'Byt',
            'house': 'Dům', 
            'villa': 'Vila',
            'land': 'Pozemek',
            'commercial': 'Komerční'
        };
        return types[value] || value;
    }
    
    function getProvinceName(value) {
        const provinces = {
            'lombardy': 'Lombardie',
            'tuscany': 'Toskánsko',
            'veneto': 'Benátsko',
            'liguria': 'Ligurie',
            'umbria': 'Umbrie',
            'marche': 'Marche',
            'abruzzo': 'Abruzzo',
            'sicily': 'Sicílie',
            'sardinia': 'Sardinie'
        };
        return provinces[value] || value;
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Navigation menu interactions
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Simulate navigation
            const linkText = this.textContent;
            showNotification(`Navigating to: ${linkText}`, 'info');
        });
    });
    
    // Main CTA button interaction - now handles search/inquiry
    const ctaBtn = document.querySelector('#main-search-btn');
    
    if (ctaBtn) {
        ctaBtn.addEventListener('click', function() {
            const activeTab = document.querySelector('.tab-btn.active');
            const isOfferTab = activeTab.textContent.includes('nabídka');
            
            if (isOfferTab) {
                handlePropertySearch();
            } else {
                handleInquirySubmission();
            }
        });
    }
    
    // Login button interaction
    const loginBtn = document.querySelector('.login-btn');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            showNotification('Přesměrování na přihlašovací stránku...', 'info');
        });
    }
    
    // Register link interaction
    const registerLink = document.querySelector('.register-link');
    
    if (registerLink) {
        registerLink.addEventListener('click', function(e) {
            e.preventDefault();
            showNotification('Přesměrování na registrační stránku...', 'info');
        });
    }
    
    // Notification system
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${getNotificationColor(type)};
            color: white;
            padding: 15px 25px;
            border-radius: 7px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            font-family: 'Segoe UI', sans-serif;
            font-weight: 600;
            max-width: 400px;
            word-wrap: break-word;
            animation: slideIn 0.3s ease-out;
        `;
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 4000);
    }
    
    function getNotificationColor(type) {
        switch (type) {
            case 'success':
                return '#3E6343';
            case 'error':
                return '#E6904B';
            case 'info':
                return '#5B9162';
            default:
                return '#333333';
        }
    }
    
    // Add CSS animations for notifications
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            // Skip empty hash anchors (href="#")
            if (href === '#' || href.length <= 1) {
                return;
            }
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add loading states to buttons
    function addLoadingState(button, originalText, loadingText = 'Načítání...') {
        button.disabled = true;
        button.textContent = loadingText;
        button.style.opacity = '0.7';
        
        setTimeout(() => {
            button.disabled = false;
            button.textContent = originalText;
            button.style.opacity = '1';
        }, 1500);
    }
    
    // Enhanced button interactions with loading states
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('cta-btn') || e.target.id === 'main-search-btn') {
            const originalText = e.target.textContent;
            addLoadingState(e.target, originalText, 'Vyhledávám...');
        }
    });
    
    // Price dropdown functionality
    function initializePriceDropdown() {
        const priceFilter = document.querySelector('.price-filter');
        const priceDropdown = document.querySelector('.price-dropdown');
        
        if (!priceFilter || !priceDropdown) return;
        
        priceFilter.addEventListener('click', function(e) {
            e.stopPropagation();
            priceFilter.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!priceFilter.contains(e.target)) {
                priceFilter.classList.remove('active');
            }
        });
        
        // Prevent dropdown from closing when clicking inside
        priceDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    // Price range slider functionality
    function initializePriceRange() {
        const rangeMin = document.getElementById('price-range-min');
        const rangeMax = document.getElementById('price-range-max');
        const priceMin = document.getElementById('price-min');
        const priceMax = document.getElementById('price-max');
        
        if (!rangeMin || !rangeMax || !priceMin || !priceMax) return;
        
        function updatePriceInputs() {
            const minVal = parseInt(rangeMin.value);
            const maxVal = parseInt(rangeMax.value);
            
            // Ensure min is always less than max
            if (minVal >= maxVal) {
                if (rangeMin === document.activeElement) {
                    rangeMax.value = minVal + 50000;
                } else {
                    rangeMin.value = maxVal - 50000;
                }
            }
            
            priceMin.value = formatPrice(parseInt(rangeMin.value));
            priceMax.value = formatPrice(parseInt(rangeMax.value));
            
            // Update the price display
            const priceDisplay = document.getElementById('price-display');
            if (priceDisplay) {
                priceDisplay.textContent = `${formatPrice(parseInt(rangeMin.value))} - ${formatPrice(parseInt(rangeMax.value))} EUR`;
            }
        }
        
        function updatePriceRanges() {
            const minVal = parseInt(priceMin.value) || 50000;
            const maxVal = parseInt(priceMax.value) || 2000000;
            
            rangeMin.value = Math.max(50000, Math.min(minVal, 2000000));
            rangeMax.value = Math.max(50000, Math.min(maxVal, 2000000));
            
            updatePriceInputs();
        }
        
        function formatPrice(price) {
            return price.toLocaleString('cs-CZ');
        }
        
        // Event listeners
        rangeMin.addEventListener('input', updatePriceInputs);
        rangeMax.addEventListener('input', updatePriceInputs);
        priceMin.addEventListener('blur', updatePriceRanges);
        priceMax.addEventListener('blur', updatePriceRanges);
        
        // Initial setup
        updatePriceInputs();
    }
    
    // Enhanced Animation System
    function initializeAnimations() {
        // Intersection Observer for scroll-triggered animations
    const observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -100px 0px'
    };
    
        const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                    const element = entry.target;
                    
                    // Add animation class based on element type
                    if (element.classList.contains('section-header')) {
                        element.style.animation = 'fadeInUp 0.8s ease-out forwards';
                    } else if (element.classList.contains('property-card')) {
                        const delay = Array.from(element.parentNode.children).indexOf(element) * 0.1;
                        element.style.animation = `fadeInUp 0.6s ease-out ${delay}s forwards`;
                    } else if (element.classList.contains('service-card')) {
                        const delay = Array.from(element.parentNode.children).indexOf(element) * 0.1;
                        element.style.animation = `fadeInUp 0.6s ease-out ${delay}s forwards`;
                    } else if (element.classList.contains('services-cta')) {
                        element.style.animation = 'fadeInScale 0.8s ease-out 0.3s forwards';
                    } else if (element.classList.contains('view-all-btn')) {
                        element.style.animation = 'fadeInUp 0.6s ease-out 0.2s forwards';
                    } else {
                        element.style.animation = 'fadeInUp 0.6s ease-out forwards';
                    }
                    
                    // Stop observing once animated
                    scrollObserver.unobserve(element);
            }
        });
    }, observerOptions);
    
        // Set initial state and observe scroll-triggered elements
        const scrollElements = document.querySelectorAll(`
            .section-header,
            .property-card,
            .service-card,
            .services-cta,
            .view-all-btn
        `);
        
        scrollElements.forEach(el => {
            el.style.opacity = '0';
            scrollObserver.observe(el);
        });
        
        // Add stagger animation to navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach((link, index) => {
            link.style.opacity = '0';
            link.style.animation = `fadeInDown 0.5s ease-out ${0.7 + (index * 0.1)}s forwards`;
        });
        
        // Add stagger animation to mobile menu links
        const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
        mobileNavLinks.forEach((link, index) => {
            link.style.opacity = '0';
            link.style.animation = `fadeInLeft 0.4s ease-out ${0.2 + (index * 0.1)}s forwards`;
        });
        
        // Animate property features with stagger
        setTimeout(() => {
            const propertyFeatures = document.querySelectorAll('.property-features .feature-item');
            propertyFeatures.forEach((feature, index) => {
                feature.style.opacity = '0';
                feature.style.animation = `fadeInUp 0.4s ease-out ${index * 0.1}s forwards`;
            });
        }, 1000);
        
        // Add hover enhancement animations
        const interactiveElements = document.querySelectorAll(`
            .property-card,
            .service-card,
            .overlap-item,
            .nav-link,
            .custom-dropdown-button
        `);
        
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
                this.style.transition = 'transform 0.3s ease';
            });
            
            el.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });
        
        console.log('Enhanced animations initialized!');
    }
    
    // Initialize animations
    initializeAnimations();
    
    // Initialize single range slider
    function initializeSingleRangeSlider() {
        const priceSlider = document.getElementById('priceMax');
        const priceValue = document.getElementById('priceValue');
        const priceTooltip = document.getElementById('priceTooltip');
        const trackFill = document.querySelector('.slider-track-fill');
        
        if (!priceSlider || !priceValue || !priceTooltip || !trackFill) return;
        
        const min = parseInt(priceSlider.min);
        const max = parseInt(priceSlider.max);
        
        function updateSlider() {
            const value = parseInt(priceSlider.value);
            const percentage = ((value - min) / (max - min)) * 100;
            
            // Update display value
            priceValue.textContent = `${value}k EUR`;
            
            // Update tooltip
            priceTooltip.textContent = `${value}k`;
            priceTooltip.style.left = `${percentage}%`;
            
            // Update track fill
            trackFill.style.width = `${percentage}%`;
        }
        
        // Add event listeners
        priceSlider.addEventListener('input', updateSlider);
        
        // Show tooltip only on hover
        priceSlider.addEventListener('mouseenter', () => {
            priceTooltip.style.opacity = '1';
            priceTooltip.style.visibility = 'visible';
            priceTooltip.style.transform = 'translateX(-50%) translateY(-5px)';
        });
        
        priceSlider.addEventListener('mouseleave', () => {
            priceTooltip.style.opacity = '0';
            priceTooltip.style.visibility = 'hidden';
            priceTooltip.style.transform = 'translateX(-50%) translateY(0)';
        });
        
        priceSlider.addEventListener('mousedown', () => {
            priceTooltip.style.opacity = '1';
            priceTooltip.style.visibility = 'visible';
            priceTooltip.style.transform = 'translateX(-50%) translateY(-8px)';
        });
        
        // Initialize with current value
        updateSlider();
    }
    
    // Initialize single range slider
    initializeSingleRangeSlider();
    
    // Hero Image Slideshow
    function initializeHeroSlideshow() {
        const slides = document.querySelectorAll('.hero-slide');
        const tooltip = document.getElementById('regionTooltip');
        const tooltipCity = document.querySelector('.tooltip-city');
        const tooltipRegion = document.querySelector('.tooltip-region');
        
        if (slides.length === 0) return;
        
        let currentSlide = 0;
        let slideshowInterval;
        
        function updateTooltip(index) {
            const currentSlideElement = slides[index];
            const city = currentSlideElement.getAttribute('data-city');
            const region = currentSlideElement.getAttribute('data-region');
            
            if (tooltipCity && tooltipRegion) {
                tooltipCity.textContent = city;
                tooltipRegion.textContent = region;
            }
        }
        
        function showSlide(index) {
            // Remove active class from all slides
            slides.forEach(slide => slide.classList.remove('active'));
            
            // Add active class to current slide
            slides[index].classList.add('active');
            
            // Update tooltip content
            updateTooltip(index);
        }
        
        function nextSlide() {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        }
        
        // Initialize tooltip with first slide
        updateTooltip(0);
        
        // Start slideshow - runs continuously
        slideshowInterval = setInterval(nextSlide, 4000); // Change image every 4 seconds
        
        console.log(`Hero slideshow initialized with ${slides.length} images`);
    }
    
    // Initialize hero slideshow
    initializeHeroSlideshow();
    
    // Loading indicator functionality
    function initializeLoadingIndicator() {
        const header = document.querySelector('.header');
        
        // Add loading class when page starts loading
        if (header) {
            header.classList.add('loading');
        }
        
        // Remove loading class when page is fully loaded
        window.addEventListener('load', () => {
            setTimeout(() => {
                if (header) {
                    header.classList.remove('loading');
                }
            }, 500); // Small delay to show the completion
        });
        
        // Also handle navigation loading (for SPAs or dynamic content)
        document.addEventListener('beforeunload', () => {
            if (header) {
                header.classList.add('loading');
            }
        });
    }
    
    // Initialize loading indicator
    initializeLoadingIndicator();
    
    // Chatbot functionality
    function initializeChatbot() {
        const chatToggleBtn = document.getElementById('chatToggleBtn');
        const chatWindow = document.getElementById('chatWindow');
        const chatWidget = document.getElementById('chatbotWidget');
        const chatMinimizeBtn = document.getElementById('chatMinimizeBtn');
        const chatSendBtn = document.getElementById('chatSendBtn');
        const chatInput = document.getElementById('chatInput');
        const chatMessages = document.getElementById('chatMessages');
        const quickActionBtns = document.querySelectorAll('.quick-action-btn');
        const chatNotification = document.getElementById('chatNotification');
        const notificationClose = document.getElementById('notificationClose');
        
        if (!chatToggleBtn || !chatWindow || !chatWidget) return;
        
        let isOpen = false;
        let messageCounter = 0;
        
        // Bot responses for demo purposes
        const botResponses = {
            default: [
                "Děkuji za vaši zprávu! Jsem zde, abych vám pomohl s hledáním nemovitosti v Itálii. 🏠",
                "To je skvělá otázka! Rád vám pomohu najít odpověď. Můžete mi říct více detailů?",
                "Rozumím vašemu zájmu. Naši experti vám rádi pomohou s výběrem nemovitosti. 📞",
                "Skvělé! Mohu vám doporučit několik možností podle vašich požadavků."
            ],
            toskánsko: [
                "Toskánsko je nádherná volba! 🍷 Máme zde vily s vinicemi, tradiční farmhouses a moderní apartmány. Jaký typ nemovitosti vás zajímá nejvíce?",
                "Ve Florencii a okolí máme krásné historické objekty. Preferujete centrum města nebo klidnější venkovské oblasti?"
            ],
            náklady: [
                "Náklady na koupi nemovitosti v Itálii zahrnují: 💰\n• Daň z převodu (2-9% podle typu)\n• Notářské poplatky (1-3%)\n• Realitní provize (3-6%)\n• Právní služby\n\nRádi vám připravíme detailní kalkulaci!",
                "Celkové náklady se obvykle pohybují mezi 8-15% z kupní ceny. Závisí to na typu nemovitosti a regionu."
            ],
            financování: [
                "Pro financování máme několik možností: 🏦\n• Italské hypotéky (až 80% hodnoty)\n• Mezinárodní banky\n• Developer financing\n• Leasing\n\nMůžeme vás spojit s našimi finančními partnery!",
                "Hypotéky v Itálii jsou dostupné i pro cizince. Úroky se pohybují kolem 2-4%. Potřebovali byste předběžnou kalkulaci?"
            ]
        };
        
        // Toggle chat window
        function toggleChat() {
            isOpen = !isOpen;
            chatWidget.classList.toggle('active', isOpen);
            
            if (isOpen) {
                chatInput.focus();
                scrollToBottom();
                hideNotification();
            }
        }
        
        // Close chat
        function closeChat() {
            isOpen = false;
            chatWidget.classList.remove('active');
        }
        
        // Show notification
        function showNotification() {
            if (chatNotification) {
                chatNotification.classList.add('show');
            }
        }
        
        // Hide notification
        function hideNotification() {
            if (chatNotification) {
                chatNotification.classList.add('hide');
                setTimeout(() => {
                    chatNotification.style.display = 'none';
                }, 300);
            }
        }
        
        // Scroll messages to bottom
        function scrollToBottom() {
            setTimeout(() => {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 100);
        }
        
        // Add message to chat
        function addMessage(text, isUser = false, showTime = true) {
            messageCounter++;
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
            
            const avatarSVG = isUser ? 
                `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>` :
                `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>`;
            
            const timeText = showTime ? new Date().toLocaleTimeString('cs-CZ', { 
                hour: '2-digit', 
                minute: '2-digit' 
            }) : '';
            
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    ${avatarSVG}
                </div>
                <div class="message-content">
                    <div class="message-bubble">
                        ${text}
                    </div>
                    ${showTime ? `<div class="message-time">${timeText}</div>` : ''}
                </div>
            `;
            
            chatMessages.appendChild(messageDiv);
            scrollToBottom();
            
            return messageDiv;
        }
        
        // Show typing indicator
        function showTypingIndicator() {
            const typingDiv = document.createElement('div');
            typingDiv.className = 'typing-indicator';
            typingDiv.id = 'typingIndicator';
            
            typingDiv.innerHTML = `
                <div class="message-avatar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            `;
            
            chatMessages.appendChild(typingDiv);
            scrollToBottom();
            
            return typingDiv;
        }
        
        // Remove typing indicator
        function removeTypingIndicator() {
            const typingIndicator = document.getElementById('typingIndicator');
            if (typingIndicator) {
                typingIndicator.remove();
            }
        }
        
        // Get bot response
        function getBotResponse(userMessage) {
            const message = userMessage.toLowerCase();
            
            if (message.includes('toskán') || message.includes('florenc')) {
                return botResponses.toskánsko[Math.floor(Math.random() * botResponses.toskánsko.length)];
            } else if (message.includes('náklad') || message.includes('cena') || message.includes('poplatek')) {
                return botResponses.náklady[Math.floor(Math.random() * botResponses.náklady.length)];
            } else if (message.includes('financov') || message.includes('hypotéka') || message.includes('úvěr')) {
                return botResponses.financování[Math.floor(Math.random() * botResponses.financování.length)];
            } else {
                return botResponses.default[Math.floor(Math.random() * botResponses.default.length)];
            }
        }
        
        // Send message
        function sendMessage(text) {
            if (!text.trim()) return;
            
            // Add user message
            addMessage(text, true);
            
            // Clear input
            chatInput.value = '';
            
            // Show typing indicator
            const typingIndicator = showTypingIndicator();
            
            // Simulate bot response delay
            setTimeout(() => {
                removeTypingIndicator();
                const botResponse = getBotResponse(text);
                addMessage(botResponse, false);
            }, 1000 + Math.random() * 1500); // Random delay between 1-2.5 seconds
        }
        
        // Event listeners
        chatToggleBtn.addEventListener('click', toggleChat);
        chatMinimizeBtn.addEventListener('click', closeChat);
        
        // Notification close button
        if (notificationClose) {
            notificationClose.addEventListener('click', hideNotification);
        }
        
        // Auto-hide notification after 15 seconds
        setTimeout(() => {
            if (chatNotification && !isOpen) {
                hideNotification();
            }
        }, 15000);
        
        // Send message on button click
        chatSendBtn.addEventListener('click', () => {
            sendMessage(chatInput.value);
        });
        
        // Send message on Enter key
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(chatInput.value);
            }
        });
        
        // Quick action buttons
        quickActionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const message = btn.getAttribute('data-message');
                if (message) {
                    sendMessage(message);
                }
            });
        });
        
        // Close chat when clicking outside
        document.addEventListener('click', (e) => {
            if (isOpen && !chatWidget.contains(e.target)) {
                // Don't close immediately, add small delay to prevent accidental closes
                setTimeout(() => {
                    if (!chatWidget.matches(':hover')) {
                        closeChat();
                    }
                }, 100);
            }
        });
        
        // Prevent chat from closing when clicking inside
        chatWidget.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // Add some initial variation to welcome message
        const welcomeMessages = [
            "Ahoj! 👋 Jsem váš asistent pro nemovitosti v Itálii. Jak vám mohu pomoci?",
            "Buongiorno! 🇮🇹 Vítejte! Rád vám pomohu najít vaši vysněnou nemovitost v Itálii.",
            "Ciao! ☀️ Jsem zde, abych vám pomohl s výběrem nemovitosti v krásné Itálii. Co vás zajímá?"
        ];
        
        // Update welcome message randomly
        const welcomeMsg = document.querySelector('.bot-message .message-bubble');
        if (welcomeMsg) {
            welcomeMsg.textContent = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
        }
        
        console.log('Chatbot initialized successfully!');
    }
    
    // Process Steps Expandable functionality
    function initializeProcessSteps() {
        const processSteps = document.querySelectorAll('.process-step');
        
        processSteps.forEach(step => {
            const stepHeader = step.querySelector('.step-header');
            const expandBtn = step.querySelector('.expand-btn');
            
            if (stepHeader && expandBtn) {
                // Add click event to the entire header
                stepHeader.addEventListener('click', function() {
                    toggleStep(step);
                });
                
                // Add keyboard support
                stepHeader.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleStep(step);
                    }
                });
                
                // Make header focusable
                stepHeader.setAttribute('tabindex', '0');
            }
        });
        
        function toggleStep(step) {
            const isExpanded = step.classList.contains('expanded');
            
            if (isExpanded) {
                // Collapse the step
                step.classList.remove('expanded');
            } else {
                // Expand the step
                step.classList.add('expanded');
            }
        }
    }

    // Initialize chatbot
    initializeChatbot();
    
    // Initialize process steps
    initializeProcessSteps();
    
    // Team Members Hover Effects (CSS-based, minimal JS for enhancements)
    function initializeTeamCards() {
        const teamMembers = document.querySelectorAll('.team-member');
        
        teamMembers.forEach(member => {
            const detailsContent = member.querySelector('.details-content');
            
            // Add smooth entrance animation when hovering
            member.addEventListener('mouseenter', function() {
                if (detailsContent) {
                    detailsContent.style.animation = 'slideInUp 0.8s ease-out forwards';
                }
            });
            
            // Reset animation on mouse leave
            member.addEventListener('mouseleave', function() {
                if (detailsContent) {
                    detailsContent.style.animation = 'none';
                }
            });
        });
    }
    
    // Initialize team cards
    initializeTeamCards();
    
    console.log('Domy v Itálii website loaded successfully!');
}); 