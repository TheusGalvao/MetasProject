// ==========================================
// ÁREA DE CONFIGURAÇÃO DE API
// ==========================================
const API_CONFIG = {
    // Sua chave API (Cuidado ao compartilhar este arquivo!)
    GEMINI_API_KEY: "AIzaSyDT5jfv27i7jbaKWWW0rtRemSHdQGKKod0", 
    
    // Configuração do Calendário
    CALENDAR_EMBED_URL: "https://calendar.google.com/calendar/embed?src=matheusgalvao2203%40gmail.com&ctz=America%2FSao_Paulo" 
};

// ==========================================
// LÓGICA DO SISTEMA
// ==========================================

const State = {
    projects: [
        { 
            id: 1, 
            title: "Fazer Bolo", 
            steps: [
                { text: "Comprar Ovos", done: true },
                { text: "Assar", done: false }
            ],
            notes: ["Receita da avó..."]
        }
    ],
    activeProjectId: 1,
    
    save() { localStorage.setItem('space_os', JSON.stringify(this.projects)); },
    load() { 
        const data = localStorage.getItem('space_os');
        if(data) this.projects = JSON.parse(data);
    }
};

const App = {
    init() {
        State.load();
        this.renderSidebar();
        // MUDANÇA: Inicia na Dashboard em vez do projeto 1
        this.navigate('dashboard'); 
        this.setupCalendar();
    },

    navigate(viewName, projectId = null) {
        // Esconde todas as views (incluindo a nova dashboard)
        ['view-dashboard', 'view-project', 'view-chat', 'view-calendar'].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.classList.add('hidden');
        });

        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

        // Lógica de Roteamento
        if (viewName === 'dashboard') {
            this.renderDashboard(); // Calcula estatísticas
            document.getElementById('view-dashboard').classList.remove('hidden');
        } 
        else if (viewName === 'project' && projectId) {
            State.activeProjectId = projectId;
            this.renderProjectView(projectId);
            document.getElementById('view-project').classList.remove('hidden');
        } 
        else if (viewName === 'chat') {
            document.getElementById('view-chat').classList.remove('hidden');
        } 
        else if (viewName === 'calendar') {
            document.getElementById('view-calendar').classList.remove('hidden');
        }
    },
    renderDashboard() {
        // 1. Saudação baseada na hora
        const hour = new Date().getHours();
        let greeting = "Bom dia";
        if (hour >= 12) greeting = "Boa tarde";
        if (hour >= 18) greeting = "Boa noite";
        document.getElementById('dash-greeting').innerText = `${greeting}, Gestor`;

        // 2. Cálculos Estatísticos
        const totalProjects = State.projects.length;
        let totalDone = 0;
        let totalPending = 0;

        State.projects.forEach(p => {
            p.steps.forEach(step => {
                if(step.done) totalDone++;
                else totalPending++;
            });
        });

        // 3. Atualiza na tela
        // Animação simples de números
        document.getElementById('stat-projects').innerText = totalProjects;
        document.getElementById('stat-completed').innerText = totalDone;
        document.getElementById('stat-pending').innerText = totalPending;
    },

    renderSidebar() {
        const list = document.getElementById('project-list');
        list.innerHTML = '';
        State.projects.forEach(p => {
            const div = document.createElement('div');
            div.className = `nav-item ${p.id === State.activeProjectId ? 'active' : ''}`;
            div.innerHTML = `<i class="ph ph-check-square"></i> ${p.title}`;
            div.onclick = () => App.navigate('project', p.id);
            list.appendChild(div);
        });
    },

    createNewProject() {
        const name = prompt("Nome do novo projeto:");
        if(name) {
            const newProj = {
                id: Date.now(),
                title: name,
                steps: [],
                notes: []
            };
            State.projects.push(newProj);
            State.save();
            this.renderSidebar();
            this.navigate('project', newProj.id);
        }
    },

    renderProjectView(id) {
        const project = State.projects.find(p => p.id === id);
        if(!project) return;

        const container = document.getElementById('view-project');
        const completed = project.steps.filter(s => s.done).length;
        const total = project.steps.length || 1; 
        const progress = Math.round((completed / total) * 100);

        container.innerHTML = `
            <div style="max-width: 900px; margin: 0 auto;">
                <input class="project-title" value="${project.title}" oninput="App.updateTitle(this.value)">
                
                <div class="progress-card">
                    <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:600; text-transform:uppercase; color:#999">
                        <span>Progresso</span> <span>${progress}%</span>
                    </div>
                    <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
                    
                    <div id="step-list" style="margin-top: 20px;"></div>
                    <div class="nav-item" onclick="App.addStep()" style="margin-top:15px; color:#888">
                        <i class="ph ph-plus"></i> Adicionar etapa
                    </div>
                </div>

                <h3>Anotações</h3>
                <div id="notes-editor" contenteditable="true" style="outline:none; line-height:1.6" oninput="App.saveNotes(this)">
                    ${project.notes.join('<br>') || "Comece a escrever aqui..."}
                </div>
            </div>
        `;

        const stepList = container.querySelector('#step-list');
        project.steps.forEach((step, index) => {
            const el = document.createElement('div');
            el.className = 'step-item';
            el.innerHTML = `
                <input type="checkbox" class="step-check" ${step.done ? 'checked' : ''}>
                <span class="step-text ${step.done ? 'done' : ''}">${step.text}</span>
            `;
            el.querySelector('input').addEventListener('change', () => {
                step.done = !step.done;
                State.save();
                App.renderProjectView(id); 
            });
            stepList.appendChild(el);
        });
    },

    updateTitle(val) {
        const p = State.projects.find(proj => proj.id === State.activeProjectId);
        p.title = val;
        State.save();
        this.renderSidebar(); 
    },

    addStep() {
        const text = prompt("Nova etapa:");
        if(text) {
            const p = State.projects.find(proj => proj.id === State.activeProjectId);
            p.steps.push({ text, done: false });
            State.save();
            this.renderProjectView(p.id);
        }
    },

    saveNotes(editor) {
        const p = State.projects.find(proj => proj.id === State.activeProjectId);
        p.notes = [editor.innerHTML];
        State.save();
    },

    setupCalendar() {
        if (API_CONFIG.CALENDAR_EMBED_URL) {
            const area = document.getElementById('calendar-embed-area');
            area.innerHTML = `<iframe src="${API_CONFIG.CALENDAR_EMBED_URL}" style="border: 0" width="100%" height="100%" frameborder="0" scrolling="no"></iframe>`;
        }
    }
};

const Chat = {
    selectedModel: null,

    async send() {
        const input = document.getElementById('chat-input');
        const text = input.value;
        if(!text) return;

        this.addBubble(text, 'user');
        input.value = '';

        if (!API_CONFIG.GEMINI_API_KEY || API_CONFIG.GEMINI_API_KEY.length < 10) {
            this.addBubble("⚠️ Erro: API Key inválida.", 'ai');
            return;
        }

        const loadingId = this.addBubble("Buscando modelo...", 'ai', true);

        try {
            // FASE 1: DESCOBERTA DO MODELO
            if (!this.selectedModel) {
                const listResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_CONFIG.GEMINI_API_KEY}`);
                const listData = await listResponse.json();
                const models = listData.models || [];
                
                // Lógica de seleção inteligente
                let bestModel = models.find(m => m.name.toLowerCase().includes('gemini') && m.name.toLowerCase().includes('flash'));
                if (!bestModel) bestModel = models.find(m => m.name.toLowerCase().includes('gemini') && m.name.toLowerCase().includes('pro'));
                if (!bestModel) bestModel = models.find(m => m.name.toLowerCase().includes('gemini'));

                if (bestModel) {
                    this.selectedModel = bestModel.name.replace('models/', '');
                    console.log("✅ Modelo:", this.selectedModel);
                } else {
                    this.selectedModel = 'gemini-1.5-flash';
                }
            }

            // FASE 2: ENVIO
            const loadingEl = document.getElementById(loadingId);
            if(loadingEl) loadingEl.innerHTML = `<div style="font-size:11px; margin-bottom:5px; opacity:0.7; font-weight:bold">✨ Gemini</div> Pensando...`;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.selectedModel}:generateContent?key=${API_CONFIG.GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ contents: [{ parts: [{ text: text }] }] })
            });

            const data = await response.json();

            if (data.candidates && data.candidates.length > 0) {
                const aiResponse = data.candidates[0].content.parts[0].text;
                document.getElementById(loadingId).remove();
                this.addBubble(aiResponse, 'ai');
            } else {
                throw new Error("Sem resposta de texto");
            }

        } catch (error) {
            if(document.getElementById(loadingId)) document.getElementById(loadingId).remove();
            this.addBubble(`Erro: ${error.message}`, 'ai');
        }
    },

    // --- AQUI ESTÁ A CORREÇÃO DE FORMATAÇÃO ---
    addBubble(text, type, isLoading = false) {
        const history = document.getElementById('chat-history');
        const div = document.createElement('div');
        div.className = `message msg-${type}`;
        div.id = isLoading ? 'loading-msg' : 'msg-' + Date.now();
        
        const senderName = type === 'ai' ? '✨ Gemini' : '👤 Você';
        let htmlContent = `<div style="font-size:11px; margin-bottom:5px; opacity:0.7; font-weight:bold">${senderName}</div>`;

        if (type === 'ai' && !isLoading) {
            // USA MARKED PARA FORMATAR (Negrito, Listas, etc)
            htmlContent += `<div class="markdown-body">${marked.parse(text)}</div>`;
        } else {
            // Texto simples para usuário ou loading
            htmlContent += `<div>${text.replace(/\n/g, '<br>')}</div>`;
        }
        
        div.innerHTML = htmlContent;
        history.appendChild(div);
        history.scrollTop = history.scrollHeight;
        return div.id;
    }
};

// Start
App.init();