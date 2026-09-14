// ==========================================
// MathVerse - AI Math Tutor Chatbot (MathBot)
// Powered by Vercel Serverless Function & OpenAI
// ==========================================

(function() {
  'use strict';

  // State Management
  let isOpen = false;
  let isLoading = false;
  let messages = []; // [{ role: 'user'|'assistant', content: '...' }]

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
    checkVercelApiStatus();
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
                <span>Vercel AI (gpt-4o-mini)</span>
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
          <span>LaTeX 수식($E=mc^2$) 자동 렌더링 지원 · Vercel 환경변수(OPENAI_API_KEY) 연동</span>
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

    // Global keyboard shortcut Ctrl + J to open chatbot
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        toggleChat();
      }
    });
  }

  // 3. Check Vercel API Status
  async function checkVercelApiStatus() {
    if (window.location.protocol === 'file:') {
      if (statusBadge) {
        statusBadge.innerHTML = `
          <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          <span>Vercel 배포 실행 모드</span>
        `;
      }
      return;
    }

    try {
      const res = await fetch('/api/chat');
      if (res.ok) {
        const data = await res.json();
        if (data.configured && statusBadge) {
          statusBadge.innerHTML = `
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Vercel 연결됨 (${data.model || 'gpt-4o-mini'})</span>
          `;
          statusBadge.className = "px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1";
        }
      }
    } catch (e) {
      // Ignore network errors on initial check
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

  // 4. Render Initial Welcome Message
  function renderInitialMessage() {
    appendMessage({
      role: 'assistant',
      content: WELCOME_MESSAGE
    });
  }

  // 5. Handle Send Message (Calls Vercel /api/chat)
  async function handleSend() {
    if (isLoading) return;
    const text = (chatInput.value || '').trim();
    if (!text) return;

    // If opened via local file:// protocol
    if (window.location.protocol === 'file:') {
      chatInput.value = '';
      chatInput.style.height = 'auto';

      appendMessage({ role: 'user', content: text });
      appendMessage({
        role: 'assistant',
        content: `🚀 **안내**: 본 AI 수학 챗봇은 **Vercel 배포 환경**에서 환경변수(\`OPENAI_API_KEY\`)로 안전하게 구동됩니다.\n\nGitHub에 푸시된 레포지토리와 연동된 **Vercel 웹사이트 URL(https://...vercel.app)**에 접속하시면 등록해 두신 환경변수로 즉시 100% 정상 작동합니다!`
      });
      return;
    }

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
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: messages.slice(-8),
          question: text
        })
      });

      typingIndicator.remove();

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `서버 응답 오류 (HTTP ${res.status})`);
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || '답변을 생성하지 못했습니다.');
      }

      const assistantMsg = { role: 'assistant', content: data.answer };
      messages.push(assistantMsg);
      appendMessage(assistantMsg);

    } catch (err) {
      if (typingIndicator) typingIndicator.remove();
      appendMessage({
        role: 'assistant',
        content: `⚠️ **Vercel AI 오류**: ${err.message || '요청 처리 중 문제가 발생했습니다.'}\n\nVercel 대시보드(Settings -> Environment Variables)에 \`OPENAI_API_KEY\`가 등록되어 있는지 확인해 주세요.`
      });
    } finally {
      isLoading = false;
      sendBtn.disabled = false;
      chatInput.focus();
    }
  }

  // 6. Append Message to UI & Render LaTeX
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

  // 7. Typing Indicator
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

  // 8. Render KaTeX Math Expressions
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

  // 9. Markdown Parser with Math Protection
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

  // Global controller
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
