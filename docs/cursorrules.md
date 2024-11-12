## 규칙

## 패키지 매니저

- **패키지 매니저:** `pnpm`을 사용합니다.

## UI 컴포넌트 설정

- **ShadCN 컴포넌트들 우선적으로 활용합니다.**
- **현재 구현된 컴포넌트:**
  - Button
  - Card
  - Textarea
  - Toast (sonner)

## Next.js Server Actions & API Routes 사용 지침

### 현재 구현된 Server Actions
- `saveDiary`: 새 일기 저장
- `updateDiary`: 기존 일기 수정
- `deleteDiary`: 일기 삭제
- `getDiary`: 단일 일기 조회
- `getDiaries`: 전체 일기 목록 조회

### 데이터 저장소
- 현재는 쿠키 기반 임시 저장소 사용
- 추후 데이터베이스 연동 예정

### 자동 저장 기능
- 30초 간격 자동 저장
- localStorage를 활용한 임시 저장
- 페이지 이탈 시 경고

### 일반 규칙
- Server Actions는 단순 CRUD 작업에 사용
- 복잡한 로직은 API Routes로 이전 예정
