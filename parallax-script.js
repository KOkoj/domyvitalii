// Parallax Script for Layer Animation
class ParallaxController {
    constructor() {
        this.layers = document.querySelectorAll('.parallax-layer');
        this.hero = document.querySelector('.parallax-hero');
        this.isScrolling = false;
        this.lastScrollY = 0;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.initialAnimation();
    }

    bindEvents() {
        // Throttled scroll event for performance
        window.addEventListener('scroll', () => {
            if (!this.isScrolling) {
                requestAnimationFrame(() => {
                    this.handleScroll();
                    this.isScrolling = false;
                });
                this.isScrolling = true;
            }
        });

        // Resize event for responsive behavior
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Intersection Observer for performance optimization
        this.setupIntersectionObserver();
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.enableParallax();
                } else {
                    this.disableParallax();
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });

        if (this.hero) {
            observer.observe(this.hero);
        }
    }

    enableParallax() {
        this.parallaxEnabled = true;
    }

    disableParallax() {
        this.parallaxEnabled = false;
    }

    handleScroll() {
        if (!this.parallaxEnabled) return;

        const scrolled = window.pageYOffset;
        const heroHeight = this.hero ? this.hero.offsetHeight : window.innerHeight;
        const scrollProgress = Math.min(scrolled / heroHeight, 1);

        this.layers.forEach(layer => {
            const speed = parseFloat(layer.dataset.speed) || 0.5;
            const yPos = scrolled * speed;
            
            // Apply transform with GPU acceleration
            layer.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });

        this.lastScrollY = scrolled;
    }

    handleResize() {
        // Reset transforms on resize to prevent layout issues
        this.layers.forEach(layer => {
            layer.style.transform = 'translate3d(0, 0, 0)';
        });
        
        // Recalculate parallax on next scroll
        setTimeout(() => {
            this.handleScroll();
        }, 100);
    }

    initialAnimation() {
        // Enhanced load animation with staggered timing
        this.layers.forEach((layer, index) => {
            const delay = index * 100;
            
            // Set initial state
            layer.style.transform = 'translate3d(0, 60px, 0)';
            layer.style.opacity = '0';
            
            // Animate to final position
            setTimeout(() => {
                layer.style.transition = 'transform 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 1.5s ease-out';
                layer.style.transform = 'translate3d(0, 0, 0)';
                layer.style.opacity = layer.classList.contains('parallax-layer-1') ? '0.9' : 
                                     layer.classList.contains('parallax-layer-2') ? '0.95' : '1';
            }, delay);
            
            // Remove transition after animation completes
            setTimeout(() => {
                layer.style.transition = 'transform 0.1s ease-out';
            }, delay + 1500);
        });
    }


}

// Advanced Performance Optimizations
class PerformanceOptimizer {
    constructor() {
        this.setupRAF();
        this.setupVisibilityAPI();
        this.setupReducedMotion();
    }

    setupRAF() {
        // Enhanced requestAnimationFrame with fallback
        window.requestAnimationFrame = window.requestAnimationFrame || 
                                     window.webkitRequestAnimationFrame ||
                                     window.mozRequestAnimationFrame ||
                                     window.oRequestAnimationFrame ||
                                     window.msRequestAnimationFrame ||
                                     function(callback) {
                                         window.setTimeout(callback, 1000 / 60);
                                     };
    }

    setupVisibilityAPI() {
        // Pause animations when tab is not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimations();
            } else {
                this.resumeAnimations();
            }
        });
    }

    setupReducedMotion() {
        // Respect user's reduced motion preference
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.disableAnimations();
        }
    }

    pauseAnimations() {
        document.body.classList.add('animations-paused');
    }

    resumeAnimations() {
        document.body.classList.remove('animations-paused');
    }

    disableAnimations() {
        document.body.classList.add('reduced-motion');
    }
}

// Smooth Scroll Enhancement
class SmoothScrollEnhancer {
    constructor() {
        this.setupSmoothScroll();
    }

    setupSmoothScroll() {
        // Enhanced smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    this.smoothScrollTo(targetElement);
                }
            });
        });
    }

    smoothScrollTo(element) {
        const targetPosition = element.offsetTop;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = 1000;
        let start = null;

        const animation = (currentTime) => {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const run = this.easeInOutQuad(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        };

        requestAnimationFrame(animation);
    }

    easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }
}

// Loading Animation Controller
class LoadingAnimationController {
    constructor() {
        this.setupLoadingStates();
    }

    setupLoadingStates() {
        // Set initial loading states
        document.body.classList.add('loading');
        
        // Remove loading state after animations complete
        setTimeout(() => {
            document.body.classList.remove('loading');
            document.body.classList.add('loaded');
        }, 2000);
    }
}

// Mobile Touch Enhancements
class MobileEnhancer {
    constructor() {
        this.setupTouchEvents();
        this.setupMobileOptimizations();
    }

    setupTouchEvents() {
        // Enhanced touch scrolling for mobile
        let touchStartY = 0;
        let touchEndY = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartY = e.changedTouches[0].screenY;
        });

        document.addEventListener('touchend', (e) => {
            touchEndY = e.changedTouches[0].screenY;
            this.handleTouchGesture();
        });
    }

    handleTouchGesture() {
        // Add touch gesture handling if needed
        const threshold = 50;
        const diff = touchStartY - touchEndY;
        
        if (Math.abs(diff) > threshold) {
            // Touch gesture detected
            document.body.classList.add('touch-scrolling');
            setTimeout(() => {
                document.body.classList.remove('touch-scrolling');
            }, 100);
        }
    }

    setupMobileOptimizations() {
        // Disable hover effects on mobile
        if ('ontouchstart' in window) {
            document.body.classList.add('touch-device');
        }
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Feature detection
    const supportsIntersectionObserver = 'IntersectionObserver' in window;
    const supportsWebGL = !!window.WebGLRenderingContext;
    
    if (supportsIntersectionObserver) {
        // Initialize all controllers
        new ParallaxController();
        new PerformanceOptimizer();
        new SmoothScrollEnhancer();
        new LoadingAnimationController();
        new MobileEnhancer();
        
        console.log('Parallax system initialized successfully');
    } else {
        // Fallback for older browsers
        console.log('Intersection Observer not supported, using fallback');
        new ParallaxController();
    }
});

// Export for potential external use
window.ParallaxController = ParallaxController; 