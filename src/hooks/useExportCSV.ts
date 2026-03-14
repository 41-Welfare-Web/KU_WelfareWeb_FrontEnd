type TabType = 'rental' | 'plotter' | 'items';

interface RentalData {
  id: number;
  user: {
    name: string;
    studentId: string;
    department?: string;
    departmentName?: string;
    departmentType?: string;
  };
  departmentName?: string;
  departmentType?: string;
  startDate: string;
  endDate: string;
  status: string;
  itemSummary?: string;
  createdAt: string;
}

interface PlotterData {
  id: number;
  user?: {
    name: string;
    studentId: string;
    department?: string;
    departmentName?: string;
  };
  departmentType?: string;
  departmentName?: string;
  purpose: string;
  paperSize: string;
  pageCount: number;
  pickupDate: string;
  status: string;
  createdAt: string;
}

const RENTAL_STATUS_KO: Record<string, string> = {
  RESERVED: '예약',
  RENTED: '대여 중',
  RETURNED: '정상 반납',
  OVERDUE: '연체',
  CANCELED: '예약 취소',
  DEFECTIVE: '불량 반납',
};

const PLOTTER_STATUS_KO: Record<string, string> = {
  PENDING: '예약 대기',
  CONFIRMED: '예약 확정',
  PRINTED: '인쇄 완료',
  REJECTED: '예약 반려',
  COMPLETED: '수령 완료',
};

// 쉼표/줄바꿈 포함 필드를 큰따옴표로 감싸기
const esc = (v: string | number) => {
  const s = String(v ?? '');
  return s.includes(',') || s.includes('\n') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
};

// 날짜를 Excel이 자동 변환하지 않도록 ="YYYY-MM-DD" 형식으로 강제
const escDate = (v: string) => {
  const d = (v ?? '').slice(0, 10);
  return d ? `="${d}"` : '-';
};

export function useExportCSV() {
  const exportRentalCSV = (data: RentalData[]) => {
    if (data.length === 0) {
      alert('다운로드할 데이터가 없습니다.');
      return;
    }

    // 테이블 컬럼 순서: 신청번호 / 신청자 / 소속 / 대여 품목 / 대여 날짜 / 반납 날짜 / 상태
    let csvContent = '신청번호,신청자,학번,소속,대여 품목,대여 날짜,반납 날짜,상태\n';

    data.forEach(item => {
      const dept = item.departmentName || item.departmentType || item.user.departmentName || item.user.departmentType || '-';
      const row = [
        esc(`R-${item.id}`),
        esc(item.user.name),
        esc(item.user.studentId),
        esc(dept),
        esc(item.itemSummary?.replace(/\s*외\s*0건$/, '') || '-'),
        escDate(item.startDate),
        escDate(item.endDate),
        esc(RENTAL_STATUS_KO[item.status] ?? item.status),
      ].join(',');
      csvContent += row + '\n';
    });

    downloadCSV(csvContent, '대여관리');
  };

  const exportPlotterCSV = (data: PlotterData[]) => {
    if (data.length === 0) {
      alert('다운로드할 데이터가 없습니다.');
      return;
    }

    // 테이블 컬럼 순서: 신청번호 / 신청자 / 소속 / 파일명(목적) / 용지/장수 / 수령일 / 상태
    let csvContent = '신청번호,신청자,학번,소속,파일명,용지 크기,인쇄 장수,수령일,상태\n';

    data.forEach(item => {
      const dept = item.departmentName || item.user?.departmentName || item.departmentType || '-';
      const row = [
        esc(`P-${item.id}`),
        esc(item.user?.name ?? '사용자 정보 없음'),
        esc(item.user?.studentId ?? '-'),
        esc(dept),
        esc(item.purpose),
        esc(item.paperSize),
        esc(item.pageCount),
        escDate(item.pickupDate ?? ''),
        esc(PLOTTER_STATUS_KO[item.status] ?? item.status),
      ].join(',');
      csvContent += row + '\n';
    });

    downloadCSV(csvContent, '플로터관리');
  };

  const downloadCSV = (csvContent: string, fileName: string) => {
    // BOM 추가 (한글 깨짐 방지)
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportCSV = (activeTab: TabType, rentalData: RentalData[], plotterData: PlotterData[]) => {
    if (activeTab === 'rental') {
      exportRentalCSV(rentalData);
    } else if (activeTab === 'plotter') {
      exportPlotterCSV(plotterData);
    } else {
      alert('물품 목록은 CSV 다운로드를 지원하지 않습니다.');
    }
  };

  return { exportCSV, exportRentalCSV, exportPlotterCSV };
}
