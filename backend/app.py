from flask import Flask,request,jsonify
from flask_cors import CORS
from cgpa_logic import calculate_sgpa,calculate_cgpa,calculate_percentage

from database import (
create_tables,
register_student,
login_student,
username_exists,
regno_exists,
semester_exists,
save_semester,
save_subjects,
get_last_semester,
get_dashboard
)

app = Flask(__name__)
CORS(app)
create_tables()


@app.route("/")
def home():
    return "CGPA Backend Running"


@app.route("/register",methods=["POST"])
def register():

    try:

        data = request.json

        username = data["username"]
        register_no = data["register_no"]

        if username_exists(username):

            return jsonify({
                "status":"error",
                "message":"Username already exists"
            }),400

        warning=None

        if regno_exists(register_no):
            warning="Register number already exists"

        register_student(data)

        return jsonify({
            "status":"success",
            "message":"Student registered successfully",
            "warning":warning
        })

    except Exception as e:

        return jsonify({
            "status":"error",
            "message":str(e)
        }),500


@app.route("/login",methods=["POST"])
def login():

    data=request.json

    username=data["username"]
    password=data["password"]

    student=login_student(username,password)

    if student:

        return jsonify({
            "status":"success",
            "student_id":student["id"],
            "name":student["name"]
        })

    return jsonify({
        "status":"error",
        "message":"Invalid login"
    })


@app.route("/calculate",methods=["POST"])
def calculate():

    try:

        data=request.json

        subjects=data["subjects"]
        prev_cgpa=data.get("prev_cgpa",0)
        prev_credits=data.get("prev_credits",0)
        formula=data.get("formula","9.5")

        sgpa,credits=calculate_sgpa(subjects)

        cgpa=calculate_cgpa(
            prev_cgpa,
            prev_credits,
            sgpa,
            credits
        )

        percentage=calculate_percentage(cgpa,formula)

        return jsonify({
            "sgpa":sgpa,
            "cgpa":cgpa,
            "percentage":percentage
        })

    except ValueError as e:

        return jsonify({
            "status":"error",
            "message":str(e)
        }),400


@app.route("/save-semester",methods=["POST"])
def save_sem():

    data=request.json

    student_id=data["student_id"]
    semester_no=data["semester"]
    subjects=data["subjects"]

    if semester_exists(student_id,semester_no):

        return jsonify({
            "status":"error",
            "message":"Semester already saved"
        }),400

    sgpa,credits=calculate_sgpa(subjects)

    prev_cgpa,prev_credits=get_last_semester(student_id)

    cgpa=calculate_cgpa(
        prev_cgpa,
        prev_credits,
        sgpa,
        credits
    )

    semester_id=save_semester(
        student_id,
        semester_no,
        sgpa,
        cgpa,
        credits
    )

    save_subjects(semester_id,subjects)

    return jsonify({
        "sgpa":sgpa,
        "cgpa":cgpa
    })


@app.route("/dashboard/<int:student_id>")
def dashboard(student_id):

    data=get_dashboard(student_id)

    return jsonify({
        "semesters":data
    })


if __name__=="__main__":
    app.run(debug=True)