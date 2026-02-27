type TabType = 'rental' | 'plotter' | 'items';

interface RentalData {
  id: number;
  user: {
    name: string;
    studentId: string;
    department?: string;
  };
  startDate: string;
  endDate: string;
  status: string;
  itemSummary: string;
  createdAt: string;
}

interface PlotterData {
  id: number;
  user: {
    name: string;
    studentId: string;
    department?: string;
  };
  purpose: string;
  paperSize: string;
  pageCount: number;
  pickupDate: string;
  status: string;
  createdAt: string;
}

export function useExportCSV() {
  const exportRentalCSV = (data: RentalData[]) => {
    if (data.length === 0) {
      alert('다운로드할 데이터가 없습니다.');
      return;
    }

    // CSV 헤더
    let csvContent = '예약번호,이름,학번,신청일,예약 기간,상태,물품명\n';
    
    // CSV 행 생성
    data.forEach(item => {
      const row = [
        `RENT-${item.id}`,
        item.user.name,
        item.user.studentId,
        item.createdAt.split('T')[0],
        `${item.startDate} ~ ${item.endDate}`,
        item.status,
        item.itemSummary.replace(/,/g, ' ')
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

    // CSV 헤더
    let csvContent = '주문번호,이름,학번,신청일,목적,용지 크기,장수,수령일,상태\n';
    
    // CSV 행 생성
    data.forEach(item => {
      const row = [
        `PLOT-${item.id}`,
        item.user.name,
        item.user.studentId,
        item.createdAt.split('T')[0],
        item.purpose.replace(/,/g, ' '),
        item.paperSize,
        item.pageCount,
        item.pickupDate || '-',
        item.status
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
