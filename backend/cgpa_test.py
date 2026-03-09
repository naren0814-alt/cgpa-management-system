from cgpa_logic import calculate_sgpa, calculate_cgpa, calculate_percentage

subjects = [
{"name":"Math","credit":3,"grade":"O"},
{"name":"DS","credit":4,"grade":"A"},
{"name":"Physics","credit":3,"grade":"B+"}
]

sgpa, credits = calculate_sgpa(subjects)

cgpa = calculate_cgpa(
    prev_cgpa=8.2,
    prev_credits=20,
    current_sgpa=sgpa,
    current_credits=credits
)

percentage = calculate_percentage(cgpa,"9.5")

print("SGPA:",sgpa)
print("CGPA:",cgpa)
print("Percentage:",percentage)