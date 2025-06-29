// Utility Functions
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// DOM Elements
const navbar = $('#navbar');
const navToggle = $('#nav-toggle');
const navMenu = $('#nav-menu');
const themeToggle = $('#theme-toggle');
const loadingScreen = $('#loading-screen');
const contactForm = $('#contact-form');

// Geolocation and Map Elements
const getLocationBtn = $('#get-location-btn');
const shareLocationBtn = $('#share-location-btn');
const locationText = $('#location-text');
const latitudeSpan = $('#latitude');
const longitudeSpan = $('#longitude');
const locationStatus = $('#location-status');
const mapElement = $('#map');
const zoomInBtn = $('#zoom-in-btn');
const zoomOutBtn = $('#zoom-out-btn');
const centerMapBtn = $('#center-map-btn');

// Global variables for map
let map = null;
let userMarker = null;
let userLocation = null;

// Loading Screen
window.addEventListener('load', () => {
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
    }, 1500);
});

// Navigation
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    
    // Add scrolled class to navbar
    if (currentScrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    // Update active nav link
    updateActiveNavLink();
    
    lastScrollY = currentScrollY;
});

// Mobile Navigation Toggle
navToggle?.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
});

// Close mobile menu when clicking on a link
$$('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// Update Active Navigation Link
function updateActiveNavLink() {
    const sections = $$('section[id]');
    const navLinks = $$('.nav-link');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

// Theme Toggle
const initTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (prefersDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    updateThemeIcon();
};

const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon();
};

const updateThemeIcon = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const icon = themeToggle?.querySelector('i');
    
    if (icon) {
        icon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
};

themeToggle?.addEventListener('click', toggleTheme);

// Initialize theme on load
initTheme();

// Smooth Scrolling for Navigation Links
$$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        const targetId = link.getAttribute('href');
        const targetSection = $(targetId);
        
        if (targetSection) {
            const offsetTop = targetSection.offsetTop - 80;
            
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Intersection Observer for Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
            
            // Animate skill bars
            if (entry.target.classList.contains('skill-item')) {
                const progressBar = entry.target.querySelector('.skill-progress');
                const targetWidth = progressBar.getAttribute('data-width');
                
                setTimeout(() => {
                    progressBar.style.width = targetWidth;
                }, 200);
            }
            
            // Animate counters
            if (entry.target.classList.contains('stat-item')) {
                const counter = entry.target.querySelector('.stat-number');
                const target = parseInt(counter.getAttribute('data-target'));
                animateCounter(counter, target);
            }
        }
    });
}, observerOptions);

// Observe elements for animation
$$('.skill-item, .project-card, .stat-item, .timeline-item, .contact-item').forEach(el => {
    observer.observe(el);
});

// Counter Animation
function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 30);
}

// Geolocation Functions
function initializeMap(lat = 27.7172, lng = 85.3240) {
    // Default to Kathmandu, Nepal if no coordinates provided
    if (map) {
        map.remove();
    }
    
    map = L.map('map').setView([lat, lng], 13);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);
    
    // Add marker if coordinates are provided
    if (lat !== 27.7172 || lng !== 85.3240) {
        userMarker = L.marker([lat, lng]).addTo(map)
            .bindPopup('Your current location')
            .openPopup();
    } else {
        // Default marker for Kathmandu
        L.marker([lat, lng]).addTo(map)
            .bindPopup('Kathmandu, Nepal - Default Location')
            .openPopup();
    }
}

function updateLocationDisplay(position) {
    const { latitude, longitude } = position.coords;
    userLocation = { lat: latitude, lng: longitude };
    
    // Update text displays
    locationText.textContent = `Location found successfully!`;
    latitudeSpan.textContent = `Lat: ${latitude.toFixed(6)}`;
    longitudeSpan.textContent = `Lng: ${longitude.toFixed(6)}`;
    
    // Update status
    locationStatus.innerHTML = `
        <i class="fas fa-check-circle" style="color: var(--accent-color);"></i>
        <span>Location detected successfully</span>
    `;
    
    // Enable share button
    shareLocationBtn.disabled = false;
    
    // Initialize map with user location
    initializeMap(latitude, longitude);
}

function handleLocationError(error) {
    let errorMessage = '';
    
    switch(error.code) {
        case error.PERMISSION_DENIED:
            errorMessage = "Location access denied by user";
            break;
        case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable";
            break;
        case error.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
        default:
            errorMessage = "An unknown error occurred";
            break;
    }
    
    locationText.textContent = errorMessage;
    locationStatus.innerHTML = `
        <i class="fas fa-exclamation-triangle" style="color: #ef4444;"></i>
        <span>${errorMessage}</span>
    `;
    
    // Initialize map with default location
    initializeMap();
}

function getCurrentLocation() {
    if (!navigator.geolocation) {
        handleLocationError({ code: 0, message: "Geolocation not supported" });
        return;
    }
    
    // Update UI to show loading state
    getLocationBtn.innerHTML = `
        <i class="fas fa-spinner fa-spin"></i>
        <span>Getting Location...</span>
    `;
    getLocationBtn.disabled = true;
    
    locationStatus.innerHTML = `
        <i class="fas fa-spinner fa-spin"></i>
        <span>Detecting your location...</span>
    `;
    
    const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
    };
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            updateLocationDisplay(position);
            
            // Reset button
            getLocationBtn.innerHTML = `
                <i class="fas fa-check"></i>
                <span>Location Found</span>
            `;
            getLocationBtn.disabled = false;
        },
        (error) => {
            handleLocationError(error);
            
            // Reset button
            getLocationBtn.innerHTML = `
                <i class="fas fa-crosshairs"></i>
                <span>Try Again</span>
            `;
            getLocationBtn.disabled = false;
        },
        options
    );
}

function shareLocation() {
    if (!userLocation) return;
    
    const locationUrl = `https://www.google.com/maps?q=${userLocation.lat},${userLocation.lng}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'My Current Location',
            text: 'Check out my current location!',
            url: locationUrl
        }).catch(err => {
            console.log('Error sharing:', err);
            copyToClipboard(locationUrl);
        });
    } else {
        copyToClipboard(locationUrl);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Location URL copied to clipboard!', 'success');
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('Location URL copied to clipboard!', 'success');
    });
}

// Map Control Functions
function zoomIn() {
    if (map) {
        map.zoomIn();
    }
}

function zoomOut() {
    if (map) {
        map.zoomOut();
    }
}

function centerMap() {
    if (map && userLocation) {
        map.setView([userLocation.lat, userLocation.lng], 15);
    }
}

// Event Listeners for Geolocation
getLocationBtn?.addEventListener('click', getCurrentLocation);
shareLocationBtn?.addEventListener('click', shareLocation);
zoomInBtn?.addEventListener('click', zoomIn);
zoomOutBtn?.addEventListener('click', zoomOut);
centerMapBtn?.addEventListener('click', centerMap);

// Contact Form Handling
contactForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    try {
        // Simulate form submission (replace with actual endpoint)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Show success message
        showNotification('Message sent successfully!', 'success');
        contactForm.reset();
        
        // Reset form labels
        $$('.form-group').forEach(group => {
            const input = group.querySelector('input, textarea');
            const label = group.querySelector('label');
            if (input && label && !input.value) {
                label.style.top = '';
                label.style.fontSize = '';
                label.style.color = '';
            }
        });
        
    } catch (error) {
        showNotification('Failed to send message. Please try again.', 'error');
    } finally {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 1rem;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
        transform: translateX(100%);
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Close functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    });
    
    // Auto close after 5 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
}

// Form Input Animation
$$('.form-group input, .form-group textarea').forEach(input => {
    input.addEventListener('focus', () => {
        const label = input.nextElementSibling;
        if (label && label.tagName === 'LABEL') {
            label.style.top = '-10px';
            label.style.left = '1rem';
            label.style.fontSize = '0.875rem';
            label.style.color = 'var(--primary-color)';
            label.style.background = 'white';
            label.style.padding = '0 0.5rem';
        }
    });
    
    input.addEventListener('blur', () => {
        const label = input.nextElementSibling;
        if (label && label.tagName === 'LABEL' && !input.value) {
            label.style.top = '';
            label.style.left = '';
            label.style.fontSize = '';
            label.style.color = '';
            label.style.background = '';
            label.style.padding = '';
        }
    });
});

// Parallax Effect for Hero Section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = $$('.floating-icon');
    
    parallaxElements.forEach((element, index) => {
        const speed = 0.5 + (index * 0.1);
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px)`;
    });
});

// Keyboard Navigation
document.addEventListener('keydown', (e) => {
    // ESC key closes mobile menu
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // Arrow keys for navigation
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const sections = Array.from($$('section[id]'));
        const currentIndex = sections.findIndex(section => {
            const rect = section.getBoundingClientRect();
            return rect.top <= 100 && rect.bottom > 100;
        });
        
        let nextIndex;
        if (e.key === 'ArrowDown') {
            nextIndex = Math.min(currentIndex + 1, sections.length - 1);
        } else {
            nextIndex = Math.max(currentIndex - 1, 0);
        }
        
        if (nextIndex !== currentIndex && sections[nextIndex]) {
            sections[nextIndex].scrollIntoView({ behavior: 'smooth' });
        }
    }
});

// Performance Optimization
// Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debouncing to scroll events
const debouncedScrollHandler = debounce(() => {
    updateActiveNavLink();
}, 10);

window.addEventListener('scroll', debouncedScrollHandler);

// Preload images
const preloadImages = () => {
    const images = [
        'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg',
        'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg',
        'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg'
    ];
    
    images.forEach(src => {
        const img = new Image();
        img.src = src;
    });
};

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize map with default location
    initializeMap();
    
    // Add initial animations
    setTimeout(() => {
        $$('.hero-text, .hero-image').forEach((el, index) => {
            el.style.animationDelay = `${index * 0.2}s`;
            el.classList.add('fade-in-up');
        });
    }, 100);
    
    // Initialize skill progress bars
    $$('.skill-progress').forEach(bar => {
        bar.style.width = '0%';
    });
    
    // Preload images
    preloadImages();
    
    console.log('Portfolio website with geolocation initialized successfully!');
});

// Error Handling
window.addEventListener('error', (e) => {
    console.error('JavaScript Error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled Promise Rejection:', e.reason);
});

// Service Worker Registration (if sw.js exists)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}