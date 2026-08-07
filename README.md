# Market Note

투자 브리핑과 시장 분석 콘텐츠를 읽기 편하게 보여주는 티스토리 반응형 스킨입니다.

- 현재 버전: `v1.5.5`
- 라이선스: MIT
- 주요 기능: 반응형 카드 레이아웃, 검색, 자동 목차, 예상 읽기 시간, 읽기 진행률, 모바일 표 스크롤

## 설치

1. 배포 압축 파일을 풉니다.
2. 티스토리 관리자에서 **꾸미기 → 스킨 변경 → 스킨 등록**으로 이동합니다.
3. 최상위의 `skin.html`, `style.css`, `index.xml`, `preview` 파일을 업로드합니다.
4. `images/script.js`도 함께 업로드합니다.
5. 저장한 뒤 스킨 보관함에서 **Market Note**를 적용합니다.

> 스킨을 교체하기 전에 현재 사용 중인 스킨을 보관해 두는 것을 권장합니다.

## 권장 설정

| 항목 | 설정 |
| --- | --- |
| 홈 설정 | 커버 사용 |
| 모바일 | 티스토리 모바일웹 자동 연결 사용 안 함 |
| 홈 커버 | 시장 브리핑 히어로 1개, 주요 글 카드 6개 |
| 글 목록 | 페이지당 8개 |
| 대표 이미지 | 16:10 또는 4:3 비율 |

댓글과 방명록은 티스토리 관리자 설정 및 로그인 상태에 맞는 입력 폼을 표시하며, 게시물 하단에 기본으로 펼쳐집니다.

## 글 작성

- 제목 2는 큰 소제목으로 디자인됩니다.
- 제목 2와 제목 3이 합쳐 두 개 이상이면 사이드바 목차가 자동 생성됩니다.
- 본문 분량을 기준으로 예상 읽기 시간과 상단 진행률이 표시됩니다.
- 이미지, 인용문, 코드 블록과 표 등 티스토리 에디터 요소를 지원합니다.
- 넓은 표는 모바일 화면에서 좌우로 스크롤할 수 있습니다.

공개 전에는 개인의 보유 금액이나 계좌 정보가 포함되지 않았는지 확인하세요.

## 공통 본문 컴포넌트

새로운 게시물은 특정 주제나 문서 템플릿 대신 `.content-document`와 `.content-*` 공통 클래스로 구성할 수 있습니다.

```html
<article class="content-document">
  <header class="content-hero">
    <span class="content-badge">REPORT</span>
    <h1>게시물 제목</h1>
    <p class="content-lead">게시물의 핵심 내용을 소개합니다.</p>
  </header>

  <section class="content-section">
    <h2>핵심 요약</h2>
    <div class="content-grid">
      <div class="content-card">요약 내용</div>
      <div class="content-card">요약 내용</div>
    </div>
  </section>
</article>
```

| 클래스 | 용도 |
| --- | --- |
| `content-hero` | 게시물 히어로 영역 |
| `content-badge`, `content-label` | 배지와 짧은 레이블 |
| `content-summary`, `content-panel` | 요약 및 일반 정보 상자 |
| `content-toc` | 게시물 내부 목차 |
| `content-section` | 본문 구획 |
| `content-grid`, `content-card` | 반응형 카드 레이아웃 |
| `content-callout` | 강조문 |
| `content-callout--warning` | 주의 강조문 |
| `content-callout--danger` | 위험 강조문 |
| `content-callout--success` | 긍정 강조문 |
| `content-table-wrap` | 모바일 스크롤 표 |
| `content-chart` | 넓은 차트 영역 |
| `content-code`, `content-key` | 코드 블록과 키보드 키 |
| `content-timeline`, `content-steps` | 타임라인과 단계 목록 |
| `content-closing`, `content-sources` | 맺음말과 출처 |

기존 `ai-daily-post`, `jcos-vscode-guide`, `mn-report` 선택자도 이전 게시물과의 호환을 위해 계속 지원합니다.

## 사용자 정의

스킨 편집에서 포인트 색상과 본문 너비를 변경할 수 있습니다. 기본 색상은 네이비 `#132f4c`, 블루 `#2f78b7`, 레드 `#c64135`, 골드 `#a8740a`입니다.

게시물별 컴포넌트 색상은 `.content-document`에서 다음 CSS 변수를 덮어써 변경합니다.

```css
.content-document {
  --content-primary: #2f78b7;
  --content-heading: #132f4c;
  --content-border: #dce5ed;
  --content-muted: #607187;
}
```

## 파일 구성

| 경로 | 설명 |
| --- | --- |
| `skin.html` | 티스토리 치환자가 포함된 메인 템플릿 |
| `style.css` | 레이아웃과 게시물 본문 스타일 |
| `index.xml` | 스킨 정보, 커버 및 사용자 설정 |
| `images/script.js` | 메뉴, 검색, 목차, 진행률과 표 처리 기능 |
| `preview*` | 스킨 미리보기 이미지 |

## 주의 사항

- `index.xml`을 수정해 다시 업로드하면 일부 스킨 설정이 초기화될 수 있습니다.
- 애드센스와 티스토리 자체 광고 위치는 티스토리 관리자 설정을 따릅니다.

## 라이선스

[MIT License](LICENSE) · Copyright © 2026 Jinhoon Kim
