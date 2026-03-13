const API="http://localhost:5000";

function addSubject(){

let table=document.getElementById("subjectTable");

let row=table.insertRow();

row.innerHTML=
`<td>New</td>

<td><input type="number"></td>
<td>
<select>
<option>O</option>
<option>A+</option>
<option>A</option>
<option>B+</option>
<option>B</option>
</select>
</td>`;
}function calculateCGPA(){

let subjects=[];

let rows=document.querySelectorAll("#subjectTable tr");

rows.forEach((row,i)=>{

if(i==0) return;

let credit=row.cells[1].children[0].value;
let grade=row.cells[2].children[0].value;

subjects.push({
credit:credit,
grade:grade
});

});

fetch(API+"/calculate",{

method:"POST",
headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
subjects:subjects
})

})
.then(res=>res.json())
.then(data=>{

document.getElementById("result").innerHTML=
"SGPA: "+data.sgpa+
" CGPA: "+data.cgpa+
" Percentage: "+data.percentage;

});
}

function register(){

let data={
name:document.getElementById("name").value,
email:document.getElementById("email").value,
phone:document.getElementById("phone").value,
college:document.getElementById("college").value,
course:document.getElementById("course").value,
register_number:document.getElementById("regno").value,
username:document.getElementById("username").value,
password:document.getElementById("password").value
};

fetch(API+"/register",{

method:"POST",
headers:{
"Content-Type":"application/json"
},

body:JSON.stringify(data)

})
.then(res=>res.json())
.then(data=>{

alert(data.message);

});
}

function login(){

let data={
username:document.getElementById("loginUsername").value,
password:document.getElementById("loginPassword").value
};

fetch(API+"/login",{

method:"POST",
headers:{
"Content-Type":"application/json"
},

body:JSON.stringify(data)

})
.then(res=>res.json())
.then(data=>{

if(data.student_id){

localStorage.setItem("student_id",data.student_id);

window.location="dashboard.html";

}else{

alert("Login failed");

}

});
}

function addDashRow(){

let table=document.getElementById("dashTable");

let row=table.insertRow();

row.innerHTML=
`<td><input></td>

<td><input type="number"></td>
<td>
<select>
<option>O</option>
<option>A+</option>
<option>A</option>
<option>B+</option>
<option>B</option>
</select>
</td>`;
}function saveSemester(){

let student_id=localStorage.getItem("student_id");

let semester=document.getElementById("semester").value;

let subjects=[];

let rows=document.querySelectorAll("#dashTable tr");

rows.forEach((row,i)=>{

if(i==0) return;

let name=row.cells[0].children[0].value;
let credit=row.cells[1].children[0].value;
let grade=row.cells[2].children[0].value;

subjects.push({
name:name,
credit:credit,
grade:grade
});

});

fetch(API+"/save-semester",{

method:"POST",
headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
student_id:student_id,
semester:semester,
subjects:subjects
})

})
.then(res=>res.json())
.then(data=>{

alert("Semester Saved");
loadDashboard();

});
}

function loadDashboard(){

let student_id=localStorage.getItem("student_id");

fetch(API+"/dashboard/"+student_id)

.then(res=>res.json())

.then(data=>{

let html="";

data.semesters.forEach(sem=>{

html+=
"<p>Semester "+sem.semester+
" | SGPA "+sem.sgpa+
" | CGPA "+sem.cgpa+"</p>";

});

document.getElementById("summary").innerHTML=html;

});
}