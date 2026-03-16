const API = "http://127.0.0.1:5000"

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

function addSubject(){

let table=document.getElementById("subjectTable")

let row=table.insertRow()

row.innerHTML=`
<td><input type="text"></td>
<td><input type="number"></td>
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

function calculate(){

let table=document.getElementById("subjectTable")

let subjects=[]

for(let i=1;i<table.rows.length;i++){

let row=table.rows[i]

let credit=row.cells[1].children[0].value
let grade=row.cells[2].children[0].value

subjects.push({
credit:Number(credit),
grade:grade
})

}

let prev_cgpa=document.getElementById("prev_cgpa").value
let prev_credits=document.getElementById("prev_credits").value

fetch(API+"/calculate",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
subjects:subjects,
previous_cgpa:Number(prev_cgpa),
previous_credits:Number(prev_credits)
})

})

.then(res=>res.json())

.then(data=>{

document.getElementById("result").innerHTML=
"SGPA: "+data.sgpa+
"<br>CGPA: "+data.cgpa+
"<br>Percentage: "+data.percentage

})

}

function register(){

let data = {

name:document.getElementById("reg_name").value,
email:document.getElementById("reg_email").value,
phone:document.getElementById("reg_phone").value,
college:document.getElementById("reg_college").value,
course:document.getElementById("reg_course").value,
register_number:document.getElementById("reg_regno").value,
username:document.getElementById("reg_username").value,
password:document.getElementById("reg_password").value

}

fetch("http://127.0.0.1:5000/register",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify(data)

})

.then(res=>res.json())

.then(data=>{

console.log(data)

if(data.error){

document.getElementById("register_msg").innerText = data.error

}

else{

document.getElementById("register_msg").innerText = "Registration Successful! Please login."

showLogin()

}

})

}

function login(){

let username=document.getElementById("login_username").value
let password=document.getElementById("login_password").value

fetch("http://127.0.0.1:5000/login",{

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

console.log(data)

if(data.student_id){

localStorage.setItem("student_id", data.student_id)

window.location.href="dashboard.html"

}

else{

document.getElementById("login_msg").innerText = data.error

}

})

}

function saveSemester(){

let student_id = localStorage.getItem("student_id")

let semester=document.getElementById("semester").value

let subjects=getSubjects()

fetch("http://127.0.0.1:5000/save-semester",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

student_id:student_id,
semester_no:semester,
subjects:subjects

})

})

.then(res=>res.json())

.then(data=>{

alert("Semester saved successfully!")

})

}