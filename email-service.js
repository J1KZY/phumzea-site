// Email Service for PHUMZEA Bug Reports
// Using EmailJS for client-side email sending

const EMAIL_CONFIG = {
    SERVICE_ID: 'service_phumzea', // Replace with your EmailJS service ID
    TEMPLATE_ID: 'template_bug_report', // Replace with your EmailJS template ID
    PUBLIC_KEY: 'YOUR_PUBLIC_KEY' // Replace with your EmailJS public key
};

class EmailService {
    constructor() {
        this.init();
    }

    init() {
        // Initialize EmailJS
        if (typeof emailjs !== 'undefined') {
            emailjs.init(EMAIL_CONFIG.PUBLIC_KEY);
        }
    }

    async sendBugReport(bugData) {
        try {
            const templateParams = {
                to_email: 'jakzyjm@gmail.com',
                username: bugData.username,
                bug_type: bugData.bugType,
                description: bugData.description,
                timestamp: new Date().toLocaleString(),
                attachments: bugData.attachments || []
            };

            // Send email via EmailJS
            const response = await emailjs.send(
                EMAIL_CONFIG.SERVICE_ID,
                EMAIL_CONFIG.TEMPLATE_ID,
                templateParams
            );

            return { success: true, response };
        } catch (error) {
            console.error('Email sending failed:', error);
            return { success: false, error };
        }
    }

    async sendWithAttachments(bugData, files) {
        try {
            // Convert files to base64 for EmailJS
            const attachments = await this.processFiles(files);
            
            const templateParams = {
                to_email: 'jakzyjm@gmail.com',
                username: bugData.username,
                bug_type: bugData.bugType,
                description: bugData.description,
                timestamp: new Date().toLocaleString(),
                has_attachments: attachments.length > 0,
                attachment_count: attachments.length
            };

            // Add first attachment as base64 (EmailJS limitation)
            if (attachments.length > 0) {
                templateParams.attachment1 = attachments[0].data;
                templateParams.attachment1_name = attachments[0].name;
            }

            const response = await emailjs.send(
                EMAIL_CONFIG.SERVICE_ID,
                EMAIL_CONFIG.TEMPLATE_ID,
                templateParams
            );

            return { success: true, response, attachments };
        } catch (error) {
            console.error('Email with attachments failed:', error);
            return { success: false, error };
        }
    }

    async processFiles(files) {
        const attachments = [];
        
        for (let file of files) {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                console.warn(`File ${file.name} is too large, skipping`);
                continue;
            }

            const base64 = await this.fileToBase64(file);
            attachments.push({
                name: file.name,
                type: file.type,
                size: file.size,
                data: base64
            });
        }
        
        return attachments;
    }

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    validateFiles(files) {
        const errors = [];
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime', 'video/webm'];

        files.forEach(file => {
            if (!allowedTypes.includes(file.type)) {
                errors.push(`${file.name}: Invalid file type`);
            }
            if (file.size > maxSize) {
                errors.push(`${file.name}: File too large (max 10MB)`);
            }
        });

        return errors;
    }
}

// Initialize email service
const emailService = new EmailService();
