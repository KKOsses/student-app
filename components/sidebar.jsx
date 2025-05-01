export function Sidebar({ role, onRoleChange }) {
  return (
    <aside className="w-64 bg-white border-r p-4 space-y-4">
      <div className="text-xl font-bold">ระบบบันทึกคะแนน</div>
      <div>
        <button onClick={() => onRoleChange('teacher')} className={role === 'teacher' ? 'font-bold' : ''}>
          ครู
        </button>
        <span> / </span>
        <button onClick={() => onRoleChange('student')} className={role === 'student' ? 'font-bold' : ''}>
          นักเรียน
        </button>
      </div>
    </aside>
  );
}