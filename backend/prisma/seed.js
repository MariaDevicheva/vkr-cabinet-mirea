// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Данные преподавателей
const teachersData = [
  { email: 'adjer.t.b@edu.mirea.ru', fullName: 'Аждер Татьяна Борисовна', position: 'Доцент' },
  { email: 'baklanov.p.a@edu.mirea.ru', fullName: 'Бакланов Павел Анатольевич', position: 'Доцент' },
  { email: 'burlakov.v.v@edu.mirea.ru', fullName: 'Бурлаков Вячеслав Викторович', position: 'Профессор' },
  { email: 'vartanyan.a.a@edu.mirea.ru', fullName: 'Вартанян Аревшад Апетович', position: 'Профессор' },
  { email: 'gosteva.m.a@edu.mirea.ru', fullName: 'Гостева Мария Александровна', position: 'Доцент' },
  { email: 'elagina.o.a@edu.mirea.ru', fullName: 'Елагина Ольга Александровна', position: 'Доцент' },
  { email: 'emelyanova.o.v@edu.mirea.ru', fullName: 'Емельянова Ольга Владимировна', position: 'Доцент' },
  { email: 'zemtsov.a.d@edu.mirea.ru', fullName: 'Земцов Алексей Дмитриевич', position: 'Доцент' },
  { email: 'koretskiy.v.p@edu.mirea.ru', fullName: 'Корецкий Владимир Павлович', position: 'Доцент' },
  { email: 'kudryavtseva.i.g@edu.mirea.ru', fullName: 'Кудрявцева Ирина Генадьевна', position: 'Доцент' },
  { email: 'lukashevich.e.v@edu.mirea.ru', fullName: 'Лукашевич Евгения Вадимовна', position: 'Доцент' },
  { email: 'marukhlenko.a.l@edu.mirea.ru', fullName: 'Марухленко Анатолий Леонидович', position: 'Доцент' },
  { email: 'novikova.o.a@edu.mirea.ru', fullName: 'Новикова Ольга Александровна', position: 'Доцент' },
  { email: 'parshin.i.o@edu.mirea.ru', fullName: 'Паршин Игорь Олегович', position: 'Доцент' },
  { email: 'perminova.o.m@edu.mirea.ru', fullName: 'Перминова Ольга Михайловна', position: 'Доцент' },
  { email: 'pertseva.o.v@edu.mirea.ru', fullName: 'Перцева Ольга Вадимовна', position: 'Доцент' },
  { email: 'provorova.i.p@edu.mirea.ru', fullName: 'Проворова Ирина Павловна', position: 'Доцент' },
  { email: 'ramenskaya.a.v@edu.mirea.ru', fullName: 'Раменская Алина Владимировна', position: 'Доцент' },
  { email: 'semenycheva.i.f@edu.mirea.ru', fullName: 'Семенычева Ирина Флюровна', position: 'Доцент' },
  { email: 'sigankov.a.a@edu.mirea.ru', fullName: 'Сиганьков Алексей Александрович', position: 'Доцент' },
  { email: 'soroko.a.v@edu.mirea.ru', fullName: 'Сороко Андрей Викторович', position: 'Заведующий кафедрой' },
  { email: 'starikovskaya.n.a@edu.mirea.ru', fullName: 'Стариковская Надежда Анатольевна', position: 'Доцент' },
  { email: 'stebunova.o.i@edu.mirea.ru', fullName: 'Стебунова Ольга Ивановна', position: 'Доцент' },
  { email: 'tyurin.a.g@edu.mirea.ru', fullName: 'Тюрин Андрей Геннадьевич', position: 'Доцент' },
];

// Данные студентов
const studentsData = [
  { email: 'amirmetov.r.i@edu.mirea.ru', fullName: 'Амирметов Ренат Имранович', groupName: 'УИБО-02-23' },
  { email: 'bazitov.d.d@edu.mirea.ru', fullName: 'Базитов Денис Дмитриевич', groupName: 'УИБО-02-23' },
  { email: 'bezuglov.i.d@edu.mirea.ru', fullName: 'Безуглов Иван Денисович', groupName: 'УИБО-02-23' },
  { email: 'belous.v.s@edu.mirea.ru', fullName: 'Белоус Вячеслав Сергеевич', groupName: 'УИБО-02-23' },
  { email: 'bereshpolov.d.s@edu.mirea.ru', fullName: 'Берешполов Даниил Сергеевич', groupName: 'УИБО-02-23' },
  { email: 'bolshakova.e.a@edu.mirea.ru', fullName: 'Большакова Екатерина Александровна', groupName: 'УИБО-02-23' },
  { email: 'gerasimenko.v.d@edu.mirea.ru', fullName: 'Герасименко Валерия Дмитриевна', groupName: 'УИБО-02-23' },
  { email: 'devicheva.m.s@edu.mirea.ru', fullName: 'Девичева Мария Станиславовна', groupName: 'УИБО-02-23' },
  { email: 'kareva.m.s@edu.mirea.ru', fullName: 'Карьева Мария Сергеевна', groupName: 'УИБО-02-23' },
  { email: 'lebedev.k.s@edu.mirea.ru', fullName: 'Лебедев Кирилл Сергеевич', groupName: 'УИБО-02-23' },
  { email: 'litvinov.n.a@edu.mirea.ru', fullName: 'Литвинов Никита Антонович', groupName: 'УИБО-02-23' },
  { email: 'matuhina.a.o@tdu.mirea.ru', fullName: 'Матюхина Алина Олеговна', groupName: 'УИБО-02-23' },
  { email: 'manatcakanyan.a.b@edu.mirea.ru', fullName: 'Мнецаканян Ани Бениаминовна', groupName: 'УИБО-02-23' },
  { email: 'petuhov.a.a@edu.mirea.ru', fullName: 'Петухов Александр Алексеевич', groupName: 'УИБО-02-23' },
  { email: 'podoroga.k.a@edu.mirea.ru', fullName: 'Подорога Кирилл Александрович', groupName: 'УИБО-02-23' },
  { email: 'savchenko.v.e@edu.mirea.ru', fullName: 'Савченко Валерия Евгеньевна', groupName: 'УИБО-02-23' },
  { email: 'semin.p.e@edu.mirea.ru', fullName: 'Семин Павел Евгеньевич', groupName: 'УИБО-02-23' },
  { email: 'sidnyakov.p.v@edu.mirea.ru', fullName: 'Сидняков Павел Валерьевич', groupName: 'УИБО-02-23' },
  { email: 'sidyakova.d.d@edu.mirea.ru', fullName: 'Сидякова Дарья Дмитриевна', groupName: 'УИБО-02-23' },
  { email: 'simakov.a.a@edu.mirea.ru', fullName: 'Симаков Андрей Александрович', groupName: 'УИБО-02-23' },
  { email: 'tatarenko.m.v@edu.mirea.ru', fullName: 'Татаренко Михаил Вадимович', groupName: 'УИБО-02-23' },
  { email: 'fedoseev.i.m@edu.mirea.ru', fullName: 'Федосеев Игнат Максимович', groupName: 'УИБО-02-23' },
  { email: 'filin-koldakov.s.i@edu.mirea.ru', fullName: 'Филин-Колдаков Савелий Иванович', groupName: 'УИБО-02-23' },
  { email: 'chernikov.a.v@edu.mirea.ru', fullName: 'Черников Алексей Всеволодович', groupName: 'УИБО-02-23' },
  { email: 'chukavina.y.o@edu.mirea.ru', fullName: 'Чукавина Юлия Олеговна', groupName: 'УИБО-02-23' },
  { email: 'shubina.e.s@edu.mirea.ru', fullName: 'Шубина Елизавета Станиславовна', groupName: 'УИБО-02-23' },
];

async function main() {
  console.log('🌱 Начинаем заполнение базы данных...');

  // Хешируем пароли
  const teacherPasswordHash = await bcrypt.hash('PrepodMirea', 10);
  const studentPasswordHash = await bcrypt.hash('StudentMirea', 10);

  // Создаём преподавателей
  console.log('📚 Создаём преподавателей...');
  for (const t of teachersData) {
    await prisma.teacher.upsert({
      where: { email: t.email },
      update: {},
      create: {
        email: t.email,
        passwordHash: teacherPasswordHash,
        fullName: t.fullName,
        position: t.position,
        department: 'Кафедра информационных технологий в государственном управлении',
        academicDegree: t.position === 'Профессор' || t.position === 'Заведующий кафедрой' ? 'Доктор наук' : 'Кандидат наук',
      },
    });
  }

  // Получаем ID преподавателей для распределения
  const teachers = await prisma.teacher.findMany();
  
  // Создаём студентов
  console.log('🎓 Создаём студентов...');
  let studentIndex = 0;
  for (const s of studentsData) {
    const teacher = teachers[studentIndex % teachers.length];
    
    await prisma.student.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email,
        passwordHash: studentPasswordHash,
        fullName: s.fullName,
        groupName: s.groupName,
        course: 3,
        degree: 'Бакалавриат',
        gpa: 4.0 + Math.random() * 1.0,
        teacherId: teacher.id,
      },
    });
    studentIndex++;
  }

  // Создаём новости
  console.log('📰 Создаём новости...');
  await prisma.news.createMany({
    data: [
      { title: 'Приём заявок на ВКР завершён', description: 'Заявки принимались до 1 марта 2026', important: true, tags: 'важно' },
      { title: 'Утверждение тем до 1 апреля', description: 'Не забудьте утвердить темы дипломников', important: true, tags: 'дедлайн' },
      { title: 'График защит утверждён', description: 'Защиты пройдут с 1 по 20 июня', important: false, tags: 'защита' },
    ],
  });

  console.log('✅ База данных успешно заполнена!');
  console.log(`📊 Создано преподавателей: ${teachers.length}`);
  console.log(`📊 Создано студентов: ${studentsData.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });