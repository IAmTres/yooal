// Project embed interactions
const initProjectEmbeds = () => {
    const projectEmbeds = document.querySelectorAll('.project-embed');
    
    projectEmbeds.forEach(embed => {
        const iframe = embed.querySelector('iframe');
        const container = embed.querySelector('.embed-container');
        
        // Add loading state
        container.insertAdjacentHTML('beforeend', `
            <div class="loading-overlay">
                <div class="loading-spinner"></div>
            </div>
        `);
        
        // Remove loading overlay when iframe loads
        iframe.addEventListener('load', () => {
            container.querySelector('.loading-overlay').style.opacity = '0';
            setTimeout(() => {
                container.querySelector('.loading-overlay').remove();
            }, 300);
        });
        
        // Mouse move parallax effect
        embed.addEventListener('mousemove', (e) => {
            const rect = embed.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const xPercent = (x / rect.width - 0.5) * 2;
            const yPercent = (y / rect.height - 0.5) * 2;
            
            iframe.style.transform = `
                scale(1.02)
                translate(${xPercent * 5}px, ${yPercent * 5}px)
                rotateX(${yPercent * -2}deg)
                rotateY(${xPercent * 2}deg)
            `;
        });
        
        // Reset transform on mouse leave
        embed.addEventListener('mouseleave', () => {
            iframe.style.transform = 'none';
        });

        // Click to visit
        embed.addEventListener('click', () => {
            window.open(embed.dataset.url, '_blank');
        });
    });
};

// Initialize project embeds when DOM loads
document.addEventListener('DOMContentLoaded', initProjectEmbeds);

// Smooth animations on scroll
const observeElements = (elements, callback) => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                callback(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    elements.forEach(el => observer.observe(el));
};

// Contact form functionality
const contactModal = document.getElementById('contactModal');
const contactForm = document.getElementById('contactForm');
const formMessage = contactForm.querySelector('.form-message');
const submitButton = contactForm.querySelector('.submit-button');
const buttonText = submitButton.querySelector('.button-text');
const buttonLoader = submitButton.querySelector('.button-loader');

// Open contact modal
document.querySelectorAll('.open-contact-modal').forEach(button => {
    button.addEventListener('click', () => {
        contactModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        // Generate CSRF token
        const csrfToken = Math.random().toString(36).substring(2);
        contactForm.querySelector('[name="csrf_token"]').value = csrfToken;
        // Store in session
        sessionStorage.setItem('csrf_token', csrfToken);
    });
});

// Close contact modal
contactModal.querySelector('.close-modal').addEventListener('click', () => {
    contactModal.classList.remove('active');
    document.body.style.overflow = '';
    contactForm.reset();
    formMessage.textContent = '';
    formMessage.className = 'form-message';
});

// Close modal when clicking outside
contactModal.addEventListener('click', (e) => {
    if (e.target === contactModal) {
        contactModal.classList.remove('active');
        document.body.style.overflow = '';
        contactForm.reset();
        formMessage.textContent = '';
        formMessage.className = 'form-message';
    }
});

// Handle form submission
contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Show loading state
    buttonText.textContent = 'Sending...';
    buttonLoader.classList.remove('hidden');
    submitButton.disabled = true;
    
    try {
        const formData = new FormData(contactForm);
        
        const response = await fetch('/api/contact.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            formMessage.textContent = 'Message sent successfully!';
            formMessage.className = 'form-message success';
            contactForm.reset();
            setTimeout(() => {
                contactModal.classList.remove('active');
                document.body.style.overflow = '';
                formMessage.textContent = '';
                formMessage.className = 'form-message';
            }, 2000);
        } else {
            throw new Error(result.message || 'Failed to send message');
        }
    } catch (error) {
        formMessage.textContent = error.message;
        formMessage.className = 'form-message error';
    } finally {
        buttonText.textContent = 'Send Message';
        buttonLoader.classList.add('hidden');
        submitButton.disabled = false;
    }
});

// Animate hero section
const heroText = document.querySelector('.statement-text h1');
if (heroText) {
    const words = heroText.innerHTML.split(' ').map(word => `<span class="word">${word}</span>`).join(' ');
    heroText.innerHTML = words;
    
    const wordSpans = heroText.querySelectorAll('.word');
    wordSpans.forEach((word, index) => {
        word.style.animationDelay = `${index * 0.1}s`;
    });
}

// Animate stats
const stats = document.querySelectorAll('.stat');
observeElements(stats, stat => {
    stat.style.opacity = '1';
    stat.style.transform = 'translateY(0)';
});

// Animate project cards
const projectCards = document.querySelectorAll('.project-card');
observeElements(projectCards, card => {
    card.style.opacity = '1';
    card.style.transform = 'translateY(0)';
});

// Modal functionality
const modal = document.getElementById('websitePreviewModal');
const modalIframe = modal.querySelector('iframe');
const visitSiteBtn = modal.querySelector('.visit-site-btn');
const closeModalBtn = modal.querySelector('.close-modal');

function openModal(url) {
    modalIframe.src = url;
    visitSiteBtn.href = url;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.classList.remove('active');
    setTimeout(() => {
        modalIframe.src = '';
    }, 300);
    document.body.style.overflow = '';
}

// Add click handlers to project cards
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', () => {
        const url = card.dataset.url;
        openModal(url);
    });
});

// Close modal when clicking close button or outside
closeModalBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Close modal with escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});

// Mouse move effect on project cards
projectCards.forEach(card => {
    const image = card.querySelector('.project-image');
    const overlay = card.querySelector('.project-overlay');

    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const xPercent = (x / rect.width - 0.5) * 20;
        const yPercent = (y / rect.height - 0.5) * 20;
        
        image.style.transform = `perspective(1000px) rotateX(${-yPercent}deg) rotateY(${xPercent}deg) scale3d(1.05, 1.05, 1.05)`;
        
        // Parallax effect for overlay
        const overlayX = (x / rect.width - 0.5) * 10;
        const overlayY = (y / rect.height - 0.5) * 10;
        overlay.style.transform = `translate(${overlayX}px, ${overlayY}px)`;
    });
    
    card.addEventListener('mouseleave', () => {
        image.style.transform = 'none';
        overlay.style.transform = 'none';
    });
});

// Infinite scroll effect
const scrollContents = document.querySelectorAll('.scroll-content');
scrollContents.forEach(content => {
    content.addEventListener('animationend', () => {
        content.style.animation = 'none';
        void content.offsetWidth; // Trigger reflow
        content.style.animation = 'scroll 30s linear infinite';
    });
});

// Pause infinite scroll on hover
const scrollWrapper = document.querySelector('.scroll-wrapper');
if (scrollWrapper) {
    scrollWrapper.addEventListener('mouseenter', () => {
        scrollContents.forEach(content => {
            content.style.animationPlayState = 'paused';
        });
    });

    scrollWrapper.addEventListener('mouseleave', () => {
        scrollContents.forEach(content => {
            content.style.animationPlayState = 'running';
        });
    });
}

// Animate statistics when in view
const animateStats = () => {
    const stats = document.querySelectorAll('.stat-number');
    stats.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-value'));
        const duration = 2000; // 2 seconds
        const start = parseInt(stat.textContent);
        const increment = (target - start) / (duration / 16); // 60fps

        let current = start;
        const animate = () => {
            current += increment;
            if (current <= target) {
                stat.textContent = Math.round(current);
                requestAnimationFrame(animate);
            } else {
                stat.textContent = target;
            }
        };
        animate();
    });
};

// Observe stats section
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateStats();
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const statsSection = document.querySelector('.statement-stats');
if (statsSection) {
    statsObserver.observe(statsSection);
}

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 100,
                behavior: 'smooth'
            });
        }
    });
});

// Header scroll effect
const header = document.querySelector('.header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        header.classList.remove('scroll-up');
        return;
    }
    
    if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
        header.classList.remove('scroll-up');
        header.classList.add('scroll-down');
    } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
        header.classList.remove('scroll-down');
        header.classList.add('scroll-up');
    }
    
    lastScroll = currentScroll;
});
        }
    });
});

// Add custom cursor styles
const style = document.createElement('style');
style.textContent = `
    .custom-cursor {
        width: 20px;
        height: 20px;
        background: rgba(0, 255, 149, 0.2);
        border: 2px solid var(--accent);
        border-radius: 50%;
        position: fixed;
        pointer-events: none;
        z-index: 9999;
        transition: transform 0.15s ease-out, background-color 0.3s ease-out;
        transform: translate(-50%, -50%);
    }

    .cursor-hover {
        transform: translate(-50%, -50%) scale(1.5);
        background: rgba(0, 255, 149, 0.3);
    }

    body {
        cursor: none;
    }

    a, .website-item, .tag {
        cursor: none;
    }
`;

document.head.appendChild(style);

// Add hover effect to website items with tilt
document.querySelectorAll('.website-item').forEach(item => {
    item.addEventListener('mousemove', (e) => {
        const rect = item.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const xPercent = (x / rect.width - 0.5) * 2;
        const yPercent = (y / rect.height - 0.5) * 2;
        
        const rotateX = yPercent * 4;
        const rotateY = -xPercent * 4;
        
        item.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
    });

    item.addEventListener('mouseleave', () => {
        item.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
    });
});

// Add smooth reveal animation on scroll
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

websiteItems.forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(40px)';
    item.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(item);
});

