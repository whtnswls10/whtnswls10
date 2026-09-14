// ==========================================
// MathVerse - AI Math Tutor Chatbot (MathBot)
// ==========================================

(function() {
  'use strict';

  // State Management
  let isOpen = false;
  let isLoading = false;
  let messages = []; // [{ role: 'user'|'assistant', content: '...' }]
  let pendingQuestion = ''; // Holds the user question to retry once key is provided

  // Retrieve API Key with multi-stage priority fallback
  function getEffectiveApiKey() {
    // 1. config.js file (window.MATHVERSE_CONFIG.OPENAI_API_KEY)
    if (window.MATHVERSE_CONFIG && window.MATHVERSE_CONFIG.OPENAI_API_KEY) {
      return window.MATHVERSE_CONFIG.OPENAI_API_KEY.trim();
    }
    // 2. localStorage (persistent across browser sessions)
    const localKey = localStorage.getItem('mathverse_openai_api_key');
    if (localKey && localKey.trim()) {
      return localKey.trim();
    }
    // 3. sessionStorage (fallback)
    const sessionKey = sessionStorage.getItem('mathverse_custom_api_key');
    if (sessionKey && sessionKey.trim()) {
      return sessionKey.trim();
    }
    return '';
  }

  function saveEffectiveApiKey(key) {
    const cleanKey = (key || '').trim();
    if (cleanKey) {
      localStorage.setItem('mathverse_openai_api_key', cleanKey);
      sessionStorage.setItem('mathverse_custom_api_key', cleanKey);
    } else {
      localStorage.removeItem('mathverse_openai_api_key');
      sessionStorage.removeItem('mathverse_custom_api_key');
    }
    updateStatusBadge();
  }

  // DOM Elements cache
  let floatingBtn = null;
  let chatPanel = null;
  let chatBody = null;
  let chatInput = null;
  let sendBtn = null;
  let statusBadge = null;

  // Initial welcome message
  const WELCOME_MESSAGE = `안녕하세요! 👋 저는 수학 탐구를 돕는 AI 수학 전문 튜터 **매쓰봇(MathBot)**입니다.

수학 공부를 하다 막히는 공식, 문제 풀이 접근법, 증명 원리 등 무엇이든 편하게 물어보세요!
- 📐 "원의 방정식 표준형과 일반형의 차이가 뭐야?"
- 📈 "이차방정식 근의 공식은 어떻게 유도해?"
- 🚀 "지진 삼각측량에서 원의 방정식이 어떻게 쓰여?"
- ♾️ "미분계수의 기하학적 의미를 쉽게 설명해줘"

아래 추천 질문을 누르거나 직접 질문을 입력해 보세요!`;

  // Quick preset questions
  const PRESET_QUESTIONS = [
    "원의 방정식 표준형과 일반형 차이점",
    "근의 공식 유도 과정 쉽게 설명해줘",
    "원과 직선의 위치관계 판별법 2가지",
    "지진 관측소 삼각측량 원리",
    "피타고라스 정리 증명 3가지",
    "미분과 적분의 관계는?"
  ];

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    buildChatInterface();
    attachEventListeners();
    renderInitialMessage();
    updateStatusBadge();
    checkServerConfig();
  });

  // 1. Build & Inject Chat UI into DOM
  function buildChatInterface() {
    // Floating Trigger Button
    floatingBtn = document.createElement('button');
    floatingBtn.id = 'math-chat-trigger-btn';
    floatingBtn.className = 'math-chat-trigger';
    floatingBtn.setAttribute('aria-label', 'AI 수학 튜터 열기');
    floatingBtn.innerHTML = `
      <div class="chat-trigger-glow"></div>
      <div class="chat-trigger-icon-wrap">
        <i data-lucide="sparkles" class="trigger-sparkle-icon"></i>
        <i data-lucide="bot" class="trigger-bot-icon"></i>
      </div>
      <span class="chat-trigger-label">AI 수학 튜터</span>
      <span class="chat-trigger-badge">질문하기</span>
    `;

    // Chat Panel
    chatPanel = document.createElement('div');
    chatPanel.id = 'math-chat-panel';
    chatPanel.className = 'math-chat-panel glass-panel-lg';
    chatPanel.innerHTML = `
      <!-- Header -->
      <div class="chat-header">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[1.5px] shadow-md shadow-indigo-500/30 flex-shrink-0">
            <div class="w-full h-full rounded-[10px] bg-[#0c101c] flex items-center justify-center">
              <i data-lucide="bot" class="w-5 h-5 text-indigo-400"></i>
            </div>
          </div>
          <div class="flex flex-col">
            <div class="flex items-center gap-2">
              <h3 class="text-sm font-bold text-white tracking-wide">MathBot AI 튜터</h3>
              <span id="math-chat-status" class="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>OpenAI gpt-4o-mini</span>
              </span>
            </div>
            <p class="text-[11px] text-slate-400">개념 설명 · 단계별 풀이 · LaTeX 수식 시각화</p>
          </div>
        </div>

        <div class="flex items-center gap-1">
          <!-- Reset Chat Button -->
          <button id="math-chat-clear-btn" class="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors" title="대화 초기화">
            <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
          </button>
          <!-- Settings Button (Local Key fallback) -->
          <button id="math-chat-settings-btn" class="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors" title="API 키 설정">
            <i data-lucide="settings-2" class="w-4 h-4"></i>
          </button>
          <!-- Close Button -->
          <button id="math-chat-close-btn" class="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors" title="닫기">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>
      </div>

      <!-- Quick Preset Suggestions Bar -->
      <div class="chat-presets-container">
        <div class="chat-presets-scroll" id="math-chat-presets">
          ${PRESET_QUESTIONS.map(q => `
            <button class="chat-preset-chip" data-question="${escapeHtml(q)}">
              <i data-lucide="help-circle" class="w-3 h-3 text-indigo-400"></i>
              <span>${escapeHtml(q)}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Messages Stream Body -->
      <div class="chat-body" id="math-chat-body"></div>

      <!-- Input Bar -->
      <div class="chat-footer">
        <form id="math-chat-form" class="relative flex items-end gap-2">
          <textarea 
            id="math-chat-input" 
            rows="1" 
            placeholder="수학 질문을 입력하세요... (Enter: 전송, Shift+Enter: 줄바꿈)" 
            class="chat-input-textarea"
          ></textarea>
          <button type="submit" id="math-chat-send-btn" class="chat-send-button" title="전송">
            <i data-lucide="send" class="w-4 h-4"></i>
          </button>
        </form>
        <div class="chat-footer-caption">
          <span>LaTeX 수식($E=mc^2$) 자동 렌더링 지원 · 초·중·고 교육과정 연계</span>
        </div>
      </div>

      <!-- Inline API Key Modal -->
      <div id="math-chat-api-modal" class="chat-api-modal hidden">
        <div class="chat-api-modal-content glass-panel-lg">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <i data-lucide="key" class="w-4 h-4 text-amber-400"></i>
              <h4 class="text-xs font-bold text-white">OpenAI API 설정</h4>
            </div>
            <button type="button" id="close-api-modal-btn" class="text-slate-400 hover:text-white">
              <i data-lucide="x" class="w-4 h-4"></i>
            </button>
          </div>
          <p class="text-[11px] text-slate-300 mb-2 leading-relaxed">
            - <strong>Vercel 배포 사이트</strong>: Vercel 환경변수 <code>OPENAI_API_KEY</code>로 자동 동작합니다.<br/>
            - <strong>로컬 프리뷰(file://)</strong>: 브라우저에 API 키를 저장하면 로컬에서도 즉시 질문할 수 있습니다 (로컬 브라우저에만 보관됨).
          </p>
          <input 
            type="password" 
            id="modal-custom-api-key" 
            placeholder="sk-..." 
            class="glass-input w-full text-xs py-2 px-3 mb-3 font-mono"
          />
          <div class="flex items-center justify-between gap-2">
            <button type="button" id="clear-custom-key-btn" class="glass-btn text-[11px] py-1 px-3 text-rose-300 hover:bg-rose-500/20">
              키 삭제
            </button>
            <button type="button" id="save-custom-key-btn" class="glass-btn glass-btn-primary text-[11px] py-1 px-4">
              저장 및 적용
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(floatingBtn);
    document.body.appendChild(chatPanel);

    // Cache elements
    chatBody = document.getElementById('math-chat-body');
    chatInput = document.getElementById('math-chat-input');
    sendBtn = document.getElementById('math-chat-send-btn');
    statusBadge = document.getElementById('math-chat-status');

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // 2. Attach Event Handlers
  function attachEventListeners() {
    // Open / Close toggle
    floatingBtn.addEventListener('click', toggleChat);
    document.getElementById('math-chat-close-btn').addEventListener('click', closeChat);

    // Top Navigation trigger link support
    document.querySelectorAll('[data-action="open-math-chat"]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        openChat();
      });
    });

    // Form submit
    const form = document.getElementById('math-chat-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleSend();
    });

    // Enter to submit, Shift+Enter for newline
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });

    // Auto-expand textarea
    chatInput.addEventListener('input', () => {
      chatInput.style.height = 'auto';
      chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
    });

    // Preset questions
    const presetContainer = document.getElementById('math-chat-presets');
    if (presetContainer) {
      presetContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.chat-preset-chip');
        if (btn) {
          const q = btn.dataset.question;
          chatInput.value = q;
          handleSend();
        }
      });
    }

    // Reset Chat
    document.getElementById('math-chat-clear-btn').addEventListener('click', () => {
      if (confirm('대화 내용을 모두 초기화할까요?')) {
        messages = [];
        chatBody.innerHTML = '';
        renderInitialMessage();
      }
    });

    // API Key modal
    const settingsBtn = document.getElementById('math-chat-settings-btn');
    const apiModal = document.getElementById('math-chat-api-modal');
    const closeApiModalBtn = document.getElementById('close-api-modal-btn');
    const saveCustomKeyBtn = document.getElementById('save-custom-key-btn');
    const clearCustomKeyBtn = document.getElementById('clear-custom-key-btn');
    const customKeyInput = document.getElementById('modal-custom-api-key');

    settingsBtn.addEventListener('click', () => {
      customKeyInput.value = getEffectiveApiKey();
      apiModal.classList.toggle('hidden');
    });
    closeApiModalBtn.addEventListener('click', () => {
      apiModal.classList.add('hidden');
    });
    saveCustomKeyBtn.addEventListener('click', () => {
      const key = (customKeyInput.value || '').trim();
      saveEffectiveApiKey(key);
      apiModal.classList.add('hidden');
      alert(key ? '✅ API 키가 저장되었습니다! 이제 로컬에서도 정상 질문하실 수 있습니다.' : 'API 키가 삭제되었습니다.');
      
      // Auto-retry pending question if exists
      if (key && pendingQuestion) {
        const q = pendingQuestion;
        pendingQuestion = '';
        chatInput.value = q;
        handleSend();
      }
    });
    clearCustomKeyBtn.addEventListener('click', () => {
      saveEffectiveApiKey('');
      customKeyInput.value = '';
      alert('저장된 API 키가 삭제되었습니다.');
    });

    // Delegate inline key submission inside chat messages
    chatBody.addEventListener('click', (e) => {
      const target = e.target.closest('[data-action="save-inline-key"]');
      if (target) {
        const wrap = target.closest('.inline-key-card');
        if (wrap) {
          const input = wrap.querySelector('.inline-key-input');
          const key = (input ? input.value : '').trim();
          if (!key) {
            alert('OpenAI API 키 (sk-...)를 입력해 주세요.');
            return;
          }
          saveEffectiveApiKey(key);
          wrap.innerHTML = `<div class="text-xs text-emerald-300 font-semibold py-2">✅ API 키가 성공적으로 저장되었습니다! 질문을 처리합니다...</div>`;
          
          // Re-trigger the pending question
          if (pendingQuestion) {
            const q = pendingQuestion;
            pendingQuestion = '';
            setTimeout(() => {
              chatInput.value = q;
              handleSend();
            }, 300);
          }
        }
      }
    });

    // Global keyboard shortcut Ctrl + J or Alt + M to open chatbot
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        toggleChat();
      }
    });
  }

  // Update Status Badge UI
  function updateStatusBadge() {
    if (!statusBadge) return;
    const currentKey = getEffectiveApiKey();
    const isLocalFile = window.location.protocol === 'file:';

    if (currentKey) {
      statusBadge.innerHTML = `
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        <span>연동 완료 (gpt-4o-mini)</span>
      `;
      statusBadge.className = "px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1";
    } else if (isLocalFile) {
      statusBadge.innerHTML = `
        <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
        <span>로컬 모드 (키 입력 대기)</span>
      `;
      statusBadge.className = "px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 cursor-pointer";
      statusBadge.onclick = () => {
        document.getElementById('math-chat-settings-btn').click();
      };
    } else {
      statusBadge.innerHTML = `
        <span class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
        <span>Vercel Serverless</span>
      `;
    }
  }

  // Check server configuration (for hosted Vercel environment)
  async function checkServerConfig() {
    if (window.location.protocol === 'file:') return;

    try {
      const res = await fetch('/api/chat');
      if (res.ok) {
        const data = await res.json();
        if (data.configured) {
          statusBadge.innerHTML = `
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Vercel 연동됨 (${data.model || 'gpt-4o-mini'})</span>
          `;
          statusBadge.className = "px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1";
        }
      }
    } catch (e) {
      // Offline / local preview fallback
    }
  }

  function toggleChat() {
    if (isOpen) {
      closeChat();
    } else {
      openChat();
    }
  }

  function openChat() {
    isOpen = true;
    chatPanel.classList.add('open');
    floatingBtn.classList.add('active');
    setTimeout(() => {
      chatInput.focus();
    }, 200);
  }

  function closeChat() {
    isOpen = false;
    chatPanel.classList.remove('open');
    floatingBtn.classList.remove('active');
  }

  // 3. Render Initial Welcome Message
  function renderInitialMessage() {
    appendMessage({
      role: 'assistant',
      content: WELCOME_MESSAGE
    });
  }

  // 4. Handle Send Message
  async function handleSend() {
    if (isLoading) return;
    const text = (chatInput.value || '').trim();
    if (!text) return;

    const effectiveKey = getEffectiveApiKey();
    const isLocalFile = window.location.protocol === 'file:';

    // Reset input
    chatInput.value = '';
    chatInput.style.height = 'auto';

    // Add user message
    const userMsg = { role: 'user', content: text };
    messages.push(userMsg);
    appendMessage(userMsg);

    // Show typing indicator
    isLoading = true;
    sendBtn.disabled = true;
    const typingIndicator = showTypingIndicator();

    try {
      let answerText = '';

      // CASE 1: If an effective local API key is already set, call OpenAI directly
      // (This guarantees 100% smooth operation on file:// without needing any backend server)
      if (effectiveKey) {
        answerText = await callDirectOpenAI(text, messages, effectiveKey);
      } 
      // CASE 2: Try Vercel Serverless Function (/api/chat)
      else if (!isLocalFile) {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: messages.slice(-8),
            question: text
          })
        }).catch(() => null);

        if (res && res.ok) {
          const data = await res.json();
          if (data.success) {
            answerText = data.answer;
          } else {
            answerText = `⚠️ **Vercel API 안내**: ${data.message || 'API 키를 확인해 주세요.'}`;
          }
        } else {
          // If hosted but /api/chat failed or unconfigured
          pendingQuestion = text;
          answerText = buildInlineKeyPromptHtml();
        }
      } 
      // CASE 3: Running locally on file:// without key yet
      else {
        pendingQuestion = text;
        answerText = buildInlineKeyPromptHtml();
      }

      // Remove typing indicator
      typingIndicator.remove();

      // Add assistant message
      const assistantMsg = { role: 'assistant', content: answerText };
      messages.push(assistantMsg);
      appendMessage(assistantMsg);

    } catch (err) {
      typingIndicator.remove();
      appendMessage({
        role: 'assistant',
        content: `❌ **오류가 발생했습니다**: ${err.message || '네트워크 연결 상태나 API 키를 확인해 주세요.'}`
      });
    } finally {
      isLoading = false;
      sendBtn.disabled = false;
      chatInput.focus();
    }
  }

  // HTML prompt when running locally without a key configured
  function buildInlineKeyPromptHtml() {
    return `💡 **로컬 환경(file://) 실행 안내**

현재 Vercel 웹 서버가 아닌 **내 컴퓨터의 로컬 파일(\`file://\`)**로 열려 있어, Vercel 클라우드에 등록된 \`OPENAI_API_KEY\` 환경변수에 브라우저가 직접 접근할 수 없습니다.

아래 방법 중 **하나**를 선택하시면 즉시 정상 작동합니다:

<div class="inline-key-card p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 my-2">
  <div class="text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">
    <span>🔑 1초 만에 로컬 키 등록 (추천)</span>
  </div>
  <p class="text-[11px] text-slate-300 mb-2">
    여기에 API 키를 붙여넣으시면 브라우저에 안전하게 저장되어 다음부터는 다시 묻지 않고 바로 답변합니다:
  </p>
  <div class="flex items-center gap-2">
    <input 
      type="password" 
      placeholder="sk-proj-... 또는 sk-..." 
      class="inline-key-input glass-input w-full text-xs py-1.5 px-3 font-mono"
    />
    <button type="button" data-action="save-inline-key" class="glass-btn glass-btn-primary text-xs py-1.5 px-3 whitespace-nowrap shadow-md shadow-purple-500/20">
      저장 및 답변받기
    </button>
  </div>
</div>

<div class="flex items-center gap-2 mt-2 pt-1 border-t border-white/10 text-[11px] text-slate-400">
  <span>또는:</span>
  <a href="https://github.com/whtnswls10/whtnswls10" target="_blank" class="text-purple-300 hover:text-white underline">
    GitHub 레포지토리
  </a>
  <span>에 연동된 Vercel 배포 URL로 접속하시면 환경변수로 바로 동작합니다.</span>
</div>`;
  }

  // Direct client OpenAI call
  async function callDirectOpenAI(text, history, apiKey) {
    const systemPrompt = `당신은 초·중·고등학생을 위한 따뜻하고 친절하며 명쾌한 AI 수학 전문 튜터 '매쓰봇(MathBot)'입니다.
다음 지침을 철저히 따라 학생의 질문에 답변하세요:

1. **교육적 접근 & 태도**:
   - 학생의 질문에 대해 바로 기계적인 정답만 내놓지 말고, 핵심 원리와 단계별(Step-by-step) 풀이 과정을 알기 쉽게 설명해 주세요.
   - 친절하고 격려하는 어조(해요체, 존댓말)를 사용하며, 칭찬을 아끼지 마세요.
   - 필요하다면 직관적인 비유나 시각화 조언을 덧붙여 주세요.

2. **수식 표기 규칙 (가장 중요)**:
   - 모든 수학 기호, 변수, 방정식, 수식은 반드시 LaTeX 문법을 사용하세요.
   - 문장 속 인라인 수식: $y = ax^2 + bx + c$, $(x-a)^2 + (y-b)^2 = r^2$, $\\frac{a}{b}$, $\\sqrt{x}$
   - 독립된 블록 수식:
     $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

3. **답변 구성**:
   - 💡 **핵심 개념**: 공식 정의나 핵심 포인트
   - 🔍 **단계별 풀이 / 원리 설명**: 논리적 흐름
   - 📐 **직관적 팁 또는 기억법**: 쉽게 기억하는 방법`;

    const chatHistory = [{ role: 'system', content: systemPrompt }].concat(
      history.slice(-8).map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: String(m.content || '')
      }))
    );

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: chatHistory,
        temperature: 0.6,
        max_tokens: 1500
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      if (res.status === 401) {
        saveEffectiveApiKey(''); // Clear invalid key
        throw new Error('입력하신 OpenAI API 키가 올바르지 않습니다. 키를 다시 확인해 주세요.');
      }
      throw new Error(err.error?.message || `HTTP ${res.status}: OpenAI API 호출 실패`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || '답변을 생성하지 못했습니다.';
  }

  // 5. Append Message to UI & Render LaTeX
  function appendMessage(msg) {
    const isUser = msg.role === 'user';
    const msgEl = document.createElement('div');
    msgEl.className = `chat-message-row ${isUser ? 'user-row' : 'bot-row'}`;

    const timeString = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

    if (isUser) {
      msgEl.innerHTML = `
        <div class="user-bubble-wrap">
          <div class="user-bubble">${escapeHtml(msg.content).replace(/\n/g, '<br/>')}</div>
          <span class="bubble-time">${timeString}</span>
        </div>
      `;
    } else {
      const isHtmlContent = msg.content.includes('<div class="inline-key-card');
      const renderedBody = isHtmlContent ? msg.content : parseMarkdownAndMath(msg.content);

      msgEl.innerHTML = `
        <div class="bot-avatar">
          <i data-lucide="bot" class="w-4 h-4 text-indigo-400"></i>
        </div>
        <div class="bot-bubble-wrap">
          <div class="bot-bubble-header">
            <span class="bot-name">매쓰봇</span>
            <span class="bubble-time">${timeString}</span>
          </div>
          <div class="bot-bubble markdown-body">${renderedBody}</div>
          ${!isHtmlContent ? `
            <div class="bot-bubble-actions">
              <button class="copy-btn" title="답변 복사" data-content="${escapeHtml(msg.content)}">
                <i data-lucide="copy" class="w-3 h-3"></i>
                <span>복사</span>
              </button>
              <button class="speak-btn" title="음성으로 듣기" data-content="${escapeHtml(msg.content)}">
                <i data-lucide="volume-2" class="w-3 h-3"></i>
                <span>읽기</span>
              </button>
            </div>
          ` : ''}
        </div>
      `;
    }

    chatBody.appendChild(msgEl);

    // Apply KaTeX Math rendering if available
    renderMath(msgEl);

    // Refresh Lucide icons
    if (window.lucide) {
      window.lucide.createIcons({ root: msgEl });
    }

    // Attach copy and speech events
    if (!isUser) {
      const copyBtn = msgEl.querySelector('.copy-btn');
      if (copyBtn) {
        copyBtn.addEventListener('click', () => {
          const raw = copyBtn.dataset.content;
          navigator.clipboard.writeText(raw).then(() => {
            copyBtn.innerHTML = `<i data-lucide="check" class="w-3 h-3 text-emerald-400"></i><span class="text-emerald-300">완료!</span>`;
            if (window.lucide) window.lucide.createIcons({ root: copyBtn });
            setTimeout(() => {
              copyBtn.innerHTML = `<i data-lucide="copy" class="w-3 h-3"></i><span>복사</span>`;
              if (window.lucide) window.lucide.createIcons({ root: copyBtn });
            }, 2000);
          });
        });
      }

      const speakBtn = msgEl.querySelector('.speak-btn');
      if (speakBtn && 'speechSynthesis' in window) {
        speakBtn.addEventListener('click', () => {
          window.speechSynthesis.cancel();
          const cleanText = msg.content
            .replace(/\$\$[\s\S]*?\$\$/g, '수식 생략')
            .replace(/\$([^\$]+)\$/g, '$1')
            .replace(/[#*`_~]/g, '');
          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.lang = 'ko-KR';
          utterance.rate = 1.0;
          window.speechSynthesis.speak(utterance);
        });
      }
    }

    // Scroll to bottom
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  // 6. Typing Indicator
  function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'chat-message-row bot-row typing-indicator-row';
    indicator.innerHTML = `
      <div class="bot-avatar">
        <i data-lucide="bot" class="w-4 h-4 text-indigo-400"></i>
      </div>
      <div class="typing-bubble">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="text-xs text-indigo-300 ml-2">선생님이 수학 원리를 생각하고 있어요...</span>
      </div>
    `;
    chatBody.appendChild(indicator);
    if (window.lucide) window.lucide.createIcons({ root: indicator });
    chatBody.scrollTop = chatBody.scrollHeight;
    return indicator;
  }

  // 7. Render KaTeX Math Expressions
  function renderMath(element) {
    if (window.renderMathInElement) {
      try {
        window.renderMathInElement(element, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\[', right: '\\]', display: true },
            { left: '\\(', right: '\\)', display: false }
          ],
          throwOnError: false
        });
      } catch (e) {
        console.warn('KaTeX rendering error:', e);
      }
    }
  }

  // 8. Simple Markdown Parser with Math Protection
  function parseMarkdownAndMath(text) {
    if (!text) return '';

    // Step 1: Temporarily protect Math blocks ($$...$$ and $...$)
    const mathPlaceholders = [];
    let protectedText = text;

    // Display math $$...$$
    protectedText = protectedText.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
      const idx = mathPlaceholders.length;
      mathPlaceholders.push(`$$${formula}$$`);
      return `@@MATH_BLOCK_${idx}@@`;
    });

    // Inline math $...$
    protectedText = protectedText.replace(/\$([^\$\n]+?)\$/g, (match, formula) => {
      const idx = mathPlaceholders.length;
      mathPlaceholders.push(`$${formula}$`);
      return `@@MATH_INLINE_${idx}@@`;
    });

    // Step 2: Basic HTML escaping
    let html = escapeHtml(protectedText);

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h4 class="text-indigo-300 font-bold text-sm mt-3 mb-1">$1</h4>');
    html = html.replace(/^## (.*$)/gim, '<h3 class="text-white font-bold text-base mt-3 mb-1.5 border-b border-white/10 pb-1">$1</h3>');
    html = html.replace(/^# (.*$)/gim, '<h2 class="text-white font-extrabold text-lg mt-4 mb-2">$1</h2>');

    // Bold & Italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-amber-200 font-semibold">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em class="text-indigo-200">$1</em>');

    // Bullet points
    html = html.replace(/^\s*[-*]\s+(.*$)/gim, '<li class="ml-4 list-disc text-slate-200 my-0.5">$1</li>');

    // Numbered lists
    html = html.replace(/^\s*(\d+)\.\s+(.*$)/gim, '<li class="ml-4 list-decimal text-slate-200 my-0.5"><span class="font-medium text-indigo-300">$1.</span> $2</li>');

    // Code blocks & inline code
    html = html.replace(/```([a-z]*)\n([\s\S]*?)```/gim, '<pre class="my-2 p-2.5 rounded-lg bg-black/50 border border-white/10 font-mono text-xs overflow-x-auto text-indigo-200"><code>$2</code></pre>');
    html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-white/10 text-cyan-300 font-mono text-xs">$1</code>');

    // Line breaks
    html = html.replace(/\n\n/g, '<p class="my-2"></p>');
    html = html.replace(/\n/g, '<br/>');

    // Step 3: Restore Math blocks
    mathPlaceholders.forEach((math, idx) => {
      html = html.replace(`@@MATH_BLOCK_${idx}@@`, math);
      html = html.replace(`@@MATH_INLINE_${idx}@@`, math);
    });

    return html;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Expose global controller for buttons elsewhere on the page
  window.MathBot = {
    open: openChat,
    close: closeChat,
    toggle: toggleChat,
    setApiKey: saveEffectiveApiKey,
    ask: function(question) {
      openChat();
      if (chatInput) {
        chatInput.value = question;
        handleSend();
      }
    }
  };

})();
