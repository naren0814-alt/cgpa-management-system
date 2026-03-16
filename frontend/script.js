const API = "http://127.0.0.1:5000"

/* ---------------------------
SECTION SWITCHING
--------------------------- */

function showCalculator(){
document.getElementById("calculatorSection").style.display="block"
document.getElementById("registerSection").style.display="none"
document.getElementById("loginSection").style.display="none"
}

function showRegister(){
document.getElementById("calculatorSection").style.display="none"
document.getElementById("registerSection").style.display="block"
document.getElementById("loginSection").style.display="none"
}

function showLogin(){
document.getElementById("calculatorSection").style.display="none"
document.getElementById("registerSection").style.display="none"
document.getElementById("loginSection").style.display="block"
}


/* ---------------------------
ADD SUBJECT ROW
--------------------------- */

function addSubject(){

let table = document.getElementById("subjectTable")

let rowCount = table.rows.length

let row = table.insertRow()

row.innerHTML = `
<td>${rowCount}</td>

<td>
<input type="text" placeholder="Subject ${rowCount}">
</td>

<td>
<input type="number">
</td>

<td>
<select>
<option>O</option>
<option>A+</option>
<option>A</option>
<option>B+</option>
<option>B</option>
<option>C</option>
</select>
</td>
`

}

function removeSubject(){

let table = document.getElementById("subjectTable")

if(table.rows.length > 2){

table.deleteRow(table.rows.length - 1)

updateSerialNumbers()

}

}

function updateSerialNumbers(){

let table = document.getElementById("subjectTable")

for(let i = 1; i < table.rows.length; i++){

table.rows[i].cells[0].innerText = i

table.rows[i].cells[1].children[0].placeholder = "Subject " + i

}

}

/* ---------------------------
GET SUBJECTS FROM TABLE
--------------------------- */

function getSubjects(){

let table=document.getElementById("subjectTable")

let subjects=[]

for(let i=1;i<table.rows.length;i++){

let row=table.rows[i]

let name=row.cells[1].children[0].value
let credit=row.cells[2].children[0].value
let grade=row.cells[3].children[0].value

subjects.push({
name:name,
credit:Number(credit),
grade:grade
})

}

return subjects
}


/* ---------------------------
DIRECT CGPA CALCULATOR
--------------------------- */

function calculate(){

let subjects = getSubjects()

let prev_cgpa = document.getElementById("prev_cgpa").value
let prev_credits = document.getElementById("prev_credits").value
let formula = document.getElementById("formula").value

fetch(API + "/calculate", {

method: "POST",

headers: {
"Content-Type": "application/json"
},

body: JSON.stringify({
subjects: subjects,
prev_cgpa: Number(prev_cgpa),
prev_credits: Number(prev_credits),
formula: formula
})

})

.then(res => res.json())

.then(data => {

console.log("Calculate Response:", data)

document.getElementById("result").innerHTML =
"SGPA: " + data.sgpa +
"<br>CGPA: " + data.cgpa +
"<br>Percentage: " + data.percentage

})

.catch(err => {
console.log("Error:", err)
})

}


/* ---------------------------
REGISTER USER
--------------------------- */

function register(){

let data={

name:document.getElementById("reg_name").value,
email:document.getElementById("reg_email").value,
phone:document.getElementById("reg_phone").value,
college:document.getElementById("reg_college").value,
course:document.getElementById("reg_course").value,
register_no:document.getElementById("reg_regno").value,
username:document.getElementById("reg_username").value,
password:document.getElementById("reg_password").value

}

fetch(API+"/register",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify(data)

})

.then(res=>res.json())

.then(data=>{

console.log("Register Response:", data)

if(data.status === "success"){

document.getElementById("register_msg").innerText =
"Registration successful! Please login."

showLogin()

}
else{

document.getElementById("register_msg").innerText = data.message

}

})

}


/* ---------------------------
LOGIN USER
--------------------------- */

function login(){

let username = document.getElementById("login_username").value
let password = document.getElementById("login_password").value

fetch(API+"/login",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
username:username,
password:password
})

})

.then(res=>res.json())

.then(data=>{

console.log("Login Response:", data)

if(data.status === "success"){

localStorage.setItem("student_id", data.student_id)
localStorage.setItem("student_name", data.name)

window.location.href = "dashboard.html"

}
else{

document.getElementById("login_msg").innerText = data.message

}

})

}


/* ---------------------------
SAVE SEMESTER
--------------------------- */

function saveSemester(){

let student_id = localStorage.getItem("student_id")

let semester = document.getElementById("semester").value

let subjects = getSubjects()

fetch(API + "/save-semester", {

method: "POST",

headers: {
"Content-Type": "application/json"
},

body: JSON.stringify({
student_id: Number(student_id),
semester: Number(semester),
subjects: subjects
})

})

.then(res => res.json())

.then(data => {

console.log("Save Semester Response:", data)

alert(data.message || "Semester saved successfully!")

loadDashboard()

})

.catch(err=>{
console.log(err)
})

}


/* ---------------------------
LOAD DASHBOARD HISTORY
--------------------------- */

function loadDashboard(){

let student_id=localStorage.getItem("student_id")

if(!student_id){
alert("Please login first")
window.location.href="index.html"
return
}

fetch(API+"/dashboard/"+student_id)

.then(res=>res.json())

.then(data=>{

let table=document.getElementById("historyTable")

if(!table) return

table.innerHTML=`
<tr>
<th>Semester</th>
<th>SGPA</th>
<th>CGPA</th>
</tr>
`

data.semesters.forEach(sem=>{

let row=table.insertRow()

row.innerHTML=`
<td>${sem.semester_no}</td>
<td>${sem.sgpa}</td>
<td>${sem.cgpa}</td>
`

})

})

}


/* ---------------------------
WELCOME MESSAGE
--------------------------- */

window.onload=function(){

let name=localStorage.getItem("student_name")

if(name && document.getElementById("welcome")){
document.getElementById("welcome").innerText="Welcome "+name
}

loadDashboard()

}