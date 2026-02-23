import { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { createDummyPlotterOrders } from '../../services/plotterApi';
import { createDummyRentals } from '../../services/rentalApi';

export default function TestDataPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleCreatePlotterData = async () => {
    const count = prompt('생성할 플로터 주문 개수를 입력하세요:', '5');
    if (!count) return;

    const numCount = parseInt(count);
    if (isNaN(numCount) || numCount < 1 || numCount > 20) {
      alert('1~20 사이의 숫자를 입력하세요.');
      return;
    }

    try {
      setLoading(true);
      setMessage('플로터 테스트 데이터 생성 중...');
      const results = await createDummyPlotterOrders(numCount);
      setMessage(`✅ 플로터 주문 ${results.length}개 생성 완료!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('플로터 더미 데이터 생성 실패:', error);
      setMessage('❌ 플로터 데이터 생성에 실패했습니다.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRentalData = async () => {
    const count = prompt('생성할 대여 예약 개수를 입력하세요:', '5');
    if (!count) return;

    const numCount = parseInt(count);
    if (isNaN(numCount) || numCount < 1 || numCount > 20) {
      alert('1~20 사이의 숫자를 입력하세요.');
      return;
    }

    try {
      setLoading(true);
      setMessage('대여 테스트 데이터 생성 중...');
      const results = await createDummyRentals(numCount);
      setMessage(`✅ 대여 예약 ${results.length}개 생성 완료!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('대여 더미 데이터 생성 실패:', error);
      setMessage('❌ 대여 데이터 생성에 실패했습니다.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      
      <div className="w-full bg-gradient-to-b from-[#ffdcc5] to-white min-h-screen pb-20">
        <div className="max-w-[1440px] mx-auto px-8 pt-8">
          {/* 타이틀 */}
          <div className="relative inline-block mb-8">
            <h1 className="text-[48px] font-bold text-[#410f07] mb-2">테스트 데이터 생성</h1>
            <div className="absolute left-0 bottom-0 w-[400px] h-[4px] bg-[#410f07]"></div>
          </div>

          {/* 안내 메시지 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-yellow-800 mb-2">⚠️ 주의사항</h2>
            <ul className="list-disc list-inside text-yellow-700 space-y-1">
              <li>이 페이지는 개발/테스트 목적으로만 사용하세요.</li>
              <li>더미 데이터는 실제 API를 호출하여 서버에 저장됩니다.</li>
              <li>로그인된 사용자 계정으로 데이터가 생성됩니다.</li>
              <li>한 번에 최대 20개까지 생성 가능합니다.</li>
            </ul>
          </div>

          {/* 상태 메시지 */}
          {message && (
            <div className={`p-4 rounded-lg mb-6 ${
              message.includes('✅') ? 'bg-green-50 text-green-800 border border-green-200' : 
              message.includes('❌') ? 'bg-red-50 text-red-800 border border-red-200' : 
              'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              <p className="font-medium">{message}</p>
            </div>
          )}

          {/* 버튼 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 플로터 데이터 생성 */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">플로터 주문 데이터</h2>
                <p className="text-gray-600">
                  다양한 용지 크기와 목적의 플로터 주문 샘플을 생성합니다.
                </p>
              </div>
              <button
                onClick={handleCreatePlotterData}
                disabled={loading}
                className="w-full bg-[#FE6949] text-white rounded-lg py-4 px-6 font-bold text-lg hover:bg-[#e55838] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '생성 중...' : '플로터 데이터 생성'}
              </button>
              <div className="mt-4 text-sm text-gray-500">
                <p>• A0, A1, A2, A3 용지 크기 랜덤 생성</p>
                <p>• 1~5장 랜덤 매수</p>
                <p>• 더미 PDF 파일 포함</p>
              </div>
            </div>

            {/* 대여 데이터 생성 */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">대여 예약 데이터</h2>
                <p className="text-gray-600">
                  다양한 기간과 물품의 대여 예약 샘플을 생성합니다.
                </p>
              </div>
              <button
                onClick={handleCreateRentalData}
                disabled={loading}
                className="w-full bg-[#155DFC] text-white rounded-lg py-4 px-6 font-bold text-lg hover:bg-[#1048c9] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '생성 중...' : '대여 데이터 생성'}
              </button>
              <div className="mt-4 text-sm text-gray-500">
                <p>• 1~3일 대여 기간 랜덤 생성</p>
                <p>• 물품 ID 1~10 랜덤 선택</p>
                <p>• 1~3개 물품 랜덤 수량</p>
              </div>
            </div>
          </div>

          {/* 추가 정보 */}
          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">💡 팁</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• 생성된 데이터는 <strong>관리자 대시보드</strong>에서 확인할 수 있습니다.</li>
              <li>• 마이페이지에서도 자신의 예약 내역을 확인할 수 있습니다.</li>
              <li>• API 과부하 방지를 위해 각 요청 사이에 0.5초 딜레이가 있습니다.</li>
              <li>• 테스트 후에는 수동으로 삭제하거나 데이터베이스를 초기화하세요.</li>
            </ul>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
