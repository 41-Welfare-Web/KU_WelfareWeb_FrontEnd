import { useState } from "react";

interface ProfileEditFormProps {
  userId: string;
  initialDepartment?: string;
  onUpdate?: (data: {
    password: string;
    passwordConfirm: string;
    department: string;
  }) => void;
  onDelete?: () => void;
  className?: string;
}

export default function ProfileEditForm({
  userId,
  initialDepartment = "학생복지 위원회",
  onUpdate,
  onDelete,
  className = "",
}: ProfileEditFormProps) {
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [department, setDepartment] = useState(initialDepartment);

  const handlePasswordCheck = () => {
    if (password === passwordConfirm) {
      alert("비밀번호가 일치합니다.");
    } else {
      alert("비밀번호가 일치하지 않습니다.");
    }
  };

  const handleProfileUpdate = () => {
    if (!password) {
      alert("비밀번호를 입력해주세요.");
      return;
    }
    if (password !== passwordConfirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    
    if (onUpdate) {
      onUpdate({ password, passwordConfirm, department });
    } else {
      alert("개인정보가 수정되었습니다.");
    }
  };

  const handleAccountDelete = () => {
    if (window.confirm("정말 탈퇴하시겠습니까?")) {
      if (onDelete) {
        onDelete();
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

      {/* 비밀번호 */}
      <div className="mb-8">
        <label className="block text-[20px] text-black mb-3">비밀번호</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="***********"
          className="w-full h-[71px] bg-[#efefef] rounded-[10px] px-6 text-[20px] text-[#afafaf] placeholder:text-[#afafaf]"
        />
      </div>

      {/* 비밀번호 확인 */}
      <div className="mb-8">
        <label className="block text-[20px] text-black mb-3">비밀번호 확인</label>
        <div className="flex gap-3">
          <input
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            placeholder="***********"
            className="flex-1 h-[67px] bg-[#efefef] rounded-[10px] px-6 text-[20px] text-[#afafaf] placeholder:text-[#afafaf]"
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
