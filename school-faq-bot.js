// school-faq-bot-hosted.js - Optimized for Render
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
        
        // Knowledge Base
        this.knowledgeBase = {
            admission: "📝 **Admissions Requirements:**\n\n**WASSCE/SSSCE:**\n• Credit passes (A1-C6/A-D) in 3 Core + 3 Elective subjects\n• Core: English, Math, Integrated Science/Social Studies\n\n**Mature Applicants:**\n• 25+ years old\n• Entrance exam required\n\n**Application:** VVU Admissions Portal or Campus Registry",
            
            fees: "💰 **Fees (2024/2025):**\n\n• Health Programs: GHS 11,000-12,000/year\n• Business Programs: GHS 8,500/year\n• Science Programs: GHS 8,800-9,000/year\n• Education Programs: GHS 7,800/year\n\n**Payment:** Bank transfer, Mobile Money (*800*50#)",
            
            courses: "📚 **Courses Available:**\n\n**Health Sciences:**\n• BSc Nursing\n• BSc Midwifery\n• BSc Mental Health Nursing\n\n**Business:**\n• BBA Accounting, Management, Marketing\n• BBA Banking & Finance\n\n**Science:**\n• BSc Computer Science, IT\n• BSc Agribusiness, Mathematics\n\n**Education:**\n• B.Ed Mathematics, Social Studies\n• B.Ed Management, Accounting",
            
            timetable: "🕒 **Academic Schedule:**\n\n**Monday - Friday**\n• Morning: 7:00 AM - 12:00 PM\n• Afternoon: 1:00 PM - 5:00 PM\n\n**Access:** iSchool Portal after registration",
            
            contact: "📞 **Contact Techiman Campus:**\n\n• Main Office: 032-209-6694\n• Admissions: 024-685-7672\n• Finance: 020-652-9501\n• E-Learning: 024-220-3118\n• Email: info@vvu.edu.gh",
            
            portal: "🌐 **Student Portal:**\n• Website: ischool.vvu.edu.gh\n• Username: Student ID\n• Password: DDMMYYYY (Date of Birth)\n• Support: ICT Office or 024-220-3118"
        };

        this.userSessions = new Map();
        this.startTime = new Date();
        
        console.log('🤖 VVU FAQ Bot Initialized for Render');
    }

    getMainMenu() {
        return Markup.keyboard([
            ['📝 Admissions', '💰 Fees', '📚 Courses'],
            ['🕒 Timetable', '📞 Contact', '🌐 Student Portal'],
            ['🔔 Notifications', '❓ Help']
        ]).resize();
    }

    getHelpMenu() {
        return Markup.keyboard([
            ['Admission Requirements', 'Fee Structure', 'Available Courses'],
            ['Application Process', 'Payment Methods', 'Portal Access'],
            ['📋 Main Menu']
        ]).resize();
    }

    getNotifications() {
        return `🔔 **Current Notifications**\n
📢 Admissions Open for 2024/2025
🎓 Orientation: September 2-6, 2024
💻 Portal Maintenance: Sundays 2-4 AM
📚 Library: Extended exam hours

*Check notice board for updates!*`;
    }

    processMessage(question, userId = 'anonymous') {
        try {
            const questionLower = question.toLowerCase();
            
            // Handle menu commands
            if (questionLower.includes('notification') || question === '🔔 Notifications') {
                return {
                    response: this.getNotifications(),
                    menu: this.getMainMenu()
                };
            }

            if (questionLower.includes('help') || question === '❓ Help') {
                return {
                    response: "🤖 **How can I help you?**\n\nChoose from the options below or ask me anything about:\n• Admissions & Requirements\n• Fees & Payments\n• Courses & Programs\n• Campus Services\n\nI'm here to assist you! 🎓",
                    menu: this.getHelpMenu()
                };
            }

            if (question === '📋 Main Menu') {
                return {
                    response: "📋 **Main Menu**\n\nWhat would you like to know about?",
                    menu: this.getMainMenu()
                };
            }

            // Handle specific topics
            const responses = {
                // Admissions
                'admission': this.knowledgeBase.admission,
                '📝 admissions': this.knowledgeBase.admission,
                'admission requirements': "📋 **Admission Requirements:**\n\n**WASSCE/SSSCE:**\n• 6 Credits (3 Core + 3 Electives)\n• Core: English, Math, Science/Social Studies\n• Electives relevant to your program\n\n**Mature Applicants (25+):**\n• Entrance exam\n• Interview\n• Work experience considered",
                'application process': "📝 **Application Process:**\n\n1. Get application form (online/campus)\n2. Fill and submit with required documents\n3. Pay application fee\n4. Wait for admission letter\n5. Complete registration\n\n**Deadline:** March 31st annually",
                
                // Fees
                'fee': this.knowledgeBase.fees,
                '💰 fees': this.knowledgeBase.fees,
                'fee structure': "💰 **Detailed Fee Structure:**\n\n• Tuition: GHS 7,800 - GHS 12,000\n• Registration: GHS 500/semester\n• Technology: GHS 300/semester\n• SRC Dues: GHS 200/year\n• Hostel: GHS 1,500 - GHS 2,500/semester",
                'payment methods': "💳 **Payment Methods:**\n\n• Bank: Prudential Bank Ghana\n• Account: Valley View University\n• Mobile Money: *800*50#\n• Cash: Finance Office\n• Online: Student Portal",
                
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
                    return {
                        response: response,
                        menu: this.getMainMenu()
                    };
                }
            }

            // Default response
            return {
                response: "❓ I'm not sure about that, but I can help you with:\n\n• Admissions information 📝\n• Fee structure and payments 💰\n• Available courses and programs 📚\n• Campus contacts and services 📞\n\nUse the menu below or ask me directly!",
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

    setupRoutes() {
        // Health check
        this.app.get('/', (req, res) => {
            const uptime = process.uptime();
            res.json({ 
                status: '✅ VVU FAQ Bot Running on Render',
                version: '2.0',
                environment: process.env.NODE_ENV || 'development',
                uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
                users: this.userSessions.size,
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

        // 404 handler
        this.app.use('*', (req, res) => {
            res.status(404).json({
                error: 'Endpoint not found',
                availableEndpoints: {
                    'GET /': 'Health check',
                    'POST /api/chat': 'Chat with bot'
                }
            });
        });
    }

    start(port = process.env.PORT || 10000) {
        return new Promise((resolve, reject) => {
            this.server = this.app.listen(port, () => {
                console.log(`\n🚀 VVU FAQ Bot Successfully Deployed on Render!`);
                console.log(`📍 Port: ${port}`);
                console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
                console.log(`🕒 Started: ${new Date().toISOString()}`);
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

I'm your official campus assistant, now hosted on Render! I can help you with:

• 📝 Admissions information
• 💰 Fees and payments  
• 📚 Courses and programs
• 🕒 Academic schedule
• 📞 Contact details
• 🌐 Student portal help

*Use the menu below or type your question!* 👇`;

            ctx.replyWithMarkdown(welcomeText, this.faqBot.getMainMenu());
        });

        this.bot.help((ctx) => {
            ctx.replyWithMarkdown(
                "🤖 *Need help?*\n\nI'm hosted on Render cloud platform for 24/7 availability!\n\nUse the menu buttons or ask me anything about VVU Techiman Campus!",
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
        
        console.log('🎉 Deployment Complete! Bot is live and ready.');
        
    }).catch(error => {
        console.error('💥 Deployment Failed:', error.message);
        process.exit(1);
    });
}

module.exports = { RenderReadyBot, RenderTelegramBot };