document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('leadForm');
  const submitBtn = document.getElementById('submitBtn');

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      targetElement.scrollIntoView({
        behavior: 'smooth'
      });
      
      // If the target is the form and fields are empty, highlight it
      if (targetId === '#apply') {
        const nameVal = document.getElementById('name').value;
        const phoneVal = document.getElementById('phone').value;
        const loanTypeVal = document.getElementById('loanType').value;
        
        if (!nameVal || !phoneVal || !loanTypeVal) {
          const formContainer = document.querySelector('.hero-form');
          formContainer.classList.add('highlight-form');
          
          // Focus the first empty input
          if (!nameVal) {
            document.getElementById('name').focus({ preventScroll: true });
          } else if (!phoneVal) {
            document.getElementById('phone').focus({ preventScroll: true });
          } else {
            document.getElementById('loanType').focus({ preventScroll: true });
          }
          
          // Remove highlight after animation
          setTimeout(() => {
            formContainer.classList.remove('highlight-form');
          }, 2000); 
        }
      }
    });
  });

  if(form) {
    // Form submission handler
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Animate button
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking Eligibility...';
      submitBtn.style.opacity = '0.8';

      // Simulate API call/processing
      setTimeout(() => {
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Redirecting to WhatsApp...';
        submitBtn.style.backgroundColor = '#25d366';
        submitBtn.style.color = 'white';
        
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const loanType = document.getElementById('loanType').value;
        
        // --- Conversion Tracking ---
        // Fire Facebook Pixel Lead Event
        if (typeof fbq === 'function') {
          fbq('track', 'Lead', {
            content_name: loanType + ' Loan Inquiry',
            event_source: 'Form Submission'
          });
        }
        
        // Prepare WhatsApp redirect (Target Num: 9363777659)
        const message = `Hi! I want to check eligibility for a ${loanType} loan. My name is ${name} and my number is ${phone}.`;
        const waLink = `https://wa.me/919363777659?text=${encodeURIComponent(message)}`;
        
        // Store the waLink so thank-you page can use it
        localStorage.setItem('waLink', waLink);
        
        // Reset form and redirect to thank-you page after a short delay
        setTimeout(() => {
          form.reset();
          submitBtn.innerHTML = originalText;
          submitBtn.style.backgroundColor = '';
          submitBtn.style.color = '';
          
          window.location.href = 'thank-you.html';
        }, 1500);
        
      }, 1500);
    });
  }

  // --- Track Clicks on All Other WhatsApp/Apply Buttons ---
  const otherCtaButtons = document.querySelectorAll('.cta-button, .primary-btn:not(#submitBtn), .whatsapp-float, .final-cta a');
  otherCtaButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (typeof fbq === 'function') {
        fbq('track', 'Lead', {
          event_source: 'Direct Click / WhatsApp Float'
        });
      }
    });
  });
});
