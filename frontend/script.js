const addSubjectBtn = document.getElementById('add-subject');
const subjectTbody = document.getElementById('subject-tbody');
if(addSubjectBtn){
    addSubjectBtn.addEventListener('click', ()=>{
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td><input type="text" placeholder="Subject"></td>
            <td><input type="number" placeholder="Marks"></td>
            <td><input type="number" placeholder="Credits"></td>
            <td>
                <select>
                    <option value="10">A+</option>
                    <option value="9">A</option>
                    <option value="8">B+</option>
                    <option value="7">B</option>
                    <option value="6">C+</option>
                    <option value="5">C</option>
                    <option value="4">D</option>
                    <option value="0">F</option>
                </select>
            </td>
        `;
        subjectTbody.appendChild(newRow);
    });
}

const calcBtn = document.getElementById('calculate-btn');
const resultDiv = document.getElementById('result-display');

if(calcBtn){
    calcBtn.addEventListener('click', ()=>{
        const rows = document.querySelectorAll('#subject-tbody tr');
        let totalGradePoints = 0;
        let totalCredits = 0;
        rows.forEach(row=>{
            const marks = Number(row.children[1].querySelector('input').value) || 0;
            const credits = Number(row.children[2].querySelector('input').value) || 0;
            const grade = Number(row.children[3].querySelector('select').value) || 0;

            totalGradePoints += grade * credits;
            totalCredits += credits;
        });

        const prevCGPA = Number(document.getElementById('prev-cgpa').value) || 0;
        const prevCredits = Number(document.getElementById('prev-credits').value) || 0;

        const cumulativePoints = (prevCGPA * prevCredits) + totalGradePoints;
        const cumulativeCredits = prevCredits + totalCredits;

        const sgpa = (totalGradePoints / totalCredits || 0).toFixed(2);
        const cgpa = (cumulativePoints / cumulativeCredits || 0).toFixed(2);

        resultDiv.textContent = SGPA: ${sgpa} | CGPA: ${cgpa};
    });
}

// Toggle Login/Register Forms
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
document.getElementById('show-login').addEventListener('click', ()=>{
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
});
document.getElementById('show-register').addEventListener('click', ()=>{
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
});

// ----------------- DASHBOARD.HTML SCRIPT -----------------
const addSubDashBtn = document.getElementById('add-subject-dashboard');
if(addSubDashBtn){
    addSubDashBtn.addEventListener('click', () => {
        const tbody = document.getElementById('subject-tbody');
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td><input type="text" placeholder="Subject Name"></td>
            <td><input type="number" placeholder="Marks"></td>
            <td><input type="number" placeholder="Credits"></td>
            <td>
                <select>
                    <option value="10">A+</option>
                    <option value="9">A</option>
                    <option value="8">B+</option>
                    <option value="7">B</option>
                    <option value="6">C+</option>
                    <option value="5">C</option>
                    <option value="4">D</option>
                    <option value="0">F</option>
                </select>
            </td>
        `;
        tbody.appendChild(newRow);
    });
}

const calculateDashBtn = document.getElementById('calculate-dashboard');
const saveSemesterBtn = document.getElementById('save-semester');

if(calculateDashBtn){
    calculateDashBtn.addEventListener('click', ()=>{
        const rows = document.querySelectorAll('#subject-tbody tr');
        let totalGradePoints = 0;
        let totalCredits = 0;

        rows.forEach(row=>{
            const credit = Number(row.children[2].querySelector('input').value) || 0;
            const grade = Number(row.children[3].querySelector('select').value) || 0;

            totalGradePoints += grade * credit;
            totalCredits += credit;
        });

        if(totalCredits === 0){
            alert("Enter at least one subject with credits!");
            return;
        }

        const sgpa = (totalGradePoints / totalCredits).toFixed(2);

        alert(SGPA: ${sgpa});
    });
}

if(saveSemesterBtn){
    saveSemesterBtn.addEventListener('click', ()=>{
        alert("Semester saved! (Frontend simulation only)");
    });
}