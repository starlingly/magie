/* ===== MAGIE Companion - Main Application ===== */

// Initialize app on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Check if returning user
    if (MAGIE_Storage.isOnboardingComplete() && MAGIE_Storage.hasPrimer()) {
        showDashboard();
    } else {
        showView('view-landing');
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
}

function nextStep(viewId) {
    showView(viewId);
}

function startJourney() {
    showView('view-welcome');
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
}

// ===== PRIMER WIZARD =====

function nextPrimerSection(sectionName) {
    // Save current section data first
    saveCurrentPrimerSection();

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

function saveCurrentPrimerSection() {
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

    MAGIE_Storage.savePrimer(updates);
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

function completePrimer() {
    // Save final section
    saveCurrentPrimerSection();

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
            'ChatGPT': '<a href="https://chat.openai.com" target="_blank">chat.openai.com →</a>',
            'Gemini': '<a href="https://gemini.google.com" target="_blank">gemini.google.com →</a>',
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
    const sessionCount = MAGIE_Storage.getSessionCount();
    const daysPracticing = MAGIE_Storage.getDaysPracticing();

    // Update dashboard data
    if (primer && primer.name) {
        document.getElementById('dashboard-name').textContent = primer.name;
    }
    document.getElementById('total-sessions').textContent = sessionCount;
    document.getElementById('days-practicing').textContent = daysPracticing;

    showView('view-dashboard');
}

function startSession() {
    // Load primer data if editing
    loadPrimerData();

    // Show session prep
    const primer = MAGIE_Storage.getPrimer();

    if (confirm('Ready to start your session?\n\nMake sure you have your Primer ready to paste into your AI.')) {
        setupFirstSession();
        showView('view-first-session');

        // Log session start
        MAGIE_Storage.addSession({
            type: 'session',
            note: 'Session started'
        });
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

// ===== BREATHING EXERCISE =====

let breathingInterval = null;
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

    // Alternate instruction
    const instruction = document.getElementById('breath-instruction');
    let phase = 0;

    const breathePhases = setInterval(() => {
        phase++;
        if (phase === 1) {
            instruction.textContent = 'Breathe In';
        } else if (phase === 2) {
            instruction.textContent = 'Hold';
        } else if (phase === 3) {
            instruction.textContent = 'Breathe Out';
        } else if (phase === 4) {
            instruction.textContent = 'Hold';
            clearInterval(breathePhases);
        }
    }, 2000);
}

function closeBreathing() {
    document.getElementById('breathing-modal').classList.add('hidden');
    if (breathingInterval) {
        clearInterval(breathingInterval);
        breathingInterval = null;
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
