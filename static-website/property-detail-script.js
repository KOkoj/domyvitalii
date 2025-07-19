// Property Detail Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeSimpleGallery();
    initializeActionButtons();
    initializeMessageWindow();
    initializeContactButtons();
    initializePropertyMap();
    initializeComparison();
});

// Simple gallery that redirects to gallery page
function initializeSimpleGallery() {
        const viewAllBtn = document.getElementById('viewAllBtn');
        
        // Add click handler to view all button
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
            window.location.href = 'property-gallery.html';
        });
    }
}

// Old lightbox functionality removed - now using dedicated gallery page

// Action buttons functionality
function initializeActionButtons() {
    const likeBtn = document.querySelector('.like-btn');
    const shareBtn = document.querySelector('.share-btn');
    const copyBtn = document.querySelector('.copy-btn');
    
    // Like button
    if (likeBtn) {
    let isLiked = false;
    likeBtn.addEventListener('click', () => {
        isLiked = !isLiked;
        if (isLiked) {
            likeBtn.style.color = '#e74c3c';
            likeBtn.querySelector('span').textContent = 'Uloženo';
            showNotification('Nemovitost byla uložena do oblíbených', 'success');
        } else {
            likeBtn.style.color = '';
            likeBtn.querySelector('span').textContent = 'Uložit';
            showNotification('Nemovitost byla odebrána z oblíbených', 'info');
        }
    });
    }
    
    // Share button
    if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Vila s výhledem na moře - Toskánsko',
                    text: 'Podívej se na tuto úžasnou nemovitost v Itálii!',
                    url: window.location.href
                });
                showNotification('Úspěšně sdíleno', 'success');
            } catch (err) {
                console.log('Sdílení bylo zrušeno');
            }
        } else {
            // Fallback for browsers that don't support Web Share API
            copyToClipboard(window.location.href);
            showNotification('Odkaz byl zkopírován do schránky', 'success');
        }
    });
    }
    
    // Copy link button
    if (copyBtn) {
    copyBtn.addEventListener('click', () => {
        copyToClipboard(window.location.href);
        showNotification('Odkaz byl zkopírován do schránky', 'success');
    });
}
}

// Contact form functionality
function initializeMessageWindow() {
    console.log('Initializing contact form...');
    
    // Initialize form expansion functionality
    const dropdown = document.getElementById('contactReason');
    const textarea = document.getElementById('messageText');
    
    console.log('Dropdown element:', dropdown);
    console.log('Textarea element:', textarea);
    
    // Add event listeners for form expansion
    if (dropdown) {
        dropdown.addEventListener('click', function(e) {
            console.log('Dropdown clicked');
            expandForm();
        });
        dropdown.addEventListener('focus', function(e) {
            console.log('Dropdown focused');
            expandForm();
        });
        dropdown.addEventListener('change', function(e) {
            console.log('Dropdown changed');
            updateMessageText();
        });
    }
    
    if (textarea) {
        textarea.addEventListener('click', function(e) {
            console.log('Textarea clicked');
            expandForm();
        });
        textarea.addEventListener('focus', function(e) {
            console.log('Textarea focused');
            expandForm();
        });
    }
    
    // Also add click listener to the entire dropdown container
    const dropdownContainer = document.querySelector('.dropdown-container');
    if (dropdownContainer) {
        dropdownContainer.addEventListener('click', function(e) {
            console.log('Dropdown container clicked');
            expandForm();
        });
    }
    
    // Set initial message text based on pre-selected option
    updateMessageText();
    
    console.log('Contact form initialized successfully');
}

// Function to expand the contact form
function expandForm() {
    console.log('Expanding form...');
    const expandableFields = document.querySelectorAll('.expandable-field');
    console.log('Found expandable fields:', expandableFields.length);
    
    expandableFields.forEach((field, index) => {
        console.log(`Processing field ${index}:`, field);
        // Remove the inline style display: none
        field.style.display = 'block';
        // Add the show class for animation
        setTimeout(() => {
            field.classList.add('show');
            console.log(`Added show class to field ${index}`);
        }, 50 + (index * 100)); // Stagger the animations
    });
}

// Function to update message text based on contact reason
function updateMessageText() {
    const dropdown = document.getElementById('contactReason');
    const textarea = document.getElementById('messageText');
    
    if (!dropdown || !textarea) return;
    
    const messageTexts = {
        'info': 'Dobrý den, mám zájem o tuto nemovitost. Rád bych získal více informací o ceně, dostupnosti a možnosti prohlídky. Děkuji.',
        'photos': 'Dobrý den, zajímá mě tato nemovitost a chtěl bych vidět více fotografií interiéru i exteriéru. Můžete mi prosím poslat dodatečné snímky? Děkuji.',
        'availability': 'Dobrý den, mám zájem o koupi této nemovitosti. Můžete mi prosím sdělit, zda je stále dostupná a jaké jsou podmínky prodeje? Děkuji.',
        'visit': 'Dobrý den, chtěl bych si naplánovat osobní prohlídku této nemovitosti. Můžete mi prosím navrhnout vhodný termín? Děkuji za odpověď.',
        'other': 'Dobrý den, mám dotaz ohledně této nemovitosti. '
    };
    
    const selectedValue = dropdown.value;
    textarea.value = messageTexts[selectedValue] || messageTexts['info'];
}

// Contact form functions (called from HTML onclick)
function sendContactForm() {
    const contactReason = document.getElementById('contactReason').value;
    const messageText = document.getElementById('messageText').value.trim();
    const userName = document.getElementById('userName').value.trim();
    const userEmail = document.getElementById('userEmail').value.trim();
    const userPhone = document.getElementById('userPhone').value.trim();
    const privacyConsent = document.getElementById('privacyConsent').checked;
    
    // Validation (contact reason is always selected now)
    // No need to validate contact reason since it's pre-selected
    
    if (!messageText) {
        showNotification('Prosím napište zprávu.', 'error');
        return;
    }
    
    if (!userName) {
        showNotification('Prosím zadejte své jméno.', 'error');
        return;
    }
    
    if (!userEmail) {
        showNotification('Prosím zadejte svůj email.', 'error');
        return;
    }
    
    if (!isValidEmail(userEmail)) {
        showNotification('Prosím zadejte platný email.', 'error');
        return;
    }
    
    if (!privacyConsent) {
        showNotification('Prosím odsouhlaste podmínky ochrany osobních údajů.', 'error');
        return;
    }
    
    // Prepare contact data
    const contactData = {
        reason: contactReason,
        message: messageText,
        name: userName,
        email: userEmail,
        phone: userPhone,
        property: 'Vila s výhledem na moře - Toskánsko'
    };
    
    // Here you would typically send the data to your backend
    console.log('Sending contact form:', contactData);
    
    showNotification('Zpráva byla úspěšně odeslána! Makléř vás bude brzy kontaktovat.', 'success');
    
    // Clear the form
    clearContactForm();
}

// Clear contact form
function clearContactForm() {
    document.getElementById('contactReason').value = '';
    document.getElementById('messageText').value = '';
    document.getElementById('userName').value = '';
    document.getElementById('userEmail').value = '';
    document.getElementById('userPhone').value = '';
    document.getElementById('privacyConsent').checked = false;
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Request visit functionality
function requestVisit() {
    openInquiryModal('Chtěl bych si naplánovat osobní prohlídku této nemovitosti. Můžete mi prosím navrhnout vhodný termín?');
}

// Request price functionality  
function requestPrice() {
    openInquiryModal('Mám zájem o tuto nemovitost a chtěl bych navrhnout svou cenovou nabídku. Můžeme si domluvit jednání?');
}

// Contact buttons functionality
function initializeContactButtons() {
    const callBtn = document.querySelector('.call-btn');
    const emailBtn = document.querySelector('.email-btn');
    
    callBtn.addEventListener('click', () => {
        // In a real application, this would open the phone dialer
        showNotification('Otevírám telefon...', 'info');
        // window.location.href = 'tel:+420123456789';
    });
    
    emailBtn.addEventListener('click', () => {
        openInquiryModal('Chtěl bych kontaktovat realitního makléře ohledně této nemovitosti');
    });
    
    // Property action buttons
    const propertyActionBtns = document.querySelectorAll('.property-action-btn');
    
    propertyActionBtns.forEach(button => {
        button.addEventListener('click', () => {
            const buttonText = button.textContent.trim();
            
            if (buttonText.includes('půdorys')) {
                showNotification('Otevírám půdorys...', 'info');
                // Here you would open a modal with floor plans
            } else if (buttonText.includes('Virtuální prohlídka')) {
                showNotification('Spouštím virtuální prohlídku...', 'info');
                // Here you would open virtual tour
            } else if (buttonText.includes('prohlídku')) {
                openInquiryModal('Chtěl bych si naplánovat osobní prohlídku této nemovitosti');
            }
        });
    });
}

// Utility functions
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: type === 'success' ? '#3E6343' : type === 'error' ? '#f44336' : '#2196F3',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        zIndex: '10000',
        fontWeight: '500',
        fontSize: '14px',
        maxWidth: '300px',
        wordWrap: 'break-word',
        animation: 'slideInRight 0.3s ease'
    });
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

function openInquiryModal(defaultMessage) {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    Object.assign(overlay.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '10000',
        animation: 'fadeIn 0.3s ease'
    });
    
    // Create modal content
    const modal = document.createElement('div');
    modal.className = 'inquiry-modal';
    Object.assign(modal.style, {
        background: 'white',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        animation: 'slideInUp 0.3s ease'
    });
    
    modal.innerHTML = `
        <div class="modal-header" style="margin-bottom: 24px;">
            <h2 style="color: #2c3e50; margin-bottom: 8px;">Kontaktovat makléře</h2>
            <p style="color: #6c757d;">Pošlete zprávu ohledně této nemovitosti</p>
        </div>
        
        <form class="inquiry-form">
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #495057;">Jméno a příjmení</label>
                <input type="text" name="name" required style="width: 100%; padding: 12px; border: 1px solid #e9ecef; border-radius: 8px; font-size: 14px;">
            </div>
            
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #495057;">Email</label>
                <input type="email" name="email" required style="width: 100%; padding: 12px; border: 1px solid #e9ecef; border-radius: 8px; font-size: 14px;">
            </div>
            
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #495057;">Telefon (volitelné)</label>
                <input type="tel" name="phone" style="width: 100%; padding: 12px; border: 1px solid #e9ecef; border-radius: 8px; font-size: 14px;">
            </div>
            
            <div style="margin-bottom: 24px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #495057;">Zpráva</label>
                <textarea name="message" rows="4" required style="width: 100%; padding: 12px; border: 1px solid #e9ecef; border-radius: 8px; font-size: 14px; resize: vertical;">${defaultMessage}</textarea>
            </div>
            
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button type="button" class="modal-cancel" style="background: #f8f9fa; border: 1px solid #e9ecef; color: #495057; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 500;">Zrušit</button>
                <button type="submit" style="background: #3E6343; border: none; color: white; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 500;">Odeslat zprávu</button>
            </div>
        </form>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Add event listeners
    const cancelBtn = modal.querySelector('.modal-cancel');
    const form = modal.querySelector('.inquiry-form');
    
    cancelBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        // Here you would normally send the form data to your backend
        showNotification('Zpráva byla úspěšně odeslána. Makléř vás bude brzy kontaktovat.', 'success');
        closeModal();
    });
    
    // Focus first input
    modal.querySelector('input[name="name"]').focus();
    
    function closeModal() {
        overlay.style.animation = 'fadeOut 0.3s ease';
        modal.style.animation = 'slideOutDown 0.3s ease';
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.remove();
            }
        }, 300);
    }
}

// Map navigation function
function openMapsNavigation() {
    // Property coordinates for Cinque Terre, Tuscany
    const latitude = 44.1223;  // Approximate coordinates for Cinque Terre
    const longitude = 9.7072;
    const propertyName = "Vila s výhledem na moře";
    
    // Try to detect the user's preferred maps app
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    
    let mapsUrl;
    
    if (isIOS) {
        // iOS - prefer Apple Maps, fallback to Google Maps
        mapsUrl = `maps://maps.apple.com/?q=${encodeURIComponent(propertyName)}&ll=${latitude},${longitude}`;
        
        // Try to open Apple Maps
        window.location.href = mapsUrl;
        
        // Fallback to Google Maps if Apple Maps fails
        setTimeout(() => {
            window.open(`https://maps.google.com/?q=${latitude},${longitude}&ll=${latitude},${longitude}&z=15`, '_blank');
        }, 500);
        
    } else if (isAndroid) {
        // Android - prefer Google Maps
        mapsUrl = `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodeURIComponent(propertyName)})`;
        window.location.href = mapsUrl;
        
    } else {
        // Desktop or other - open Google Maps in new tab
        mapsUrl = `https://maps.google.com/?q=${latitude},${longitude}&ll=${latitude},${longitude}&z=15`;
        window.open(mapsUrl, '_blank');
    }
    
    // Show notification
    showNotification('Otevírám navigaci...', 'info');
}

// Scroll to map section function
function scrollToMapSection() {
    const mapSection = document.getElementById('map-section');
    if (mapSection) {
        mapSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Scroll to comparison section
function scrollToComparisonSection() {
    const comparisonSection = document.getElementById('comparisonSection');
    if (comparisonSection) {
        comparisonSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Initialize property map
let propertyMap;

function initializePropertyMap() {
    // Initialize the map
    propertyMap = L.map('propertyMap').setView([44.1223, 9.7072], 15);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(propertyMap);
    
    // Add marker for the property - using default marker
    const propertyMarker = L.marker([44.1223, 9.7072]).addTo(propertyMap);
    
    // Add popup with property details
    propertyMarker.bindPopup(`
        <div class="property-popup">
            <img src="pexels-pixabay-210017.jpg" alt="Vila s výhledem na moře" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 12px;">
            <h3 style="margin: 0 0 8px 0; color: #333; font-size: 16px;">Vila s výhledem na moře</h3>
            <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">Cinque Terre, Toskánsko</p>
            <div style="font-size: 18px; font-weight: bold; color: #3E6343;">€850,000</div>
        </div>
    `);
}

// Expand map function
function expandMap() {
    const mapSection = document.querySelector('.map-section');
    const mapElement = document.getElementById('propertyMap');
    const expandBtn = document.querySelector('.expand-map-btn');
    
    if (mapSection.classList.contains('fullscreen')) {
        // Exit fullscreen
        mapSection.classList.remove('fullscreen');
        document.body.style.overflow = '';
        
        // Update button icon to expand
        expandBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
            </svg>
        `;
        expandBtn.title = 'Rozšířit mapu';
        
    } else {
        // Enter fullscreen
        mapSection.classList.add('fullscreen');
        document.body.style.overflow = 'hidden';
        
        // Update button icon to contract
        expandBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
            </svg>
        `;
        expandBtn.title = 'Zmenšit mapu';
    }
    
    // Resize the map after expansion/contraction
    setTimeout(() => {
        if (propertyMap) {
            propertyMap.invalidateSize();
        }
    }, 300);
}

// Property Comparison Functions
function initializeComparison() {
    // Check if user has saved properties (this would normally come from localStorage or API)
    const savedProperties = getSavedProperties();
    
    if (savedProperties.length === 0) {
        // Hide comparison section if no saved properties
        const comparisonSection = document.getElementById('comparisonSection');
        if (comparisonSection) {
            comparisonSection.style.display = 'none';
        }
    }
}

function getSavedProperties() {
    // Simulate saved properties - in real app this would come from localStorage or API
    return [
        {
            id: 1,
            name: 'Historická vila s vinicí',
            location: 'Chianti, Toskánsko',
            price: 920000,
            size: 320,
            rooms: 5,
            bathrooms: 3,
            floor: 1,
            type: 'Vila',
            yearBuilt: 1890,
            image: 'pexels-grisentig-4215104.jpg',
            savedDate: '2024-01-15'
        },
        {
            id: 2,
            name: 'Moderní vila s bazénem',
            location: 'Lucca, Toskánsko',
            price: 750000,
            size: 250,
            rooms: 4,
            bathrooms: 2,
            floor: 1,
            type: 'Vila',
            yearBuilt: 2010,
            image: 'pexels-mickyiaia34-709478.jpg',
            savedDate: '2024-01-12'
        }
    ];
}

function showAllSavedComparisons() {
    // This would open a modal or navigate to a comparison page
    console.log('Opening comparison with all saved properties');
    
    // Simulate modal or page navigation
    showNotification('Funkce "Porovnat se všemi uloženými" bude otevřena v detailním porovnávacím rozhraní.', 'info');
}

function openDetailedComparison() {
    // This would open a detailed comparison view
    console.log('Opening detailed comparison view');
    
    // Simulate modal or page navigation  
    showNotification('Detailní porovnání by zobrazilo rozšířené vlastnosti, fotografie, mapy a investiční potenciál.', 'info');
}

function addToComparison(propertyId) {
    // Add current property to saved properties for comparison
    console.log('Adding property to saved list:', propertyId);
    
    // This would normally save to localStorage or send to API
    const currentProperty = {
        id: Date.now(),
        name: 'Vila s výhledem na moře',
        location: 'Cinque Terre, Toskánsko',
        price: 850000,
        size: 280,
        rooms: 4,
        bathrooms: 2,
        floor: 2,
        type: 'Vila',
        yearBuilt: 1995,
        image: 'pexels-pixabay-210017.jpg',
        savedDate: new Date().toISOString().split('T')[0]
    };
    
    // Show success message
    showNotification('Nemovitost byla přidána do uložených pro porovnání!', 'success');
}

function removeFromComparison(propertyId) {
    // Remove property from saved list
    console.log('Removing property from comparison:', propertyId);
    showNotification('Nemovitost byla odebrána z porovnání', 'info');
}

function calculatePricePerSqm(price, size) {
    return Math.round(price / size);
}

function formatPrice(price) {
    return new Intl.NumberFormat('cs-CZ', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0
    }).format(price);
}

// CSS animations are now defined in property-detail-styles.css