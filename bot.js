// school-faq-bot-hosted.js - Production Ready Version
const express = require('express');
const bodyParser = require('body-parser');
const { Telegraf, Markup } = require('telegraf');

class HostedInteractiveBot {
    constructor() {
        this.app = express();
        this.app.use(bodyParser.json());
        
        // Security middleware
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            next();
        });
        
        this.setupRoutes();
        
        // Enhanced Knowledge Base
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

        // Handle specific topics (same as before)
        if (questionLower.includes('admission') || question === '📝 Admissions') {
            return {
                response: this.knowledgeBase.admission,
                menu: Markup.keyboard([
                    ['Admission Requirements', 'Application Process'],
                    ['Application Deadline', 'Required Documents'],
                    ['📋 Main Menu']
                ]).resize()
            };
        }

        if (questionLower.includes('fee') || question === '💰 Fees') {
            return {
                response: this.knowledgeBase.fees,
                menu: Markup.keyboard([
                    ['Fee Structure', 'Payment Methods'],
                    ['Finance Contact', 'Payment Deadline'],
                    ['📋 Main Menu']
                ]).resize()
            };
        }

        if (questionLower.includes('course') || question === '📚 Courses') {
            return {
                response: this.knowledgeBase.courses,
                menu: Markup.keyboard([
                    ['Health Programs', 'Business Programs'],
                    ['Science Programs', 'Education Programs'],
                    ['📋 Main Menu']
                ]).resize()
            };
        }

        if (questionLower.includes('time') || question === '🕒 Timetable') {
            return {
                response: this.knowledgeBase.timetable,
                menu: this.getMainMenu()
            };
        }

        if (questionLower.includes('contact') || question === '📞 Contact') {
            return {
                response: this.knowledgeBase.contact,
                menu: this.getMainMenu()
            };
        }

        if (questionLower.includes('portal') || question === '🌐 Student Portal') {
            return {
                response: this.knowledgeBase.portal,
                menu: this.getMainMenu()
            };
        }

        // Handle sub-menu items (same as before)
        if (question === 'Admission Requirements') {
            return {
                response: "📋 **Admission Requirements:**\n\n**WASSCE/SSSCE:**\n• 6 Credits (3 Core + 3 Electives)\n• Core: English, Math, Science/Social Studies\n• Electives relevant to your program\n\n**Mature Applicants (25+):**\n• Entrance exam\n• Interview\n• Work experience considered",
                menu: this.getHelpMenu()
            };
        }

        if (question === 'Application Process') {
            return {
                response: "📝 **Application Process:**\n\n1. Get application form (online/campus)\n2. Fill and submit with required documents\n3. Pay application fee\n4. Wait for admission letter\n5. Complete registration\n\n**Deadline:** March 31st annually",
                menu: this.getHelpMenu()
            };
        }

        if (question === 'Fee Structure') {
            return {
                response: "💰 **Detailed Fee Structure:**\n\n• Tuition: GHS 7,800 - GHS 12,000\n• Registration: GHS 500/semester\n• Technology: GHS 300/semester\n• SRC Dues: GHS 200/year\n• Hostel: GHS 1,500 - GHS 2,500/semester",
                menu: this.getHelpMenu()
            };
        }

        if (question === 'Payment Methods') {
            return {
                response: "💳 **Payment Methods:**\n\n• Bank: Prudential Bank Ghana\n• Account: Valley View University\n• Mobile Money: *800*50#\n• Cash: Finance Office\n• Online: Student Portal",
                menu: this.getHelpMenu()
            };
        }

        if (question === 'Health Programs') {
            return {
                response: "🏥 **Health Sciences Programs:**\n\n• BSc Nursing (4 years)\n• BSc Midwifery (4 years)\n• BSc Mental Health Nursing (4 years)\n\n**Requirements:** Science background preferred\n**Career:** Hospitals, Clinics, Community Health",
                menu: this.getHelpMenu()
            };
        }

        if (question === 'Business Programs') {
            return {
                response: "💼 **Business Programs:**\n\n• BBA Accounting (4 years)\n• BBA Management (4 years)\n• BBA Marketing (4 years)\n• BBA Banking & Finance (4 years)\n\n**Career:** Corporate, Banking, Entrepreneurship",
                menu: this.getHelpMenu()
            };
        }

        // Default response
        return {
            response: "❓ I'm not sure about that, but I can help you with:\n\n• Admissions information 📝\n• Fee structure and payments 💰\n• Available courses and programs 📚\n• Campus contacts and services 📞\n\nUse the menu below or ask me directly!",
            menu: this.getMainMenu()
        };
    }

    setupRoutes() {
        // Health check with more info
        this.app.get('/', (req, res) => {
            const uptime = process.uptime();
            const hours = Math.floor(uptime / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = Math.floor(uptime % 60);
            
            res.json({ 
                status: '✅ VVU FAQ Bot Running',
                version: '2.0',
                hosted: true,
                uptime: `${hours}h ${minutes}m ${seconds}s`,
                users: this.userSessions.size,
                startTime: this.startTime.toISOString(),
                endpoints: {
                    health: '/',
                    chat: '/api/chat (POST)',
                    stats: '/api/stats'
                }
            });
        });

        // Chat endpoint
        this.app.post('/api/chat', (req, res) => {
            try {
                const { question, userId } = req.body;
                
                if (!question) {
                    return res.status(400).json({ error: 'Question is required' });
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
                    error: 'Internal server error',
                    response: "Sorry, I'm having trouble right now. Please try again later."
                });
            }
        });

        // Statistics endpoint
        this.app.get('/api/stats', (req, res) => {
            res.json({
                totalUsers: this.userSessions.size,
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                nodeVersion: process.version,
                platform: process.platform
            });
        });

        // 404 handler
        this.app.use('*', (req, res) => {
            res.status(404).json({
                error: 'Endpoint not found',
                availableEndpoints: {
                    'GET /': 'Health check',
                    'POST /api/chat': 'Chat with bot',
                    'GET /api/stats': 'Bot statistics'
                }
            });
        });
    }

    start(port = process.env.PORT || 3000) {
        return new Promise((resolve, reject) => {
            this.server = this.app.listen(port, '0.0.0.0', () => {
                console.log(`\n🚀 VVU FAQ Bot Hosted Successfully!`);
                console.log(`📍 Port: ${port}`);
                console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
                console.log(`📊 Health: http://0.0.0.0:${port}`);
                console.log(`💬 API: http://0.0.0.0:${port}/api/chat`);
                console.log(`🕒 Started: ${new Date().toISOString()}`);
                console.log(`✅ Ready for production use!\n`);
                resolve(this.server);
            }).on('error', reject);
        });
    }
}

class HostedTelegramBot {
    constructor(token, faqBot) {
        this.bot = new Telegraf(token);
        this.faqBot = faqBot;
        this.setupHandlers();
    }

    setupHandlers() {
        this.bot.start((ctx) => {
            const welcomeText = `🎓 *Welcome to VVU Techiman Campus!* 🏫

I'm your hosted campus assistant. I can help you with:

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
                "🤖 *Need help?*\n\nUse the menu buttons or ask me anything about VVU Techiman Campus!",
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
                
                console.log(`💬 ${ctx.from.first_name}: "${question}"`);
                
            } catch (error) {
                console.error('Telegram Error:', error);
                ctx.replyWithMarkdown(
                    "❌ *Sorry, I encountered an error.*\n\nPlease try again or contact campus directly:\n📞 032-209-6694",
                    this.faqBot.getMainMenu()
                );
            }
        });

        this.bot.catch((err, ctx) => {
            console.error('Bot Global Error:', err);
        });
    }

    start() {
        this.bot.launch().then(() => {
            console.log('✅ Telegram Bot Connected to Hosted Service');
        }).catch(error => {
            console.log('❌ Telegram Bot Failed:', error.message);
        });
        
        process.once('SIGINT', () => this.bot.stop('SIGINT'));
        process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
    }
}

// Production startup
if (require.main === module) {
    const bot = new HostedInteractiveBot();
    
    const port = process.env.PORT || 3000;
    
    bot.start(port).then(() => {
        const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
        
        if (telegramToken && telegramToken.length > 20) {
            try {
                const telegramBot = new HostedTelegramBot(telegramToken, bot);
                telegramBot.start();
            } catch (error) {
                console.log('⚠️ Telegram bot disabled:', error.message);
            }
        } else {
            console.log('ℹ️ Telegram: Set TELEGRAM_BOT_TOKEN to enable');
        }
    }).catch(error => {
        console.error('💥 Startup Failed:', error.message);
        process.exit(1);
    });
}

module.exports = { HostedInteractiveBot, HostedTelegramBot };