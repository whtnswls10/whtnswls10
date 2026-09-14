# 🌌 MathVerse - 수학 시뮬레이션 허브 (글래스모피즘 웹사이트)

수학 교육 및 시각화 시뮬레이션 프로그램을 한곳에 모으고 직관적으로 탐구할 수 있는 **글래스모피즘(Glassmorphism)** 스타일의 웹 플랫폼입니다.

---

## ✨ 주요 기능 및 특징

1. **글래스모피즘 디자인 시스템**
   - 부드러운 배경 블러(`backdrop-filter: blur(20px)`), 반투명 유리 질감, 빛 반사 테두리
   - 부유하는 네온 메쉬 그라데이션 및 수학 기호/파티클 캔버스 배경 애니메이션
2. **플로팅 글래스 상단 네비게이션 바**
   - 로고 및 브랜딩, 카테고리 퀵 링크, 실시간 검색(`Ctrl + K`), 반응형 모바일 서랍 메뉴
3. **🔵 원의 방정식 표현 탐구 활동 데이터베이스 (Circle Equation DB)**
   - 2022 개정 공통수학1 도형의 방정식 연계 10대 핵심 탐구 활동 체계화
   - 표준형·일반형 변형, 좌표축 접촉, 위치관계 및 접선, 지진 삼각측량 등 실생활 모델링 데이터베이스 구축
   - 활동 검색, 카테고리 및 난이도 필터링, 상세 활동지 모달, 파라미터 시뮬레이터 연동
   - JSON DB 파일 다운로드 및 사용자 정의 활동 브라우저 영구 저장(LocalStorage) 지원
4. **히어로 실시간 인터랙티브 샌드박스**
   - 메인 화면에서 슬라이더(진폭, 주기, 속도)를 조작하여 실시간 함수 그래프 $f(x)$와 접선의 미분계수 $f'(x)$의 움직임을 관찰
   - 원의 방정식 $(x-a)^2 + (y-b)^2 = r^2$, 삼각함수, 이차 포물선, 정규 가우스 곡선 모드 지원
5. **수학 시뮬레이션 라이브러리 그리드**
   - **기하 & 도형**: 원의 방정식과 접선 기하학, 3차원 공간벡터와 외적(Cross Product)
   - **미적분학**: 단위원과 삼각함수의 세계, 푸리에 급수 파형 합성
   - **확률과 통계**: 갈톤 보드(Galton Board)와 중심극한정리
   - **AI & 응용수학**: 경사하강법과 인공지능 최적화 손실 곡면
   - **함수와 대수**: 이차함수와 판별식 $D$의 기하학
6. **🤖 AI 수학 질문 챗봇 (MathVerse AI 튜터 - MathBot)**
   - OpenAI `gpt-4o-mini` 기반의 실시간 1:1 맞춤형 수학 질문 챗봇 탑재
   - 초·중·고 교육과정에 맞춘 친절한 단계별(Step-by-step) 풀이 및 직관적 원리 설명
   - **LaTeX / KaTeX 수식 자동 렌더링**: 분수, 거듭제곱, 근호, 미적분 기호 등을 수학 교재처럼 깔끔하게 시각화
   - 우측 하단 플로팅 챗봇 위젯, 상단 내비게이션 퀵 버튼, 원클릭 추천 질문 칩 제공
   - Vercel Serverless 엔드포인트([`/api/chat.js`](./api/chat.js))를 통해 `OPENAI_API_KEY`를 클라이언트에 노출하지 않는 안전한 통신 구조
7. **Vercel 원클릭 배포 최적화**
   - Node.js 빌드 과정 없이 정적 파일(HTML, CSS, JS)로 구동되어 Vercel에서 100% 오류 없이 즉시 배포 가능 (`vercel.json` 내장)

---

## 📚 원의 방정식 수록 탐구 활동 (10대 핵심 DB)

| No | 활동명 | 분류 | 난이도 | 핵심 방정식 및 기하학적 성질 |
|---|---|---|---|---|
| **01** | 컴퍼스와 자취: 표준형 유도 | 표준형 & 일반형 | 기본 | 두 점 사이 거리 $(x-a)^2 + (y-b)^2 = r^2$ |
| **02** | 완전제곱식 변형과 성립 조건 | 표준형 & 일반형 | 기본 | 일반형 $x^2+y^2+Ax+By+C=0 \iff A^2+B^2-4C > 0$ |
| **03** | 좌표축에 접하는 원의 방정식 | 좌표축 접촉 | 발전 | $x$축 접($\|b\|=r$), $y$축 접($\|a\|=r$), 동시 접 |
| **04** | 세 점을 지나는 외접원의 방정식 | 표준형 & 일반형 | 발전 | 외심 삼각측량 및 일차연립방정식 풀이 |
| **05** | 원과 직선의 위치관계 듀얼 판정 | 위치관계 & 접선 | 발전 | 점과 직선 거리 $d$와 반지름 $r$ 비교 ($d < r, d=r, d>r$) |
| **06** | 원의 접선의 방정식 3대 마스터 | 위치관계 & 접선 | 심화 | 원 위의 점, 기울기 $m$ 공식, 원 밖의 한 점 접선쌍 |
| **07** | 지진 진앙지 삼각측량 프로젝트 | 실생활 융합 모델링 | 심화 | 3개 관측소 원들의 공통 교점(진앙지) 연립 추적 |
| **08** | 스마트 시티 5G 기지국 커버리지 | 실생활 융합 모델링 | 발전 | 도심 거점을 포괄하는 최소 반경 원의 부등식 최적화 |
| **09** | 아폴로니오스의 원 (자취 탐구) | 심화 자취 & 원의 족 | 심화 | 두 점 거리의 비 $m:n$인 내분점·외분점 지름 원 |
| **10** | 두 원의 공통현과 원의 족 | 심화 자취 & 원의 족 | 심화 | 항등식 $C_1 + k C_2 = 0$ 및 공통현($k=-1$) |

---

## ⚡ Supabase 클라우드 데이터베이스 연동 안내

본 프로젝트는 Vercel에 연동된 **Supabase** 데이터베이스에 원의 방정식 탐구 활동을 클라우드로 직접 영구 저장할 수 있도록 완벽히 구성되어 있습니다.

### 1. Supabase 테이블 생성 (1회만 실행)
Supabase 대시보드의 **SQL Editor**로 이동하여 프로젝트 루트에 포함된 [`supabase_schema.sql`](./supabase_schema.sql) 파일의 내용을 붙여넣고 **[Run]**을 클릭합니다:
- 테이블명: `circle_activities`
- 공개 읽기(SELECT) 및 등록/업데이트(INSERT/UPSERT) RLS 정책 자동 활성화

### 2. Vercel + Supabase 자동 연동 원리
- Vercel 대시보드의 **Integrations**에서 Supabase를 프로젝트와 연결하면 다음 환경변수가 Vercel 서버리스 런타임에 자동으로 주입됩니다:
  - `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_ANON_KEY` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Vercel Serverless API 엔드포인트 [`/api/activities.js`](./api/activities.js)가 이 환경 변수를 자동으로 감지하여 Supabase REST API를 통해 데이터를 안전하게 저장하고 조회합니다.
- 웹사이트 화면의 **[Supabase 동기화]** 버튼을 누르면 10대 기본 활동과 브라우저에서 작성한 모든 활동이 Supabase 클라우드로 즉시 일괄 동기화됩니다.

---

## 🤖 AI 수학 튜터 챗봇 (OpenAI 연동 안내)

본 플랫폼은 학생들이 언제든지 수학 질문을 하고 실시간 답변을 받을 수 있는 AI 수학 튜터 챗봇을 제공합니다.

### Vercel 배포 시 OpenAI API 키 등록
1. [Vercel 대시보드](https://vercel.com)에 로그인 후 해당 프로젝트를 선택합니다.
2. **[Settings]** > **[Environment Variables]** 탭으로 이동합니다.
3. 다음과 같이 환경 변수를 추가합니다:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: 발급받으신 OpenAI API Key (`sk-...`)
   - **Target**: Production, Preview, Development 모두 체크
4. *(선택)* 모델을 변경하고 싶다면 `OPENAI_MODEL` 환경 변수에 `gpt-4o-mini` 또는 `gpt-4o`를 설정할 수 있습니다 (기본값: `gpt-4o-mini`).
5. Vercel의 **[Deployments]** 탭에서 **Redeploy**를 1회 실행하면 서버리스 함수([`/api/chat.js`](./api/chat.js))에 환경변수가 즉시 반영됩니다.

### 로컬 프리뷰 환경(file://)에서 테스트하는 3가지 방법
1. **방법 1 (가장 간편)**: `index.html`을 브라우저로 열고 챗봇에 질문 시 나타나는 입력창에 API 키를 붙여넣으면, 브라우저에 자동 저장되어 즉시 답변이 나옵니다 (이후 재입력 불필요).
2. **방법 2 (원클릭 환경변수 동기화)**: 폴더 내 [`sync_env.bat`](./sync_env.bat) 파일을 더블 클릭하면 Windows 환경변수의 `OPENAI_API_KEY`를 감지하여 로컬 설정(`config.js`)을 자동 생성합니다.
3. **방법 3 (설정 아이콘)**: 챗봇 창 우측 상단의 **설정(⚙️)** 버튼을 눌러 언제든 키를 확인하거나 변경·삭제할 수 있습니다.

---

## 🚀 로컬 실행 방법 (Local Preview)

별도의 프로그램 설치 없이 바로 확인할 수 있습니다:

1. 파일 탐색기에서 `c:\Users\user\Desktop\직무연수` 폴더로 이동합니다.
2. `index.html` 파일을 **더블 클릭**하면 기본 웹 브라우저(Chrome, Edge 등)에서 즉시 실행됩니다.

---

## 🌐 Vercel에 배포하는 2가지 방법

### 방법 1: GitHub 연동 배포 (가장 추천)

1. [GitHub](https://github.com)에 로그인하고 새 레포지토리(`math-simulations`)를 생성합니다.
2. 현재 폴더(`직무연수`) 내 파일들을 GitHub 레포지토리에 업로드합니다.
3. [Vercel](https://vercel.com)에 접속하여 로그인합니다.
4. **[Add New...]** > **[Project]**를 클릭하고 방금 생성한 GitHub 레포지토리를 선택(Import)합니다.
5. 별도의 Build Command나 Output Directory 설정 변경 없이 **[Deploy]** 버튼을 클릭합니다.
6. 약 15초 후 `https://math-simulations-xxxx.vercel.app` 과 같은 무료 글로벌 배포 URL이 발급됩니다!

### 방법 2: Vercel CLI 배포

터미널에 `vercel` 또는 `npx vercel` 명령어를 지원하는 환경이라면:
```bash
npx vercel
```
명령어를 입력하고 안내에 따라 엔터를 누르면 즉시 배포됩니다.

---

## 📁 파일 구조

```
직무연수/
├── api/
│   └── activities.js          # Vercel Serverless Function (Supabase REST CRUD API)
├── supabase_schema.sql        # Supabase 테이블 및 RLS 정책 생성 SQL DDL
├── .env.example               # Supabase 환경 변수 설정 템플릿
├── circle_activities_db.json  # 원의 방정식 표현 10대 탐구 활동 JSON 데이터베이스
├── circle_activities_db.js    # 브라우저 직접 실행 및 로컬 환경 지원 DB 모듈
├── index.html                 # 메인 웹 허브, 활동 DB 뷰어, 상세 모달, 시뮬레이터
├── style.css                  # 글래스모피즘 디자인 시스템, 블러 및 네온 스타일
├── script.js                  # 캔버스 렌더러, 활동 DB 필터/검색, Supabase/LocalStorage 동기화
├── vercel.json                # Vercel 배포 라우팅 및 캐시/보안 헤더 설정
└── README.md                  # 프로젝트 가이드, Supabase 연동 명세 및 배포 안내
```
