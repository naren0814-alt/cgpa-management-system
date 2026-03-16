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


def username_exists(username):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT id FROM students WHERE username=?
    """,(username,))

    row = cursor.fetchone()

    conn.close()

    return row is not None


def regno_exists(register_no):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT id FROM students WHERE register_no=?
    """,(register_no,))

    row = cursor.fetchone()

    conn.close()

    return row is not None


def login_student(username,password):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT * FROM students
    WHERE username=? AND password=?
    """,(username,password))

    student = cursor.fetchone()

    conn.close()

    return student


def semester_exists(student_id,semester_no):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT id FROM semesters
    WHERE student_id=? AND semester_no=?
    """,(student_id,semester_no))

    row = cursor.fetchone()

    conn.close()

    return row is not None


def save_semester(student_id,semester_no,sgpa,cgpa,credits):

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


def save_subjects(semester_id,subjects):

    conn = get_connection()
    cursor = conn.cursor()

    for subject in subjects:

        name = subject.get("name","")
        credit = subject["credit"]
        grade = subject["grade"]

        cursor.execute("""
        INSERT INTO subjects
        (semester_id,subject_name,credit,grade)
        VALUES (?,?,?,?)
        """,(semester_id,name,credit,grade))

    conn.commit()
    conn.close()


def get_last_semester(student_id):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT cgpa,total_credits
    FROM semesters
    WHERE student_id=?
    ORDER BY semester_no DESC
    LIMIT 1
    """,(student_id,))

    row = cursor.fetchone()

    conn.close()

    if row:
        return row["cgpa"],row["total_credits"]

    return 0,0


def get_dashboard(student_id):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT semester_no,sgpa,cgpa
    FROM semesters
    WHERE student_id=?
    ORDER BY semester_no
    """,(student_id,))

    rows = cursor.fetchall()

    conn.close()

    return [dict(row) for row in rows]