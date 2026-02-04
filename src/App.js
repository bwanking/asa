import React from 'react';
import { db } from './firebase'; 
import { doc, setDoc } from 'firebase/firestore';


function App() {
  
  const runUpload = async (subject) => {
    const targetClass = "p3";
    console.log(`🚀 Starting Factory for ${subject}...`);
    
    for (let i = 0; i < 100; i++) {
      const yearMapping = 1990 + i; 
      const docId = `${targetClass}_${subject.toLowerCase()}_${yearMapping}`;
      
      const generatedQuestions = Array.from({ length: 50 }, (_, index) => {
        const qNum = index + 1;
        const qId = (yearMapping * 100) + qNum;
        let questionObj = { q: "", ans: "", options: [] };

        // --- SUBJECT LOGIC SWITCH ---
        if (subject === "mathematics") {
          const n1 = (qId % 50) + 10;
          const n2 = (qId % 10);
          questionObj.q = `Work out: ${n1} + ${n2} = ____`;
          questionObj.ans = `${n1 + n2}`;
          questionObj.options = [`${n1 + n2}`, `${n1 + n2 + 5}`, "100", "5"];
        } 
        else if (subject === "science") {
          questionObj.q = "Which part of the body is used for seeing?";
          questionObj.ans = "Eyes";
          questionObj.options = ["Eyes", "Ears", "Nose", "Legs"];
        } 
        else if (subject === "sst") {
          questionObj.q = "Which of these is a basic need of a family?";
          questionObj.ans = "Food";
          questionObj.options = ["Food", "Television", "Toy", "Radio"];
        }

        return questionObj;
      });

      try {
        await setDoc(doc(db, "UDA_EXAMS", docId), {
          metadata: {
            class: "P3",
            subject: subject.toUpperCase(),
            totalQuestions: 50,
            updatedAt: new Date().toISOString(),
            year: yearMapping.toString()
          },
          questions: generatedQuestions
        });
        console.log(`✅ ${docId} Done`);
      } catch (err) {
        console.error("❌ Error:", err);
        alert("Check your Firebase Rules! Error: " + err.message);
        return;
      }
    }
    alert(`${subject.toUpperCase()} finished! Check your Firestore collection.`);
  };

  return (
    <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      <h1 style={{ color: '#2c3e50' }}>UDA ADMIN PANEL (ASA-DBA)</h1>
      <p style={{ color: '#7f8c8d' }}>Choose a subject to generate 100 years of data.</p>
      
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '30px' }}>
        <button 
          onClick={() => runUpload("mathematics")}
          style={btnStyle("#e74c3c")}
        >
          Upload P3 Math
        </button>

        <button 
          onClick={() => runUpload("science")}
          style={btnStyle("#27ae60")}
        >
          Upload P3 Science
        </button>

        <button 
          onClick={() => runUpload("sst")}
          style={btnStyle("#2980b9")}
        >
          Upload P3 SST
        </button>
      </div>
    </div>
  );
}

// Simple styling helper
const btnStyle = (color) => ({
  padding: '20px 30px',
  backgroundColor: color,
  color: 'white',
  border: 'none',
  borderRadius: '12px',
  cursor: 'pointer',
  fontWeight: 'bold',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
});

export default App;
