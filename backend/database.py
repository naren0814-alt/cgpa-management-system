import sqlite3

DB_NAME = "cgpa_system.db"


def get_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn


def create_tables():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        phone TEXT,
        college TEXT,
        course TEXT,
        register_no TEXT,
        username TEXT UNIQUE,
        password TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS semesters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        semester_no INTEGER,
        sgpa REAL,
        cgpa REAL,
        total_credits REAL
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS subjects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        semester_id INTEGER,
        subject_name TEXT,
        credit REAL,
        grade TEXT
    )
    """)

    conn.commit()
    conn.close()

def register_student(data):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO students
    (name,email,phone,college,course,register_no,username,password)
    VALUES (?,?,?,?,?,?,?,?)
    """,(
        data["name"],
        data["email"],
        data["phone"],
        data["college"],
        data["course"],
        data["register_no"],
        data["username"],
        data["password"]
    ))

    conn.commit()
    conn.close()

def login_student(username, password):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT * FROM students
    WHERE username=? AND password=?
    """,(username,password))

    student = cursor.fetchone()

    conn.close()

    return student

def save_semester(student_id, semester_no, sgpa, cgpa, credits):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO semesters
    (student_id,semester_no,sgpa,cgpa,total_credits)
    VALUES (?,?,?,?,?)
    """,(student_id,semester_no,sgpa,cgpa,credits))

    semester_id = cursor.lastrowid

    conn.commit()
    conn.close()

    return semester_id