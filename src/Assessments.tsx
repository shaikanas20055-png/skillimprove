import { useState } from "react";
import { addStudentNotice, saveStored, useStudentName } from "./app-data";

type Question = { prompt: string; options?: string[]; answers: string[]; explanation: string };
const mcq = (prompt: string, options: string[], answer: string, explanation: string): Question => ({ prompt, options, answers: [answer], explanation });
const blank = (prompt: string, answers: string[], explanation: string): Question => ({ prompt, answers, explanation });
const questionBank: Record<string, Question[]> = {
  "Aptitude": [
    mcq("A product priced at ₹1,200 is discounted by 15%. What is the final price?", ["₹1,020", "₹1,080", "₹1,000", "₹1,150"], "₹1,020", "15% of 1,200 is 180. Subtracting gives 1,020."),
    blank("Complete the sequence: 3, 6, 12, 24, ___.", ["48"], "Each number is double the previous number."),
    mcq("A train covers 180 km in 3 hours. What is its average speed?", ["45 km/h", "60 km/h", "90 km/h", "180 km/h"], "60 km/h", "Average speed is distance divided by time: 180 / 3."),
    blank("A fair six-sided die has ___ equally likely outcomes.", ["6", "six"], "A standard die has six faces, each with equal probability."),
    mcq("A and B share ₹500 in the ratio 2:3. What is B’s share?", ["₹200", "₹250", "₹300", "₹350"], "₹300", "B receives 3 of 5 equal parts: 500 × 3/5 = 300."),
  ],
  "JavaScript": [
    mcq("What does typeof [] return?", ["array", "object", "list", "undefined"], "object", "Arrays are objects. Use Array.isArray() to distinguish arrays."),
    blank("Fill in the keyword: ___ user = { name: \"Alex\" }; // binding cannot be reassigned", ["const"], "const prevents reassignment of the binding, not mutation of the object."),
    mcq("Which method converts a JSON string into a JavaScript object?", ["JSON.stringify()", "JSON.parse()", "Object.keys()", "Array.from()"], "JSON.parse()", "JSON.parse converts JSON text into a JavaScript value."),
    blank("Fill in the keyword used to wait for a Promise inside an async function: ___.", ["await"], "await pauses execution of an async function until a Promise settles."),
    mcq("What is the result of 2 === \"2\"?", ["true", "false", "undefined", "TypeError"], "false", "Strict equality does not coerce types; a number differs from a string."),
  ],
  "Python": [
    mcq("Which collection is immutable?", ["list", "dict", "set", "tuple"], "tuple", "Tuples cannot be modified after creation."),
    blank("Fill in the keyword to define a function: ___ greet():", ["def"], "Python uses def to define functions."),
    mcq("What does len([1, 2, 3]) return?", ["2", "3", "4", "TypeError"], "3", "len returns the number of elements in the list."),
    blank("Fill in the missing built-in: ___(5) produces 0, 1, 2, 3, 4 when iterated.", ["range", "range()"], "range(5) represents integers from 0 up to, but not including, 5."),
    mcq("What is the result of 7 // 2?", ["3", "3.5", "4", "1"], "3", "// performs floor division."),
  ],
  "Java": [
    mcq("Which keyword creates an instance of a class?", ["class", "new", "this", "static"], "new", "new allocates an object and invokes its constructor."),
    blank("Fill in the primitive type for true/false values: ___.", ["boolean"], "The Java primitive boolean has values true and false."),
    mcq("Which method compares the contents of two Strings?", ["==", "equals()", "compare()", "match()"], "equals()", "String.equals compares content; == compares references."),
    blank("A class uses the keyword ___ to inherit from another class.", ["extends"], "extends declares a superclass."),
    mcq("Which collection grows dynamically and preserves insertion order?", ["ArrayList", "HashSet", "int[]", "TreeSet"], "ArrayList", "ArrayList is a resizable ordered list."),
  ],
  "C": [
    mcq("Which header declares printf?", ["stdlib.h", "stdio.h", "string.h", "math.h"], "stdio.h", "stdio.h declares standard input/output functions."),
    blank("Fill in the operator to get the address of x: ___x.", ["&"], "& is the address-of operator."),
    mcq("What index accesses the first array element?", ["-1", "0", "1", "2"], "0", "C arrays use zero-based indexing."),
    blank("Fill in the function used to release memory allocated with malloc: ___.", ["free", "free()"], "free releases dynamically allocated memory."),
    mcq("Which loop always executes its body at least once?", ["for", "while", "do-while", "None"], "do-while", "do-while checks its condition after running the body."),
  ],
  "C++": [
    mcq("Which standard-library container is a dynamic array?", ["std::vector", "std::map", "std::set", "std::queue"], "std::vector", "std::vector stores elements contiguously and can resize."),
    blank("Fill in the keyword for a function that supports dynamic dispatch: ___.", ["virtual"], "virtual enables runtime dispatch through a base pointer or reference."),
    mcq("Which mechanism automatically runs destructors when objects leave scope?", ["RAII", "Garbage collection", "Macros", "malloc"], "RAII", "RAII ties resource ownership to object lifetime."),
    blank("Fill in the namespace for cout: ___::cout.", ["std"], "cout is declared in the std namespace."),
    mcq("Which smart pointer represents exclusive ownership?", ["std::shared_ptr", "std::unique_ptr", "std::weak_ptr", "Raw pointer"], "std::unique_ptr", "unique_ptr owns a resource exclusively."),
  ],
  "SQL": [
    mcq("Which clause filters rows before grouping?", ["HAVING", "ORDER BY", "WHERE", "GROUP BY"], "WHERE", "WHERE filters input rows; HAVING filters grouped results."),
    blank("Fill in the keyword: ___ name FROM students;", ["select"], "SELECT retrieves columns from a table."),
    mcq("Which join returns all rows from the left table, including unmatched rows?", ["INNER JOIN", "LEFT JOIN", "CROSS JOIN", "RIGHT JOIN"], "LEFT JOIN", "LEFT JOIN keeps every left-table row."),
    blank("Fill in the aggregate function: ___(*) counts all rows.", ["count"], "COUNT(*) counts rows, including rows containing NULL values."),
    mcq("Which constraint uniquely identifies each row and disallows NULL?", ["FOREIGN KEY", "DEFAULT", "PRIMARY KEY", "CHECK"], "PRIMARY KEY", "A primary key is unique and non-null."),
  ],
};
const normalize = (text: string) => text.trim().toLowerCase().replace(/;$/, "");

export default function Assessments({ navigate }: { navigate: (path: string) => void }) {
  const name = useStudentName();
  const [track, setTrack] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState("");
  const questions = track ? questionBank[track] : [];
  const correct = questions.map((question, i) => question.answers.some(answer => normalize(answer) === normalize(answers[i] || "")));
  const score = questions.length ? Math.round(correct.filter(Boolean).length / questions.length * 100) : 0;
  const level = score >= 80 ? "Advanced" : score >= 60 ? "Intermediate" : "Developing";
  const answered = Object.values(answers).filter(value => value.trim()).length;

  const submit = () => {
    if (answered !== questions.length) { setError(`Answer all ${questions.length} questions before submitting. You have ${questions.length - answered} remaining.`); return; }
    try {
      saveStored("skillimprove-last-assessment", { track, score, level, completedAt: new Date().toISOString() });
      addStudentNotice({ id: `assessment-${track}`, title: `${track} assessment completed · ${score}%`, detail: `${level} level. Review your recommended learning path.`, path: "learning" });
    } catch { setError("Could not save your result in this browser. Please try again."); return; }
    setComplete(true);
  };

  if (!track) return <>
    <div className="welcome"><div><span className="badge badge-purple">SKILL ASSESSMENT LIBRARY</span><h2>Prove more of what you know</h2><p>Choose aptitude or a programming language. Every assessment includes multiple-choice and fill-in-the-blank questions.</p></div></div>
    <div className="assessment-catalog">{Object.keys(questionBank).map((title, i) => <section className="card assessment-track" key={title}><div className={`icon-tile ${i % 2 ? "purple" : "green"}`}>{title === "Aptitude" ? "IQ" : title.slice(0, 2)}</div><span className="badge badge-gray">{title === "Aptitude" ? "Logical & quantitative" : "Programming fundamentals"}</span><h3>{title}</h3><p>5 questions · 3 multiple choice · 2 fill in the blank</p><button className="btn btn-primary full" onClick={() => { setTrack(title); setAnswers({}); setIndex(0); setError(""); }}>Start assessment</button></section>)}</div>
  </>;
  if (complete) return <div className="result-wrap"><section className="card result-card"><span className="badge badge-green">ASSESSMENT COMPLETE</span><h2>Assessment complete, {name.split(" ")[0]}</h2><p>{track} · Score calculated from your submitted answers</p><strong className="actual-score">{score}%</strong><span className={`badge ${score >= 80 ? "badge-green" : "badge-orange"}`}>{level}</span><div className="result-stats"><div><strong>{correct.filter(Boolean).length}/{questions.length}</strong><small>Correct answers</small></div><div><strong>{answered}</strong><small>Answered</small></div><div><strong>{questions.length - correct.filter(Boolean).length}</strong><small>To improve</small></div></div><div className="assessment-review">{questions.map((question, i) => <div key={question.prompt} className={correct[i] ? "review-correct" : "review-incorrect"}><span className={`badge ${correct[i] ? "badge-green" : "badge-orange"}`}>{correct[i] ? "Correct" : "Review this topic"}</span><h3>{question.prompt}</h3><p>Your answer: <strong>{answers[i]}</strong></p>{!correct[i] && <p>Correct answer: <strong>{question.answers[0]}</strong></p>}<p>{question.explanation}</p></div>)}</div><div className="modal-actions"><button className="btn btn-secondary" onClick={() => { setTrack(null); setComplete(false); }}>Choose another assessment</button><button className="btn btn-primary" onClick={() => navigate("/student/learning")}>View recommended next steps</button></div></section></div>;

  const question = questions[index];
  return <div className="assessment-layout"><div className="assessment-main">
    <div className="assessment-head"><div><button className="text-link" onClick={() => { if (!answered || window.confirm("Leave this assessment? Your current answers will be discarded.")) setTrack(null); }}>Back to assessments</button><h2>{track} Skill Assessment</h2><p>Question {index + 1} of {questions.length} · {answered} answered</p></div><span className="badge badge-purple">{question.options ? "Multiple choice" : "Fill in the blank"}</span></div>
    <div className="progress"><span className="fill" style={{ width: `${answered / questions.length * 100}%` }} /></div>
    <section className="card question-card"><span className="eyebrow">{track?.toUpperCase()}</span><h2>{question.prompt}</h2>
      {question.options ? <div className="answers">{question.options.map((option, i) => <button key={option} aria-pressed={answers[index] === option} className={answers[index] === option ? "selected" : ""} onClick={() => { setAnswers({ ...answers, [index]: option }); setError(""); }}><span>{String.fromCharCode(65 + i)}</span>{option}</button>)}</div> :
      <label className="blank-answer">Your answer<input key={`${track}-${index}`} autoFocus value={answers[index] || ""} placeholder="Type the missing value or keyword" onChange={event => { setAnswers({ ...answers, [index]: event.target.value }); setError(""); }} /><small>Answers are not case-sensitive. Extra spaces are ignored.</small></label>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="question-actions"><button className="btn btn-secondary" disabled={index === 0} onClick={() => setIndex(index - 1)}>Previous</button>{index < questions.length - 1 ? <button className="btn btn-primary" onClick={() => setIndex(index + 1)}>Next question</button> : <button className="btn btn-primary" onClick={submit}>Submit assessment</button>}</div>
    </section>
  </div><section className="card question-nav"><h3>Question navigator</h3><div>{questions.map((_, i) => <button key={i} aria-label={`Go to question ${i + 1}`} className={i === index ? "current" : answers[i]?.trim() ? "done" : ""} onClick={() => setIndex(i)}>{i + 1}</button>)}</div><hr /><p>Answered <b>{answered}/{questions.length}</b></p><p>Use the numbers to review an earlier answer.</p></section></div>;
}
