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

/**
 * 2026년 한국 공휴일 목록 (YYYY-MM-DD 형식)
 */
const HOLIDAYS_2026: string[] = [
  '2026-01-01', // 신정
  '2026-02-16', // 설날 연휴
  '2026-02-17', // 설날
  '2026-02-18', // 설날 연휴
  '2026-03-01', // 삼일절
  '2026-05-05', // 어린이날
  '2026-05-24', // 부처님오신날 (음력 4월 8일)
  '2026-06-06', // 현충일
  '2026-08-15', // 광복절
  '2026-09-24', // 추석 연휴
  '2026-09-25', // 추석
  '2026-09-26', // 추석 연휴
  '2026-10-03', // 개천절
  '2026-10-09', // 한글날
  '2026-12-25', // 성탄절
];

/**
 * 주어진 날짜가 주말(토요일 또는 일요일)인지 확인합니다.
 * 
 * @param date - 확인할 날짜 (Date 객체 또는 YYYY-MM-DD 문자열)
 * @returns 주말이면 true, 아니면 false
 */
export function isWeekend(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = d.getDay();
  return day === 0 || day === 6; // 0: 일요일, 6: 토요일
}

/**
 * 주어진 날짜가 공휴일인지 확인합니다.
 * 
 * @param date - 확인할 날짜 (Date 객체 또는 YYYY-MM-DD 문자열)
 * @returns 공휴일이면 true, 아니면 false
 */
export function isHoliday(date: Date | string): boolean {
  const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
  return HOLIDAYS_2026.includes(dateStr);
}

/**
 * 주어진 날짜가 근무일(평일이면서 공휴일이 아닌 날)인지 확인합니다.
 * 
 * @param date - 확인할 날짜 (Date 객체 또는 YYYY-MM-DD 문자열)
 * @returns 근무일이면 true, 아니면 false
 */
export function isWorkday(date: Date | string): boolean {
  return !isWeekend(date) && !isHoliday(date);
}

/**
 * 주어진 날짜가 유효한 수령 희망일인지 확인합니다.
 * (2026년 내의 근무일이어야 함)
 * 
 * @param date - 확인할 날짜 (YYYY-MM-DD 문자열)
 * @returns 유효하면 true, 아니면 false와 에러 메시지
 */
export function validateDesiredDate(date: string): { valid: boolean; message?: string } {
  if (!date) {
    return { valid: false, message: '수령 희망일을 선택해주세요.' };
  }

  const selectedDate = new Date(date);
  const minDate = new Date('2026-01-01');
  const maxDate = new Date('2026-12-31');

  if (selectedDate < minDate || selectedDate > maxDate) {
    return { valid: false, message: '수령 희망일은 2026년 1월 1일부터 12월 31일 사이여야 합니다.' };
  }

  if (isWeekend(date)) {
    return { valid: false, message: '주말은 선택할 수 없습니다. 평일을 선택해주세요.' };
  }

  if (isHoliday(date)) {
    return { valid: false, message: '공휴일은 선택할 수 없습니다. 평일을 선택해주세요.' };
  }

  return { valid: true };
}
