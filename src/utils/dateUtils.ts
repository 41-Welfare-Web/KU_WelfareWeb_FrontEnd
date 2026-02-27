/**
 * 날짜 관련 유틸리티 함수
 */

/**
 * 근무일(평일) 기준으로 지정된 일수 이후의 날짜를 계산합니다.
 * 주말(토요일, 일요일)은 제외하고 계산합니다.
 * 
 * @param workDays - 계산할 근무일 수
 * @param startDate - 시작 날짜 (기본값: 오늘)
 * @returns 계산된 날짜
 */
export function calculateWorkdaysFromNow(workDays: number, startDate: Date = new Date()): Date {
  let workDaysCount = 0;
  const current = new Date(startDate);
  
  while (workDaysCount < workDays) {
    current.setDate(current.getDate() + 1);
    const day = current.getDay();
    // 0 = 일요일, 6 = 토요일
    if (day !== 0 && day !== 6) {
      workDaysCount++;
    }
  }
  
  return current;
}

/**
 * 날짜를 "M월 D일" 형식으로 포맷팅합니다.
 * 
 * @param date - 포맷팅할 날짜
 * @returns "M월 D일" 형식의 문자열
 */
export function formatDateToKorean(date: Date): string {
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

/**
 * 근무일 기준으로 지정된 일수 이후의 날짜를 한국어 형식으로 반환합니다.
 * 
 * @param workDays - 계산할 근무일 수
 * @returns "M월 D일" 형식의 문자열
 */
export function getExpectedDateKorean(workDays: number): string {
  const expectedDate = calculateWorkdaysFromNow(workDays);
  return formatDateToKorean(expectedDate);
}
