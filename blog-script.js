// Configuration for API endpoints
const API_CONFIG = {
    // Automatically detect if we're in development or production
    baseURL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3001/api'  // Local development
        : 'https://your-railway-backend.up.railway.app/api', // Production - UPDATE THIS URL
    
    // Fallback for debugging
    get apiUrl() {
        console.log('Using API URL:', this.baseURL);
        return this.baseURL;
    }
};

// Blog functionality
class BlogManager {
    constructor() {
        this.blogData = null;
        this.filteredPosts = [];
        this.currentFilters = {
            family: 'all',
            topic: 'all',
            search: ''
        };
        this.postsPerPage = 6;
        this.currentPage = 1;
        
        this.init();
    }
    
    async init() {
        try {
            await this.loadBlogData();
            this.setupEventListeners();
            this.renderInitialContent();
        } catch (error) {
            console.error('Failed to initialize blog:', error);
            this.showError();
        }
    }
    
    async loadBlogData() {
        try {
            const response = await fetch('data/blog-index.json');
            if (!response.ok) {
                throw new Error('Failed to load blog data');
            }
            this.blogData = await response.json();
            this.filteredPosts = [...this.blogData.posts];
        } catch (error) {
            console.error('Error loading blog data:', error);
            throw error;
        }
    }
    
    setupEventListeners() {
        // Family tab listeners
        const familyTabs = document.querySelectorAll('.family-tab');
        familyTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const family = e.target.dataset.family;
                this.setFamilyFilter(family);
            });
        });
        
        // Search input listener
        const searchInput = document.getElementById('blogSearch');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.setSearchFilter(e.target.value);
                }, 300);
            });
        }
        
        // Load more button listener
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMorePosts();
            });
        }
        
        // Newsletter form listener
        const newsForm = document.querySelector('.newsletter-form');
        if (newsForm) {
            newsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleNewsletterSubmit(e);
            });
        }
    }
    
    setFamilyFilter(family) {
        this.currentFilters.family = family;
        this.currentFilters.topic = 'all';
        this.currentPage = 1;
        
        // Update active tab
        document.querySelectorAll('.family-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.family === family);
        });
        
        // Update topic pills
        this.renderTopicPills();
        
        // Filter and render posts
        this.filterPosts();
        this.renderPosts();
    }
    
    setTopicFilter(topic) {
        this.currentFilters.topic = topic;
        this.currentPage = 1;
        
        // Update active pill
        document.querySelectorAll('.topic-pill').forEach(pill => {
            pill.classList.toggle('active', pill.dataset.topic === topic);
        });
        
        // Filter and render posts
        this.filterPosts();
        this.renderPosts();
    }
    
    setSearchFilter(search) {
        this.currentFilters.search = search.toLowerCase();
        this.currentPage = 1;
        
        // Filter and render posts
        this.filterPosts();
        this.renderPosts();
    }
    
    filterPosts() {
        this.filteredPosts = this.blogData.posts.filter(post => {
            // Family filter
            if (this.currentFilters.family !== 'all' && post.family !== this.currentFilters.family) {
                return false;
            }
            
            // Topic filter
            if (this.currentFilters.topic !== 'all' && post.topic !== this.currentFilters.topic) {
                return false;
            }
            
            // Search filter
            if (this.currentFilters.search) {
                const searchTerm = this.currentFilters.search;
                const searchableText = [
                    post.title,
                    post.excerpt,
                    post.author,
                    ...post.tags
                ].join(' ').toLowerCase();
                
                if (!searchableText.includes(searchTerm)) {
                    return false;
                }
            }
            
            return true;
        });
        
        // Sort by date (newest first)
        this.filteredPosts.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
    }
    
    renderInitialContent() {
        this.renderTopicPills();
        this.filterPosts();
        this.renderPosts();
    }
    
    renderTopicPills() {
        const topicPillsContainer = document.getElementById('topicPills');
        if (!topicPillsContainer) return;
        
        topicPillsContainer.innerHTML = '';
        
        if (this.currentFilters.family === 'all') {
            return;
        }
        
        const familyData = this.blogData.families[this.currentFilters.family];
        if (!familyData) return;
        
        // Add "All" pill for the selected family
        const allPill = document.createElement('button');
        allPill.className = 'topic-pill active';
        allPill.dataset.topic = 'all';
        allPill.textContent = 'Vše';
        allPill.addEventListener('click', () => this.setTopicFilter('all'));
        topicPillsContainer.appendChild(allPill);
        
        // Add topic pills
        Object.entries(familyData.topics).forEach(([topicKey, topicName]) => {
            const pill = document.createElement('button');
            pill.className = 'topic-pill';
            pill.dataset.topic = topicKey;
            pill.textContent = topicName;
            pill.addEventListener('click', () => this.setTopicFilter(topicKey));
            topicPillsContainer.appendChild(pill);
        });
    }
    
    renderPosts() {
        const blogGrid = document.getElementById('blogGrid');
        if (!blogGrid) return;
        
        const postsToShow = this.filteredPosts.slice(0, this.currentPage * this.postsPerPage);
        
        if (postsToShow.length === 0) {
            this.showEmptyState();
            return;
        }
        
        blogGrid.innerHTML = '';
        
        postsToShow.forEach((post, index) => {
            const postCard = this.createPostCard(post);
            postCard.classList.add('fade-in');
            blogGrid.appendChild(postCard);
        });
        
        // Update load more button
        this.updateLoadMoreButton();
    }
    
    createPostCard(post) {
        const card = document.createElement('div');
        card.className = 'blog-card';
        card.addEventListener('click', () => this.openPost(post));
        
        const familyName = this.blogData.families[post.family]?.name || post.family;
        const formattedDate = this.formatDate(post.publishDate);
        
        card.innerHTML = `
            <div class="blog-card-image">
                ${post.cover ? `<img src="${post.cover}" alt="${post.title}" onerror="this.style.display='none'">` : ''}
                <div class="blog-card-placeholder">${post.title}</div>
            </div>
            <div class="blog-card-content">
                <div class="blog-card-meta">
                    <span class="blog-card-family">${familyName}</span>
                    <span class="blog-card-date">${formattedDate}</span>
                </div>
                <h3 class="blog-card-title">${post.title}</h3>
                <p class="blog-card-excerpt">${post.excerpt}</p>
                <div class="blog-card-tags">
                    ${post.tags.map(tag => `<span class="blog-card-tag">${tag}</span>`).join('')}
                </div>
                <div class="blog-card-footer">
                    <span class="blog-card-author">${post.author}</span>
                    <span class="blog-card-read-time">${post.readTime} min čtení</span>
                </div>
            </div>
        `;
        
        return card;
    }
    
    loadMorePosts() {
        this.currentPage++;
        this.renderPosts();
    }
    
    updateLoadMoreButton() {
        const loadMoreContainer = document.getElementById('loadMoreContainer');
        if (!loadMoreContainer) return;
        
        const totalPosts = this.filteredPosts.length;
        const shownPosts = this.currentPage * this.postsPerPage;
        
        if (shownPosts < totalPosts) {
            loadMoreContainer.style.display = 'block';
        } else {
            loadMoreContainer.style.display = 'none';
        }
    }
    
    showEmptyState() {
        const blogGrid = document.getElementById('blogGrid');
        if (!blogGrid) return;
        
        blogGrid.innerHTML = `
            <div class="blog-empty">
                <div class="blog-empty-icon">📝</div>
                <h3 class="blog-empty-title">Žádné články nenalezeny</h3>
                <p class="blog-empty-description">
                    Zkuste změnit filtry nebo vyhledávací dotaz.
                </p>
            </div>
        `;
        
        // Hide load more button
        const loadMoreContainer = document.getElementById('loadMoreContainer');
        if (loadMoreContainer) {
            loadMoreContainer.style.display = 'none';
        }
    }
    
    showError() {
        const blogGrid = document.getElementById('blogGrid');
        if (!blogGrid) return;
        
        blogGrid.innerHTML = `
            <div class="blog-empty">
                <div class="blog-empty-icon">⚠️</div>
                <h3 class="blog-empty-title">Chyba při načítání</h3>
                <p class="blog-empty-description">
                    Nepodařilo se načíst články. Zkuste obnovit stránku.
                </p>
            </div>
        `;
    }
    
    openPost(post) {
        // For now, just log the post - in future this will navigate to post page
        console.log('Opening post:', post);
        
        // Navigate to the blog post page
        const slug = post.slug || post.title.toLowerCase().replace(/\s+/g, '-');
        const postUrl = `/blog/${slug}.html`;
        
        // Check if the post page exists, if not show coming soon message
        fetch(postUrl, { method: 'HEAD' })
            .then(response => {
                if (response.ok) {
                    window.location.href = postUrl;
                } else {
                    this.showNotification(`Článek "${post.title}" bude brzy dostupný!`, 'info');
                }
            })
            .catch(() => {
                this.showNotification(`Článek "${post.title}" bude brzy dostupný!`, 'info');
            });
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('cs-CZ', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    handleNewsletterSubmit(e) {
        const formData = new FormData(e.target);
        const email = formData.get('email') || e.target.querySelector('input[type="email"]').value;
        
        if (!email) {
            this.showNotification('Prosím zadejte váš e-mail.', 'error');
            return;
        }
        
        if (!this.isValidEmail(email)) {
            this.showNotification('Prosím zadejte platný e-mail.', 'error');
            return;
        }
        
        // Show loading state
        this.showNotification('Přihlašování k odběru...', 'info');
        
        // Send to backend API (Newsletter subscription)
        fetch(`${API_CONFIG.apiUrl}/newsletter/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                name: '', // Optional
                source: 'blog'
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            this.showNotification('Děkujeme za přihlášení k odběru!', 'success');
            console.log('Newsletter subscription successful:', data);
            
            // Clear the email input
            e.target.querySelector('input[type="email"]').value = '';
        })
        .catch(error => {
            console.error('Error subscribing to newsletter:', error);
            this.showNotification('Chyba při přihlašování. Zkuste to prosím znovu.', 'error');
        });
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    showNotification(message, type = 'info') {
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
            background: ${this.getNotificationColor(type)};
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
    
    getNotificationColor(type) {
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
}

// Initialize blog when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BlogManager();
});

// Add some utility functions for animations
function addScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe all blog cards
    document.querySelectorAll('.blog-card').forEach(card => {
        observer.observe(card);
    });
}

// Initialize scroll animations after content is loaded
setTimeout(addScrollAnimations, 1000); 