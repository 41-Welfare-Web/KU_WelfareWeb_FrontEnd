import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";

interface User {
  id: string;
  username: string;
  name: string;
  studentId: string;
  phoneNumber?: string;
  departmentType?: string;
  departmentName?: string;
}

interface AdminUserSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: User) => void;
}

export default function AdminUserSelectModal({
  isOpen,
  onClose,
  onSelectUser,
}: AdminUserSelectModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 사용자 목록 조회
  useEffect(() => {
    if (isOpen && users.length === 0) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get("/api/users", {
        params: { pageSize: 1000 },
      });
      // 백엔드 응답 구조에 따라 users 또는 data로 처리
      const userList = response.data.users || response.data || [];
      setUsers(userList);
      setFilteredUsers(userList);
    } catch (err: any) {
      console.error("사용자 목록 조회 실패:", err);
      setError("사용자 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 검색 필터링
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.name?.toLowerCase().includes(query) ||
        user.studentId?.includes(query) ||
        user.username?.toLowerCase().includes(query) ||
        user.phoneNumber?.includes(query) ||
        user.departmentName?.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl max-h-[90vh] bg-white rounded-[15px] shadow-2xl flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-[20px] font-bold text-black">사용자 선택</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-[24px] font-bold"
          >
            ✕
          </button>
        </div>

        {/* 검색 필터 */}
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="이름, 학번, 전화번호로 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fe6949]"
          />
        </div>

        {/* 사용자 목록 */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-[200px]">
              <span className="text-gray-500">로딩 중...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-[200px]">
              <span className="text-red-500">{error}</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex items-center justify-center h-[200px]">
              <span className="text-gray-500">사용자를 찾을 수 없습니다.</span>
            </div>
          ) : (
            <div>
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    onSelectUser(user);
                  }}
                  className="w-full px-4 py-3 border-b border-gray-200 hover:bg-gray-50 transition text-left flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-black truncate">
                        {user.name}
                      </span>
                      <span className="text-[12px] text-gray-500">
                        ({user.studentId})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[12px] text-gray-600">
                      <span>{user.departmentName || user.departmentType || "-"}</span>
                      {user.phoneNumber && (
                        <>
                          <span>•</span>
                          <span>{user.phoneNumber}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="ml-2 text-[16px] text-gray-400">›</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="border-t border-gray-200 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
