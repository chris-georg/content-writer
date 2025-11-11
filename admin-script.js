// API Base URL - adjust for production
const API_BASE = 'https://content-writer-backend.onrender.com/api';
let currentSection = 'overview';
let authToken = localStorage.getItem('authToken');

// Check if logged in on load
document.addEventListener('DOMContentLoaded', function() {
    if (authToken) {
        showDashboard();
        loadOverview();
    } else {
        showLogin();
    }
    setupNavigation();
    setupModals();
    setupForms();
});

// Navigation
function setupNavigation() {
    const sidebarLinks = document.querySelectorAll('.sidebar a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('href').substring(1);
            showSection(section);
        });
    });
}

// Show/Hide sections
function showSection(section) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.sidebar a').forEach(a => a.classList.remove('active'));
    
    document.getElementById(`${section}-section`).classList.add('active');
    document.querySelector(`.sidebar a[href="#${section}"]`).classList.add('active');
    
    currentSection = section;
    
    // Load data for the section
    switch(section) {
        case 'overview':
            loadOverview();
            break;
        case 'services':
            loadServices();
            break;
        case 'portfolio':
            loadPortfolio();
            break;
        case 'testimonials':
            loadTestimonials();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

// Login
function showLogin() {
    document.getElementById('login-container').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
}

function showDashboard() {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('dashboard').style.display = 'flex';
}

document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch(`${API_BASE}/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });
        
        if (response.ok) {
            const data = await response.json();
            authToken = data.token;
            localStorage.setItem('authToken', authToken);
            showDashboard();
            loadOverview();
        } else {
            document.getElementById('login-message').textContent = 'Invalid credentials';
        }
    } catch (error) {
        console.error('Login error:', error);
        document.getElementById('login-message').textContent = 'Login failed';
    }
});

// Logout
document.getElementById('logout-btn').addEventListener('click', function() {
    authToken = null;
    localStorage.removeItem('authToken');
    showLogin();
});

// Load Overview
async function loadOverview() {
    try {
        const [servicesRes, portfolioRes, testimonialsRes] = await Promise.all([
            fetch(`${API_BASE}/services`),
            fetch(`${API_BASE}/projects`),
            fetch(`${API_BASE}/testimonials`)
        ]);
        
        const services = await servicesRes.json();
        const portfolio = await portfolioRes.json();
        const testimonials = await testimonialsRes.json();
        
        document.getElementById('services-count').textContent = services.length;
        document.getElementById('portfolio-count').textContent = portfolio.length;
        document.getElementById('testimonials-count').textContent = testimonials.length;
        
        // Load activity log (simplified - in real app, this would come from a separate endpoint)
        const activityLog = document.getElementById('activity-log');
        activityLog.innerHTML = '<li>Dashboard loaded</li>';
    } catch (error) {
        console.error('Error loading overview:', error);
    }
}

// Load Services
async function loadServices() {
    try {
        const response = await fetch(`${API_BASE}/services`);
        const services = await response.json();
        const servicesList = document.getElementById('services-list');
        servicesList.innerHTML = services.map(service => `
            <div class="item-card">
                <h4>${service.title}</h4>
                <p>${service.description.substring(0, 100)}...</p>
                <div class="item-actions">
                    <button class="btn btn-secondary" onclick="editService('${service._id}')">Edit</button>
                    <button class="btn btn-danger" onclick="deleteService('${service._id}')">Delete</button>
                </div>
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
            <div class="item-card">
                <h4>${project.title}</h4>
                <p>${project.tagline}</p>
                <div class="item-actions">
                    <button class="btn btn-secondary" onclick="editPortfolio('${project._id}')">Edit</button>
                    <button class="btn btn-danger" onclick="deletePortfolio('${project._id}')">Delete</button>
                </div>
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
            <div class="item-card">
                <h4>${testimonial.name}</h4>
                <p>"${testimonial.text.substring(0, 100)}..."</p>
                <div class="item-actions">
                    <button class="btn btn-secondary" onclick="editTestimonial('${testimonial._id}')">Edit</button>
                    <button class="btn btn-danger" onclick="deleteTestimonial('${testimonial._id}')">Delete</button>
                </div>
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
        if (settings.length > 0) {
            const setting = settings[0];
            document.getElementById('business-name').value = setting.businessName || '';
            document.getElementById('contact-email').value = setting.contactEmail || '';
            document.getElementById('phone').value = setting.phone || '';
            document.getElementById('location').value = setting.location || '';
            document.getElementById('scheduler-link').value = setting.schedulerLink || '';
            document.getElementById('cta-text').value = setting.ctaText || '';
            document.getElementById('cta-link').value = setting.ctaLink || '';
            document.getElementById('about-bio').value = setting.aboutBio || '';
            document.getElementById('about-image').value = setting.aboutImage || '';
            document.getElementById('social-facebook').value = setting.socialFacebook || '';
            document.getElementById('social-twitter').value = setting.socialTwitter || '';
            document.getElementById('social-linkedin').value = setting.socialLinkedin || '';
            document.getElementById('social-instagram').value = setting.socialInstagram || '';
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Setup Forms
function setupForms() {
    // Settings form
    document.getElementById('settings-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const data = {
            businessName: document.getElementById('business-name').value,
            contactEmail: document.getElementById('contact-email').value,
            phone: document.getElementById('phone').value,
            location: document.getElementById('location').value,
            schedulerLink: document.getElementById('scheduler-link').value,
            ctaText: document.getElementById('cta-text').value,
            ctaLink: document.getElementById('cta-link').value,
            aboutBio: document.getElementById('about-bio').value,
            aboutImage: document.getElementById('about-image').value,
            socialFacebook: document.getElementById('social-facebook').value,
            socialTwitter: document.getElementById('social-twitter').value,
            socialLinkedin: document.getElementById('social-linkedin').value,
            socialInstagram: document.getElementById('social-instagram').value,
        };
        
        try {
            const response = await fetch(`${API_BASE}/settings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify(data),
            });
            
            if (response.ok) {
                alert('Settings saved successfully!');
            } else {
                alert('Error saving settings');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    });

    // Create admin form
    document.getElementById('create-admin-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const username = document.getElementById('new-username').value;
        const password = document.getElementById('new-password').value;
        
        try {
            const response = await fetch(`${API_BASE}/admin/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({ username, password }),
            });
            
            if (response.ok) {
                alert('Admin created successfully!');
                this.reset();
            } else {
                alert('Error creating admin');
            }
        } catch (error) {
            console.error('Error creating admin:', error);
        }
    });
}

// Setup Modals
function setupModals() {
    // Service modal
    document.getElementById('add-service-btn').addEventListener('click', () => {
        document.getElementById('service-modal-title').textContent = 'Add Service';
        document.getElementById('service-form').reset();
        document.getElementById('service-modal').style.display = 'block';
    });

    // Portfolio modal
    document.getElementById('add-portfolio-btn').addEventListener('click', () => {
        document.getElementById('portfolio-modal-title').textContent = 'Add Portfolio Item';
        document.getElementById('portfolio-form').reset();
        document.getElementById('portfolio-modal').style.display = 'block';
    });

    // Testimonial modal
    document.getElementById('add-testimonial-btn').addEventListener('click', () => {
        document.getElementById('testimonial-modal-title').textContent = 'Add Testimonial';
        document.getElementById('testimonial-form').reset();
        document.getElementById('testimonial-modal').style.display = 'block';
    });

    // Close modals
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            closeBtn.closest('.modal').style.display = 'none';
        });
    });

    // Service form
    document.getElementById('service-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const data = {
            title: document.getElementById('service-title').value,
            description: document.getElementById('service-description').value,
            icon: document.getElementById('service-icon').value,
            price: document.getElementById('service-price').value,
        };
        
        try {
            const response = await fetch(`${API_BASE}/services`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify(data),
            });
            
            if (response.ok) {
                alert('Service saved successfully!');
                document.getElementById('service-modal').style.display = 'none';
                loadServices();
            } else {
                alert('Error saving service');
            }
        } catch (error) {
            console.error('Error saving service:', error);
        }
    });

    // Portfolio form
    document.getElementById('portfolio-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', document.getElementById('portfolio-title').value);
        formData.append('client', document.getElementById('portfolio-client').value);
        formData.append('tagline', document.getElementById('portfolio-tagline').value);
        formData.append('description', document.getElementById('portfolio-description').value);
        const imageFile = document.getElementById('portfolio-image').files[0];
        if (imageFile) {
            formData.append('image', imageFile);
        }
        
        try {
            const response = await fetch(`${API_BASE}/projects`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
                body: formData,
            });
            
            if (response.ok) {
                alert('Portfolio item saved successfully!');
                document.getElementById('portfolio-modal').style.display = 'none';
                loadPortfolio();
            } else {
                alert('Error saving portfolio item');
            }
        } catch (error) {
            console.error('Error saving portfolio item:', error);
        }
    });

    // Testimonial form
    document.getElementById('testimonial-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', document.getElementById('testimonial-name').value);
        formData.append('company', document.getElementById('testimonial-company').value);
        formData.append('text', document.getElementById('testimonial-text').value);
        const photoFile = document.getElementById('testimonial-photo').files[0];
        if (photoFile) {
            formData.append('photo', photoFile);
        }
        
        try {
            const response = await fetch(`${API_BASE}/testimonials`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
                body: formData,
            });
            
            if (response.ok) {
                alert('Testimonial saved successfully!');
                document.getElementById('testimonial-modal').style.display = 'none';
                loadTestimonials();
            } else {
                alert('Error saving testimonial');
            }
        } catch (error) {
            console.error('Error saving testimonial:', error);
        }
    });
}

// Edit functions (simplified - would need to populate forms)
function editService(id) {
    alert('Edit service functionality would be implemented here');
}

function editPortfolio(id) {
    alert('Edit portfolio functionality would be implemented here');
}

function editTestimonial(id) {
    alert('Edit testimonial functionality would be implemented here');
}

// Delete functions
async function deleteService(id) {
    if (confirm('Are you sure you want to delete this service?')) {
        try {
            const response = await fetch(`${API_BASE}/services/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });
            
            if (response.ok) {
                loadServices();
            } else {
                alert('Error deleting service');
            }
        } catch (error) {
            console.error('Error deleting service:', error);
        }
    }
}

async function deletePortfolio(id) {
    if (confirm('Are you sure you want to delete this portfolio item?')) {
        try {
            const response = await fetch(`${API_BASE}/projects/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });
            
            if (response.ok) {
                loadPortfolio();
            } else {
                alert('Error deleting portfolio item');
            }
        } catch (error) {
            console.error('Error deleting portfolio item:', error);
        }
    }
}

async function deleteTestimonial(id) {
    if (confirm('Are you sure you want to delete this testimonial?')) {
        try {
            const response = await fetch(`${API_BASE}/testimonials/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });
            
            if (response.ok) {
                loadTestimonials();
            } else {
                alert('Error deleting testimonial');
            }
        } catch (error) {
            console.error('Error deleting testimonial:', error);
        }
    }
}
