from flask import Flask, request, jsonify
from cgpa_logic import calculate_sgpa, calculate_cgpa, calculate_percentage
from database import create_tables
from database import create_tables, register_student, login_student

app = Flask(__name__)

create_tables()

@app.route("/register", methods=["POST"])
def register():

    data = request.json

    register_student(data)

    return jsonify({
        "status": "success",
        "message": "Student registered successfully"
    })

@app.route("/login", methods=["POST"])
def login():

    data = request.json

    username = data["username"]
    password = data["password"]

    student = login_student(username, password)

    if student:

        return jsonify({
            "status": "success",
            "student_id": student["id"],
            "name": student["name"]
        })

    return jsonify({
        "status": "error",
        "message": "Invalid login"
    })


@app.route("/")
def home():
    return "CGPA Backend Running"


@app.route("/calculate", methods=["POST"])
def calculate():

    data = request.json

    subjects = data["subjects"]
    prev_cgpa = data.get("prev_cgpa", 0)
    prev_credits = data.get("prev_credits", 0)
    formula = data.get("formula", "9.5")

    sgpa = calculate_sgpa(subjects)

    current_credits = sum(s["credit"] for s in subjects)

    cgpa = calculate_cgpa(
        prev_cgpa,
        prev_credits,
        sgpa,
        current_credits
    )

    percentage = calculate_percentage(cgpa, formula)

    return jsonify({
        "sgpa": sgpa,
        "cgpa": cgpa,
        "percentage": percentage
    })


if __name__ == "__main__":
    app.run(debug=True)