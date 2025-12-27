// --- IMPORTAÇÕES DO FIREBASE (Via CDN) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// ==========================================
// 1. CONFIGURAÇÃO (COLE SUAS CHAVES AQUI)
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

// Configuração da API do Gemini e Calendar
const API_CONFIG = {
    GEMINI_API_KEY: "SUA_CHAVE_GEMINI_AQUI", 
    CALENDAR_EMBED_URL: "https://calendar.google.com/calendar/embed?src=seu_email%40gmail.com&ctz=America%2FSao_Paulo" 
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ==========================================
// 2. ESTADO E LÓGICA (AGORA NA NUVEM)
// ==========================================

const State = {
    projects: [], // Começa vazio, será preenchido pelo Firebase
    activeProjectId: null,

    // Salvar agora envia para a nuvem
    save() { 
        // Envia a lista inteira de projetos para o caminho 'projects/' no banco
        set(ref(db, 'projects'), this.projects)
        .catch(error => console.error("Erro ao salvar no Firebase:", error));
    },
    
    // Load agora é automático (Realtime Listener)
    listen() {
        const projectRef = ref(db, 'projects');
        // Essa função roda SEMPRE que algo mudar no banco de dados (no PC ou Celular)
        onValue(projectRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                this.projects = data;
                // Se não tiver projeto ativo, pega o primeiro
                if (!this.activeProjectId && this.projects.length > 0) {
                    this.activeProjectId = this.projects[0].id;
                }
                // Atualiza a interface toda vez que dados chegarem
                App.refreshUI(); 
            } else {
                // Se o banco estiver vazio (primeira vez), cria um exemplo
                this.projects = [{ 
                    id: 1, title: "Primeiro Projeto", 
                    steps: [{ text: "Configurar Firebase", done: true }], 
                    notes: ["Bem vindo ao Space OS na Nuvem!"] 
                }];
                this.save();
            }
        });
    }
};

const App = {
    currentView: 'dashboard', // Guarda onde o usuário está
    saveTimeout: null, // <--- ADICIONE ISSO AQUI (Variável para controlar o tempo)

    init() {
        // Inicia a escuta do banco de dados
        State.listen();
        this.setupCalendar();
        this.navigate('dashboard');
    },

    // Função auxiliar para atualizar tudo quando os dados mudam
    refreshUI() {
        // CORREÇÃO DO BUG DO TECLADO:
        // Se o usuário estiver digitando nas anotações, NÃO redesenhe a tela agora.
        // Isso evita que o campo seja destruído e o teclado feche.
        if (document.activeElement && document.activeElement.id === 'notes-editor') {
            console.log("Usuário digitando... ignorando atualização de tela.");
            return;
        }

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
        const hour = new Date().getHours();
        let greeting = hour >= 18 ? "Boa noite" : hour >= 12 ? "Boa tarde" : "Bom dia";
        
        const greetingEl = document.getElementById('dash-greeting');
        if(greetingEl) greetingEl.innerText = `${greeting}, Comandante`;

        const totalProjects = State.projects.length;
        let totalDone = 0;
        let totalPending = 0;

        State.projects.forEach(p => {
            if(p.steps) {
                p.steps.forEach(step => step.done ? totalDone++ : totalPending++);
            }
        });

        const elProj = document.getElementById('stat-projects');
        const elDone = document.getElementById('stat-completed');
        const elPend = document.getElementById('stat-pending');

        if(elProj) elProj.innerText = totalProjects;
        if(elDone) elDone.innerText = totalDone;
        if(elPend) elPend.innerText = totalPending;
    },

    createNewProject() {
        const name = prompt("Nome do novo projeto:");
        if(name) {
            const newProj = {
                id: Date.now(),
                title: name,
                steps: [],
                notes: ["Início do projeto..."]
            };
            State.projects.push(newProj);
            State.save(); // Salva no Firebase
            // Não precisa chamar renderSidebar, o onValue fará isso automático
            this.navigate('project', newProj.id);
        }
    },

    renderProjectView(id) {
        const project = State.projects.find(p => p.id === id);
        if(!project) return;

        const container = document.getElementById('view-project');
        // Garante que steps e notes existam (proteção contra dados vazios)
        const steps = project.steps || [];
        const notes = project.notes || [];

        const completed = steps.filter(s => s.done).length;
        const total = steps.length || 1; 
        const progress = Math.round((completed / total) * 100);

        container.innerHTML = `
            <div style="max-width: 900px; margin: 0 auto;">
                <input class="project-title" value="${project.title}" onchange="App.updateTitle(this.value)">
                
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
                    ${notes.join('<br>') || "Comece a escrever aqui..."}
                </div>
            </div>
        `;

        const stepList = container.querySelector('#step-list');
        steps.forEach((step, index) => {
            const el = document.createElement('div');
            el.className = 'step-item';
            el.innerHTML = `
                <input type="checkbox" class="step-check" ${step.done ? 'checked' : ''}>
                <span class="step-text ${step.done ? 'done' : ''}">${step.text}</span>
                <i class="ph ph-trash" style="margin-left:auto; color:#faa; cursor:pointer" onclick="App.deleteStep(${index})"></i>
            `;
            el.querySelector('input').addEventListener('change', () => {
                step.done = !step.done;
                State.save(); // Salva no Firebase
            });
            stepList.appendChild(el);
        });
    },

    updateTitle(val) {
        const p = State.projects.find(proj => proj.id === State.activeProjectId);
        if(p) {
            p.title = val;
            State.save();
        }
    },

    addStep() {
        const text = prompt("Nova etapa:");
        if(text) {
            const p = State.projects.find(proj => proj.id === State.activeProjectId);
            if(!p.steps) p.steps = [];
            p.steps.push({ text, done: false });
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
            // 1. Atualiza a memória local IMEDIATAMENTE (para não perder o que digitou)
            p.notes = [editor.innerHTML];

            // 2. Agenda o salvamento na nuvem para daqui a 1.5 segundos
            // Se você digitar de novo antes disso, o timer reinicia.
            if (this.saveTimeout) clearTimeout(this.saveTimeout);
            
            this.saveTimeout = setTimeout(() => {
                State.save(); // Só envia para o Firebase quando você parar de digitar
                console.log("Salvo na nuvem!");
            }, 1500);
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

        if (!API_CONFIG.GEMINI_API_KEY || API_CONFIG.GEMINI_API_KEY.length < 10) {
            this.addBubble("⚠️ Erro: API Key inválida.", 'ai');
            return;
        }

        const loadingId = this.addBubble("Buscando modelo...", 'ai', true);

        try {
            if (!this.selectedModel) {
                // ... Lógica simplificada de busca de modelo ...
                const listResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_CONFIG.GEMINI_API_KEY}`);
                const listData = await listResponse.json();
                const models = listData.models || [];
                let bestModel = models.find(m => m.name.toLowerCase().includes('gemini') && m.name.toLowerCase().includes('flash'));
                if (!bestModel) bestModel = models.find(m => m.name.toLowerCase().includes('gemini'));
                
                this.selectedModel = bestModel ? bestModel.name.replace('models/', '') : 'gemini-1.5-flash';
            }

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.selectedModel}:generateContent?key=${API_CONFIG.GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ contents: [{ parts: [{ text: text }] }] })
            });

            const data = await response.json();
            if (data.candidates && data.candidates.length > 0) {
                document.getElementById(loadingId).remove();
                this.addBubble(data.candidates[0].content.parts[0].text, 'ai');
            } else {
                throw new Error("Sem resposta");
            }

        } catch (error) {
            if(document.getElementById(loadingId)) document.getElementById(loadingId).remove();
            this.addBubble(`Erro: ${error.message}`, 'ai');
        }
    },

    addBubble(text, type, isLoading = false) {
        const history = document.getElementById('chat-history');
        const div = document.createElement('div');
        div.className = `message msg-${type}`;
        div.id = isLoading ? 'loading-msg' : 'msg-' + Date.now();
        
        const senderName = type === 'ai' ? '✨ Gemini' : '👤 Você';
        let htmlContent = `<div style="font-size:11px; margin-bottom:5px; opacity:0.7; font-weight:bold">${senderName}</div>`;

        if (type === 'ai' && !isLoading) {
            htmlContent += `<div class="markdown-body">${marked.parse(text)}</div>`;
        } else {
            htmlContent += `<div>${text.replace(/\n/g, '<br>')}</div>`;
        }
        
        div.innerHTML = htmlContent;
        history.appendChild(div);
        history.scrollTop = history.scrollHeight;
        return div.id;
    }
};

// ==========================================
// EXPONDO PARA O HTML (IMPORTANTE!)
// ==========================================
// Como agora usamos module, as variáveis não são globais por padrão.
// Precisamos anexá-las à janela para que o onclick="" do HTML funcione.
window.App = App;
window.Chat = Chat;
window.State = State;

// Inicia
App.init();