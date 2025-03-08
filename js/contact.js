// reCAPTCHA callback
function onRecaptchaComplete(token) {
    document.querySelector('.submit-button').disabled = false;
}

// Show notification function
function showNotification(message, isError = false) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.toggle('error', isError);
    notification.classList.add('show');
    
    // Hide notification after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

document.addEventListener('DOMContentLoaded', async function() {
    // Fetch CSRF token
    try {
        const response = await fetch('/api/contact.php');
        const csrfToken = await response.text();
        document.getElementById('csrf_token').value = csrfToken;
    } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
    }
    // Handle package selection
    const packageButtons = document.querySelectorAll('.select-package');
    const budgetSelect = document.getElementById('budget');
    
    packageButtons.forEach(button => {
        button.addEventListener('click', function() {
            const packageValue = this.dataset.package;
            budgetSelect.value = packageValue;
            
            // Smooth scroll to form
            document.querySelector('.contact-form').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    });

    // Form validation and submission
    const contactForm = document.getElementById('contactForm');
    
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Basic validation
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();
        
        if (!name || !email || !message) {
            showNotification('Please fill in all required fields', true);
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('Please enter a valid email address', true);
            return;
        }
        
        const button = contactForm.querySelector('.submit-button');
        const recaptchaResponse = grecaptcha.getResponse();
        
        if (!recaptchaResponse) {
            showNotification('Please complete the reCAPTCHA verification', true);
            return;
        }
        
        // Show loading state
        button.classList.add('loading');
        button.disabled = true;
        
        try {
            const formData = new FormData(contactForm);
            formData.append('g-recaptcha-response', recaptchaResponse);
            

            
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                contactForm.reset();
                grecaptcha.reset();
                button.disabled = true; // Keep disabled until reCAPTCHA is completed again
                showNotification('Thank you, we shall be in contact soon');
            } else {
                throw new Error(result.message || 'Something went wrong. Please try again.');
            }
        } catch (error) {
            const errorMessage = error.message || 'Failed to send message. Please try again later.';
            alert(errorMessage);
            console.error('Form submission error:', error);
        } finally {
            // Reset button state
            button.classList.remove('loading');
            button.disabled = true; // Keep disabled until reCAPTCHA is completed again
        }
    });
});
