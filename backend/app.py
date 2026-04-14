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
get_dashboard,
get_student_profile,
update_student_profile,
get_previous_semester,
get_student_semester_rows,
get_subjects_by_semester,
update_semester_totals,
get_semester_id,
replace_subjects
)

app = Flask(__name__)
CORS(app)
create_tables()


def recompute_student_progress(student_id):

    prev_cgpa = 0
    prev_credits = 0

    for semester in get_student_semester_rows(student_id):
        subjects = [
            {
                "name": subject["subject_name"],
                "credit": subject["credit"],
                "grade": subject["grade"]
            }
            for subject in get_subjects_by_semester(semester["id"])
        ]

        sgpa,credits = calculate_sgpa(subjects)
        cgpa = calculate_cgpa(prev_cgpa,prev_credits,sgpa,credits)

        update_semester_totals(semester["id"],sgpa,cgpa,credits)

        prev_cgpa = cgpa
        prev_credits += credits


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

    try:

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
        recompute_student_progress(student_id)

        updated = get_dashboard(student_id)
        current = next(
            (semester for semester in updated if semester["semester_no"] == semester_no),
            None
        )

        return jsonify({
            "status":"success",
            "message":"Semester saved successfully",
            "semester":current
        })

    except ValueError as e:

        return jsonify({
            "status":"error",
            "message":str(e)
        }),400


@app.route("/dashboard/<int:student_id>")
def dashboard(student_id):

    data=get_dashboard(student_id)

    return jsonify({
        "semesters":data
    })


@app.route("/student/<int:student_id>")
def student_profile(student_id):

    profile = get_student_profile(student_id)

    if not profile:
        return jsonify({
            "status":"error",
            "message":"Student not found"
        }),404

    return jsonify({
        "status":"success",
        "profile":profile
    })


@app.route("/student/<int:student_id>",methods=["PUT"])
def update_profile(student_id):

    data = request.json
    update_student_profile(student_id,data)

    return jsonify({
        "status":"success",
        "message":"Profile updated successfully"
    })


@app.route("/semester-context/<int:student_id>/<int:semester_no>")
def semester_context(student_id,semester_no):

    previous = get_previous_semester(student_id,semester_no)

    if not previous:
        return jsonify({
            "status":"success",
            "previous_cgpa":0,
            "previous_credits":0,
            "previous_semester":None
        })

    return jsonify({
        "status":"success",
        "previous_cgpa":previous["cgpa"],
        "previous_credits":previous["total_credits"],
        "previous_semester":previous["semester_no"]
    })


@app.route("/update-semester",methods=["PUT"])
def update_semester_data():

    try:
        data = request.json

        student_id = data["student_id"]
        semester_no = data["semester"]
        subjects = data["subjects"]

        semester_id = get_semester_id(student_id,semester_no)

        if not semester_id:
            return jsonify({
                "status":"error",
                "message":"Semester not found"
            }),404

        replace_subjects(semester_id,subjects)
        recompute_student_progress(student_id)

        updated = get_dashboard(student_id)
        current = next(
            (semester for semester in updated if semester["semester_no"] == semester_no),
            None
        )

        return jsonify({
            "status":"success",
            "message":"Semester updated successfully",
            "semester":current
        })

    except ValueError as e:

        return jsonify({
            "status":"error",
            "message":str(e)
        }),400


if __name__=="__main__":
    app.run(debug=True)
