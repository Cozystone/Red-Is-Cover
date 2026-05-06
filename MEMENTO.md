# MEMENTO — Red Is Cover Portfolio

세션이 죽어도 이 파일이 기억한다.
새 세션 시작 시 **이 파일을 먼저 읽을 것**.

---

## 프로젝트 개요

**이름**: Red Is Cover
**작성자**: 안석 김 (Anseok Kim)
**스택**: Next.js (App Router) + React Three Fiber (Three.js) + Framer Motion + Tailwind v4
**경로**: `C:\ASKIM_all\Personal Project\0.Claude Code\Creative Portfolio\portfolio`
**테마**: "차갑고 가속화된 시대에 인간성을 찾는다"
**컬러**: 레드 #D91C1C, 크림 #FAF8F5, 다크 #060606

---

## 사이트 구조 (페이지 흐름)

```
[진입] VideoHero — 전체화면 루프 비디오
  - 와인글라스 씬 ↔ 담배 씬 (가로 스와이프/우클릭드래그/트랙패드로 전환)
  - Space / 탭 → 커튼(좌우 패널)이 열리며 Landing 노출

[Landing] 빨간 방 (#b50707 그라디언트)
  - "The work of staying human."
  - 오른쪽 건물벽 '골목길' 간판 클릭 → 씬 체인:
      idle → clearing → liquid (LiquidOverlay) → whiteroom (WhiteRoomScene)
      → phonecall (PhoneCallScene)
  - 골목길 클릭은 window.scrollY < innerHeight * 0.85 일 때만 활성화 (스크롤 중 오작동 방지)

[PhoneCallScene] 서울 야경 + 간판 콜라주 + Canon AT-1 카메라
  - 카메라 클릭 → turning → viewfinder 모드
  - 뷰파인더: 커서 패닝, 스크롤 줌
  - Enter → 셔터 → 폴라로이드 캡처
  - ESC → 종료 → 카메라 리셋

[스크롤 이후 일반 섹션]
PinterestBoard  → 마소니리 무드보드 그리드
World           → "02 — WORLD" 인생 선언문
Categories      → "03" Windows Chrome 탭 UI — "Anseogle" 워드마크
                   탭: Art/Fashion/Brand/Writing/Worldbuilding
                   new-tab 뷰: Anseogle 로고 + 단축 아이콘 + Kimail 버튼
                   isAdmin → "✦ New Project" FAB → AdminEditor 사이드패널
Archive         → "04 — VISUAL ARCHIVE"
Profile         → "05 — PROFILE"
[AdminDoor]     → 비밀 섹션 (번호 없음): 문 GLB 클릭 → 열림 → Campbell 캔 등장
                   → "What's The Password?" → "maurizio cattelan" → 관리자 모드 진입
Contact         → "06 — CONTACT"
```

---

## 핵심 파일 맵

| 파일 | 역할 |
|------|------|
| `app/page.tsx` | 페이지 루트, 섹션 조합 |
| `app/layout.tsx` | 폰트(Cormorant Garamond, DM Sans), 메타데이터 |
| `app/globals.css` | Tailwind v4 토큰, 커스텀 프로퍼티, 애니메이션 |
| `lib/gunContext.tsx` | 총 인터랙션 상태머신 (idle→dropping→aiming→shattering→revealed) |
| `lib/adminContext.tsx` | 관리자 모드 상태 (비밀번호: "maurizio cattelan") |
| `lib/projects.ts` | MOCK_PROJECTS + Supabase CRUD (createProject 포함) |
| `lib/types.ts` | Project, ProjectCategory, ProjectStatus 타입 |
| `lib/supabase.ts` | Supabase 싱글톤 (env 없으면 null) + sendMessage() |
| `components/ui/GolmokSign.tsx` | 골목길 이스터에그 + 씬 체인 트리거 (scrollY guard 포함) |
| `components/ui/PhoneCallScene.tsx` | Canon AT-1 카메라 뷰파인더 씬 |
| `components/ui/WineGlassScene.tsx` | 와인글라스 3D 씬 |
| `components/ui/CigaretteScene.tsx` | 담배 3D 씬 |
| `components/ui/WhiteRoomScene.tsx` | 흰 방 씬 |
| `components/ui/GrassField.tsx` | 풀밭 배경 |
| `components/ui/GunCanvas.tsx` | 총 3D 캔버스 |
| `components/ui/GunOverlay.tsx` | 총 오버레이 UI |
| `components/ui/KeychainNav.tsx` | 상단 고정 네비 (isAdmin → ADMIN 브랜딩 + EXIT 버튼) |
| `components/ui/CustomCursor.tsx` | 커스텀 커서 |
| `components/ui/BackgroundField.tsx` | 배경 필드 |
| `components/ui/LiquidOverlay.tsx` | 액체 전환 효과 |
| `components/ui/ScrollReveal.tsx` | 스크롤 등장 애니메이션 |
| `components/ui/KimailCompose.tsx` | Gmail 스타일 메일 컴포즈 패널 (Supabase messages 저장) |
| `components/ui/AdminEditor.tsx` | 관리자 프로젝트 편집 사이드패널 (이미지 업로드 포함) |
| `components/ui/ProjectDetailModal.tsx` | 프로젝트 상세 팝업 |
| `components/sections/VideoHero.tsx` | 진입 씬 전체 |
| `components/sections/Landing.tsx` | 빨간 방 랜딩 |
| `components/sections/World.tsx` | 선언문 섹션 |
| `components/sections/Categories.tsx` | WorksBrowser — Anseogle, 탭+그리드, Kimail, AdminFAB |
| `components/sections/Archive.tsx` | 비주얼 아카이브 |
| `components/sections/Profile.tsx` | 프로필 |
| `components/sections/AdminDoor.tsx` | 비밀 관리자 입장 씬 (문 + Campbell 캔 + 비밀번호) |
| `components/sections/AdminDoorScene.tsx` | R3F 캔버스: room-door.glb + campbells-can.glb |
| `components/sections/Contact.tsx` | 연락처 |
| `components/sections/PinterestBoard.tsx` | 핀터레스트 무드보드 |
| `public/room-door.glb` | 문 3D 모델 (애니메이션 포함) |
| `public/campbells-can.glb` | Campbell 수프캔 3D 모델 |
| `public/bookmarks/` | 북마크 파비콘 이미지 4장 |
| `public/signs/` | 서울 간판 이미지 20장 |
| `supabase/schema.sql` | DB 스키마 (projects, background_images, messages) |
| `supabase/storage.sql` | Storage 버킷 + RLS 정책 |
| `.env.local` | Supabase URL + anon key |

---

## 세션 히스토리

### 세션 0 — 초기 구축 (2026-03-24 ~ 03-28)

**커밋 히스토리 (최신순):**
- `61d1aa3` fix: camera orbit via spherical coords, improved green mesh detection
- `6ad2dfb` fix: wine mode as default, preserve scroll position on overlay
- `83a170e` feat: camera turn anim, shutter capture, polaroid, zoom sound, lens black
- `1688802` tweak: camera initial angle slightly left of center
- `9bd20d4` tweak: viewfinder scroll sensitivity 0.0008→0.002, pan range 340/230→560/380
- `15857b8` viewfinder iris anim, cursor pan, scroll zoom, bigger signs, disable text select
- `c823ab0` feat: camera canvas — seoul night bg + fix model transparency
- `5beb79b` feat: PhoneCallScene — sign collage + Canon AT-1 3D model
- `0a8a7f0` tweak: phone hint → top, volume hint → appears on mount then fades

**주요 완성 기능:**
- VideoHero: 루프 비디오 + 와인/담배 씬 스와이프 전환 + 커튼 열기
- Landing: 빨간 방 + 골목길 이스터에그 + 씬 체인
- PhoneCallScene: Canon AT-1 카메라, 뷰파인더, 셔터, 폴라로이드
- WhiteRoomScene: 흰 방 전환 씬
- KeychainNav: 고정 네비 + 키체인 캔버스
- World, Archive, Profile, Contact: 정적 섹션들
- PinterestBoard: 마소니리 그리드

**마지막 작업 상태:**
- PhoneCallScene의 카메라 오빗을 Spherical 좌표계로 수정
- 그린 메쉬 감지 개선
- wine mode가 기본값으로 설정됨

---

### 세션 1 — WorksBrowser 구축 (2026-05-05)

**목표:** Categories 섹션("03 — Chapters") 재설계

**변경 파일:**
- `components/sections/Categories.tsx` — 전면 교체 (WorksBrowser)
- `components/ui/ProjectDetailModal.tsx` — 신규 생성

**커밋:** 세션 1 끝 → `66e5112`

---

### 세션 2 — 관리자 모드 + Kimail + AdminDoor + Supabase 연결 (2026-05-06)

**목표:** 관리자 진입 씬, Kimail 메시지 시스템, Anseogle 리브랜딩, Supabase 완전 연결

**신규 파일:**
- `lib/adminContext.tsx` — 관리자 상태 컨텍스트
- `components/sections/AdminDoor.tsx` — 비밀 섹션 (문 + 캔 + 비밀번호)
- `components/sections/AdminDoorScene.tsx` — R3F 씬
- `components/ui/KimailCompose.tsx` — Gmail 스타일 메일 컴포즈
- `components/ui/AdminEditor.tsx` — 관리자 프로젝트 편집 사이드패널
- `supabase/schema.sql` — DB 스키마 (messages 테이블 추가)
- `supabase/storage.sql` — Storage 버킷 설정

**수정 파일:**
- `components/sections/Categories.tsx` — Anseogle 워드마크, 탭클릭 fix, Kimail, Admin FAB
- `components/ui/KeychainNav.tsx` — ADMIN 브랜딩, EXIT 버튼
- `app/page.tsx` — AdminProvider 추가, AdminDoor 삽입
- `lib/supabase.ts` — sendMessage() 추가
- `components/ui/GolmokSign.tsx` — scrollY guard (inHeroView)
- `World.tsx`, `Archive.tsx`, `Profile.tsx`, `Contact.tsx`, `ProjectDetailModal.tsx` — Cormorant → Helvetica Neue

**Supabase:**
- 프로젝트 ref: `rigjdwdayvgkgxiwnxwm`
- DB 테이블: `projects`, `background_images`, `messages`
- Storage 버킷: `project-images` (public)
- Vercel env 등록 완료

**커밋 히스토리:**
- `512f2c6` chore: add storage bucket setup SQL
- `1281bbe` chore: add messages table + RLS policies to schema.sql
- `1accd7c` feat: admin mode + AdminDoor 3D + Kimail + Anseogle + tab fix
- `66e5112` feat: multiple UX fixes + Helvetica font + bookmark images (세션2 시작 기준)

---

## TODO (다음 세션)

- [ ] 각 프로젝트에 image_url 추가 (`public/projects/` 폴더에 이미지 넣고 projects.ts 업데이트)
- [ ] Kimail 전송 테스트 (messages 테이블 저장 확인)
- [ ] AdminDoor 비밀번호 + 관리자 편집 E2E 테스트
- [ ] Archive 섹션 재편 검토
- [ ] 모바일 최적화 전체 점검
