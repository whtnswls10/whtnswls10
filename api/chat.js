// Vercel Serverless Function: /api/chat
// OpenAI Chat Completions API Integration for MathVerse AI Math Tutor

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. Check and Sanitize API Key from Environment Variables
  // Handles cases where the key was accidentally pasted multiple times or contains newlines (\r, \n)
  let rawKey = process.env.OPENAI_API_KEY || req.headers['x-openai-key'] || '';
  if (typeof rawKey !== 'string') {
    rawKey = String(rawKey);
  }
  rawKey = rawKey.trim();

  // Extract a pure, valid single-line OpenAI key pattern (sk-...)
  let apiKey = '';
  const keyMatch = rawKey.match(/sk-[A-Za-z0-9_\-]+/);
  if (keyMatch) {
    apiKey = keyMatch[0].trim();
  } else if (rawKey) {
    // Fallback: take first line and strip invalid HTTP header characters
    apiKey = rawKey.split(/[\r\n]+/)[0].replace(/["'\s\r\n]/g, '').trim();
  }

  // Status check endpoint (GET)
  if (req.method === 'GET') {
    return res.status(200).json({
      configured: Boolean(apiKey),
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      provider: 'OpenAI Chat Completions API',
      message: apiKey
        ? 'OpenAI API key is configured and ready.'
        : 'OPENAI_API_KEY environment variable is not configured yet.'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed. Use POST.' });
  }

  if (!apiKey) {
    return res.status(500).json({
      success: false,
      error: 'OPENAI_API_KEY_MISSING',
      message: '서버에 올바른 형식의 OPENAI_API_KEY 환경변수가 감지되지 않았습니다. Vercel 대시보드의 Settings -> Environment Variables에서 등록해 주세요.'
    });
  }

  try {
    const { messages, question, topic } = req.body || {};

    if (!messages && !question) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_REQUEST',
        message: '질문(question) 또는 대화 기록(messages)이 누락되었습니다.'
      });
    }

    // System prompt tailored for empathetic, pedagogical math tutoring
    const systemPrompt = `당신은 초·중·고등학생을 위한 따뜻하고 친절하며 명쾌한 AI 수학 전문 튜터 '매쓰봇(MathBot)'입니다.
다음 지침을 철저히 따라 학생의 질문에 답변하세요:

1. **교육적 접근 & 태도**:
   - 학생의 질문에 대해 바로 기계적인 정답만 내놓지 말고, 핵심 원리와 단계별(Step-by-step) 사고 과정을 알기 쉽게 설명해 주세요.
   - 친절하고 격려하는 어조(해요체, 존댓말)를 사용하며, 학생의 호기심을 칭찬해 주세요.
   - 필요하다면 실생활 속 직관적인 예시나 그래프/도형의 시각적 형태를 머릿속에 그릴 수 있도록 설명해 주세요.

2. **수식 표기 규칙 (가장 중요)**:
   - 모든 수학 기호, 변수, 방정식, 수식은 반드시 LaTeX 문법을 사용하세요.
   - 문장 속 인라인 수식은 달러 기호 하나로 감싸세요: $y = ax^2 + bx + c$, $(x-a)^2 + (y-b)^2 = r^2$, $\\sqrt{x}$, $\\frac{a}{b}$
   - 독립된 블록 수식은 달러 기호 두 개로 감싸세요:
     $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$
   - 분수는 반드시 \\frac{분자}{분모}를 사용하고, 제곱근은 \\sqrt{}를 사용하세요.

3. **답변 구성**:
   - 💡 **핵심 개념**: 질문한 내용의 핵심 정의 또는 공식
   - 🔍 **단계별 풀이 / 원리 설명**: 초보자도 이해하기 쉬운 논리적 단계
   - 📐 **직관적 팁 또는 기억법**: 기억하기 쉬운 팁 또는 기하학적 의미
   - ✨ **생각해볼 점 (선택)**: 학생이 스스로 적용해볼 수 있는 가벼운 퀴즈나 후속 질문

항상 학생이 수학에 흥미와 자신감을 가질 수 있도록 도와주세요!`;

    // Build chat conversation array
    let chatMessages = [{ role: 'system', content: systemPrompt }];

    if (Array.isArray(messages) && messages.length > 0) {
      // Append sanitized past multi-turn history
      const sanitized = messages.slice(-10).map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: String(m.content || '')
      }));
      chatMessages = chatMessages.concat(sanitized);
    } else if (question) {
      chatMessages.push({
        role: 'user',
        content: topic ? `[주제: ${topic}] ${question}` : question
      });
    }

    const modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: chatMessages,
        temperature: 0.6,
        max_tokens: 1500
      })
    });

    if (!openAiResponse.ok) {
      const errorData = await openAiResponse.json().catch(() => ({}));
      console.error('OpenAI API Error:', errorData);
      return res.status(openAiResponse.status).json({
        success: false,
        error: 'OPENAI_API_ERROR',
        message: errorData.error?.message || 'OpenAI API 호출 중 오류가 발생했습니다.',
        status: openAiResponse.status
      });
    }

    const data = await openAiResponse.json();
    const answer = data.choices?.[0]?.message?.content || '답변을 생성하지 못했습니다.';

    return res.status(200).json({
      success: true,
      answer,
      model: modelName,
      usage: data.usage
    });
  } catch (error) {
    console.error('Server error in /api/chat:', error);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: error.message || '서버 내부 오류가 발생했습니다.'
    });
  }
}
