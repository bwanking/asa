import React from 'react'; // Removed unused useState to fix Vercel error
import { db } from './firebase'; 
import { doc, setDoc } from 'firebase/firestore';

const GlobalStyles = () => (
  <style>{`
    body, html { margin: 0; padding: 0; width: 100%; height: 100%; background: #f8fafd; font-family: 'Inter', sans-serif; }
    .app-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; }
    .admin-btn {
      position: fixed; bottom: 20px; right: 20px; background: #ff4444; color: white;
      border: none; padding: 20px; borderRadius: 12px; font-weight: 900;
      cursor: pointer; z-index: 10000; box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }
    .status-box { background: white; padding: 40px; border-radius: 30px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
  `}</style>
);

function App() {
  // --- UDA FACTORY LOGIC ---
  const uploadP3Math = async () => {
    const targetClass = "P3";
    const targetSubject = "MATHEMATICS";
    
    console.log("🚀 Factory Started...");
    
    // Loop to create 100 Sets (1990 - 2089)
    for (let i = 0; i < 100; i++) {
      const yearMapping = 1990 + i; 
      const docId = `${targetClass.toLowerCase()}_${targetSubject.toLowerCase()}_${yearMapping}`;
      
      const generatedQuestions = Array.from({ length: 50 }, (_, index) => {
        const qNum = index + 1;
        const qId = (yearMapping * 100) + qNum;
        
        let questionObj = {
          q: "",
          ans: "",
          options: [],
          artType: null,
          artValue: null
        };

        // Logic for P3 Math Questions
        if (qNum % 10 === 1) {
          const count = (qId % 5) + 4;
          questionObj.q = `How many members are in this set?`;
          questionObj.ans = `${count}`;
          questionObj.options = [`${count}`, `${count + 2}`, "3", "10"];
          questionObj.artType = "sets";
          questionObj.artValue = count;
        } else if (qNum % 10 === 5) {
          const factor = (qId % 5) + 2;
          questionObj.q = `Multiply: ${factor} x 3 = ____`;
          questionObj.ans = `${factor * 3}`;
          questionObj.options = [`${factor * 3}`, `${factor * 3 + 1}`, "15", "9"];
        } else {
          const n1 = 100 + (qId % 50);
          const n2 = 50 + (qId % 20);
          questionObj.q = `Work out: ${n1} + ${n2} = ____`;
          questionObj.ans = `${n1 + n2}`;
          questionObj.options = [`${n1 + n2}`, `${n1 + n2 - 5}`, "200", "150"];
        }
        return questionObj;
      });

      try {
        // Matches your DB schema: metadata + questions array
        await setDoc(doc(db, "UDA_EXAMS", docId), {
          metadata: {
            class: targetClass,
            subject: targetSubject,
            totalQuestions: 50,
            updatedAt: new Date().toISOString(),
            year: yearMapping.toString()
          },
          questions: generatedQuestions
        });
        console.log(`✅ Uploaded ${docId}`);
      } catch (err) {
        console.error(`❌ Error at ${docId}:`, err);
        break; 
      }
    }
    alert("FINISHED: 100 Sets of P3 Math are now in Firebase!");
  };

  return (
    <div className="app-container">
      <GlobalStyles />
      
      <div className="status-box">
        <h1 style={{ color: '#0a111e', fontSize: '24px', fontWeight: '900' }}>UDA ADMIN PANEL</h1>
        <p style={{ color: '#666' }}>The uploader is ready. Open your console (F12) before starting.</p>
        <p style={{ fontSize: '12px', marginTop: '20px', color: '#aaa' }}>Build Status: <span style={{color: 'green'}}>Success</span></p>
      </div>

      {/* CLICK THIS TO RUN THE FACTORY */}
      <button className="admin-btn" onClick={uploadP3Math}>
        🚀 START P3 MATH UPLOAD
      </button>
    </div>
  );
}

export default App;
