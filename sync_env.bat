@echo off
chcp 65001 >nul
echo ========================================================
echo  MathVerse - 로컬 OpenAI API 키 연동 스크립트
echo ========================================================
echo.

setlocal enabledelayedexpansion

REM 1. 시스템 또는 사용자 환경변수 OPENAI_API_KEY 확인
if not "%OPENAI_API_KEY%"=="" (
    echo [OK] Windows 환경변수 OPENAI_API_KEY 감지 완료!
    set "KEY=%OPENAI_API_KEY%"
) else (
    echo [안내] 현재 명령 세션에서 OPENAI_API_KEY 환경변수를 탐색 중입니다...
    for /f "tokens=2*" %%a in ('reg query "HKCU\Environment" /v OPENAI_API_KEY 2^>nul') do set "KEY=%%b"
    if "!KEY!"=="" (
        for /f "tokens=2*" %%a in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v OPENAI_API_KEY 2^>nul') do set "KEY=%%b"
    )
)

if not "!KEY!"=="" (
    echo [성공] 환경변수에서 API 키를 찾았습니다!
) else (
    echo [알림] 시스템 환경변수에 OPENAI_API_KEY가 아직 설정되어 있지 않습니다.
    echo OpenAI API 키(sk-...)를 직접 입력하시거나 붙여넣어 주세요:
    set /p "KEY=API 키 입력: "
)

if "!KEY!"=="" (
    echo [취소] 키가 입력되지 않아 작업을 중단합니다.
    pause
    exit /b
)

REM config.js 생성
echo // MathVerse 로컬 실행 전용 설정 파일 (자동 생성됨) > config.js
echo window.MATHVERSE_CONFIG = { >> config.js
echo   OPENAI_API_KEY: "!KEY!" >> config.js
echo }; >> config.js

echo.
echo ========================================================
echo  [완료] config.js 파일이 성공적으로 생성되었습니다!
echo  이제 index.html을 더블클릭하여 브라우저에서 바로 사용하세요.
echo  (config.js 파일은 .gitignore 처리되어 깃에 커밋되지 않습니다)
echo ========================================================
echo.
pause
