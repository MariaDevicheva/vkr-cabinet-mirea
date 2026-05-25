from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy import create_engine, Column, Integer, String, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import enum
import hashlib
import os

# ================== НАСТРОЙКИ ==================
DATABASE_URL = "sqlite:///./vkr.db"

# ================== БАЗА ДАННЫХ ==================
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Роли пользователей
class UserRole(str, enum.Enum):
    STUDENT = "student"
    TEACHER = "teacher"

# Степень образования студента
class DegreeLevel(str, enum.Enum):
    BACHELOR = "Бакалавр"
    MASTER = "Магистр"
    POSTGRADUATE = "Аспирант"

# Научная степень преподавателя
class AcademicDegree(str, enum.Enum):
    NONE = "Без степени"
    PHD = "Кандидат наук"
    DOCTOR = "Доктор наук"
    PROFESSOR = "Профессор"

# ================== МОДЕЛИ ==================

# Модель таблицы пользователей (общая)
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    photo_url = Column(String, nullable=True)  # URL или путь к фото

# Модель студента (расширенная информация)
class Student(Base):
    __tablename__ = "students"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, unique=True, nullable=False)
    full_name = Column(String, nullable=False)
    group_number = Column(String, nullable=False)  # Номер группы
    degree_level = Column(Enum(DegreeLevel), nullable=False)  # Бакалавр/Магистр/Аспирант
    course = Column(Integer, nullable=False)  # Курс (1-6)
    institute = Column(String, nullable=False)  # Институт
    department = Column(String, nullable=False)  # Кафедра

# Модель преподавателя
class Teacher(Base):
    __tablename__ = "teachers"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, unique=True, nullable=True)
    full_name = Column(String, nullable=False)
    department = Column(String, nullable=False)  # Кафедра
    position = Column(String, nullable=False)    # Должность
    academic_degree = Column(Enum(AcademicDegree), nullable=False, default=AcademicDegree.NONE)  # Научная степень
    research_area = Column(String)               # Область исследований
    max_students = Column(Integer, default=3)
    current_students = Column(Integer, default=0)

# Таблица заявок
class Application(Base):
    __tablename__ = "applications"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, nullable=False)
    teacher_id = Column(Integer, nullable=False)
    status = Column(String, default="pending")
    created_at = Column(String)

# Создаем таблицы
Base.metadata.create_all(bind=engine)

# ================== PYDANTIC СХЕМЫ ==================
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class StudentProfileResponse(BaseModel):
    id: int
    user_id: int
    full_name: str
    email: str
    group_number: str
    degree_level: str
    course: int
    institute: str
    department: str
    photo_url: str | None = None

class TeacherProfileResponse(BaseModel):
    id: int
    user_id: int | None
    full_name: str
    email: str
    department: str
    position: str
    academic_degree: str
    research_area: str | None
    max_students: int
    current_students: int
    photo_url: str | None = None

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: UserRole
    photo_url: str | None = None

class LoginResponse(BaseModel):
    success: bool
    message: str
    user: UserResponse | None = None
    profile: StudentProfileResponse | TeacherProfileResponse | None = None

# ================== ЗАВИСИМОСТИ ==================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ================== ХЕШИРОВАНИЕ ПАРОЛЕЙ ==================
def get_password_hash(password: str) -> str:
    salt = os.urandom(32)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return salt.hex() + ':' + key.hex()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    salt_hex, key_hex = hashed_password.split(':')
    salt = bytes.fromhex(salt_hex)
    key = bytes.fromhex(key_hex)
    new_key = hashlib.pbkdf2_hmac('sha256', plain_password.encode('utf-8'), salt, 100000)
    return new_key == key

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

# ================== СОЗДАНИЕ ТЕСТОВЫХ ДАННЫХ ==================
def create_test_users(db: Session):
    # Создаём пользователей
    if db.query(User).count() == 0:
        # Студент
        student_user = User(
            email="student@uni.ru",
            full_name="Иванов Иван Иванович",
            hashed_password=get_password_hash("123456"),
            role=UserRole.STUDENT,
            photo_url="https://api.dicebear.com/7.x/avataaars/svg?seed=Ivan"
        )
        
        # Преподаватель
        teacher_user = User(
            email="teacher@uni.ru",
            full_name="Петрова Анна Сергеевна",
            hashed_password=get_password_hash("123456"),
            role=UserRole.TEACHER,
            photo_url="https://api.dicebear.com/7.x/avataaars/svg?seed=Anna"
        )
        
        db.add(student_user)
        db.add(teacher_user)
        db.commit()
        db.refresh(student_user)
        db.refresh(teacher_user)
        
        print("✅ Тестовые пользователи созданы!")
    
    # Создаём профиль студента
    if db.query(Student).count() == 0:
        student_user = db.query(User).filter(User.email == "student@uni.ru").first()
        if student_user:
            student_profile = Student(
                user_id=student_user.id,
                full_name=student_user.full_name,
                group_number="ИКБО-01-23",
                degree_level=DegreeLevel.BACHELOR,
                course=3,
                institute="Институт информационных технологий",
                department="Корпоративных информационных систем"
            )
            db.add(student_profile)
            db.commit()
            print("✅ Профиль студента создан!")
    
    # Создаём профили преподавателей
    if db.query(Teacher).count() == 0:
        teachers_data = [
            {
                "user_id": 2,
                "full_name": "Петрова Анна Сергеевна",
                "department": "Прикладной математики",
                "position": "Доцент",
                "academic_degree": AcademicDegree.PHD,
                "research_area": "Машинное обучение и нейронные сети",
                "max_students": 3,
                "current_students": 0
            },
            {
                "user_id": None,
                "full_name": "Смирнов Алексей Владимирович",
                "department": "Информационных систем",
                "position": "Профессор",
                "academic_degree": AcademicDegree.DOCTOR,
                "research_area": "Распределённые вычисления",
                "max_students": 2,
                "current_students": 0
            },
            {
                "user_id": None,
                "full_name": "Козлова Елена Игоревна",
                "department": "Программной инженерии",
                "position": "Старший преподаватель",
                "academic_degree": AcademicDegree.PHD,
                "research_area": "Веб-разработка и UX/UI",
                "max_students": 4,
                "current_students": 0
            }
        ]
        
        for t_data in teachers_data:
            teacher = Teacher(**t_data)
            db.add(teacher)
        
        db.commit()
        print("✅ Тестовые преподаватели созданы!")

# ================== ПРИЛОЖЕНИЕ FASTAPI ==================
app = FastAPI(title="Запись на ВКР API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    db = SessionLocal()
    create_test_users(db)
    db.close()

@app.get("/")
async def root():
    return {"message": "API Записи на ВКР работает!"}

@app.post("/api/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, request.email)
    
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Неверный email или пароль")
    
    if not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Неверный email или пароль")
    
    profile = None
    if user.role == UserRole.STUDENT:
        student = db.query(Student).filter(Student.user_id == user.id).first()
        if student:
            profile = StudentProfileResponse(
                id=student.id,
                user_id=student.user_id,
                full_name=student.full_name,
                email=user.email,
                group_number=student.group_number,
                degree_level=student.degree_level.value,
                course=student.course,
                institute=student.institute,
                department=student.department,
                photo_url=user.photo_url
            )
    elif user.role == UserRole.TEACHER:
        teacher = db.query(Teacher).filter(Teacher.user_id == user.id).first()
        if teacher:
            profile = TeacherProfileResponse(
                id=teacher.id,
                user_id=teacher.user_id,
                full_name=teacher.full_name,
                email=user.email,
                department=teacher.department,
                position=teacher.position,
                academic_degree=teacher.academic_degree.value,
                research_area=teacher.research_area,
                max_students=teacher.max_students,
                current_students=teacher.current_students,
                photo_url=user.photo_url
            )
    
    return LoginResponse(
        success=True,
        message=f"Добро пожаловать, {user.full_name}!",
        user=UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            photo_url=user.photo_url
        ),
        profile=profile
    )

@app.get("/api/teachers")
async def get_teachers(db: Session = Depends(get_db)):
    teachers = db.query(Teacher).all()
    return teachers

@app.post("/api/applications")
async def create_application(student_id: int, teacher_id: int, db: Session = Depends(get_db)):
    existing = db.query(Application).filter(
        Application.student_id == student_id,
        Application.teacher_id == teacher_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Заявка уже подана")
    
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if teacher.current_students >= teacher.max_students:
        raise HTTPException(status_code=400, detail="Нет свободных мест")
    
    from datetime import datetime
    application = Application(
        student_id=student_id,
        teacher_id=teacher_id,
        created_at=datetime.now().isoformat()
    )
    
    db.add(application)
    db.commit()
    
    return {"success": True, "message": "Заявка отправлена"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)