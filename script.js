// API Base URL - adjust for production
const API_BASE = 'https://content-writer-backend.onrender.com/api';

// Load data on page load
document.addEventListener('DOMContentLoaded', function() {
    loadServices();
    loadPortfolio();
    loadTestimonials();
    loadSettings();
    setupContactForm();
    setupNavigation();
    setupPortfolioModal();
});

// Navigation smooth scrolling
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// Load Services
async function loadServices() {
    try {
        const response = await fetch(`${API_BASE}/services`);
        const services = await response.json();
        const servicesList = document.getElementById('services-list');
        servicesList.innerHTML = services.map(service => `
            <div class="service-item">
                <img src="${service.icon ? `${API_BASE.replace('/api', '')}${service.icon}` : 'https://via.placeholder.com/80'}" alt="${service.title}">
                <h3>${service.title}</h3>
                <p>${service.description}</p>
                ${service.price ? `<p class="service-price">Starting at $${service.price}</p>` : ''}
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading services:', error);
    }
}

// Load Portfolio
async function loadPortfolio() {
    try {
        const response = await fetch(`${API_BASE}/projects`);
        const projects = await response.json();
        const portfolioList = document.getElementById('portfolio-list');
        portfolioList.innerHTML = projects.map(project => `
            <div class="portfolio-item" onclick="openPortfolioModal('${project._id}')">
                <img src="${project.image ? `${API_BASE.replace('/api', '')}${project.image}` : ''}" alt="${project.title}">
                <h3>${project.title}</h3>
                <p>${project.tagline}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading portfolio:', error);
    }
}

// Load Testimonials
async function loadTestimonials() {
    try {
        const response = await fetch(`${API_BASE}/testimonials`);
        const testimonials = await response.json();
        const testimonialsList = document.getElementById('testimonials-list');
        testimonialsList.innerHTML = testimonials.map(testimonial => `
            <div class="testimonial-item">
                ${testimonial.photo ? `<img src="${testimonial.photo ? `${API_BASE.replace('/api', '')}${testimonial.photo}` : ''}" alt="${testimonial.name}">` : ''}
                <blockquote>"${testimonial.text}"</blockquote>
                <cite>${testimonial.name}, ${testimonial.company}</cite>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading testimonials:', error);
    }
}

// Load Settings
async function loadSettings() {
    try {
        const response = await fetch(`${API_BASE}/settings`);
        const settings = await response.json();
        if (settings) {
            document.querySelector('.logo').textContent = settings.businessName || 'WriterName';
            document.getElementById('about-image').src = settings.aboutImage ? `${API_BASE.replace('/api', '')}${settings.aboutImage}` : '';
            document.getElementById('about-bio').textContent = settings.aboutBio || 'Bio will be loaded dynamically.';
            document.getElementById('contact-email').textContent = `Email: ${settings.contactEmail || 'loading...'}`;
            document.getElementById('contact-scheduler').href = settings.schedulerLink || '#';
            document.getElementById('social-facebook').href = settings.socialFacebook || '#';
            document.getElementById('social-twitter').href = settings.socialTwitter || '#';
            document.getElementById('social-linkedin').href = settings.socialLinkedin || '#';
            document.getElementById('social-instagram').href = settings.socialInstagram || '#';
            document.querySelector('.hero .cta-button').textContent = settings.ctaText || 'View My Work';
            document.querySelector('.hero .cta-button').href = settings.ctaLink || '#portfolio';
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Setup Contact Form
function setupContactForm() {
    const form = document.getElementById('contact-form');
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        try {
            const response = await fetch(`${API_BASE}/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (response.ok) {
                alert('Message sent successfully!');
                form.reset();
            } else {
                alert('Error sending message. Please try again.');
            }
        } catch (error) {
            console.error('Error sending contact form:', error);
            alert('Error sending message. Please try again.');
        }
    });
}

// Portfolio Modal
function setupPortfolioModal() {
    const modal = document.getElementById('portfolio-modal');
    const closeBtn = modal.querySelector('.close');
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

async function openPortfolioModal(projectId) {
    try {
        const response = await fetch(`${API_BASE}/projects/${projectId}`);
        const project = await response.json();
        document.getElementById('modal-title').textContent = project.title;
        document.getElementById('modal-image').src = project.image ? `${API_BASE.replace('/api', '')}${project.image}` : '';
        document.getElementById('modal-description').innerHTML = project.description;
        document.getElementById('portfolio-modal').style.display = 'block';
    } catch (error) {
        console.error('Error loading project details:', error);
    }
}
