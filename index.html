// --- IMPORTAÇÕES DO FIREBASE ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ==========================================
// 1. CONFIGURAÇÃO
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyDCWSTDEHHdPFeRHiBQYB-cbIzFLwBKOW0",
    authDomain: "space-os-b74c6.firebaseapp.com",
    databaseURL: "https://space-os-b74c6-default-rtdb.firebaseio.com",
    projectId: "space-os-b74c6",
    storageBucket: "space-os-b74c6.firebasestorage.app",
    messagingSenderId: "159368423472",
    appId: "1:159368423472:web:6401932f64edc49cc1e5f5"
};

const API_CONFIG = {
    // ⚠️ COLOQUE SUA CHAVE GEMINI AQUI
    GEMINI_API_KEY: "SUA_CHAVE_GEMINI_AQUI", 
    CALENDAR_EMBED_URL: "https://calendar.google.com/calendar/embed?src=seu_email%40gmail.com&ctz=America%2FSao_Paulo" 
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ==========================================
// 2. PWA (INSTALAÇÃO)
// ==========================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .catch(err => console.log('Falha no SW:', err));
    });
}

// ==========================================
// 3. ESTADO GLOBAL
// ==========================================
const State = {
    user: null,
    projects: [],
    activeProjectId: null,

    save() { 
        if (!this.user) return;
        set(ref(db, `users/${this.user.uid}/projects`), this.projects)
        .catch(error => console.error("Erro ao salvar:", error));
    },
    
    listen() {
        if (!this.user) return;
        const projectRef = ref(db, `users/${this.user.uid}/projects`);
        onValue(projectRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                this.projects = data;
                if (this.activeProjectId && !this.projects.find(p => p.id === this.activeProjectId)) {
                    this.activeProjectId = null;
                }
                App.refreshUI(); 
            } else {
                this.projects = [];
                App.refreshUI();
            }
        });
    }
};

// ==========================================
// 4. LÓGICA DO APP
// ==========================================
const App = {
    currentView: 'dashboard', 
    saveTimeout: null,
    lastRenderedId: null,
    draggedItemIndex: null, // Controle do Drag & Drop

    // Checagem de versão automática (via GitHub Actions)
    async checkSystemVersion() {
        try {
            const response = await fetch('./version.json?t=' + new Date().getTime());
            if (!response.ok) throw new Error("Versão não encontrada");
            const data = await response.json();
            console.log("Versão:", data.version);
            
            // Se você criar um elemento no HTML com id="app-version", ele preenche
            const versionEl = document.getElementById('app-version');
            if (versionEl) {
                versionEl.innerText = `Space OS ${data.version}`;
                versionEl.title = `Build: ${data.build} | Data: ${data.date}`;
            }
        } catch (error) {
            console.warn("Modo Dev (sem version.json)");
        }
    },

    init() {
        // Monitora Login
        onAuthStateChanged(auth, (user) => {
            if (user) {
                State.user = user;
                document.getElementById('login-screen').style.display = 'none';
                State.listen();
                this.setupCalendar();
                this.checkSystemVersion(); // Checa versão ao logar
                this.navigate('dashboard');
            } else {
                State.user = null;
                State.projects = [];
                document.getElementById('login-screen').style.display = 'flex';
            }
        });
    },

    login() { signInWithPopup(auth, provider).catch((error) => alert("Erro: " + error.message)); },
    logout() { signOut(auth).then(() => window.location.reload()); },

    refreshUI() {
        // Proteção de Foco (Evita fechar teclado mobile)
        if (document.activeElement && (document.activeElement.id === 'notes-editor' || document.activeElement.classList.contains('step-input'))) return;

        this.renderSidebar();
        if (this.currentView === 'dashboard') this.renderDashboard();
        if (this.currentView === 'project') this.renderProjectView(State.activeProjectId);
    },

    navigate(viewName, projectId = null) {
        this.currentView = viewName;
        ['view-dashboard', 'view-project', 'view-chat', 'view-calendar'].forEach(id => 
            document.getElementById(id).classList.add('hidden')
        );
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

        if (viewName === 'dashboard') {
            this.renderDashboard();
            document.getElementById('view-dashboard').classList.remove('hidden');
        } else if (viewName === 'project' && projectId) {
            State.activeProjectId = projectId;
            this.renderProjectView(projectId);
            document.getElementById('view-project').classList.remove('hidden');
        } else if (viewName === 'chat') {
            document.getElementById('view-chat').classList.remove('hidden');
        } else if (viewName === 'calendar') {
            document.getElementById('view-calendar').classList.remove('hidden');
        }
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

    renderDashboard() {
        const userName = State.user ? State.user.displayName.split(" ")[0] : "Viajante";
        const hour = new Date().getHours();
        let greeting = hour >= 18 ? "Boa noite" : hour >= 12 ? "Boa tarde" : "Bom dia";
        
        const greetingEl = document.getElementById('dash-greeting');
        if(greetingEl) greetingEl.innerText = `${greeting}, ${userName}`;

        const totalProjects = State.projects.length;
        let totalDone = 0;
        State.projects.forEach(p => {
            if(p.steps) p.steps.forEach(step => { if(step.done) totalDone++; });
        });

        const elProj = document.getElementById('stat-projects');
        const elDone = document.getElementById('stat-completed');
        
        if(elProj) elProj.innerText = totalProjects;
        if(elDone) elDone.innerText = totalDone;
    },

    createNewProject() {
        const name = prompt("Nome do novo projeto:");
        if(name) {
            const newProj = { id: Date.now(), title: name, steps: [], notes: ["Início do projeto..."] };
            State.projects.push(newProj);
            State.save();
            this.navigate('project', newProj.id);
        }
    },

    renderProjectView(id) {
        const project = State.projects.find(p => p.id === id);
        if(!project) return;

        const container = document.getElementById('view-project');
        const steps = project.steps || [];
        const notes = project.notes || [];
        const completed = steps.filter(s => s.done).length;
        const total = steps.length || 1; 
        const progress = Math.round((completed / total) * 100);

        const existingEditor = document.getElementById('notes-editor');
        const isSameProject = this.lastRenderedId === id;
        this.lastRenderedId = id;

        // Lógica Cirúrgica: Se já existe, atualiza partes. Se não, desenha tudo.
        if (!existingEditor || !isSameProject) {
            container.innerHTML = `
                <div style="max-width: 900px; margin: 0 auto;">
                    <input class="project-title" id="proj-title-input" value="${project.title}" oninput="App.updateTitle(this.value)">
                    <div class="progress-card">
                        <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:600; text-transform:uppercase; color:#999">
                            <span>Progresso</span> <span id="progress-text">${progress}%</span>
                        </div>
                        <div class="progress-bar"><div class="progress-fill" id="progress-fill" style="width:${progress}%"></div></div>
                        <div id="step-list" style="margin-top: 20px;"></div>
                        <div class="nav-item" onclick="App.addStep()" style="margin-top:15px; color:#888">
                            <i class="ph ph-plus"></i> Adicionar etapa
                        </div>
                    </div>
                    <h3>Anotações</h3>
                    <div id="notes-editor" contenteditable="true" style="outline:none; line-height:1.6; min-height:100px;" oninput="App.saveNotes(this)">
                        ${notes.join('<br>') || "Escreva aqui..."}
                    </div>
                </div>
            `;
            this.renderStepsList(steps);
        } else {
            // Atualização Parcial
            const titleInput = document.getElementById('proj-title-input');
            if (document.activeElement !== titleInput) titleInput.value = project.title;

            document.getElementById('progress-text').innerText = `${progress}%`;
            document.getElementById('progress-fill').style.width = `${progress}%`;

            this.renderStepsList(steps);

            if (document.activeElement !== existingEditor) {
                const newContent = notes.join('<br>') || "Escreva aqui...";
                if (existingEditor.innerHTML !== newContent) existingEditor.innerHTML = newContent;
            }
        }
    },

    // --- RENDERIZAÇÃO DA LISTA (Com Drag & Drop e Edição) ---
    renderStepsList(steps) {
        const stepList = document.getElementById('step-list');
        stepList.innerHTML = '';
        
        steps.forEach((step, index) => {
            // Cores das Datas
            let dateStyle = "color:#999;";
            if(step.date) {
                const today = new Date().toISOString().split('T')[0];
                if(step.date < today && !step.done) dateStyle = "color:#e53e3e; font-weight:bold;";
                else if(step.date === today && !step.done) dateStyle = "color:#d69e2e; font-weight:bold;";
            }

            const el = document.createElement('div');
            el.className = 'step-item';
            el.setAttribute('draggable', 'true'); // Permite arrastar
            el.dataset.index = index;

            el.innerHTML = `
                <div class="drag-handle"><i class="ph ph-dots-six-vertical"></i></div>
                <input type="checkbox" class="step-check" ${step.done ? 'checked' : ''} style="cursor:pointer">
                
                <input type="text" class="step-input ${step.done ? 'done' : ''}" 
                       value="${step.text}" 
                       onchange="App.updateStepText(${index}, this.value)">
                
                <input type="date" value="${step.date || ''}" 
                       style="border:none; background:transparent; font-size:12px; margin-right:10px; cursor:pointer; ${dateStyle}"
                       onchange="App.updateStepDate(${index}, this.value)">

                <i class="ph ph-trash" style="color:#faa; cursor:pointer" onclick="App.deleteStep(${index})"></i>
            `;
            
            // Listeners
            el.querySelector('.step-check').addEventListener('change', () => {
                step.done = !step.done;
                State.save(); 
            });

            // Drag Events
            el.addEventListener('dragstart', (e) => App.dragStart(e, index));
            el.addEventListener('dragover', (e) => App.dragOver(e));
            el.addEventListener('drop', (e) => App.drop(e, index));
            
            stepList.appendChild(el);
        });
    },

    // --- MANIPULAÇÃO DE DADOS ---
    updateStepText(index, newText) {
        const p = State.projects.find(proj => proj.id === State.activeProjectId);
        if(p && p.steps[index]) { p.steps[index].text = newText; State.save(); }
    },

    updateStepDate(index, newDate) {
        const p = State.projects.find(proj => proj.id === State.activeProjectId);
        if(p && p.steps[index]) { p.steps[index].date = newDate; State.save(); }
    },

    // Funções de Drag and Drop
    dragStart(e, index) {
        this.draggedItemIndex = index;
        e.dataTransfer.effectAllowed = 'move';
        e.target.classList.add('dragging');
    },

    dragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        return false;
    },

    drop(e, targetIndex) {
        e.stopPropagation();
        const p = State.projects.find(proj => proj.id === State.activeProjectId);
        if (p && this.draggedItemIndex !== null && this.draggedItemIndex !== targetIndex) {
            const item = p.steps.splice(this.draggedItemIndex, 1)[0];
            p.steps.splice(targetIndex, 0, item);
            State.save();
        }
        document.querySelectorAll('.step-item').forEach(el => el.classList.remove('dragging'));
        this.draggedItemIndex = null;
        return false;
    },

    // Outros Updates
    updateTitle(val) {
        const p = State.projects.find(proj => proj.id === State.activeProjectId);
        if(p) { p.title = val; State.save(); }
    },
    addStep() {
        const text = prompt("Nova etapa:");
        if(text) {
            const p = State.projects.find(proj => proj.id === State.activeProjectId);
            if(!p.steps) p.steps = [];
            p.steps.push({ text, done: false, date: "" });
            State.save();
        }
    },
    deleteStep(index) {
        if(confirm("Remover esta etapa?")) {
            const p = State.projects.find(proj => proj.id === State.activeProjectId);
            p.steps.splice(index, 1);
            State.save();
        }
    },
    saveNotes(editor) {
        const p = State.projects.find(proj => proj.id === State.activeProjectId);
        if(p) {
            p.notes = [editor.innerHTML];
            if (this.saveTimeout) clearTimeout(this.saveTimeout);
            this.saveTimeout = setTimeout(() => { State.save(); }, 1500);
        }
    },
    setupCalendar() {
        if (API_CONFIG.CALENDAR_EMBED_URL) {
            const area = document.getElementById('calendar-embed-area');
            if(area) area.innerHTML = `<iframe src="${API_CONFIG.CALENDAR_EMBED_URL}" style="border: 0" width="100%" height="100%" frameborder="0" scrolling="no"></iframe>`;
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

        if (!API_CONFIG.GEMINI_API_KEY) { this.addBubble("⚠️ Configure sua API Key.", 'ai'); return; }
        const loadingId = this.addBubble("Pensando...", 'ai', true);

        // Contexto Inteligente
        let contextPrompt = "";
        if (State.activeProjectId) {
            const p = State.projects.find(proj => proj.id === State.activeProjectId);
            if (p) {
                const cleanNotes = (p.notes || []).join(" ").replace(/<[^>]*>?/gm, '');
                const stepsList = (p.steps || []).map(s => `- ${s.text} (${s.done ? 'Feito' : 'Pendente'})`).join("\n");
                contextPrompt = `CONTEXTO: Projeto "${p.title}".\nNOTAS: "${cleanNotes}".\nETAPAS:\n${stepsList}\nPERGUNTA: ${text}`;
            }
        } else { contextPrompt = text; }

        try {
            if (!this.selectedModel) {
                const listResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_CONFIG.GEMINI_API_KEY}`);
                const listData = await listResponse.json();
                const models = listData.models || [];
                let bestModel = models.find(m => m.name.includes('flash')) || models.find(m => m.name.includes('gemini'));
                this.selectedModel = bestModel ? bestModel.name.replace('models/', '') : 'gemini-1.5-flash';
            }
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.selectedModel}:generateContent?key=${API_CONFIG.GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ contents: [{ parts: [{ text: contextPrompt }] }] })
            });
            const data = await response.json();
            document.getElementById(loadingId).remove();
            if(data.candidates) this.addBubble(data.candidates[0].content.parts[0].text, 'ai');
        } catch (error) {
            if(document.getElementById(loadingId)) document.getElementById(loadingId).remove();
            this.addBubble("Erro: " + error.message, 'ai');
        }
    },
    addBubble(text, type, isLoading = false) {
        const history = document.getElementById('chat-history');
        const div = document.createElement('div');
        div.className = `message msg-${type}`;
        div.id = isLoading ? 'loading-msg' : 'msg-' + Date.now();
        const name = type === 'ai' ? '✨ Gemini' : '👤 Você';
        let content = `<div style="font-size:11px; margin-bottom:5px; opacity:0.7; font-weight:bold">${name}</div>`;
        content += type === 'ai' && !isLoading ? `<div class="markdown-body">${marked.parse(text)}</div>` : `<div>${text.replace(/\n/g, '<br>')}</div>`;
        div.innerHTML = content;
        history.appendChild(div);
        history.scrollTop = history.scrollHeight;
        return div.id;
    }
};

window.App = App;
window.Chat = Chat;
window.State = State;
App.init();