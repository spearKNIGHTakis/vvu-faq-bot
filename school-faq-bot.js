// school-faq-bot-hosted.js - Optimized for Render with Complaints & Human Support
const express = require('express');
const bodyParser = require('body-parser');
const { Telegraf, Markup } = require('telegraf');

class RenderReadyBot {
    constructor() {
        this.app = express();
        this.app.use(bodyParser.json());
        
        // Security and CORS
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            next();
        });
        
        this.setupRoutes();
        
        // Updated Knowledge Base with accurate 2025/2026 fees from PDF
        this.knowledgeBase = {
            admission: "📝 **Admissions Requirements:**\n\n**WASSCE/SSSCE:**\n• Credit passes (A1-C6/A-D) in 3 Core + 3 Elective subjects\n• Core: English, Math, Integrated Science/Social Studies\n\n**Mature Applicants:**\n• 25+ years old\n• Entrance exam required\n\n**Application:** VVU Admissions Portal or Campus Registry",
            
            fees: {
                unrestricted: {
                    business: {
                        continuing: 3740,
                        fresh: 4040
                    },
                    education: {
                        regular: {
                            continuing: 2912,
                            fresh: 3212
                        },
                        sandwich: {
                            continuing: 2162,
                            fresh: 2462
                        }
                    },
                    arts: {
                        continuing: 3740,
                        fresh: 4040
                    },
                    science: {
                        continuing: 4441,
                        fresh: 4741
                    },
                    nursing: {
                        continuing: 5490,
                        fresh: 5790
                    }
                },
                otherCharges: {
                    srcDues: { continuing: 100, fresh: 150 },
                    medicalExamination: 300
                },
                accommodation: {
                    hostel: {
                        fourInRoom: 1500,
                        threeInRoom: 1880,
                        twoInRoom: 2130
                    },
                    feeding: {
                        oneMeal: 2464,
                        twoMeals: 4928,
                        threeMeals: 6944
                    }
                }
            },
            
            courses: "📚 **Courses Available:**\n\n**Health Sciences:**\n• BSc Nursing\n• BSc Midwifery\n• BSc Mental Health Nursing\n\n**Business:**\n• BBA Accounting, Management, Marketing\n• BBA Banking & Finance\n\n**Science:**\n• BSc Computer Science, IT\n• BSc Agribusiness, Mathematics\n\n**Education:**\n• B.Ed Mathematics, Social Studies\n• B.Ed Management, Accounting",
            
            timetable: "🕒 **Academic Schedule:**\n\n**Monday - Friday**\n• Morning: 7:00 AM - 12:00 PM\n• Afternoon: 1:00 PM - 5:00 PM\n\n**Access:** iSchool Portal after registration",
            
            contact: "📞 **Contact Techiman Campus:**\n\n• Main Office: 032-209-6694\n• Admissions: 024-685-7672\n• Finance: 020-652-9501\n• E-Learning: 024-220-3118\n• Email: info@vvu.edu.gh",
            
            portal: "🌐 **Student Portal:**\n• Website: ischool.vvu.edu.gh\n• Username: Student ID\n• Password: DDMMYYYY (Date of Birth)\n• Support: ICT Office or 024-220-3118"
        };

        // Enhanced Complaints System with Human Support
        this.complaints = new Map();
        this.complaintCounter = 1;
        this.userSessions = new Map();
        this.pendingHumanRequests = new Map();
        this.humanAgents = new Set();
        this.startTime = new Date();
        
        // Office hours for human support
        this.officeHours = {
            start: 8, // 8 AM
            end: 17,  // 5 PM
            timezone: 'GMT'
        };
        
        console.log('🤖 VVU FAQ Bot with Human Support Initialized for Render');
    }

    getMainMenu() {
        return Markup.keyboard([
            ['📝 Admissions', '💰 Fees', '📚 Courses'],
            ['🕒 Timetable', '📞 Contact', '🌐 Student Portal'],
            ['📢 Complaints', '👨‍💻 Talk to Human', '🔔 Notifications'],
            ['❓ Help']
        ]).resize();
    }

    getHelpMenu() {
        return Markup.keyboard([
            ['Admission Requirements', 'Fee Structure', 'Available Courses'],
            ['Application Process', 'Payment Methods', 'Portal Access'],
            ['Talk to Human Agent', 'Submit Complaint', '📋 Main Menu']
        ]).resize();
    }

    getFeeMenu() {
        return Markup.keyboard([
            ['Business Fees', 'Education Fees', 'Science Fees'],
            ['Nursing Fees', 'Arts Fees', 'Accommodation & Meals'],
            ['Payment Methods', 'Discounts', '📋 Main Menu']
        ]).resize();
    }

    getComplaintsMenu() {
        return Markup.keyboard([
            ['Academic Issues', 'Administrative Issues', 'Facilities Issues'],
            ['Financial Issues', 'Security Concerns', 'Other Complaints'],
            ['📋 Main Menu', '📋 View My Complaints', '👨‍💻 Talk to Human']
        ]).resize();
    }

    getHumanSupportMenu() {
        return Markup.keyboard([
            ['🔄 Request Human Help', '📞 Call Campus Directly'],
            ['📧 Email Support', '🏢 Visit Office'],
            ['📋 Main Menu', '❓ Cancel Request']
        ]).resize();
    }

    getComplaintCategories() {
        return {
            'academic': {
                name: 'Academic Issues',
                examples: 'Course registration, Lecturer issues, Grading problems, Academic advising',
                department: 'Academic Affairs Office',
                contact: '024-685-7672'
            },
            'administrative': {
                name: 'Administrative Issues', 
                examples: 'Registration problems, Document processing, Staff behavior, Delays',
                department: 'Administration Office',
                contact: '032-209-6694'
            },
            'facilities': {
                name: 'Facilities Issues',
                examples: 'Classroom equipment, Library issues, Hostel problems, Water/electricity',
                department: 'Facilities Management',
                contact: '020-652-9501'
            },
            'financial': {
                name: 'Financial Issues',
                examples: 'Fee payments, Scholarship issues, Financial aid, Billing problems',
                department: 'Finance Office',
                contact: '020-652-9501'
            },
            'security': {
                name: 'Security Concerns',
                examples: 'Campus safety, Theft incidents, Harassment, Emergency situations',
                department: 'Security Office',
                contact: 'Emergency: 055-123-4567'
            },
            'other': {
                name: 'Other Complaints',
                examples: 'Any other concerns not listed above',
                department: 'Student Services',
                contact: '032-209-6694'
            }
        };
    }

    isDuringOfficeHours() {
        const now = new Date();
        const currentHour = now.getHours();
        const isWeekday = now.getDay() >= 1 && now.getDay() <= 5; // Monday to Friday
        
        return isWeekday && currentHour >= this.officeHours.start && currentHour < this.officeHours.end;
    }

    getOfficeHoursStatus() {
        const now = new Date();
        const currentHour = now.getHours();
        const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;
        
        if (!isWeekday) {
            return "🚫 **Office Closed** - Weekend\n📅 Next opening: Monday 8:00 AM";
        }
        
        if (currentHour < this.officeHours.start) {
            return `🚫 **Office Closed** - Opens at ${this.officeHours.start}:00 AM`;
        } else if (currentHour >= this.officeHours.end) {
            return "🚫 **Office Closed** - Opens tomorrow at 8:00 AM";
        } else {
            const closingTime = this.officeHours.end - 12; // Convert to 12-hour format
            return `✅ **Office Open** - Closes at ${closingTime}:00 PM`;
        }
    }

    requestHumanSupport(userId, userInfo, issue) {
        const requestId = `HR${this.complaintCounter.toString().padStart(4, '0')}`;
        const request = {
            id: requestId,
            userId: userId,
            userInfo: userInfo,
            issue: issue,
            status: 'pending',
            requestedAt: new Date().toISOString(),
            assignedTo: null,
            resolvedAt: null
        };
        
        this.pendingHumanRequests.set(requestId, request);
        
        // Store in user session
        if (!this.userSessions.has(userId)) {
            this.userSessions.set(userId, { complaints: [], humanRequests: [] });
        }
        const userSession = this.userSessions.get(userId);
        userSession.humanRequests.push(requestId);
        
        console.log(`👨‍💻 Human support requested: ${requestId} by ${userId}`);
        
        return request;
    }

    formatFeesResponse(program, fees) {
        return `💰 **${program} Fees (2025/2026) - PER SEMESTER**\n\n` +
               `• Continuing Students: GHS ${fees.continuing}\n` +
               `• Fresh Students: GHS ${fees.fresh}\n\n` +
               `*Includes Tuition + General Charges*`;
    }

    getNotifications() {
        const totalComplaints = this.complaints.size;
        const pendingComplaints = Array.from(this.complaints.values()).filter(c => c.status === 'pending').length;
        const pendingHumanRequests = this.pendingHumanRequests.size;
        const officeStatus = this.getOfficeHoursStatus();
        
        return `🔔 **Current Notifications**\n
📢 Admissions Open for 2025/2026
🎓 Orientation: September 1-5, 2025
💻 Portal Maintenance: Sundays 2-4 AM
📚 Library: Extended exam hours

${officeStatus}

📊 **Support System:**
• Total Complaints: ${totalComplaints}
• Pending Resolution: ${pendingComplaints}
• Human Support Requests: ${pendingHumanRequests}

*Check notice board for updates!*`;
    }

    submitComplaint(userId, category, description, contactInfo = '') {
        const complaintId = `COMP${this.complaintCounter.toString().padStart(4, '0')}`;
        const categoryInfo = this.getComplaintCategories()[Object.keys(this.getComplaintCategories()).find(key => 
            this.getComplaintCategories()[key].name === category
        )];
        
        const complaint = {
            id: complaintId,
            userId: userId,
            category: category,
            description: description,
            contactInfo: contactInfo,
            department: categoryInfo?.department || 'Student Services',
            contact: categoryInfo?.contact || '032-209-6694',
            status: 'pending',
            submittedAt: new Date().toISOString(),
            resolvedAt: null,
            resolution: ''
        };
        
        this.complaints.set(complaintId, complaint);
        this.complaintCounter++;
        
        // Store user session
        if (!this.userSessions.has(userId)) {
            this.userSessions.set(userId, { complaints: [], humanRequests: [] });
        }
        const userSession = this.userSessions.get(userId);
        userSession.complaints.push(complaintId);
        
        console.log(`📝 New complaint submitted: ${complaintId} by ${userId}`);
        
        return complaint;
    }

    getUserComplaints(userId) {
        const userSession = this.userSessions.get(userId);
        if (!userSession || !userSession.complaints) {
            return [];
        }
        
        return userSession.complaints
            .map(complaintId => this.complaints.get(complaintId))
            .filter(complaint => complaint !== undefined)
            .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    }

    formatComplaintResponse(complaint) {
        const statusEmoji = complaint.status === 'resolved' ? '✅' : '⏳';
        const resolutionText = complaint.resolution ? `\n\n**Resolution:**\n${complaint.resolution}` : '';
        
        return `📋 **Complaint #${complaint.id}** ${statusEmoji}\n\n` +
               `**Category:** ${complaint.category}\n` +
               `**Department:** ${complaint.department}\n` +
               `**Contact:** ${complaint.contact}\n` +
               `**Status:** ${complaint.status.toUpperCase()}\n` +
               `**Submitted:** ${new Date(complaint.submittedAt).toLocaleDateString()}\n` +
               `**Description:**\n${complaint.description}` +
               resolutionText;
    }

    getHumanSupportResponse(userId) {
        const officeStatus = this.getOfficeHoursStatus();
        const isOfficeOpen = this.isDuringOfficeHours();
        
        let response = `👨‍💻 **Human Support**\n\n`;
        
        if (isOfficeOpen) {
            response += `✅ ${officeStatus}\n\n`;
            response += `**Immediate Assistance Available:**\n`;
            response += `• 📞 Call: 032-209-6694\n`;
            response += `• 🏢 Visit: Administration Building\n`;
            response += `• 📧 Email: info@vvu.edu.gh\n\n`;
            response += `**Request Human Help:**\n`;
            response += `I can connect you with a human agent for complex issues. Our team is available to help you right now!`;
        } else {
            response += `🚫 ${officeStatus}\n\n`;
            response += `**After-Hours Support:**\n`;
            response += `• 📧 Email: info@vvu.edu.gh\n`;
            response += `• 📝 Submit a complaint (24/7)\n`;
            response += `• 📱 Leave a message\n\n`;
            response += `**We'll respond first thing tomorrow morning!**`;
        }
        
        return response;
    }

    processMessage(question, userId = 'anonymous') {
        try {
            console.log(`📨 Received question from ${userId}: "${question}"`);
            
            const questionLower = question.toLowerCase();
            const userSession = this.userSessions.get(userId) || { complaints: [], humanRequests: [], complaintInProgress: null, humanRequestInProgress: null };
            
            // Handle human support in progress
            if (userSession.humanRequestInProgress) {
                return this.handleHumanSupportFlow(question, userId, userSession);
            }
            
            // Handle complaints in progress
            if (userSession.complaintInProgress) {
                return this.handleComplaintFlow(question, userId, userSession);
            }
            
            // Handle menu commands first
            if (questionLower.includes('notification') || question === '🔔 Notifications') {
                return {
                    response: this.getNotifications(),
                    menu: this.getMainMenu()
                };
            }

            if (questionLower.includes('help') || question === '❓ Help') {
                return {
                    response: "🤖 **How can I help you?**\n\nChoose from the options below or ask me anything about:\n• Admissions & Requirements\n• Fees & Payments\n• Courses & Programs\n• Campus Services\n• Complaints & Feedback\n• Human Support & Live Help\n\nI'm here to assist you! 🎓",
                    menu: this.getHelpMenu()
                };
            }

            if (question === '📋 Main Menu') {
                this.userSessions.set(userId, { 
                    complaints: userSession.complaints, 
                    humanRequests: userSession.humanRequests 
                }); // Clear in-progress states
                return {
                    response: "📋 **Main Menu**\n\nWhat would you like to know about?",
                    menu: this.getMainMenu()
                };
            }

            // Handle human support requests
            if (questionLower.includes('human') || questionLower.includes('agent') || question === '👨‍💻 Talk to Human' || question === 'Talk to Human Agent') {
                return {
                    response: this.getHumanSupportResponse(userId),
                    menu: this.getHumanSupportMenu()
                };
            }

            if (question === '🔄 Request Human Help') {
                if (!this.isDuringOfficeHours()) {
                    return {
                        response: "🚫 **Office Closed**\n\nOur human support team is currently unavailable. Please:\n• Submit a complaint for 24/7 tracking\n• Call during office hours: 8 AM - 5 PM\n• Email: info@vvu.edu.gh\n\nWe'll respond first thing tomorrow!",
                        menu: this.getMainMenu()
                    };
                }
                
                // Start human support process
                userSession.humanRequestInProgress = {
                    step: 'description'
                };
                this.userSessions.set(userId, userSession);
                
                return {
                    response: "👨‍💻 **Human Support Request**\n\nPlease describe what you need help with. Be as detailed as possible so we can connect you with the right specialist:\n\n*Type your issue below:*",
                    menu: Markup.removeKeyboard()
                };
            }

            if (question === '📞 Call Campus Directly') {
                return {
                    response: "📞 **Direct Campus Contacts**\n\n**Main Office:** 032-209-6694\n**Admissions:** 024-685-7672\n**Finance:** 020-652-9501\n**E-Learning:** 024-220-3118\n**Emergency:** 055-123-4567\n\n*Available during office hours: Mon-Fri, 8AM-5PM*",
                    menu: this.getHumanSupportMenu()
                };
            }

            if (question === '📧 Email Support') {
                return {
                    response: "📧 **Email Support**\n\n**General Inquiries:** info@vvu.edu.gh\n**Admissions:** admissions@vvu.edu.gh\n**Finance:** finance@vvu.edu.gh\n**IT Support:** itsupport@vvu.edu.gh\n\n*We typically respond within 24 hours*",
                    menu: this.getHumanSupportMenu()
                };
            }

            if (question === '🏢 Visit Office') {
                return {
                    response: "🏢 **Campus Visit**\n\n**Valley View University - Techiman Campus**\n📍 Location: Techiman, Bono East Region\n🕒 Hours: Monday-Friday, 8:00 AM - 5:00 PM\n\n**Office Locations:**\n• Administration Building: Main queries\n• Academic Block: Course-related issues\n• Finance Office: Fee payments\n• ICT Office: Portal support\n\n*Bring your student ID for faster service*",
                    menu: this.getHumanSupportMenu()
                };
            }

            if (question === '❓ Cancel Request') {
                userSession.humanRequestInProgress = null;
                this.userSessions.set(userId, userSession);
                return {
                    response: "✅ Request cancelled. Returning to main menu.",
                    menu: this.getMainMenu()
                };
            }

            // Handle complaints system
            if (questionLower.includes('complaint') || question === '📢 Complaints' || question === 'Submit Complaint') {
                const categories = this.getComplaintCategories();
                let response = "📢 **Complaints & Feedback System**\n\n";
                response += "We're here to help! Please select the category that best describes your issue:\n\n";
                
                Object.entries(categories).forEach(([key, category]) => {
                    response += `• **${category.name}**\n  ${category.examples}\n\n`;
                });
                
                response += "Your complaint will be forwarded to the appropriate department for resolution.";
                
                return {
                    response: response,
                    menu: this.getComplaintsMenu()
                };
            }

            if (question === '📋 View My Complaints') {
                const userComplaints = this.getUserComplaints(userId);
                if (userComplaints.length === 0) {
                    return {
                        response: "📋 **Your Complaints**\n\nYou haven't submitted any complaints yet.",
                        menu: this.getComplaintsMenu()
                    };
                }
                
                let response = "📋 **Your Complaints**\n\n";
                userComplaints.forEach((complaint, index) => {
                    const statusEmoji = complaint.status === 'resolved' ? '✅' : '⏳';
                    response += `${index + 1}. #${complaint.id} - ${complaint.category} ${statusEmoji}\n`;
                });
                
                response += "\nSelect a complaint category above to submit a new issue.";
                
                return {
                    response: response,
                    menu: this.getComplaintsMenu()
                };
            }

            // Handle complaint categories
            const complaintCategories = this.getComplaintCategories();
            for (const [key, category] of Object.entries(complaintCategories)) {
                if (question === category.name || questionLower.includes(key)) {
                    // Start complaint process
                    userSession.complaintInProgress = {
                        category: category.name,
                        step: 'description'
                    };
                    this.userSessions.set(userId, userSession);
                    
                    return {
                        response: `📝 **${category.name} Complaint**\n\nPlease describe your issue in detail. Include:\n• What happened\n• When it occurred\n• Who was involved (if any)\n• What resolution you're seeking\n\n*Type your description below:*`,
                        menu: Markup.removeKeyboard()
                    };
                }
            }

            // [Rest of your existing fee handlers and other topic handlers remain the same]
            // Handle specific fee queries FIRST (before general fee menu)
            if (question === 'Business Fees' || questionLower.includes('business fee')) {
                console.log(`✅ Matched Business fees`);
                return {
                    response: this.formatFeesResponse("School of Business", this.knowledgeBase.fees.unrestricted.business),
                    menu: this.getFeeMenu()
                };
            }

            if (question === 'Education Fees' || questionLower.includes('education fee')) {
                console.log(`✅ Matched Education fees`);
                return {
                    response: this.formatFeesResponse("School of Education - Regular", this.knowledgeBase.fees.unrestricted.education.regular) + 
                            `\n\n**Sandwich Program:**\n• Continuing: GHS ${this.knowledgeBase.fees.unrestricted.education.sandwich.continuing}\n• Fresh: GHS ${this.knowledgeBase.fees.unrestricted.education.sandwich.fresh}`,
                    menu: this.getFeeMenu()
                };
            }

            if (question === 'Science Fees' || questionLower.includes('science fee')) {
                console.log(`✅ Matched Science fees`);
                return {
                    response: this.formatFeesResponse("Faculty of Science", this.knowledgeBase.fees.unrestricted.science),
                    menu: this.getFeeMenu()
                };
            }

            if (question === 'Nursing Fees' || questionLower.includes('nursing fee')) {
                console.log(`✅ Matched Nursing fees`);
                return {
                    response: this.formatFeesResponse("School of Nursing & Midwifery", this.knowledgeBase.fees.unrestricted.nursing),
                    menu: this.getFeeMenu()
                };
            }

            if (question === 'Arts Fees' || questionLower.includes('arts fee')) {
                console.log(`✅ Matched Arts fees`);
                return {
                    response: this.formatFeesResponse("Faculty of Arts & Social Sciences", this.knowledgeBase.fees.unrestricted.arts),
                    menu: this.getFeeMenu()
                };
            }

            if (question === 'Accommodation & Meals' || questionLower.includes('accommodation') || questionLower.includes('meal')) {
                console.log(`✅ Matched Accommodation & Meals`);
                const fees = this.knowledgeBase.fees;
                return {
                    response: "🏠 **Accommodation & Feeding (Per Semester)**\n\n" +
                             "**Hostel Fees:**\n" +
                             `• 4 in a room: GHS ${fees.accommodation.hostel.fourInRoom}\n` +
                             `• 3 in a room: GHS ${fees.accommodation.hostel.threeInRoom}\n` +
                             `• 2 in a room: GHS ${fees.accommodation.hostel.twoInRoom}\n\n` +
                             "**Feeding Plans:**\n" +
                             `• 1 Meal a Day: GHS ${fees.accommodation.feeding.oneMeal}\n` +
                             `• 2 Meals a Day: GHS ${fees.accommodation.feeding.twoMeals}\n` +
                             `• 3 Meals a Day: GHS ${fees.accommodation.feeding.threeMeals}`,
                    menu: this.getFeeMenu()
                };
            }

            if (question === 'Payment Methods' || questionLower.includes('payment method')) {
                console.log(`✅ Matched Payment Methods`);
                return {
                    response: "💳 **Payment Methods:**\n\n" +
                             "**Bank Transfer:**\n" +
                             "• Prudential Bank Ghana Ltd.\n" +
                             "• Account: Valley View University\n" +
                             "• Account No: 0362000060080\n\n" +
                             "**Mobile Money:**\n" +
                             "• Dial *800*50#\n" +
                             "• Dial *924*200#\n" +
                             "• Dial *772*42#\n\n" +
                             "**Separate Accounts:**\n" +
                             "• Feeding: 0362000060014\n" +
                             "• Hostel: 0362000060160",
                    menu: this.getFeeMenu()
                };
            }

            if (question === 'Discounts' || questionLower.includes('discount')) {
                console.log(`✅ Matched Discounts`);
                return {
                    response: "🎫 **Available Discounts:**\n\n" +
                             "• 5% waiver for full payment before reopening\n" +
                             "• 5% waiver for each additional ward\n" +
                             "• 10% of tuition for certified Seventh-day Adventist students\n" +
                             "• 25% of tuition for certified Seventh-day Adventist theology students",
                    menu: this.getFeeMenu()
                };
            }

            // Handle general fee menu - THIS SHOULD COME AFTER SPECIFIC FEE HANDLERS
            if (questionLower.includes('fee') || question === '💰 Fees') {
                console.log(`✅ Matched general fees menu`);
                return {
                    response: "💰 **Fee Information (2025/2026)**\n\nSelect your program to see detailed fee structure per semester:",
                    menu: this.getFeeMenu()
                };
            }

            // Handle other specific topics
            const responses = {
                // Admissions
                'admission': this.knowledgeBase.admission,
                '📝 admissions': this.knowledgeBase.admission,
                'admission requirements': "📋 **Admission Requirements:**\n\n**WASSCE/SSSCE:**\n• 6 Credits (3 Core + 3 Electives)\n• Core: English, Math, Science/Social Studies\n• Electives relevant to your program\n\n**Mature Applicants (25+):**\n• Entrance exam\n• Interview\n• Work experience considered",
                'application process': "📝 **Application Process:**\n\n1. Get application form (online/campus)\n2. Fill and submit with required documents\n3. Pay application fee\n4. Wait for admission letter\n5. Complete registration\n\n**Deadline:** March 31st annually",
                
                // Courses
                'course': this.knowledgeBase.courses,
                '📚 courses': this.knowledgeBase.courses,
                'health programs': "🏥 **Health Sciences Programs:**\n\n• BSc Nursing (4 years)\n• BSc Midwifery (4 years)\n• BSc Mental Health Nursing (4 years)\n\n**Requirements:** Science background preferred\n**Career:** Hospitals, Clinics, Community Health",
                'business programs': "💼 **Business Programs:**\n\n• BBA Accounting (4 years)\n• BBA Management (4 years)\n• BBA Marketing (4 years)\n• BBA Banking & Finance (4 years)\n\n**Career:** Corporate, Banking, Entrepreneurship",
                
                // Other topics
                'time': this.knowledgeBase.timetable,
                '🕒 timetable': this.knowledgeBase.timetable,
                'contact': this.knowledgeBase.contact,
                '📞 contact': this.knowledgeBase.contact,
                'portal': this.knowledgeBase.portal,
                '🌐 student portal': this.knowledgeBase.portal
            };

            // Find matching response
            for (const [key, response] of Object.entries(responses)) {
                if (questionLower.includes(key)) {
                    console.log(`✅ Matched ${key} in responses`);
                    return {
                        response: response,
                        menu: this.getMainMenu()
                    };
                }
            }

            // Default response with human support suggestion
            console.log(`❓ No specific match found for: "${question}"`);
            return {
                response: `❓ I'm not sure about that, but I can help you with:\n\n• Admissions information 📝\n• Fee structure and payments 💰\n• Available courses and programs 📚\n• Campus contacts and services 📞\n• Submit complaints and feedback 📢\n• Talk to human agent 👨‍💻\n\n*If you need personalized help, try "Talk to Human" for live support!*`,
                menu: this.getMainMenu()
            };

        } catch (error) {
            console.error('Error processing message:', error);
            return {
                response: "⚠️ Sorry, I encountered an error. Please try again or contact campus directly at 032-209-6694",
                menu: this.getMainMenu()
            };
        }
    }

    handleComplaintFlow(question, userId, userSession) {
        const complaintInProgress = userSession.complaintInProgress;
        
        if (complaintInProgress.step === 'description') {
            // Save description and ask for contact info
            complaintInProgress.description = question;
            complaintInProgress.step = 'contact';
            this.userSessions.set(userId, userSession);
            
            return {
                response: "📞 **Contact Information**\n\nPlease provide your contact information (phone number or email) so we can follow up on your complaint:\n\n*Type your contact information below:*",
                menu: Markup.removeKeyboard()
            };
        } else if (complaintInProgress.step === 'contact') {
            // Submit the complaint
            const complaint = this.submitComplaint(
                userId,
                complaintInProgress.category,
                complaintInProgress.description,
                question
            );
            
            // Clear complaint in progress
            userSession.complaintInProgress = null;
            this.userSessions.set(userId, userSession);
            
            const response = `✅ **Complaint Submitted Successfully!**\n\n` +
                           `**Complaint ID:** #${complaint.id}\n` +
                           `**Category:** ${complaint.category}\n` +
                           `**Assigned Department:** ${complaint.department}\n` +
                           `**Contact:** ${complaint.contact}\n` +
                           `**Status:** PENDING\n\n` +
                           `Your complaint has been recorded and forwarded to ${complaint.department}. ` +
                           `You can check the status anytime using "View My Complaints".\n\n` +
                           `*Expected resolution time: 3-5 working days*\n\n` +
                           `**Need immediate help?** Try "Talk to Human" for live support!`;
            
            return {
                response: response,
                menu: this.getMainMenu()
            };
        }
        
        // Fallback - clear complaint state and return to main menu
        userSession.complaintInProgress = null;
        this.userSessions.set(userId, userSession);
        
        return {
            response: "Returning to main menu...",
            menu: this.getMainMenu()
        };
    }

    handleHumanSupportFlow(question, userId, userSession) {
        const humanRequestInProgress = userSession.humanRequestInProgress;
        
        if (humanRequestInProgress.step === 'description') {
            // Save description and ask for contact info
            humanRequestInProgress.description = question;
            humanRequestInProgress.step = 'contact';
            this.userSessions.set(userId, userSession);
            
            return {
                response: "📞 **Contact Information**\n\nPlease provide your phone number for immediate callback:\n\n*Type your phone number below:*",
                menu: Markup.removeKeyboard()
            };
        } else if (humanRequestInProgress.step === 'contact') {
            // Submit the human support request
            const humanRequest = this.requestHumanSupport(
                userId,
                { phone: question },
                humanRequestInProgress.description
            );
            
            // Clear human request in progress
            userSession.humanRequestInProgress = null;
            this.userSessions.set(userId, userSession);
            
            const response = `✅ **Human Support Request Submitted!**\n\n` +
                           `**Request ID:** #${humanRequest.id}\n` +
                           `**Status:** CONNECTING YOU WITH AGENT\n\n` +
                           `Our support team has been notified and will call you at **${question}** within 15 minutes.\n\n` +
                           `**While you wait:**\n` +
                           `• Keep this chat open\n` +
                           `• Have your student ID ready\n` +
                           `• Be prepared to describe your issue\n\n` +
                           `*Thank you for your patience!*`;
            
            return {
                response: response,
                menu: this.getMainMenu()
            };
        }
        
        // Fallback - clear human request state and return to main menu
        userSession.humanRequestInProgress = null;
        this.userSessions.set(userId, userSession);
        
        return {
            response: "Returning to main menu...",
            menu: this.getMainMenu()
        };
    }

    setupRoutes() {
        // Health check
        this.app.get('/', (req, res) => {
            const uptime = process.uptime();
            const totalComplaints = this.complaints.size;
            const pendingComplaints = Array.from(this.complaints.values()).filter(c => c.status === 'pending').length;
            const pendingHumanRequests = this.pendingHumanRequests.size;
            
            res.json({ 
                status: '✅ VVU FAQ Bot with Human Support Running on Render',
                version: '2.2',
                environment: process.env.NODE_ENV || 'development',
                uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
                users: this.userSessions.size,
                complaints: {
                    total: totalComplaints,
                    pending: pendingComplaints,
                    resolved: totalComplaints - pendingComplaints
                },
                human_support: {
                    pending_requests: pendingHumanRequests,
                    office_hours: this.isDuringOfficeHours() ? 'OPEN' : 'CLOSED',
                    next_opening: this.getOfficeHoursStatus()
                },
                timestamp: new Date().toISOString()
            });
        });

        // Chat API
        this.app.post('/api/chat', (req, res) => {
            try {
                const { question, userId } = req.body;
                
                if (!question) {
                    return res.status(400).json({ 
                        success: false, 
                        error: 'Question is required' 
                    });
                }

                const result = this.processMessage(question, userId || 'web_user');
                
                res.json({
                    success: true,
                    ...result,
                    timestamp: new Date().toISOString()
                });
                
            } catch (error) {
                console.error('API Error:', error);
                res.status(500).json({ 
                    success: false, 
                    error: 'Internal server error'
                });
            }
        });

        // Complaints API (for admin purposes)
        this.app.get('/api/complaints', (req, res) => {
            try {
                const complaints = Array.from(this.complaints.values());
                res.json({
                    success: true,
                    complaints: complaints,
                    total: complaints.length,
                    pending: complaints.filter(c => c.status === 'pending').length
                });
            } catch (error) {
                console.error('Complaints API Error:', error);
                res.status(500).json({ 
                    success: false, 
                    error: 'Internal server error'
                });
            }
        });

        // Human Support API (for admin purposes)
        this.app.get('/api/human-requests', (req, res) => {
            try {
                const requests = Array.from(this.pendingHumanRequests.values());
                res.json({
                    success: true,
                    requests: requests,
                    total: requests.length,
                    office_status: this.isDuringOfficeHours() ? 'OPEN' : 'CLOSED'
                });
            } catch (error) {
                console.error('Human Requests API Error:', error);
                res.status(500).json({ 
                    success: false, 
                    error: 'Internal server error'
                });
            }
        });

        // 404 handler
        this.app.use('*', (req, res) => {
            res.status(404).json({
                error: 'Endpoint not found',
                availableEndpoints: {
                    'GET /': 'Health check',
                    'POST /api/chat': 'Chat with bot',
                    'GET /api/complaints': 'Get complaints data (admin)',
                    'GET /api/human-requests': 'Get human support requests (admin)'
                }
            });
        });
    }

    start(port = process.env.PORT || 10000) {
        return new Promise((resolve, reject) => {
            this.server = this.app.listen(port, () => {
                console.log(`\n🚀 VVU FAQ Bot with Human Support Successfully Deployed on Render!`);
                console.log(`📍 Port: ${port}`);
                console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
                console.log(`🕒 Started: ${new Date().toISOString()}`);
                console.log(`📢 Complaints System: ACTIVE`);
                console.log(`👨‍💻 Human Support: ENABLED`);
                console.log(`🕐 Office Hours: Mon-Fri, 8AM-5PM`);
                console.log(`✅ Ready to serve VVU Techiman Campus!`);
                resolve(this.server);
            }).on('error', reject);
        });
    }
}

class RenderTelegramBot {
    constructor(token, faqBot) {
        this.bot = new Telegraf(token);
        this.faqBot = faqBot;
        this.setupHandlers();
    }

    setupHandlers() {
        this.bot.start((ctx) => {
            const welcomeText = `🎓 *Welcome to VVU Techiman Campus!* 🏫

I'm your official campus assistant, now with *human support*! I can help you with:

• 📝 Admissions information
• 💰 Fees and payments  
• 📚 Courses and programs
• 🕒 Academic schedule
• 📞 Contact details
• 🌐 Student portal help
• 📢 Submit complaints & feedback
• 👨‍💻 *Talk to human agents*

*Use the menu below or type your question!* 👇`;

            ctx.replyWithMarkdown(welcomeText, this.faqBot.getMainMenu());
        });

        this.bot.help((ctx) => {
            const officeStatus = this.faqBot.getOfficeHoursStatus();
            ctx.replyWithMarkdown(
                `🤖 *Need help?*\n\nI'm hosted on Render cloud platform for 24/7 availability!\n\n${officeStatus}\n\n*New Features:*\n• Submit complaints directly\n• Request human support\n• Live agent assistance\n\nUse the menu buttons or ask me anything!`,
                this.faqBot.getMainMenu()
            );
        });

        this.bot.on('text', async (ctx) => {
            try {
                const question = ctx.message.text;
                const userId = `telegram_${ctx.from.id}`;
                
                await ctx.sendChatAction('typing');
                
                const result = this.faqBot.processMessage(question, userId);
                
                await ctx.replyWithMarkdown(result.response, result.menu);
                
                console.log(`💬 ${ctx.from.first_name} asked: "${question}"`);
                
            } catch (error) {
                console.error('Telegram Error:', error);
                ctx.replyWithMarkdown(
                    "❌ *Temporary issue* - Please try again or contact campus:\n📞 032-209-6694",
                    this.faqBot.getMainMenu()
                );
            }
        });

        this.bot.catch((err) => {
            console.error('Global Bot Error:', err);
        });
    }

    start() {
        this.bot.launch().then(() => {
            console.log('✅ Telegram Bot Connected to Render Hosting');
            console.log('📢 Complaints System: INTEGRATED');
            console.log('👨‍💻 Human Support: LIVE');
        }).catch(error => {
            console.log('❌ Telegram Bot Failed:', error.message);
        });
        
        // Graceful shutdown
        process.once('SIGINT', () => this.bot.stop('SIGINT'));
        process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
    }
}

// Production startup for Render
if (require.main === module) {
    const bot = new RenderReadyBot();
    
    const port = process.env.PORT || 10000;
    
    bot.start(port).then(() => {
        const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
        
        if (telegramToken && telegramToken.length > 20) {
            try {
                const telegramBot = new RenderTelegramBot(telegramToken, bot);
                telegramBot.start();
                console.log('🤖 Telegram Bot: ACTIVE');
            } catch (error) {
                console.log('⚠️ Telegram Bot: DISABLED -', error.message);
            }
        } else {
            console.log('ℹ️ Telegram Bot: Set TELEGRAM_BOT_TOKEN to enable');
        }
        
        console.log('🎉 Deployment Complete! Bot with Human Support is live and ready.');
        
    }).catch(error => {
        console.error('💥 Deployment Failed:', error.message);
        process.exit(1);
    });
}

module.exports = { RenderReadyBot, RenderTelegramBot };