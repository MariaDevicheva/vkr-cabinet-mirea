// src/server.js
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
// Автоматически заполняем базу при запуске
const seedDatabase = require('../prisma/seed');
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ==================== АВТОРИЗАЦИЯ (без выбора типа) ====================
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Сначала ищем среди преподавателей
    const teacher = await prisma.teacher.findUnique({
      where: { email }
    });
    
    if (teacher) {
      const validPassword = await bcrypt.compare(password, teacher.passwordHash);
      
      if (!validPassword) {
        return res.status(401).json({ success: false, error: 'Неверный пароль' });
      }
      
      const token = jwt.sign(
        { id: teacher.id, email: teacher.email, type: 'teacher' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      return res.json({
        success: true,
        token,
        user: { id: teacher.id, email: teacher.email },
        userType: 'teacher',
        profile: {
          full_name: teacher.fullName,
          position: teacher.position,
          department: teacher.department,
          academic_degree: teacher.academicDegree
        }
      });
    }
    
    // Если не преподаватель, ищем среди студентов
    const student = await prisma.student.findUnique({
      where: { email },
      include: { teacher: true }
    });
    
    if (student) {
      const validPassword = await bcrypt.compare(password, student.passwordHash);
      
      if (!validPassword) {
        return res.status(401).json({ success: false, error: 'Неверный пароль' });
      }
      
      const token = jwt.sign(
        { id: student.id, email: student.email, type: 'student' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      return res.json({
        success: true,
        token,
        user: { id: student.id, email: student.email },
        userType: 'student',
        profile: {
          full_name: student.fullName,
          group: student.groupName,
          course: student.course,
          degree: student.degree,
          gpa: student.gpa,
          teacher_name: student.teacher?.fullName || 'Не назначен'
        }
      });
    }
    
    // Никого не нашли
    return res.status(401).json({ success: false, error: 'Пользователь не найден' });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
});

// ==================== ЗАПУСК СЕРВЕРА ====================
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});