import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getDatabase,
  ref,
  get,
  set,
  push,
  onValue
} from 'firebase/database';

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
  const [behaviorLogs, setBehaviorLogs] = useState([]);
  const [scores, setScores] = useState({});
  const [students, setStudents] = useState([]);

  const [newStudent, setNewStudent] = useState({ uid: '', nickname: '', email: '', role: 'student' });

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
              onValue(ref(db, `scores/${currentUser.uid}`), (snap) => {
                if (snap.exists()) setScores(snap.val());
              });
              onValue(ref(db, `behavior/${currentUser.uid}`), (snap) => {
                if (snap.exists()) setBehaviorLogs(Object.values(snap.val()));
              });
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
          const studentList = Object.values(allUsers).filter(u => u.role === 'student');
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

  const handleAddStudent = () => {
    if (newStudent.uid && newStudent.nickname && newStudent.email) {
      set(ref(db, `users/${newStudent.uid}`), newStudent);
      setNewStudent({ uid: '', nickname: '', email: '', role: 'student' });
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

        <section style={{ backgroundColor: '#f3f4f6', padding: 20, borderRadius: 10, marginBottom: 30 }}>
          <h2 style={{ fontSize: 20, fontWeight: '600' }}>เพิ่มนักเรียนใหม่</h2>
          <input placeholder="UID" value={newStudent.uid} onChange={e => setNewStudent({ ...newStudent, uid: e.target.value })} style={{ marginRight: 10 }} />
          <input placeholder="ชื่อเล่น" value={newStudent.nickname} onChange={e => setNewStudent({ ...newStudent, nickname: e.target.value })} style={{ marginRight: 10 }} />
          <input placeholder="Email" value={newStudent.email} onChange={e => setNewStudent({ ...newStudent, email: e.target.value })} style={{ marginRight: 10 }} />
          <button onClick={handleAddStudent}>เพิ่มนักเรียน</button>
        </section>

        <section>
          <h2 style={{ fontSize: 20, fontWeight: '600', marginBottom: 10 }}>รายชื่อนักเรียน</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#e5e7eb' }}>
              <tr>
                <th style={{ padding: 10 }}>UID</th>
                <th>ชื่อเล่น</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: 8 }}>{s.uid}</td>
                  <td>{s.nickname}</td>
                  <td>{s.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    );
  }

  if (role === 'student' && studentData) {
    return (
      <div style={{ padding: 20 }}>
        <h1>คะแนนและพฤติกรรมของ {studentData.nickname}</h1>
        <div>
          <h2>คะแนน</h2>
          {Object.keys(scores).map(term => (
            <div key={term}>
              <h3>{term}</h3>
              <ul>
                {Object.entries(scores[term]).map(([category, value]) => (
                  <li key={category}>{category}: {value}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div>
          <h2>ประวัติพฤติกรรม</h2>
          <ul>
            {behaviorLogs.map((entry, idx) => (
              <li key={idx}>{new Date(entry.date).toLocaleDateString()}: {entry.note}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return <div>Loading...</div>;
}

export default App;
