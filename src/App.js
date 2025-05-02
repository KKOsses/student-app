import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
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

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD0dkJ2kyflxx7YXMk4uRUKBmG_-DVdAgw",
  authDomain: "new2025-df8b1.firebaseapp.com",
  databaseURL: "https://new2025-df8b1-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "new2025-df8b1",
  storageBucket: "new2025-df8b1.appspot.com",
  messagingSenderId: "484552082660",
  appId: "1:484552082660:web:1bbe9e590e8a749d3e98f1"
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
  const [behaviorForm, setBehaviorForm] = useState({});
  const [behaviorRecords, setBehaviorRecords] = useState({});

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
      onValue(ref(db, 'behavior'), (snapshot) => {
        if (snapshot.exists()) setBehaviorRecords(snapshot.val());
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

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setRole('');
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

  const handleAddBehavior = () => {
    const uid = students.find(([id, s]) => s.nickname === behaviorForm.nickname)?.[0];
    if (!uid) return alert('ไม่พบชื่อนักเรียน');
    const newEntry = {
      date: new Date().toISOString().slice(0, 10),
      ...behaviorForm
    };
    const newKey = push(ref(db)).key;
    set(ref(db, `behavior/${uid}/${newKey}`), newEntry);
    setBehaviorForm({});
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
        <button onClick={handleLogout} style={{ float: 'right', background: '#eee' }}>ออกระบบ</button>
        <h1>แดชบอร์ดครู</h1>
        <button onClick={() => setShowForm(true)}>➕ เพิ่มนักเรียน</button>
        {showForm && (
          <div>
            <input placeholder="ชื่อ" value={formData.firstname} onChange={e => setFormData({ ...formData, firstname: e.target.value })} /><br />
            <input placeholder="นามสกุล" value={formData.lastname} onChange={e => setFormData({ ...formData, lastname: e.target.value })} /><br />
            <input placeholder="ชื่อเล่น" value={formData.nickname} onChange={e => setFormData({ ...formData, nickname: e.target.value })} /><br />
            <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
              <option value="ชาย">ชาย</option>
              <option value="หญิง">หญิง</option>
            </select><br />
            <input placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} /><br />
            <input placeholder="Password" type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} /><br />
            <button onClick={handleSaveStudent}>บันทึก</button>
          </div>
        )}

        <h2>คะแนน</h2>
        <select value={scoreForm.nickname || ''} onChange={e => setScoreForm({ ...scoreForm, nickname: e.target.value })}>
          <option value="">เลือกนักเรียน</option>
          {students.map(([uid, data]) => (
            <option key={uid} value={data.nickname}>{data.nickname}</option>
          ))}
        </select><br />
        <select value={scoreForm.term || 'term1'} onChange={e => setScoreForm({ ...scoreForm, term: e.target.value })}>
          <option value="term1">เทอม 1</option>
          <option value="term2">เทอม 2</option>
        </select><br />
        <select value={scoreForm.category || ''} onChange={e => setScoreForm({ ...scoreForm, category: e.target.value })}>
          <option value="">เลือกหมวด</option>
          <option value="แบบฝึกหัด">แบบฝึกหัด</option>
          <option value="กิจกรรม">กิจกรรม</option>
          <option value="สอบกลางภาค">สอบกลางภาค</option>
          <option value="สอบปลายภาค">สอบปลายภาค</option>
          <option value="จิตพิสัย">จิตพิสัย</option>
        </select><br />
        <input type="number" placeholder="คะแนน" value={scoreForm.score || ''} onChange={e => setScoreForm({ ...scoreForm, score: e.target.value })} /><br />
        <input placeholder="หมายเหตุ" value={scoreForm.note || ''} onChange={e => setScoreForm({ ...scoreForm, note: e.target.value })} /><br />
        <button onClick={handleAddScore}>บันทึกคะแนน</button>

        <h2>พฤติกรรม</h2>
        <select value={behaviorForm.nickname || ''} onChange={e => setBehaviorForm({ ...behaviorForm, nickname: e.target.value })}>
          <option value="">เลือกนักเรียน</option>
          {students.map(([uid, data]) => (
            <option key={uid} value={data.nickname}>{data.nickname}</option>
          ))}
        </select><br />
        <input placeholder="พฤติกรรม" value={behaviorForm.behavior || ''} onChange={e => setBehaviorForm({ ...behaviorForm, behavior: e.target.value })} /><br />
        <input placeholder="หมายเหตุ" value={behaviorForm.note || ''} onChange={e => setBehaviorForm({ ...behaviorForm, note: e.target.value })} /><br />
        <button onClick={handleAddBehavior}>บันทึกพฤติกรรม</button>
      </div>
    );
  }

  return <div>Loading...</div>;
}

export default App;