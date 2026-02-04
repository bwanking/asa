import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

// ... inside your App function ...
const uploadP3Math = async () => {
  const targetClass = "P3";
  const targetSubject = "MATHEMATICS";

  console.log("🚀 Starting P3 Math Factory...");

  for (let i = 0; i < 100; i++) {
    const yearMapping = 1990 + i; 
    const docId = `${targetClass.toLowerCase()}_${targetSubject.toLowerCase()}_${yearMapping}`;
    
    // GENERATE P3 MATH SPECIFIC CONTENT
    const generatedQuestions = Array.from({ length: 50 }, (_, index) => {
      const qNum = index + 1;
      const qId = (yearMapping * 100) + qNum;
      
      // P3 Math Logic: Larger numbers, basic multiplication, and sets
      let questionObj = {
        q: "",
        ans: "",
        options: [],
        artType: null,
        artValue: null
      };

      if (qNum % 10 === 1) { // Set questions
        const count = (qId % 5) + 4;
        questionObj.q = `How many members are in this set?`;
        questionObj.ans = `${count}`;
        questionObj.options = [`${count}`, `${count + 2}`, "3", "10"];
        questionObj.artType = "sets";
        questionObj.artValue = count;
      } else if (qNum % 10 === 5) { // Multiplication
        const factor = (qId % 5) + 2;
        questionObj.q = `Multiply: ${factor} x 3 = ____`;
        questionObj.ans = `${factor * 3}`;
        questionObj.options = [`${factor * 3}`, `${factor * 3 + 1}`, "15", "9"];
      } else { // Addition/Subtraction
        const n1 = 100 + (qId % 50);
        const n2 = 50 + (qId % 20);
        questionObj.q = `Work out: ${n1} + ${n2} = ____`;
        questionObj.ans = `${n1 + n2}`;
        questionObj.options = [`${n1 + n2}`, `${n1 + n2 - 5}`, "200", "150"];
      }

      return questionObj;
    });

    try {
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
      console.error(`❌ Error uploading ${docId}:`, err);
      break; 
    }
  }
  alert("P3 Math: 100 Sets Uploaded Successfully!");
};
