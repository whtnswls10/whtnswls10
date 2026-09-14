// ==========================================
// MathVerse - AI Math Tutor Chatbot (MathBot)
// ==========================================

(function() {
  'use strict';

  // State Management
  let isOpen = false;
  let isLoading = false;
  let messages = []; // [{ role: 'user'|'assistant', content: '...' }]
  let customApiKey = sessionStorage.getItem('mathverse_custom_api_key') || '';

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
          <button id="math-chat-settings-btn" class="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors" title="API 설정">
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

      <!-- Inline API Key Modal (for testing without server env) -->
      <div id="math-chat-api-modal" class="chat-api-modal hidden">
        <div class="chat-api-modal-content glass-panel-lg">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <i data-lucide="key" class="w-4 h-4 text-amber-400"></i>
              <h4 class="text-xs font-bold text-white">OpenAI API 설정 안내</h4>
            </div>
            <button type="button" id="close-api-modal-btn" class="text-slate-400 hover:text-white">
              <i data-lucide="x" class="w-4 h-4"></i>
            </button>
          </div>
          <p class="text-[11px] text-slate-300 mb-3 leading-relaxed">
            Vercel 배포 시 환경 변수 <code>OPENAI_API_KEY</code>를 등록해두셨다면 별도 입력 없이 자동 연동됩니다.<br/>
            로컬 프리뷰에서 바로 테스트하시려면 브라우저 세션용 API 키를 아래에 입력할 수 있습니다 (서버에 저장되지 않음).
          </p>
          <input 
            type="password" 
            id="modal-custom-api-key" 
            placeholder="sk-..." 
            class="glass-input w-full text-xs py-2 px-3 mb-3 font-mono"
            value="${escapeHtml(customApiKey)}"
          />
          <div class="flex items-center justify-end gap-2">
            <button type="button" id="clear-custom-key-btn" class="glass-btn text-[11px] py-1 px-3">
              초기화
            </button>
            <button type="button" id="save-custom-key-btn" class="glass-btn glass-btn-primary text-[11px] py-1 px-3">
              저장
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
      apiModal.classList.toggle('hidden');
    });
    closeApiModalBtn.addEventListener('click', () => {
      apiModal.classList.add('hidden');
    });
    saveCustomKeyBtn.addEventListener('click', () => {
      customApiKey = (customKeyInput.value || '').trim();
      sessionStorage.setItem('mathverse_custom_api_key', customApiKey);
      apiModal.classList.add('hidden');
      alert(customApiKey ? 'API 키가 임시 저장되었습니다.' : 'API 키 설정이 비워졌습니다.');
    });
    clearCustomKeyBtn.addEventListener('click', () => {
      customApiKey = '';
      customKeyInput.value = '';
      sessionStorage.removeItem('mathverse_custom_api_key');
      alert('세션 키가 삭제되었습니다. 서버 환경변수를 기본으로 사용합니다.');
    });

    // Global keyboard shortcut Ctrl + J or Alt + M to open chatbot
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        toggleChat();
      }
    });
  }

  // Check server configuration
  async function checkServerConfig() {
    try {
      const res = await fetch('/api/chat');
      if (res.ok) {
        const data = await res.json();
        if (data.configured) {
          statusBadge.innerHTML = `
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>API 연동 완료 (${data.model || 'gpt-4o-mini'})</span>
          `;
        } else {
          statusBadge.innerHTML = `
            <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span>Vercel 키 설정 대기중</span>
          `;
        }
      }
    } catch (e) {
      // Local preview without serverless function
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

      // Prepare headers
      const headers = { 'Content-Type': 'application/json' };
      if (customApiKey) {
        headers['x-openai-key'] = customApiKey;
      }

      // Try serverless endpoint first
      let res = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: messages.slice(-8),
          question: text
        })
      }).catch(err => ({ ok: false, status: 0, error: err }));

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          answerText = data.answer;
        } else {
          answerText = `⚠️ **안내**: ${data.message || '답변을 가져오지 못했습니다.'}\n\nVercel 대시보드의 **Settings -> Environment Variables**에서 \`OPENAI_API_KEY\`가 올바르게 등록되어 있는지 확인해 주세요.`;
        }
      } else if (customApiKey) {
        // Direct Client fallback if customApiKey is provided (useful for local static preview)
        answerText = await callDirectOpenAI(text, messages);
      } else {
        answerText = `💡 **안내**: 로컬 정적 프리뷰 파일(\`file://\`)로 열려 있거나 서버리스 엔드포인트에 접속할 수 없습니다.\n\n- **Vercel에 배포된 환경**에서는 등록하신 \`OPENAI_API_KEY\` 환경변수를 통해 정상 동작합니다.\n- 지금 로컬 브라우저에서 바로 테스트하시려면 상단 오른쪽 **설정(⚙️)** 버튼을 눌러 OpenAI API 키를 임시 입력해 주세요.`;
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
        content: `❌ 오류가 발생했습니다: ${err.message || '네트워크 연결 상태를 확인해 주세요.'}`
      });
    } finally {
      isLoading = false;
      sendBtn.disabled = false;
      chatInput.focus();
    }
  }

  // Direct client OpenAI fallback for purely static local testing
  async function callDirectOpenAI(text, history) {
    const systemPrompt = `당신은 초·중·고등학생을 위한 친절하고 명쾌한 AI 수학 전문 튜터 '매쓰봇'입니다.
수학 개념, 원리, 문제 접근법을 단계별로 알기 쉽게 설명하세요.
모든 수학 기호와 수식은 반드시 LaTeX($...$, $$...$$)로 작성하세요.`;

    const chatHistory = [{ role: 'system', content: systemPrompt }].concat(
      history.slice(-8).map(m => ({ role: m.role, content: m.content }))
    );

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: chatHistory,
        temperature: 0.6
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${res.status}`);
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
      msgEl.innerHTML = `
        <div class="bot-avatar">
          <i data-lucide="bot" class="w-4 h-4 text-indigo-400"></i>
        </div>
        <div class="bot-bubble-wrap">
          <div class="bot-bubble-header">
            <span class="bot-name">매쓰봇</span>
            <span class="bubble-time">${timeString}</span>
          </div>
          <div class="bot-bubble markdown-body">${parseMarkdownAndMath(msg.content)}</div>
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
    ask: function(question) {
      openChat();
      if (chatInput) {
        chatInput.value = question;
        handleSend();
      }
    }
  };

})();
