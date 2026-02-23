import { useState } from "react";

interface ProfileEditFormProps {
  userId: string;
  initialDepartment?: string;
  onUpdate?: (data: {
    currentPassword: string;
    newPassword?: string;
    department: string;
  }) => void;
  onDelete?: (password: string) => void;
  className?: string;
}

export default function ProfileEditForm({
  userId,
  initialDepartment = "학생복지 위원회",
  onUpdate,
  onDelete,
  className = "",
}: ProfileEditFormProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [department, setDepartment] = useState(initialDepartment);

  // 비밀번호 유효성 검사
  const validatePassword = (password: string): boolean => {
    // 최소 8자 이상, 영문자, 숫자, 특수문자(@$!%*#?&) 각 1개 이상
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handlePasswordCheck = () => {
    if (!newPassword && !newPasswordConfirm) {
      alert("새 비밀번호를 입력해주세요.");
      return;
    }
    if (!validatePassword(newPassword)) {
      alert("비밀번호는 최소 8자 이상이며, 영문자, 숫자, 특수문자(@$!%*#?&)를 각각 1개 이상 포함해야 합니다.");
      return;
    }
    if (newPassword === newPasswordConfirm) {
      alert("비밀번호가 일치합니다.");
    } else {
      alert("비밀번호가 일치하지 않습니다.");
    }
  };

  const handleProfileUpdate = () => {
    // 현재 비밀번호는 필수 (본인 확인용)
    if (!currentPassword) {
      alert("본인 확인을 위해 현재 비밀번호를 입력해주세요.");
      return;
    }
    
    // 새 비밀번호를 입력한 경우, 확인 필드와 일치해야 함
    if (newPassword || newPasswordConfirm) {
      if (newPassword !== newPasswordConfirm) {
        alert("새 비밀번호가 일치하지 않습니다.");
        return;
      }
      // 새 비밀번호 유효성 검사
      if (newPassword && !validatePassword(newPassword)) {
        alert("비밀번호는 최소 8자 이상이며, 영문자, 숫자, 특수문자(@$!%*#?&)를 각각 1개 이상 포함해야 합니다.");
        return;
      }
    }
    
    if (onUpdate) {
      onUpdate({ 
        currentPassword, 
        newPassword: newPassword || undefined, 
        department 
      });
    } else {
      alert("개인정보가 수정되었습니다.");
    }
  };

  const handleAccountDelete = () => {
    if (!currentPassword) {
      alert("탈퇴를 위해 현재 비밀번호를 입력해주세요.");
      return;
    }
    
    if (window.confirm("정말 탈퇴하시겠습니까?")) {
      if (onDelete) {
        onDelete(currentPassword);
      } else {
        alert("회원 탈퇴가 완료되었습니다.");
      }
    }
  };

  return (
    <div className={`bg-white border border-[#e2e2e2] rounded-[22px] shadow-lg p-12 w-[544px] ${className}`}>
      <h2 className="text-[32px] font-bold text-black text-center mb-8">
        개인정보 수정
      </h2>

      {/* 아이디 */}
      <div className="mb-8">
        <label className="block text-[20px] text-black mb-3">아이디</label>
        <input
          type="text"
          value={userId}
          disabled
          className="w-full h-[71px] bg-[#efefef] rounded-[10px] px-6 text-[20px] text-[#afafaf]"
        />
      </div>

      {/* 현재 비밀번호 */}
      <div className="mb-8">
        <label className="block text-[20px] text-black mb-3">현재 비밀번호 (필수)</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="본인 확인을 위해 현재 비밀번호를 입력하세요"
          className="w-full h-[71px] bg-[#efefef] rounded-[10px] px-6 text-[20px] text-black placeholder:text-[#afafaf]"
        />
      </div>

      {/* 새 비밀번호 */}
      <div className="mb-8">
        <label className="block text-[20px] text-black mb-3">새 비밀번호 (선택)</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="변경하지 않으려면 비워두세요"
          className="w-full h-[71px] bg-[#efefef] rounded-[10px] px-6 text-[20px] text-black placeholder:text-[#afafaf]"
        />
        <p className="mt-2 text-[14px] text-[#868686]">
          * 최소 8자 이상, 영문자, 숫자, 특수문자(@$!%*#?&) 각 1개 이상 포함
        </p>
      </div>

      {/* 새 비밀번호 확인 */}
      <div className="mb-8">
        <label className="block text-[20px] text-black mb-3">새 비밀번호 확인</label>
        <div className="flex gap-3">
          <input
            type="password"
            value={newPasswordConfirm}
            onChange={(e) => setNewPasswordConfirm(e.target.value)}
            placeholder="새 비밀번호를 다시 입력하세요"
            className="flex-1 h-[67px] bg-[#efefef] rounded-[10px] px-6 text-[20px] text-black placeholder:text-[#afafaf]"
          />
          <button
            onClick={handlePasswordCheck}
            className="w-[106px] h-[67px] bg-[#fe6949] rounded-[10px] text-[24px] text-white font-bold hover:bg-[#e55838] transition"
          >
            확인
          </button>
        </div>
      </div>

      {/* 단위 변경 */}
      <div className="mb-8">
        <label className="block text-[20px] text-black mb-3">단위 변경</label>
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="w-full h-[71px] bg-[#efefef] rounded-[10px] px-6 text-[20px] text-black appearance-none cursor-pointer"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M7 10l5 5 5-5z' fill='%23000000'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 1rem center',
          }}
        >
          <option value="학생복지 위원회">학생복지 위원회</option>
          <option value="총학생회">총학생회</option>
          <option value="단과대 학생회">단과대 학생회</option>
          <option value="동아리">동아리</option>
          <option value="학과 학생회">학과 학생회</option>
        </select>
      </div>

      {/* 수정 완료 버튼 */}
      <button
        onClick={handleProfileUpdate}
        className="w-full h-[71px] bg-[#fd7d5d] rounded-[10px] text-[24px] text-white font-bold hover:bg-[#e46c4c] transition mb-6"
      >
        수정 완료
      </button>

      {/* 회원 탈퇴 */}
      <button
        onClick={handleAccountDelete}
        className="w-full text-[20px] text-[#868686] underline hover:text-[#666] transition"
      >
        회원 탈퇴하기
      </button>
    </div>
  );
}
