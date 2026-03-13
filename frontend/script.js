function calculateCGPA(){

let m1 = parseFloat(document.getElementById("m1").value);
let m2 = parseFloat(document.getElementById("m2").value);
let m3 = parseFloat(document.getElementById("m3").value);
let m4 = parseFloat(document.getElementById("m4").value);
let m5 = parseFloat(document.getElementById("m5").value);

let avg = (m1+m2+m3+m4+m5)/5;

let cgpa = avg/10;

document.getElementById("result").innerHTML =
"Your CGPA: " + cgpa.toFixed(2);

}