// reCAPTCHA callback
function onRecaptchaComplete(token) {
    document.querySelector('.submit-button').disabled = false;
}

document.addEventListener('DOMContentLoaded', function() {
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
            alert('Please fill in all required fields');
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address');
            return;
        }
        
        const button = contactForm.querySelector('.submit-button');
        const recaptchaResponse = grecaptcha.getResponse();
        
        if (!recaptchaResponse) {
            alert('Please complete the reCAPTCHA verification');
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
                alert('Thank you for your message! We\'ll get back to you soon.');
            } else {
                throw new Error(result.message || 'Something went wrong. Please try again.');
            }
        } catch (error) {
            alert(error.message);
        } finally {
            // Reset button state
            button.classList.remove('loading');
            button.disabled = true; // Keep disabled until reCAPTCHA is completed again
        }
    });
});
