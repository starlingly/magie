
/* ===== MAGIE Companion - Supabase Configuration ===== */

// IMPORTANT: Provide these via config.js (see config.example.js for template)
const RUNTIME_CONFIG = window.MAGIE_CONFIG || {};
const SUPABASE_URL = RUNTIME_CONFIG.supabaseUrl || '';
const SUPABASE_ANON_KEY = RUNTIME_CONFIG.supabaseAnonKey || '';

// Initialize Supabase client
let supabase = null;
let currentUser = null;

function setCloudStatus(status, message) {
    const statusEl = document.getElementById('cloud-status');
    if (!statusEl) return;

    statusEl.textContent = message;
    statusEl.classList.remove('hidden', 'success', 'warning', 'error');

    if (status) {
        statusEl.classList.add(status);
    }
}

function initSupabase() {
    // Check if Supabase credentials are configured
    // Using .includes() to avoid sed replacement breaking the check
    const missingConfig = !SUPABASE_URL || !SUPABASE_ANON_KEY ||
        SUPABASE_URL.includes('YOUR_PROJECT') ||
        SUPABASE_ANON_KEY.includes('YOUR_ANON');

    if (missingConfig) {
        console.warn('Supabase not configured. Running in localStorage-only mode.');
        console.warn('Follow SUPABASE_SETUP.md to enable cloud sync.');
        setCloudStatus('warning', 'Cloud sync unavailable. Using local storage only. Add config.js to enable cloud backups.');
        return false;
    }

    try {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase initialized successfully');
        setCloudStatus('success', 'Cloud sync available. Sign in to enable syncing across devices.');
        return true;
    } catch (error) {
        console.error('Failed to initialize Supabase:', error);
        setCloudStatus('error', 'Cloud sync failed to initialize. Please check your Supabase configuration.');
        return false;
    }
}

// Check authentication state on load
async function checkAuth() {
    if (!supabase) return null;

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        currentUser = session.user;
        setCloudStatus('success', `Cloud sync active for ${currentUser.email}.`);
        return currentUser;
    }

    setCloudStatus('success', 'Cloud sync available. Sign in to enable syncing across devices.');
    return null;
}

// Listen for auth changes
function setupAuthListener() {
    if (!supabase) return;

    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') {
            currentUser = session.user;
            console.log('User signed in:', currentUser.email);
            setCloudStatus('success', `Cloud sync active for ${currentUser.email}.`);
            closeAuthModal();
            // Reload user data from Supabase
            loadUserDataFromSupabase();
        } else if (event === 'SIGNED_OUT') {
            currentUser = null;
            console.log('User signed out');
            setCloudStatus('success', 'Cloud sync available. Sign in to enable syncing across devices.');
            // Clear local data and return to landing
            MAGIE_Storage.clearAll();
            location.reload();
        } else if (event === 'PASSWORD_RECOVERY') {
            // User clicked password reset link - show new password form
            console.log('Password recovery detected');
            showPasswordUpdateModal();
        }
    });
}

// Handle password reset from email link
async function checkForPasswordReset() {
    if (!supabase) return;

    // Check if there's a password reset token in the URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');

    if (type === 'recovery' && accessToken) {
        // Show the password update modal
        showPasswordUpdateModal();
    }
}

function showPasswordUpdateModal() {
    // Show auth modal with a special update password form
    document.getElementById('auth-modal').classList.remove('hidden');
    switchAuthTab('update-password');
}

/* ===== Authentication Functions ===== */

function showAuthModal() {
    document.getElementById('auth-modal').classList.remove('hidden');
    clearAuthMessages();
}

function closeAuthModal() {
    document.getElementById('auth-modal').classList.add('hidden');
    clearAuthMessages();
}

function switchAuthTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.auth-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    if (event && event.target) {
        event.target.classList.add('active');
    }

    // Update forms
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });

    if (tab === 'signin') {
        document.getElementById('signin-form').classList.add('active');
    } else if (tab === 'signup') {
        document.getElementById('signup-form').classList.add('active');
    } else if (tab === 'reset') {
        document.getElementById('reset-form').classList.add('active');
    } else if (tab === 'update-password') {
        document.getElementById('update-password-form').classList.add('active');
        // Hide the tabs when showing update password form
        document.querySelector('.auth-tabs').style.display = 'none';
    } else {
        // Show tabs for other forms
        document.querySelector('.auth-tabs').style.display = 'flex';
    }

    clearAuthMessages();
}

function clearAuthMessages() {
    document.getElementById('auth-error').classList.add('hidden');
    document.getElementById('auth-success').classList.add('hidden');
}

function showAuthError(message) {
    const errorEl = document.getElementById('auth-error');
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
}

function showAuthSuccess(message) {
    const successEl = document.getElementById('auth-success');
    successEl.textContent = message;
    successEl.classList.remove('hidden');
}

async function handleSignUp(event) {
    event.preventDefault();
    clearAuthMessages();

    if (!supabase) {
        showAuthError('Supabase is not configured. Please set up Supabase first.');
        return;
    }

    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const passwordConfirm = document.getElementById('signup-password-confirm').value;

    if (password !== passwordConfirm) {
        showAuthError('Passwords do not match');
        return;
    }

    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) throw error;

        showAuthSuccess('Account created! Please check your email to confirm your account.');

        // Clear form
        document.getElementById('signup-form').reset();

        // Auto-sign in if email confirmation is disabled
        if (data.session) {
            setTimeout(() => {
                closeAuthModal();
                initializeApp();
            }, 2000);
        }
    } catch (error) {
        showAuthError(error.message);
    }
}

async function handleSignIn(event) {
    event.preventDefault();
    clearAuthMessages();

    if (!supabase) {
        showAuthError('Supabase is not configured. Please set up Supabase first.');
        return;
    }

    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) throw error;

        currentUser = data.user;
        closeAuthModal();

        // Load user data and show dashboard
        await loadUserDataFromSupabase();
        showDashboard();
    } catch (error) {
        showAuthError(error.message);
    }
}

async function handleSignOut() {
    if (!supabase) return;

    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        // Clear local storage and reload
        MAGIE_Storage.clearAll();
        location.reload();
    } catch (error) {
        console.error('Sign out error:', error);
        alert('Error signing out. Please try again.');
    }
}

async function handlePasswordReset(event) {
    event.preventDefault();
    clearAuthMessages();

    if (!supabase) {
        showAuthError('Supabase is not configured. Please set up Supabase first.');
        return;
    }

    const email = document.getElementById('reset-email').value;

    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/magie`,
        });

        if (error) throw error;

        showAuthSuccess('Password reset link sent! Check your email.');

        // Clear the form
        document.getElementById('reset-form').reset();

        // Switch back to sign in after a delay
        setTimeout(() => {
            switchAuthTab('signin');
        }, 3000);
    } catch (error) {
        showAuthError(error.message);
    }
}

async function handlePasswordUpdate(event) {
    event.preventDefault();
    clearAuthMessages();

    if (!supabase) {
        showAuthError('Supabase is not configured. Please set up Supabase first.');
        return;
    }

    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('new-password-confirm').value;

    if (newPassword !== confirmPassword) {
        showAuthError('Passwords do not match');
        return;
    }

    try {
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) throw error;

        showAuthSuccess('Password updated successfully! Redirecting...');

        // Clear the form
        document.getElementById('update-password-form').reset();

        // Clear the URL hash
        window.history.replaceState(null, '', window.location.pathname);

        // Redirect to dashboard after a delay
        setTimeout(() => {
            closeAuthModal();
            showDashboard();
        }, 2000);
    } catch (error) {
        showAuthError(error.message);
    }
}

/* ===== MAGIE Companion - Storage Management ===== */

const MAGIE_Storage = {
    // Keys for localStorage
    KEYS: {
        USER_DATA: 'magie_user_data',
        PRIMER: 'magie_primer',
        SESSIONS: 'magie_sessions',
        SETTINGS: 'magie_settings'
    },

    // Initialize storage
    init() {
        if (!this.exists()) {
            this.createDefault();
        }
    },

    // Check if storage exists
    exists() {
        return localStorage.getItem(this.KEYS.USER_DATA) !== null;
    },

    // Create default storage structure
    createDefault() {
        const defaultData = {
            createdAt: new Date().toISOString(),
            lastVisit: new Date().toISOString(),
            onboardingComplete: false
        };

        const defaultPrimer = {
            name: '',
            intro: '',
            themes: [],
            themesOther: '',
            style: [],
            communication: '',
            goals: '',
            selectedAI: '',
            createdAt: null,
            updatedAt: null
        };

        const defaultSessions = [];

        const defaultSettings = {
            showCrisisBanner: true
        };

        localStorage.setItem(this.KEYS.USER_DATA, JSON.stringify(defaultData));
        localStorage.setItem(this.KEYS.PRIMER, JSON.stringify(defaultPrimer));
        localStorage.setItem(this.KEYS.SESSIONS, JSON.stringify(defaultSessions));
        localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(defaultSettings));
    },

    // Get user data
    getUserData() {
        const data = localStorage.getItem(this.KEYS.USER_DATA);
        return data ? JSON.parse(data) : null;
    },

    // Update user data
    updateUserData(updates) {
        const current = this.getUserData() || {};
        const updated = { ...current, ...updates, lastVisit: new Date().toISOString() };
        localStorage.setItem(this.KEYS.USER_DATA, JSON.stringify(updated));
        return updated;
    },

    // Get primer
    getPrimer() {
        const data = localStorage.getItem(this.KEYS.PRIMER);
        return data ? JSON.parse(data) : null;
    },

    // Save primer
    savePrimer(primer) {
        const current = this.getPrimer() || {};
        const updated = {
            ...current,
            ...primer,
            updatedAt: new Date().toISOString()
        };

        if (!updated.createdAt) {
            updated.createdAt = new Date().toISOString();
        }

        localStorage.setItem(this.KEYS.PRIMER, JSON.stringify(updated));
        return updated;
    },

    // Generate formatted primer text
    generatePrimerText() {
        const primer = this.getPrimer();
        if (!primer || !primer.name) return '';

        let text = '# MAGIE Primer\n\n';

        // Name
        text += `**Name:** ${primer.name}\n\n`;

        // Date
        text += `**Created:** ${new Date(primer.createdAt).toLocaleDateString()}\n`;
        text += `**Last Updated:** ${new Date(primer.updatedAt).toLocaleDateString()}\n\n`;

        // Introduction
        text += `## Who I Am\n\n${primer.intro}\n\n`;

        // Themes
        text += `## What I'm Working On\n\n`;
        if (primer.themes && primer.themes.length > 0) {
            text += `**Emotional Themes:** ${primer.themes.join(', ')}\n\n`;
        }
        if (primer.themesOther) {
            text += `${primer.themesOther}\n\n`;
        }

        // Style
        text += `## How I Want To Be Met\n\n`;
        if (primer.style && primer.style.length > 0) {
            text += `**Preferred Communication Style:** ${primer.style.join(', ')}\n\n`;
        }
        if (primer.communication) {
            text += `**About My Communication:**\n${primer.communication}\n\n`;
        }

        // Goals
        text += `## My Goals for MAGIE\n\n${primer.goals}\n\n`;

        // Selected AI
        if (primer.selectedAI) {
            text += `---\n\n*Practicing with ${primer.selectedAI}*\n`;
        }

        return text;
    },

    // Get all sessions
    getSessions() {
        const data = localStorage.getItem(this.KEYS.SESSIONS);
        return data ? JSON.parse(data) : [];
    },

    // Add session
    addSession(session) {
        const sessions = this.getSessions();
        const newSession = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...session
        };
        sessions.unshift(newSession); // Add to beginning
        localStorage.setItem(this.KEYS.SESSIONS, JSON.stringify(sessions));
        return newSession;
    },

    // Update session
    updateSession(sessionId, updates) {
        const sessions = this.getSessions();
        const index = sessions.findIndex(s => s.id === sessionId);
        if (index !== -1) {
            sessions[index] = { ...sessions[index], ...updates };
            localStorage.setItem(this.KEYS.SESSIONS, JSON.stringify(sessions));
            return sessions[index];
        }
        return null;
    },

    // Get session count
    getSessionCount() {
        return this.getSessions().length;
    },

    // Get days practicing (from first session or primer creation)
    getDaysPracticing() {
        const primer = this.getPrimer();
        const sessions = this.getSessions();

        let startDate = null;

        if (primer && primer.createdAt) {
            startDate = new Date(primer.createdAt);
        }

        if (sessions.length > 0) {
            const firstSession = sessions[sessions.length - 1];
            const firstSessionDate = new Date(firstSession.timestamp);
            if (!startDate || firstSessionDate < startDate) {
                startDate = firstSessionDate;
            }
        }

        if (!startDate) return 0;

        const today = new Date();
        const diffTime = Math.abs(today - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    },

    // Get settings
    getSettings() {
        const data = localStorage.getItem(this.KEYS.SETTINGS);
        return data ? JSON.parse(data) : { showCrisisBanner: true };
    },

    // Update settings
    updateSettings(updates) {
        const current = this.getSettings();
        const updated = { ...current, ...updates };
        localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(updated));
        return updated;
    },

    // Export all data
    exportAll() {
        return {
            userData: this.getUserData(),
            primer: this.getPrimer(),
            sessions: this.getSessions(),
            settings: this.getSettings(),
            exportedAt: new Date().toISOString()
        };
    },

    // Import data
    importData(data) {
        if (data.userData) {
            localStorage.setItem(this.KEYS.USER_DATA, JSON.stringify(data.userData));
        }
        if (data.primer) {
            localStorage.setItem(this.KEYS.PRIMER, JSON.stringify(data.primer));
        }
        if (data.sessions) {
            localStorage.setItem(this.KEYS.SESSIONS, JSON.stringify(data.sessions));
        }
        if (data.settings) {
            localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(data.settings));
        }
    },

    // Clear all data
    clearAll() {
        Object.values(this.KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    },

    // Check if onboarding is complete
    isOnboardingComplete() {
        const userData = this.getUserData();
        return userData && userData.onboardingComplete === true;
    },

    // Mark onboarding complete
    completeOnboarding() {
        this.updateUserData({ onboardingComplete: true });
    },

    // Check if primer exists
    hasPrimer() {
        const primer = this.getPrimer();
        return primer && primer.name && primer.intro;
    },

    /* ===== Supabase Sync Functions ===== */

    // Save primer to Supabase
    async syncPrimerToSupabase(primer) {
        if (!supabase || !currentUser) return;

        try {
            // Check if primer exists
            const { data: existing } = await supabase
                .from('primers')
                .select('id')
                .eq('user_id', currentUser.id)
                .single();

            const primerData = {
                user_id: currentUser.id,
                name: primer.name,
                intro: primer.intro,
                themes: primer.themes || [],
                themes_other: primer.themesOther || '',
                style: primer.style || [],
                communication: primer.communication || '',
                goals: primer.goals || '',
                selected_ai: primer.selectedAI || '',
                updated_at: new Date().toISOString()
            };

            if (existing) {
                // Update existing primer
                const { error } = await supabase
                    .from('primers')
                    .update(primerData)
                    .eq('user_id', currentUser.id);

                if (error) throw error;
            } else {
                // Insert new primer
                primerData.created_at = new Date().toISOString();
                const { error } = await supabase
                    .from('primers')
                    .insert([primerData]);

                if (error) throw error;
            }

            console.log('Primer synced to Supabase');
        } catch (error) {
            console.error('Error syncing primer:', error);
        }
    },

    // Load primer from Supabase
    async loadPrimerFromSupabase() {
        if (!supabase || !currentUser) return null;

        try {
            const { data, error } = await supabase
                .from('primers')
                .select('*')
                .eq('user_id', currentUser.id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // No primer found, return null
                    return null;
                }
                throw error;
            }

            // Convert to local format
            const primer = {
                name: data.name,
                intro: data.intro,
                themes: data.themes || [],
                themesOther: data.themes_other,
                style: data.style || [],
                communication: data.communication,
                goals: data.goals,
                selectedAI: data.selected_ai,
                createdAt: data.created_at,
                updatedAt: data.updated_at
            };

            // Save to localStorage
            localStorage.setItem(this.KEYS.PRIMER, JSON.stringify(primer));
            return primer;
        } catch (error) {
            console.error('Error loading primer:', error);
            return null;
        }
    },

    // Sync session to Supabase
    async syncSessionToSupabase(session) {
        if (!supabase || !currentUser) return;

        try {
            const sessionData = {
                user_id: currentUser.id,
                session_type: session.type,
                note: session.note,
                created_at: session.timestamp
            };

            const { error } = await supabase
                .from('sessions')
                .insert([sessionData]);

            if (error) throw error;

            console.log('Session synced to Supabase');
        } catch (error) {
            console.error('Error syncing session:', error);
        }
    },

    // Load sessions from Supabase
    async loadSessionsFromSupabase() {
        if (!supabase || !currentUser) return [];

        try {
            const { data, error } = await supabase
                .from('sessions')
                .select('*')
                .eq('user_id', currentUser.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Convert to local format
            const sessions = data.map(s => ({
                id: s.id,
                type: s.session_type,
                note: s.note,
                timestamp: s.created_at
            }));

            // Save to localStorage
            localStorage.setItem(this.KEYS.SESSIONS, JSON.stringify(sessions));
            return sessions;
        } catch (error) {
            console.error('Error loading sessions:', error);
            return [];
        }
    },

    // Sync settings to Supabase
    async syncSettingsToSupabase(settings) {
        if (!supabase || !currentUser) return;

        try {
            const { data: existing } = await supabase
                .from('user_settings')
                .select('id')
                .eq('user_id', currentUser.id)
                .single();

            const settingsData = {
                user_id: currentUser.id,
                show_crisis_banner: settings.showCrisisBanner,
                onboarding_complete: true,
                user_name: settings.userName || null,
                pronouns: settings.pronouns || null,
                updated_at: new Date().toISOString()
            };

            if (existing) {
                const { error } = await supabase
                    .from('user_settings')
                    .update(settingsData)
                    .eq('user_id', currentUser.id);

                if (error) throw error;
            } else {
                settingsData.created_at = new Date().toISOString();
                const { error } = await supabase
                    .from('user_settings')
                    .insert([settingsData]);

                if (error) throw error;
            }

            console.log('Settings synced to Supabase');
        } catch (error) {
            console.error('Error syncing settings:', error);
        }
    },

    // Load settings from Supabase
    async loadSettingsFromSupabase() {
        if (!supabase || !currentUser) return null;

        try {
            const { data, error } = await supabase
                .from('user_settings')
                .select('*')
                .eq('user_id', currentUser.id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return null;
                }
                throw error;
            }

            const settings = {
                showCrisisBanner: data.show_crisis_banner,
                onboardingComplete: data.onboarding_complete,
                userName: data.user_name || '',
                pronouns: data.pronouns || ''
            };

            localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
            return settings;
        } catch (error) {
            console.error('Error loading settings:', error);
            return null;
        }
    }
};

// Initialize on load
MAGIE_Storage.init();

/* ===== Load User Data from Supabase ===== */

async function loadUserDataFromSupabase() {
    if (!supabase || !currentUser) return;

    console.log('Loading user data from Supabase...');

    // Load all user data
    await Promise.all([
        MAGIE_Storage.loadPrimerFromSupabase(),
        MAGIE_Storage.loadSessionsFromSupabase(),
        MAGIE_Storage.loadSettingsFromSupabase()
    ]);

    // Update user data
    MAGIE_Storage.updateUserData({
        onboardingComplete: true
    });

    console.log('User data loaded from Supabase');
}

</script>
    <script>
/* ===== MAGIE Companion - Main Application ===== */

// Initialize app on page load
document.addEventListener('DOMContentLoaded', async function() {
    await initializeApp();
});

async function initializeApp() {
    // Initialize Supabase
    const supabaseInitialized = initSupabase();

    if (supabaseInitialized) {
        // Set up auth listener
        setupAuthListener();

        // Check for email confirmation or other auth callbacks in URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');

        // If this is an email confirmation callback, show success message
        if (accessToken && type === 'signup') {
            // Clean up the URL
            window.history.replaceState({}, document.title, window.location.pathname);

            // Show success message
            setTimeout(() => {
                showToast('✓ Email confirmed! Welcome to MAGIE.');
            }, 500);
        }
        // Check for password reset in URL
        await checkForPasswordReset();

        // Check if user is already signed in
        const user = await checkAuth();

        if (user) {
            // Load user data from Supabase
            await loadUserDataFromSupabase();

            // Check if they have a primer
            if (MAGIE_Storage.hasPrimer()) {
                showDashboard();
            } else {
                showView('view-landing');
            }
        } else {
            // Not signed in, show landing page
            showView('view-landing');
        }
    } else {
        // Supabase not configured, use localStorage only
        if (MAGIE_Storage.isOnboardingComplete() && MAGIE_Storage.hasPrimer()) {
            showDashboard();
        } else {
            showView('view-landing');
        }
    }

    // Set up event listeners
    setupEventListeners();

    // Show crisis banner if setting is enabled
    const settings = MAGIE_Storage.getSettings();
    if (settings.showCrisisBanner) {
        setTimeout(() => {
            document.getElementById('crisis-banner').classList.remove('hidden');
        }, 2000);
    }
}

function setupEventListeners() {
    // Safety checkbox
    const safetyCheckbox = document.getElementById('safety-checkbox');
    const safetyContinue = document.getElementById('safety-continue');

    if (safetyCheckbox && safetyContinue) {
        safetyCheckbox.addEventListener('change', function() {
            safetyContinue.disabled = !this.checked;
        });
    }
}

// ===== NAVIGATION =====

function showView(viewId) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });

    // Show requested view
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.add('active');
        window.scrollTo(0, 0);
    }

    // Show dashboard link on about page if user is logged in
    if (viewId === 'view-about') {
        const dashboardLink = document.getElementById('dashboard-link-about');
        if (dashboardLink && currentUser) {
            dashboardLink.style.display = 'inline-block';
        }
    }
}

function nextStep(viewId) {
    showView(viewId);
}

function startJourney() {
    // If Supabase is configured and user not signed in, show auth modal
    if (supabase && !currentUser) {
        showAuthModal();
        // Switch to sign up tab
        const signupTab = document.querySelector('.auth-tab:nth-child(2)');
        if (signupTab) signupTab.click();
    } else {
        showView('view-welcome');
    }
}

function handleReturningUser() {
    // If Supabase is configured, show sign in modal
    if (supabase) {
        if (currentUser) {
            // Already signed in, go to dashboard
            showDashboard();
        } else {
            // Show sign in modal
            showAuthModal();
        }
    } else {
        // No Supabase, use localStorage
        if (MAGIE_Storage.hasPrimer()) {
            showDashboard();
        } else {
            alert('No saved data found. Please start a new journey.');
            showView('view-landing');
        }
    }
}

// ===== ASSESSMENT =====

function showAssessmentResult() {
    const q1 = document.querySelector('input[name="q1"]:checked');
    const q2 = document.querySelector('input[name="q2"]:checked');
    const q3 = document.querySelector('input[name="q3"]:checked');
    const q4 = document.querySelector('input[name="q4"]:checked');

    if (!q1 || !q2 || !q3 || !q4) {
        alert('Please answer all questions before continuing.');
        return;
    }

    // Calculate result
    const yesCount = [q1, q2, q3, q4].filter(q => q.value === 'yes' || q.value === 'willing' || q.value === 'balance').length;

    const feedbackEl = document.getElementById('assessment-feedback');

    if (yesCount >= 3) {
        feedbackEl.className = 'result-card positive';
        feedbackEl.innerHTML = `
            <h3>✨ MAGIE Might Be A Great Fit For You</h3>
            <p>Based on your responses, MAGIE aligns well with how you process emotions and seek support. You seem ready for self-directed exploration with AI as a reflective companion.</p>
            <p><strong>What this means:</strong> You're likely to find value in building a Primer, engaging with an AI regularly, and using the structured practice to deepen your self-understanding.</p>
            <p>Ready to continue?</p>
        `;
    } else if (yesCount >= 2) {
        feedbackEl.className = 'result-card neutral';
        feedbackEl.innerHTML = `
            <h3>💡 MAGIE Could Work With Some Adaptation</h3>
            <p>MAGIE might work for you, though it may take some adjustment. You might need to experiment with different approaches or give yourself time to get comfortable with the practice.</p>
            <p><strong>What this means:</strong> Be patient with yourself. Start small. You might find it becomes more natural over time.</p>
            <p>Want to give it a try?</p>
        `;
    } else {
        feedbackEl.className = 'result-card';
        feedbackEl.innerHTML = `
            <h3>🤔 MAGIE Might Not Be The Best Fit Right Now</h3>
            <p>Based on your responses, MAGIE may not align with what you need right now. That's completely okay—different healing practices work for different people.</p>
            <p><strong>What this means:</strong> You might benefit more from other therapeutic approaches. Consider traditional therapy, body-based practices, or creative expression.</p>
            <p>You're still welcome to explore MAGIE if you're curious, but know there are other paths too.</p>
        `;
    }

    showView('view-assessment-result');
}

// ===== AI SELECTION =====

function selectAI(aiName) {
    const aiNames = {
        'claude': 'Claude',
        'chatgpt': 'ChatGPT',
        'gemini': 'Gemini',
        'gemini-studio': 'Gemini (AI Studio)',
        'grok': 'Grok',
        'copilot': 'Copilot',
        'mistral': 'Mistral',
        'other': 'Other/Undecided'
    };

    // Save selection
    MAGIE_Storage.savePrimer({ selectedAI: aiNames[aiName] });

    // Show confirmation
    document.getElementById('selected-ai-name').textContent = aiNames[aiName];
    document.getElementById('ai-selected').classList.remove('hidden');

    // Highlight selected card
    document.querySelectorAll('.ai-card').forEach(card => {
        card.style.borderColor = '';
    });
    event.target.closest('.ai-card').style.borderColor = 'var(--primary-color)';
    event.target.closest('.ai-card').style.borderWidth = '2px';
    event.target.closest('.ai-card').style.borderStyle = 'solid';

    // Scroll to the "Ready - Build My Primer" button
    setTimeout(() => {
        const buildButton = document.getElementById('build-primer-btn');
        if (buildButton) {
            buildButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 100); // Small delay to ensure the button is visible first
}

// ===== PRIMER WIZARD =====

async function nextPrimerSection(sectionName) {
    // Save current section data first
    await saveCurrentPrimerSection();

    // Hide all sections
    document.querySelectorAll('.primer-section').forEach(section => {
        section.classList.remove('active');
    });

    // Show target section
    const targetSection = document.querySelector(`.primer-section[data-section="${sectionName}"]`);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Update progress indicators
    document.querySelectorAll('.progress-step').forEach(step => {
        if (step.dataset.section === sectionName) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });

    window.scrollTo(0, 0);
}

function prevPrimerSection(sectionName) {
    nextPrimerSection(sectionName); // Same function, just going backwards
}

async function saveCurrentPrimerSection() {
    const activeSection = document.querySelector('.primer-section.active');
    if (!activeSection) return;

    const sectionName = activeSection.dataset.section;
    const updates = {};

    switch(sectionName) {
        case 'intro':
            updates.name = document.getElementById('primer-name').value;
            updates.intro = document.getElementById('primer-intro').value;
            break;

        case 'themes':
            const themeCheckboxes = document.querySelectorAll('.theme-checkbox:checked');
            updates.themes = Array.from(themeCheckboxes).map(cb => cb.value);
            updates.themesOther = document.getElementById('primer-themes-other').value;
            break;

        case 'style':
            const styleCheckboxes = document.querySelectorAll('.style-checkbox:checked');
            updates.style = Array.from(styleCheckboxes).map(cb => cb.value);
            updates.communication = document.getElementById('primer-communication').value;
            break;

        case 'goals':
            updates.goals = document.getElementById('primer-goals').value;
            break;
    }

    const updatedPrimer = MAGIE_Storage.savePrimer(updates);

    // Sync to Supabase if available
    if (supabase && currentUser) {
        await MAGIE_Storage.syncPrimerToSupabase(updatedPrimer);
    }
}

function loadPrimerData() {
    const primer = MAGIE_Storage.getPrimer();
    if (!primer) return;

    // Load intro
    if (primer.name) document.getElementById('primer-name').value = primer.name;
    if (primer.intro) document.getElementById('primer-intro').value = primer.intro;

    // Load themes
    if (primer.themes && primer.themes.length > 0) {
        primer.themes.forEach(theme => {
            const checkbox = document.querySelector(`.theme-checkbox[value="${theme}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    if (primer.themesOther) {
        document.getElementById('primer-themes-other').value = primer.themesOther;
    }

    // Load style
    if (primer.style && primer.style.length > 0) {
        primer.style.forEach(style => {
            const checkbox = document.querySelector(`.style-checkbox[value="${style}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    if (primer.communication) {
        document.getElementById('primer-communication').value = primer.communication;
    }

    // Load goals
    if (primer.goals) document.getElementById('primer-goals').value = primer.goals;
}

async function completePrimer() {
    // Save final section
    saveCurrentPrimerSection();

    // Get the saved primer
    const primer = MAGIE_Storage.getPrimer();

    // Sync to Supabase if available
    if (supabase && currentUser) {
        await MAGIE_Storage.syncPrimerToSupabase(primer);
        await MAGIE_Storage.syncSettingsToSupabase({ showCrisisBanner: true });
    }

    // Generate and display primer
    const primerText = MAGIE_Storage.generatePrimerText();
    document.getElementById('primer-output').textContent = primerText;

    // Mark onboarding as complete
    MAGIE_Storage.completeOnboarding();

    showView('view-primer-preview');
}

// ===== PRIMER ACTIONS =====

function copyPrimer() {
    const primerText = MAGIE_Storage.generatePrimerText();

    navigator.clipboard.writeText(primerText).then(() => {
        showToast('✓ Copied to clipboard!');
    }).catch(err => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = primerText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('✓ Copied to clipboard!');
    });
}

function downloadPrimer() {
    const primerText = MAGIE_Storage.generatePrimerText();
    const primer = MAGIE_Storage.getPrimer();
    const filename = `MAGIE_Primer_${primer.name || 'Unnamed'}_${new Date().toISOString().split('T')[0]}.txt`;

    const blob = new Blob([primerText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('✓ Downloaded!');
}

// ===== FIRST SESSION =====

function setupFirstSession() {
    const primer = MAGIE_Storage.getPrimer();
    if (primer && primer.selectedAI) {
        document.getElementById('session-ai-name').textContent = primer.selectedAI;

        // Set platform link
        const platformLinks = {
            'Claude': '<a href="https://claude.ai" target="_blank">claude.ai →</a>',
            'ChatGPT': '<a href="https://chatgpt.com" target="_blank">chatgpt.com →</a>',
            'Gemini': '<a href="https://gemini.google.com" target="_blank">gemini.google.com →</a>',
            'Gemini (AI Studio)': '<a href="https://aistudio.google.com" target="_blank">aistudio.google.com →</a>',
            'Grok': '<a href="https://x.com/i/grok" target="_blank">x.com/i/grok →</a>',
            'Copilot': '<a href="https://copilot.microsoft.com" target="_blank">copilot.microsoft.com →</a>',
            'Mistral': '<a href="https://chat.mistral.ai" target="_blank">chat.mistral.ai →</a>',
            'Other/Undecided': 'Open your chosen AI platform'
        };

        const linkEl = document.getElementById('platform-link');
        if (linkEl) {
            linkEl.innerHTML = platformLinks[primer.selectedAI] || '';
        }
    }
}

// Call this when showing first session view
document.addEventListener('DOMContentLoaded', function() {
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.target.id === 'view-first-session' &&
                mutation.target.classList.contains('active')) {
                setupFirstSession();
            }
        });
    });

    const firstSessionView = document.getElementById('view-first-session');
    if (firstSessionView) {
        observer.observe(firstSessionView, { attributes: true, attributeFilter: ['class'] });
    }
});

// ===== DASHBOARD =====

function showDashboard() {
    const primer = MAGIE_Storage.getPrimer();
    const settings = MAGIE_Storage.getSettings();
    const sessionCount = MAGIE_Storage.getSessionCount();
    const daysPracticing = MAGIE_Storage.getDaysPracticing();

    // Update dashboard data - prefer userName from settings, fall back to primer name
    const displayName = settings.userName || (primer && primer.name) || 'Friend';
    document.getElementById('dashboard-name').textContent = displayName;

    document.getElementById('total-sessions').textContent = sessionCount;
    document.getElementById('days-practicing').textContent = daysPracticing;

    // Show sign-out button if user is signed in
    const signOutBtn = document.getElementById('sign-out-btn');
    if (signOutBtn && supabase && currentUser) {
        signOutBtn.style.display = 'inline-block';
    }

    showView('view-dashboard');
}

async function startSession() {
    // Load primer data if editing
    loadPrimerData();

    // Show session prep
    const primer = MAGIE_Storage.getPrimer();

    if (confirm('Ready to start your session?\n\nMake sure you have your Primer ready to paste into your AI.')) {
        setupFirstSession();
        showView('view-first-session');

        // Log session start
        const session = MAGIE_Storage.addSession({
            type: 'session',
            note: 'Session started'
        });

        // Sync to Supabase if available
        if (supabase && currentUser) {
            await MAGIE_Storage.syncSessionToSupabase(session);
        }
    }
}

function showReflection() {
    alert('Reflection feature coming soon!\n\nFor now, consider:\n\n• What landed in your last session?\n• What surprised you?\n• What needs to be added to your Primer?');
}

function showPrimerManager() {
    // Load current primer data
    loadPrimerData();

    // Show primer wizard for editing
    showView('view-primer-wizard');

    // Start at first section
    nextPrimerSection('intro');
}

function showJourney() {
    alert('Journey tracking coming soon!\n\nThis will show:\n\n• Session history\n• Emotional themes over time\n• Your saved insights\n• Progress markers');
}

// ===== ACCOUNT SETTINGS =====

async function showAccountSettings() {
    // Load user profile data
    if (currentUser) {
        document.getElementById('account-email').value = currentUser.email;

        // Load name and pronouns from settings
        const settings = MAGIE_Storage.getSettings();
        if (settings.userName) {
            document.getElementById('account-name').value = settings.userName;
        }
        if (settings.pronouns) {
            document.getElementById('account-pronouns').value = settings.pronouns;
        }
    }

    showView('view-account-settings');
}

async function saveAccountProfile() {
    const name = document.getElementById('account-name').value;
    const pronouns = document.getElementById('account-pronouns').value;

    // Save to local storage
    MAGIE_Storage.updateSettings({
        userName: name,
        pronouns: pronouns
    });

    // Save to Supabase if available
    if (supabase && currentUser) {
        await MAGIE_Storage.syncSettingsToSupabase({
            userName: name,
            pronouns: pronouns,
            showCrisisBanner: MAGIE_Storage.getSettings().showCrisisBanner
        });
    }

    // Update the dashboard name
    if (name) {
        document.getElementById('dashboard-name').textContent = name;
    }

    showToast('✓ Profile updated!');
}

function showChangePasswordForm() {
    document.getElementById('change-password-section').style.display = 'none';
    document.getElementById('change-password-form').style.display = 'block';
    // Clear any previous messages
    document.getElementById('password-change-error').classList.add('hidden');
    document.getElementById('password-change-success').classList.add('hidden');
}

function hideChangePasswordForm() {
    document.getElementById('change-password-section').style.display = 'block';
    document.getElementById('change-password-form').style.display = 'none';
    // Clear form
    document.getElementById('current-password').value = '';
    document.getElementById('new-password-change').value = '';
    document.getElementById('new-password-change-confirm').value = '';
}

async function handleChangePassword(event) {
    event.preventDefault();

    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password-change').value;
    const confirmPassword = document.getElementById('new-password-change-confirm').value;

    // Clear previous messages
    document.getElementById('password-change-error').classList.add('hidden');
    document.getElementById('password-change-success').classList.add('hidden');

    if (newPassword !== confirmPassword) {
        const errorEl = document.getElementById('password-change-error');
        errorEl.textContent = 'Passwords do not match';
        errorEl.classList.remove('hidden');
        return;
    }

    if (!supabase) {
        const errorEl = document.getElementById('password-change-error');
        errorEl.textContent = 'Authentication not available';
        errorEl.classList.remove('hidden');
        return;
    }

    try {
        // First verify current password by attempting to sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: currentUser.email,
            password: currentPassword
        });

        if (signInError) {
            throw new Error('Current password is incorrect');
        }

        // Update to new password
        const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (updateError) throw updateError;

        const successEl = document.getElementById('password-change-success');
        successEl.textContent = 'Password updated successfully!';
        successEl.classList.remove('hidden');

        // Clear and hide form after success
        setTimeout(() => {
            hideChangePasswordForm();
        }, 2000);

    } catch (error) {
        const errorEl = document.getElementById('password-change-error');
        errorEl.textContent = error.message;
        errorEl.classList.remove('hidden');
    }
}

// ===== BREATHING EXERCISE =====

let breathingInterval = null;
let breathingPhaseInterval = null;
let breathingCycle = 0;

function startBreathing() {
    document.getElementById('breathing-modal').classList.remove('hidden');

    breathingCycle = 0;
    updateBreathingCycle();

    breathingInterval = setInterval(() => {
        breathingCycle++;
        if (breathingCycle >= 6) {
            closeBreathing();
        } else {
            updateBreathingCycle();
        }
    }, 8000); // 8 seconds per cycle (4 in, 4 out)
}

function updateBreathingCycle() {
    document.getElementById('breath-count').textContent = breathingCycle + 1;

    const instruction = document.getElementById('breath-instruction');
    const timer = document.getElementById('breath-timer');
    const circle = document.querySelector('.breathing-circle');
    let phase = 0;
    let countdown = 2;

    // Clear any existing phase interval
    if (breathingPhaseInterval) {
        clearInterval(breathingPhaseInterval);
    }

    // Helper function to update countdown every second
    let countdownInterval;
    function startCountdown() {
        countdown = 2;
        timer.textContent = countdown;

        if (countdownInterval) {
            clearInterval(countdownInterval);
        }

        countdownInterval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                timer.textContent = countdown;
            }
        }, 1000);
    }

    // Start with breathe in
    instruction.textContent = 'Breathe In';
    circle.classList.remove('exhale', 'hold');
    circle.classList.add('inhale');
    startCountdown();

    breathingPhaseInterval = setInterval(() => {
        phase++;
        if (phase === 1) {
            // Hold after inhale
            instruction.textContent = 'Hold';
            circle.classList.remove('inhale', 'exhale');
            circle.classList.add('hold');
            startCountdown();
        } else if (phase === 2) {
            // Breathe out
            instruction.textContent = 'Breathe Out';
            circle.classList.remove('inhale', 'hold');
            circle.classList.add('exhale');
            startCountdown();
        } else if (phase === 3) {
            // Hold after exhale
            instruction.textContent = 'Hold';
            circle.classList.remove('inhale', 'exhale');
            circle.classList.add('hold');
            startCountdown();

            // Clean up
            setTimeout(() => {
                if (countdownInterval) {
                    clearInterval(countdownInterval);
                }
            }, 2000);

            clearInterval(breathingPhaseInterval);
            breathingPhaseInterval = null;
        }
    }, 2000);
}

function closeBreathing() {
    document.getElementById('breathing-modal').classList.add('hidden');

    // Clear all intervals
    if (breathingInterval) {
        clearInterval(breathingInterval);
        breathingInterval = null;
    }
    if (breathingPhaseInterval) {
        clearInterval(breathingPhaseInterval);
        breathingPhaseInterval = null;
    }

    // Reset circle classes
    const circle = document.querySelector('.breathing-circle');
    if (circle) {
        circle.classList.remove('inhale', 'exhale', 'hold');
    }
}

// ===== CRISIS BANNER =====

function showCrisisBanner() {
    document.getElementById('crisis-banner').classList.remove('hidden');
}

function hideCrisisBanner() {
    document.getElementById('crisis-banner').classList.add('hidden');
    MAGIE_Storage.updateSettings({ showCrisisBanner: false });
}

// ===== RESOURCES =====

function downloadPrompts() {
    const prompts = `MAGIE Recursion Journal Prompts

Use these before, during, or after any MAGIE session.

✦ What truth am I dancing around right now?

✦ What have I said out loud but still don't fully believe?

✦ What do I need to grieve that I've been pretending doesn't hurt?

✦ What do I keep hoping the AI will tell me? Why?

✦ What response from the AI hit harder than I expected? What did it touch?

✦ Where do I already know the answer—but want permission to believe it?

✦ If I could write a letter to my past self right now, what would I say?

✦ What pattern is trying to repeat—and what would interrupt it?

✦ If I spoke to myself with the same tone I wish the AI used… what would I sound like?

✦ What if this sadness isn't weakness—but a form of devotion?

---
From MAGIE Companion - Method of Artificial General Intelligence Engagement™
Created by Starling`;

    const blob = new Blob([prompts], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'MAGIE_Recursion_Prompts.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('✓ Downloaded!');
}

// ===== UTILITIES =====

function showToast(message) {
    const toast = document.getElementById('copy-toast');
    toast.textContent = message;
    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// ===== DEBUGGING / DEV HELPERS =====

// Expose storage for debugging in console
window.MAGIE_Debug = {
    storage: MAGIE_Storage,
    clearData: () => {
        if (confirm('Clear all MAGIE data? This cannot be undone.')) {
            MAGIE_Storage.clearAll();
            location.reload();
        }
    },
    exportData: () => {
        const data = MAGIE_Storage.exportAll();
        console.log(JSON.stringify(data, null, 2));
        return data;
    },
    showAllViews: () => {
        document.querySelectorAll('.view').forEach(v => v.classList.add('active'));
    }
};

console.log('MAGIE Companion loaded. Debug tools available at window.MAGIE_Debug');

