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

  const [newBehavior, setNewBehavior] = useState('');
  const [newScore, setNewScore] = useState({ category: '', term: '', score: '' });

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

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleAddBehavior = () => {
    if (newBehavior && studentData) {
      push(ref(db, `behavior/${studentData.uid}`), {
        date: new Date().toISOString(),
        note: newBehavior
      });
      setNewBehavior('');
    }
  };

  const handleAddScore = () => {
    const { category, term, score } = newScore;
    if (category && term && score && studentData) {
      set(ref(db, `scores/${studentData.uid}/${term}/${category}`), parseInt(score));
      setNewScore({ category: '', term: '', score: '' });
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
      <div style={{ padding: 20 }}>
        <h1>หน้าครู - จัดการข้อมูลนักเรียน</h1>
        <h2>เพิ่มพฤติกรรม</h2>
        <input placeholder="ข้อความพฤติกรรม" value={newBehavior} onChange={e => setNewBehavior(e.target.value)} />
        <button onClick={handleAddBehavior}>บันทึก</button>

        <h2>เพิ่มคะแนน</h2>
        <input placeholder="หมวดคะแนน" value={newScore.category} onChange={e => setNewScore({ ...newScore, category: e.target.value })} />
        <input placeholder="เทอม (term1, term2)" value={newScore.term} onChange={e => setNewScore({ ...newScore, term: e.target.value })} />
        <input placeholder="คะแนน" value={newScore.score} onChange={e => setNewScore({ ...newScore, score: e.target.value })} />
        <button onClick={handleAddScore}>บันทึกคะแนน</button>
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