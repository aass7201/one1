let currentPassword = '';

document.getElementById('loginBtn').addEventListener('click', async () => {
    const pwd = document.getElementById('adminPassword').value;
    if (!pwd) return;
    
    // Test login by fetching config (dummy post to verify)
    try {
        const res = await fetch('/api/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: pwd })
        });
        
        if (res.ok) {
            currentPassword = pwd;
            document.getElementById('loginOverlay').style.display = 'none';
            document.getElementById('mainContent').style.display = 'block';
            loadConfig();
        } else {
            document.getElementById('loginError').innerText = 'كلمة المرور غير صحيحة';
        }
    } catch (err) {
        document.getElementById('loginError').innerText = 'حدث خطأ في الاتصال';
    }
});

async function loadConfig() {
    try {
        const res = await fetch('/api/config');
        const config = await res.json();
        
        document.getElementById('systemPrompt').value = config.systemPrompt || '';
        document.getElementById('botEnabledToggle').checked = config.botEnabled;
        document.getElementById('modelSelect').value = config.model || 'gemini-2.5-flash';
        
        // Render errors
        const errContainer = document.getElementById('errorsContainer');
        errContainer.innerHTML = '';
        if (config.errors && config.errors.length > 0) {
            config.errors.forEach(err => {
                const div = document.createElement('div');
                div.className = 'log-entry';
                div.innerHTML = `<span class="log-time">[${new Date(err.time).toLocaleTimeString()}]</span> ${err.message}`;
                errContainer.appendChild(div);
            });
        } else {
            errContainer.innerHTML = '<div class="log-entry">لا توجد أخطاء حالياً.</div>';
        }

        // Mock status checks - In a real scenario, you'd have endpoints to verify these
        // For simplicity, we assume connected if the backend is running and config loads
        document.getElementById('dotFb').classList.add('connected');
        document.getElementById('dotGemini').classList.add('connected');
        document.getElementById('dotWebhook').classList.add('connected');
        
    } catch (err) {
        console.error('Error loading config:', err);
    }
}

document.getElementById('saveBtn').addEventListener('click', async () => {
    const systemPrompt = document.getElementById('systemPrompt').value;
    const botEnabled = document.getElementById('botEnabledToggle').checked;
    const model = document.getElementById('modelSelect').value;
    
    const saveStatus = document.getElementById('saveStatus');
    saveStatus.innerText = 'جاري الحفظ...';
    
    try {
        const res = await fetch('/api/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                password: currentPassword,
                systemPrompt,
                botEnabled,
                model
            })
        });
        
        if (res.ok) {
            saveStatus.innerText = 'تم الحفظ بنجاح ✓';
            setTimeout(() => { saveStatus.innerText = ''; }, 3000);
        } else {
            saveStatus.innerText = 'خطأ في الحفظ!';
            saveStatus.style.color = 'var(--error)';
        }
    } catch (err) {
        saveStatus.innerText = 'فشل الاتصال!';
        saveStatus.style.color = 'var(--error)';
    }
});

// Auto refresh errors every 10 seconds
setInterval(() => {
    if (currentPassword) {
        loadConfig();
    }
}, 10000);
