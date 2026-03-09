grade_points = {
    "O": 10,
    "A+": 9,
    "A": 8,
    "B+": 7,
    "B": 6,
    "C": 5
}


def calculate_sgpa(subjects):
    """
    subjects = [
        {"name": "Math", "credit": 3, "grade": "O"},
        {"name": "DS", "credit": 4, "grade": "A"}
    ]
    """

    total_points = 0
    total_credits = 0

    for subject in subjects:

        credit = float(subject.get("credit", 0))
        grade = subject.get("grade", "").upper()

        if grade not in grade_points:
            raise ValueError(f"Invalid grade: {grade}")

        grade_point = grade_points[grade]

        total_points += credit * grade_point
        total_credits += credit

    if total_credits == 0:
        return 0, 0

    sgpa = total_points / total_credits

    return round(sgpa, 2), total_credits


def calculate_cgpa(prev_cgpa, prev_credits, current_sgpa, current_credits):

    prev_cgpa = float(prev_cgpa)
    prev_credits = float(prev_credits)

    total_points = (prev_cgpa * prev_credits) + (current_sgpa * current_credits)
    total_credits = prev_credits + current_credits

    if total_credits == 0:
        return 0

    cgpa = total_points / total_credits

    return round(cgpa, 2)


def calculate_percentage(cgpa, formula="9.5"):

    if formula == "9.5":
        percentage = cgpa * 9.5

    elif formula == "10":
        percentage = cgpa * 10

    elif formula == "custom":
        percentage = (cgpa - 0.5) * 10

    else:
        raise ValueError("Invalid percentage formula")

    return round(percentage, 2)