# 👥 Complete Access Comparison - All Roles

## 📊 **Quick Visual Comparison**

```
ACCESS LEVELS BY ROLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                    Super   School  Class   Subject
Feature             Admin   Admin   Teacher Teacher Student Parent
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Schools             ALL     ONE     ONE     ONE     ONE     ONE
Students            ALL     ALL     CLASS   SUBJECT OWN     CHILDREN
Teachers            ALL     ALL     VIEW    VIEW    ✗       ✗
Classes             ALL     ALL     OWN     TEACHING ✗      ✗
Subjects            ALL     ALL     ALL     OWN     ✗       ✗
Grades              ALL     ALL     CLASS   SUBJECT OWN     CHILDREN
Attendance          ALL     ALL     CLASS   SUBJECT OWN     CHILDREN
Fees                ALL     ALL     CLASS   ✗       OWN     CHILDREN
Parents             ALL     ALL     CLASS   ✗       ✗       OWN
Timetable           ALL     ALL     CLASS   OWN     OWN     ✗
Documents           ALL     ALL     CLASS   ✗       OWN     CHILDREN
Internal Admins     ✗       ✓       ✗       ✗       ✗       ✗
Platform Settings   ✓       ✗       ✗       ✗       ✗       ✗
Create Schools      ✓       ✗       ✗       ✗       ✗       ✗
Subscriptions       ✓       ✗       ✗       ✗       ✗       ✗
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 1️⃣ **Super Admin (Platform Administrator)**

### **Scope: ALL Schools**

```
SUPER ADMIN PORTAL
━━━━━━━━━━━━━━━━━━━━━━━
🏢 Platform Dashboard
🏫 ALL Schools (25 schools)
👥 ALL Students (12,000+)
👨‍🏫 ALL Teachers (350+)
💰 ALL Subscriptions
🛡️ Super Admin Management
📊 Platform Analytics
⚙️ Feature Management
💳 Payment Management
```

**Can Do:**
- ✅ Manage all schools
- ✅ Create new schools
- ✅ Manage subscriptions
- ✅ Control platform features
- ✅ Manage other super admins
- ✅ Access all data across all schools
- ✅ Platform-wide reports

**Scope:**
```
XYZ School (480 students)
ABC School (520 students)
PQR School (380 students)
... (22 more schools)
```

---

## 2️⃣ **School Admin**

### **Scope: ONE School (Full Access)**

```
SCHOOL ADMIN PORTAL
━━━━━━━━━━━━━━━━━━━━━━━
📊 School Dashboard
👥 ALL Students (480)
👨‍🏫 ALL Teachers (35)
📚 ALL Classes (12)
📖 ALL Subjects
📅 ALL Attendance
📝 ALL Grades
💰 ALL Fees
👨‍👩‍👧 ALL Parents (640)
🕐 ALL Timetables
📄 ALL Documents
👤 Internal Admins
```

**Can See:**
```
Grade 10A: 40 students
  ├── Rahul Kumar (GPA: 9.5, Attend: 96%)
  ├── Priya Sharma (GPA: 9.2, Attend: 98%)
  └── ... (38 more)

Grade 10B: 38 students
  ├── Amit Patel (GPA: 8.8, Attend: 95%)
  └── ... (37 more)

Grade 9A: 35 students
Grade 9B: 36 students
... (8 more classes)

TOTAL: 480 students across ALL classes
```

**Can Do:**
- ✅ View/manage ALL students (480)
- ✅ View/manage ALL teachers (35)
- ✅ View/manage ALL classes (12)
- ✅ View ALL attendance records
- ✅ View ALL grades (all subjects)
- ✅ Manage ALL fees
- ✅ Contact ALL parents
- ✅ Create internal admins
- ✅ Configure school settings
- ✅ Generate school-wide reports

**Cannot:**
- ❌ Access other schools
- ❌ Create new schools
- ❌ Manage platform settings
- ❌ Modify subscriptions

---

## 3️⃣ **Class Teacher**

### **Scope: ONE Class (Full Student Records)**

```
CLASS TEACHER PORTAL
━━━━━━━━━━━━━━━━━━━━━━━
📊 My Class Dashboard
👥 My Class Students (40)
📅 Class Attendance (ALL)
📝 Class Grades (ALL subjects)
💰 Class Fees
👨‍👩‍👧 Class Parents
🕐 Class Timetable
📄 Class Documents
📊 Class Reports
```

**Can See (Example: Class Teacher of Grade 10A):**
```
My Class: Grade 10A (40 students)
━━━━━━━━━━━━━━━━━━━━━━━

Student: Rahul Kumar
├── Personal Info ✓
├── All Subject Grades:
│   ├── Mathematics: 92% (by Mr. Kumar)
│   ├── Science: 96% (by Dr. Patel)
│   ├── English: 85% (by Ms. Sharma)
│   ├── Social Studies: 88% (by Mr. Singh)
│   ├── Hindi: 90% (by Mrs. Verma)
│   └── P.E.: 95% (by Mr. Reddy)
├── Attendance: 96% (192/200 days)
├── Fees: ₹30,000 paid / ₹20,000 pending
├── Parents:
│   ├── Father: Mr. Suresh Kumar
│   └── Mother: Mrs. Sunita Kumar
├── Behavior Notes ✓
└── Documents ✓

... (39 more students in Grade 10A)
```

**Can Do:**
- ✅ View ALL 40 students in their class
- ✅ See complete student profiles
- ✅ View grades from ALL subjects (not just their own)
- ✅ View ALL attendance records
- ✅ Access fee information
- ✅ Contact class parents
- ✅ Add behavior notes
- ✅ Generate class reports

**Cannot:**
- ❌ See students from Grade 10B, 9A, etc.
- ❌ Access other classes
- ❌ Manage teachers
- ❌ Configure school settings

---

## 4️⃣ **Subject Teacher** (Not Class Teacher)

### **Scope: ONLY Their Subject, Across Classes**

```
SUBJECT TEACHER PORTAL
━━━━━━━━━━━━━━━━━━━━━━━
📊 My Subject Dashboard
👥 My Subject Students
📅 My Subject Attendance
📝 My Subject Grades
📖 My Subject Timetable
```

**Can See (Example: Mathematics Teacher):**
```
Mathematics Teacher
Teaching: Grade 10A, 10B, 9A (3 classes)
━━━━━━━━━━━━━━━━━━━━━━━

Students in Grade 10A (Math):
├── Rahul Kumar
│   ├── Math Grade: 92% ✓ (Can see & edit)
│   ├── Math Attendance: 38/40 classes ✓
│   ├── Other subjects: ✗ (Cannot see)
│   ├── Fees: ✗ (Cannot see)
│   └── Full Profile: ✗ (Cannot see)

Students in Grade 10B (Math):
├── Amit Patel
│   ├── Math Grade: 88% ✓
│   ├── Math Attendance: 36/38 classes ✓
│   └── Other data: ✗

Students in Grade 9A (Math):
├── Neha Gupta
│   ├── Math Grade: 85% ✓
│   ├── Math Attendance: 32/35 classes ✓
│   └── Other data: ✗
```

**Can Do:**
- ✅ View students enrolled in their subject ONLY
- ✅ See/edit grades for THEIR SUBJECT ONLY
- ✅ Mark attendance for THEIR SUBJECT ONLY
- ✅ View timetable for their classes

**Cannot:**
- ❌ See grades from other subjects
- ❌ See complete student profiles
- ❌ Access fee information
- ❌ Contact parents
- ❌ See behavior notes
- ❌ View students not taking their subject

---

## 5️⃣ **Student**

### **Scope: OWN Data Only**

```
STUDENT PORTAL
━━━━━━━━━━━━━━━━━━━━━━━
📊 My Dashboard
📝 My Grades (All Subjects)
📅 My Attendance
💰 My Fees
🕐 My Timetable
📚 My Assignments
📄 My Documents
```

**Can See (Example: Rahul Kumar):**
```
Student: Rahul Kumar
━━━━━━━━━━━━━━━━━━━━━━━

My Grades:
├── Mathematics: 92% (A+)
├── Science: 96% (A+)
├── English: 85% (B+)
├── Social Studies: 88% (A)
├── Hindi: 90% (A+)
└── P.E.: 95% (A+)

My GPA: 9.0/10
My Class Rank: 3/40

My Attendance: 96% (192/200 days)
My Fees: ₹30,000 paid, ₹20,000 pending
My Timetable: [Full schedule]
My Assignments: 5 pending
My Documents: Report cards, certificates
```

**Can Do:**
- ✅ View own grades (all subjects)
- ✅ View own attendance
- ✅ View own fees
- ✅ View own timetable
- ✅ Submit assignments
- ✅ Download documents

**Cannot:**
- ❌ See other students' data
- ❌ See teacher information
- ❌ See parents' information
- ❌ Access admin functions

---

## 6️⃣ **Parent**

### **Scope: OWN Children Only**

```
PARENT PORTAL
━━━━━━━━━━━━━━━━━━━━━━━
📊 My Children Dashboard
👥 My Children
📝 Child's Grades
📅 Child's Attendance
💰 Child's Fees
📄 Child's Documents
```

**Can See (Example: Mr. Suresh Kumar):**
```
Parent: Mr. Suresh Kumar
━━━━━━━━━━━━━━━━━━━━━━━

My Children:
├── Child 1: Rahul Kumar (Grade 10A)
│   ├── Grades:
│   │   ├── Mathematics: 92%
│   │   ├── Science: 96%
│   │   └── ... (all subjects)
│   ├── GPA: 9.0/10
│   ├── Attendance: 96%
│   ├── Fees: ₹20,000 pending
│   └── Documents: Available
│
└── Child 2: Riya Kumar (Grade 8A)
    ├── Grades: [All visible]
    ├── GPA: 8.5/10
    ├── Attendance: 94%
    ├── Fees: ₹15,000 pending
    └── Documents: Available
```

**Can Do:**
- ✅ View all children's data
- ✅ See complete grades (all subjects)
- ✅ View attendance records
- ✅ Check fee status
- ✅ Download documents
- ✅ Pay fees (if enabled)

**Cannot:**
- ❌ See other students' data
- ❌ See other parents' information
- ❌ Access teacher data
- ❌ View school management info

---

## 📊 **Student Data Access Matrix**

### **Who Can See What About "Rahul Kumar (Grade 10A)":**

| Data Type | Super Admin | School Admin | Class Teacher (10A) | Math Teacher | English Teacher | Student (Self) | Parent |
|-----------|-------------|--------------|---------------------|--------------|-----------------|----------------|---------|
| **Personal Info** | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ |
| **Math Grade** | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| **English Grade** | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ |
| **All Grades** | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ |
| **Overall Attendance** | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ |
| **Math Attendance** | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| **Fees** | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ |
| **Parents Info** | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ (own) |
| **Behavior Notes** | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Documents** | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ |

---

## 🎯 **Access Summary**

### **Number of Records Each Role Can Access:**

```
Example School: XYZ Public School
480 students, 35 teachers, 12 classes

┌────────────────────────────────────────────────────────────┐
│ Role          │Students│Teachers│Classes│Subjects│Schools │
├────────────────────────────────────────────────────────────┤
│ Super Admin   │ 12,000+│  350+  │  300+ │  ALL   │   25   │
│ School Admin  │   480  │   35   │   12  │  ALL   │    1   │
│ Class Teacher │    40  │  View  │    1  │  ALL   │    1   │
│Subject Teacher│   120  │  View  │    3  │    1   │    1   │
│ Student       │     1  │   -    │    1  │  View  │    1   │
│ Parent        │  1-3   │   -    │   -   │  View  │    1   │
└────────────────────────────────────────────────────────────┘
```

---

## 🔐 **Security Rules**

### **Data Filtering:**

**Super Admin:**
```sql
SELECT * FROM students 
-- No filter, sees ALL schools
```

**School Admin:**
```sql
SELECT * FROM students 
WHERE school_id = 'xyz-school'
-- Sees ALL students in their school
```

**Class Teacher:**
```sql
SELECT * FROM students 
WHERE class_id = (
  SELECT class_id FROM teachers 
  WHERE user_id = current_user 
  AND is_class_teacher = true
)
-- Sees ONLY students in their assigned class
```

**Subject Teacher:**
```sql
SELECT DISTINCT s.* 
FROM students s
JOIN class_subjects cs ON s.class_id = cs.class_id
JOIN subjects sub ON cs.subject_id = sub.id
WHERE sub.teacher_id = current_teacher
-- Sees ONLY students taking their subject
```

**Student:**
```sql
SELECT * FROM students 
WHERE user_id = current_user
-- Sees ONLY their own data
```

**Parent:**
```sql
SELECT s.* FROM students s
JOIN student_parents sp ON s.id = sp.student_id
JOIN parents p ON sp.parent_id = p.id
WHERE p.user_id = current_user
-- Sees ONLY their children's data
```

---

## ✅ **Complete Hierarchy**

```
Platform Level (Super Admin)
│
├─ School 1 (School Admin)
│  ├─ Grade 10A (Class Teacher) - 40 students
│  │  ├─ Math (Subject Teacher)
│  │  ├─ English (Subject Teacher)
│  │  └─ Science (Subject Teacher)
│  │
│  ├─ Grade 10B (Class Teacher) - 38 students
│  └─ Grade 9A (Class Teacher) - 35 students
│
├─ School 2 (School Admin)
└─ School 3 (School Admin)

Students & Parents (Individual Access)
```

---

## 🎯 **Key Takeaways**

1. **Super Admin:** ALL schools, ALL data
2. **School Admin:** ONE school, ALL data in that school
3. **Class Teacher:** ONE class, ALL student data in that class
4. **Subject Teacher:** ONE subject, ONLY subject-specific data
5. **Student:** ONLY own data
6. **Parent:** ONLY children's data

**School Admin has the most comprehensive access within a school!** 🏫✅
