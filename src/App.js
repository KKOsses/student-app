import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getDatabase,
  ref,
  get,
  set,
  remove,
  onValue,
  push
} from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';

const firebaseConfig = {
  apiKey: 'AIzaSyD0dkJ2kyflxx7YXMk4uRUKBmG_-DVdAgw',
  authDomain: 'new2025-df8b1.firebaseapp.com',
  databaseURL: 'https://new2025-df8b1-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'new2025-df8b1',
  storageBucket: 'new2025-df8b1.firebasestorage.app',
  messagingSenderId: '484552082660',
  appId: '1:484552082660:web:1bbe9e590e8a749d3e98f1'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    nickname: '',
    gender: 'ชาย',
    email: '',
    password: ''
  });
  const [editId, setEditId] = useState(null);

  const [scoreForm, setScoreForm] = useState({});
  const [scoreRecords, setScoreRecords] = useState({});

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        get(ref(db, 'users/' + currentUser.uid)).then((snapshot) => {
          if (snapshot.exists()) {
            const userInfo = snapshot.val();
            setRole(userInfo.role);
            if (userInfo.role === 'student') {
              setStudentData(userInfo);
            }
          }
        });
      }
    });
  }, []);

  useEffect(() => {
    if (role === 'teacher') {
      onValue(ref(db, 'users'), (snapshot) => {
        if (snapshot.exists()) {
          const allUsers = snapshot.val();
          const studentList = Object.entries(allUsers).filter(([_, u]) => u.role === 'student');
          setStudents(studentList);
        }
      });
      onValue(ref(db, 'scores'), (snapshot) => {
        if (snapshot.exists()) setScoreRecords(snapshot.val());
      });
    }
  }, [role]);

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSaveStudent = async () => {
    try {
      if (!formData.email || !formData.password) return alert('กรุณากรอก email และ password');
      let uid = editId || uuidv4();
      if (!editId) {
        const cred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        uid = cred.user.uid;
      }
      await set(ref(db, `users/${uid}`), {
        uid,
        role: 'student',
        ...formData
      });
      setFormData({ firstname: '', lastname: '', nickname: '', gender: 'ชาย', email: '', password: '' });
      setEditId(null);
      setShowForm(false);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEditStudent = (uid, data) => {
    setFormData(data);
    setEditId(uid);
    setShowForm(true);
  };

  const handleDeleteStudent = async (uid) => {
    if (window.confirm('ต้องการลบนักเรียนคนนี้หรือไม่?')) {
      await remove(ref(db, `users/${uid}`));
    }
  };

  const handleAddScore = () => {
    const uid = students.find(([id, s]) => s.nickname === scoreForm.nickname)?.[0];
    if (!uid) return alert('ไม่พบชื่อนักเรียน');
    const newEntry = {
      date: new Date().toISOString().slice(0, 10),
      ...scoreForm
    };
    const newKey = push(ref(db)).key;
    set(ref(db, `scores/${uid}/${newKey}`), newEntry);
    setScoreForm({});
  };

  if (!user) {
    return (
      <div style={{ padding: 20, maxWidth: 400, margin: '0 auto' }}>
        <h2>เข้าสู่ระบบ</h2>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} /><br />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} /><br />
        <button onClick={handleLogin}>เข้าสู่ระบบ</button>
      </div>
    );
  }

  if (role === 'teacher') {
    return (
      <div style={{ padding: 20 }}>
        <h1>แดชบอร์ดครู: จัดการข้อมูลนักเรียน</h1>
        <button onClick={() => setShowForm(true)}>➕ เพิ่มนักเรียน</button>

        {showForm && (
          <div style={{ background: '#f3f4f6', padding: 20, borderRadius: 10, marginBottom: 20 }}>
            <h2>{editId ? 'แก้ไขนักเรียน' : 'เพิ่มนักเรียนใหม่'}</h2>
            <input placeholder="ชื่อ" value={formData.firstname} onChange={e => setFormData({ ...formData, firstname: e.target.value })} /><br />
            <input placeholder="นามสกุล" value={formData.lastname} onChange={e => setFormData({ ...formData, lastname: e.target.value })} /><br />
            <input placeholder="ชื่อเล่น" value={formData.nickname} onChange={e => setFormData({ ...formData, nickname: e.target.value })} /><br />
            <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
              <option value="ชาย">ชาย</option>
              <option value="หญิง">หญิง</option>
            </select><br />
            <input placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} /><br />
            <input placeholder="Password" type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} /><br />
            <button onClick={handleSaveStudent}>{editId ? 'บันทึกการแก้ไข' : 'เพิ่มนักเรียน'}</button>
            <button onClick={() => { setShowForm(false); setFormData({ firstname: '', lastname: '', nickname: '', gender: 'ชาย', email: '', password: '' }); setEditId(null); }} style={{ marginLeft: 10 }}>ยกเลิก</button>
          </div>
        )}

        <h2>รายชื่อนักเรียน</h2>
        <table border="1" cellPadding="5">
          <thead>
            <tr><th>ชื่อ</th><th>นามสกุล</th><th>ชื่อเล่น</th><th>เพศ</th><th>Email</th><th>จัดการ</th></tr>
          </thead>
          <tbody>
            {students.map(([uid, data]) => (
              <tr key={uid}>
                <td>{data.firstname}</td>
                <td>{data.lastname}</td>
                <td>{data.nickname}</td>
                <td>{data.gender}</td>
                <td>{data.email}</td>
                <td>
                  <button onClick={() => handleEditStudent(uid, data)}>✏️</button>
                  <button onClick={() => handleDeleteStudent(uid)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: 40 }}>
          <h2>จัดการคะแนน</h2>
          <div>
  <select
    value={scoreForm.nickname || ''}
    onChange={e => setScoreForm({ ...scoreForm, nickname: e.target.value })}
  >
    <option value="">เลือกชื่อนักเรียน</option>
    {students.map(([uid, data]) => (
      <option key={uid} value={data.nickname}>{data.nickname}</option>
    ))}
  </select><br />
  <select value={scoreForm.term || 'term1'} onChange={e => setScoreForm({ ...scoreForm, term: e.target.value })}>
    <option value="term1">เทอม 1</option>
    <option value="term2">เทอม 2</option>
  </select><br />
  <select value={scoreForm.category || ''} onChange={e => setScoreForm({ ...scoreForm, category: e.target.value })}>
    <option value="">เลือกหมวดคะแนน</option>
    <option value="แบบฝึกหัด">แบบฝึกหัด</option>
    <option value="กิจกรรม">กิจกรรม</option>
    <option value="สอบกลางภาค">สอบกลางภาค</option>
    <option value="สอบปลายภาค">สอบปลายภาค</option>
    <option value="จิตพิสัย">จิตพิสัย</option>
  </select><br />
  <input type="number" placeholder="คะแนน" value={scoreForm.score || ''} onChange={e => setScoreForm({ ...scoreForm, score: e.target.value })} /><br />
  <input placeholder="หมายเหตุ" value={scoreForm.note || ''} onChange={e => setScoreForm({ ...scoreForm, note: e.target.value })} /><br />
  <button onClick={handleAddScore}>บันทึกคะแนน</button>
</div>

          <h3>ตารางคะแนน</h3>
          <table border="1" cellPadding="5">
            <thead>
              <tr><th>วันที่</th><th>ชื่อเล่น</th><th>เทอม</th><th>หมวด</th><th>คะแนน</th><th>หมายเหตุ</th></tr>
            </thead>
            <tbody>
              {Object.entries(scoreRecords).map(([uid, entries]) =>
                Object.values(entries).map((entry, idx) => (
                  <tr key={uid + idx}>
                    <td>{entry.date}</td>
                    <td>{entry.nickname}</td>
                    <td>{entry.term}</td>
                    <td>{entry.category}</td>
                    <td>{entry.score}</td>
                    <td>{entry.note}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (role === 'student' && studentData) {
    return (
      <div style={{ padding: 20 }}>
        <h1>คะแนนและพฤติกรรมของ {studentData.nickname}</h1>
      </div>
    );
  }

  return <div>Loading...</div>;
}

export default App;
