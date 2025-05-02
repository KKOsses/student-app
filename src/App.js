// App.js - ระบบจัดการนักเรียนแบบ popup form และ UID อัตโนมัติ

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

  if (!user) {
    return (
      <div style={{ padding: 20, maxWidth: 400, margin: '0 auto' }}>
        <h2>เข้าสู่ระบบ</h2>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <br />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <br />
        <button onClick={handleLogin}>เข้าสู่ระบบ</button>
      </div>
    );
  }

  if (role === 'teacher') {
    return (
      <div style={{ padding: 20, fontFamily: 'Segoe UI, sans-serif' }}>
        <h1 style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 20 }}>แดชบอร์ดครู: จัดการข้อมูลนักเรียน</h1>

        <button onClick={() => setShowForm(true)} style={{ marginBottom: 20 }}>➕ เพิ่มนักเรียน</button>

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

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#e5e7eb' }}>
            <tr>
              <th style={{ padding: 10 }}>ชื่อ</th>
              <th>นามสกุล</th>
              <th>ชื่อเล่น</th>
              <th>เพศ</th>
              <th>Email</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {students.map(([uid, data], i) => (
              <tr key={i} style={{ borderBottom: '1px solid #ddd' }}>
                <td>{data.firstname}</td>
                <td>{data.lastname}</td>
                <td>{data.nickname}</td>
                <td>{data.gender}</td>
                <td>{data.email}</td>
                <td>
                  <button onClick={() => handleEditStudent(uid, data)}>✏️</button>
                  <button onClick={() => handleDeleteStudent(uid)} style={{ marginLeft: 5 }}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

<div style={{ marginTop: 40 }}>
  <h2 style={{ fontSize: 20, fontWeight: '600', marginBottom: 10 }}>จัดการคะแนน</h2>

  <div style={{ marginBottom: 20, background: '#f9fafb', padding: 15, borderRadius: 8 }}>
    <label>ชื่อเล่น: <input value={formData.nickname || ''} onChange={e => setFormData({ ...formData, nickname: e.target.value })} /></label><br />
    <label>เทอม:
      <select value={formData.term || 'term1'} onChange={e => setFormData({ ...formData, term: e.target.value })}>
        <option value="term1">เทอม 1</option>
        <option value="term2">เทอม 2</option>
      </select>
    </label><br />
    <label>หมวดหมู่:
      <select value={formData.category || ''} onChange={e => setFormData({ ...formData, category: e.target.value })}>
        <option value="">--เลือก--</option>
        <option value="แบบฝึกหัด">แบบฝึกหัด</option>
        <option value="กิจกรรม">กิจกรรม</option>
        <option value="สอบกลางภาค">สอบกลางภาค</option>
        <option value="สอบปลายภาค">สอบปลายภาค</option>
        <option value="จิตพิสัย">จิตพิสัย</option>
      </select>
    </label><br />
    <label>คะแนน: <input type="number" value={formData.score || ''} onChange={e => setFormData({ ...formData, score: e.target.value })} /></label><br />
    <label>หมายเหตุ: <input value={formData.note || ''} onChange={e => setFormData({ ...formData, note: e.target.value })} /></label><br />
    <button onClick={handleAddScore}>บันทึกคะแนน</button>
  </div>

  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
    <thead style={{ backgroundColor: '#e5e7eb' }}>
      <tr>
        <th style={{ padding: 10 }}>วันที่</th>
        <th>ชื่อเล่น</th>
        <th>เทอม</th>
        <th>หมวด</th>
        <th>คะแนน</th>
        <th>หมายเหตุ</th>
      </tr>
    </thead>
    <tbody>
      {Object.entries(scoreRecords).map(([uid, entries]) =>
        Object.values(entries).map((entry, idx) => (
          <tr key={uid + idx} style={{ borderBottom: '1px solid #ddd' }}>
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

// เพิ่ม state และฟังก์ชันที่เกี่ยวข้องไว้ด้านบนใน component:
const [formData, setFormData] = useState({});
const [scoreRecords, setScoreRecords] = useState({});

useEffect(() => {
  if (role === 'teacher') {
    onValue(ref(db, 'scores'), (snapshot) => {
      if (snapshot.exists()) setScoreRecords(snapshot.val());
    });
  }
}, [role]);

const handleAddScore = () => {
  const uid = uids.find(id => nicknames[id] === formData.nickname);
  if (!uid) return alert('ไม่พบชื่อนักเรียน');
  const newEntry = {
    date: new Date().toISOString().slice(0, 10),
    ...formData
  };
  const newKey = push(ref(db)).key;
  set(ref(db, `scores/${uid}/${newKey}`), newEntry);
  setFormData({});
};

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
