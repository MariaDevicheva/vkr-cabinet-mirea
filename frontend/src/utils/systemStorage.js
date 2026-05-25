// src/utils/systemStorage.js

// ==================== КОНСТАНТЫ ====================
const STORAGE_KEY = 'vtk_system_data';

// ==================== БАЗОВЫЕ ФУНКЦИИ ====================

const normalizeId = (value) => String(value);

const createId = () => Date.now() + Math.floor(Math.random() * 1000);

const createDate = () => new Date().toLocaleDateString('ru-RU');

const createDateTime = () => new Date().toLocaleString('ru-RU');

// Получение всех данных системы
export const getSystemData = () => {
  const data = localStorage.getItem(STORAGE_KEY);

  if (data) {
    try {
      const parsed = JSON.parse(data);

      return {
        applications: parsed.applications || [],
        chats: parsed.chats || {},
        tasks: parsed.tasks || {},
        notifications: parsed.notifications || [],
        teacherGroups: parsed.teacherGroups || {},
        conferences: parsed.conferences || []
      };
    } catch (error) {
      console.error('Ошибка чтения localStorage:', error);
    }
  }

  return {
    applications: [],
    chats: {},
    tasks: {},
    notifications: [],
    teacherGroups: {},
    conferences: []
  };
};

// Сохранение данных системы
export const saveSystemData = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// Очистка всех данных
export const clearSystemData = () => {
  localStorage.removeItem(STORAGE_KEY);
};

// ==================== УВЕДОМЛЕНИЯ ====================

const createNotificationObject = (userId, type, title, message, data = {}) => ({
  id: createId(),
  userId,
  type,
  title,
  message,
  text: message,
  date: createDateTime(),
  read: false,
  data
});

// Добавление уведомления
export const addNotification = (userId, type, title, message, data = {}) => {
  const systemData = getSystemData();
  const notification = createNotificationObject(userId, type, title, message, data);

  systemData.notifications.push(notification);
  saveSystemData(systemData);

  return notification;
};

// Получение уведомлений пользователя
export const getUserNotifications = (userId) => {
  const systemData = getSystemData();

  return systemData.notifications
    .filter(n => normalizeId(n.userId) === normalizeId(userId))
    .sort((a, b) => b.id - a.id);
};

// Отметить уведомление как прочитанное
export const markNotificationAsRead = (notificationId) => {
  const systemData = getSystemData();

  systemData.notifications = systemData.notifications.map(notification =>
    normalizeId(notification.id) === normalizeId(notificationId)
      ? { ...notification, read: true }
      : notification
  );

  saveSystemData(systemData);

  return { success: true };
};

// Отметить все уведомления как прочитанные
export const markAllNotificationsAsRead = (userId) => {
  const systemData = getSystemData();

  systemData.notifications = systemData.notifications.map(notification =>
    normalizeId(notification.userId) === normalizeId(userId)
      ? { ...notification, read: true }
      : notification
  );

  saveSystemData(systemData);

  return { success: true };
};

// Количество непрочитанных уведомлений
export const getUnreadNotificationsCount = (userId) => {
  return getUserNotifications(userId).filter(notification => !notification.read).length;
};

// ==================== ЗАЯВКИ ====================

const buildApplicationFromArgs = (args) => {
  const [studentId, secondArg, thirdArg, fourthArg, fifthArg, sixthArg] = args;

  // Новый удобный формат:
  // submitApplication(studentId, teacherObject, studentProfile)
  if (
    typeof secondArg === 'object' &&
    secondArg !== null &&
    !Array.isArray(secondArg)
  ) {
    const teacher = secondArg;
    const profile = thirdArg || {};

    return {
      studentId,
      studentName:
        profile.full_name ||
        profile.fullName ||
        profile.name ||
        'Студент',
      studentGroup:
        profile.group ||
        profile.studentGroup ||
        'УИБО-02-23',
      studentCourse:
        profile.course ||
        profile.studentCourse ||
        4,
      teacherId: teacher.id,
      teacherName:
        teacher.fullName ||
        teacher.teacherName ||
        teacher.name ||
        'Преподаватель'
    };
  }

  // Старый формат:
  // submitApplication(studentId, studentName, studentGroup, studentCourse, teacherId, teacherName)
  return {
    studentId,
    studentName: secondArg || 'Студент',
    studentGroup: thirdArg || 'УИБО-02-23',
    studentCourse: fourthArg || 4,
    teacherId: fifthArg,
    teacherName: sixthArg || 'Преподаватель'
  };
};

// Подача заявки студентом
export const submitApplication = (...args) => {
  const systemData = getSystemData();

  const {
    studentId,
    studentName,
    studentGroup,
    studentCourse,
    teacherId,
    teacherName
  } = buildApplicationFromArgs(args);

  if (!studentId || !teacherId) {
    return {
      success: false,
      message: 'Не указан студент или преподаватель'
    };
  }

  const existingApproved = systemData.applications.find(application =>
    normalizeId(application.studentId) === normalizeId(studentId) &&
    application.status === 'approved'
  );

  if (existingApproved) {
    return {
      success: false,
      message: 'У вас уже есть утверждённый руководитель'
    };
  }

  const existingPending = systemData.applications.find(application =>
    normalizeId(application.studentId) === normalizeId(studentId) &&
    normalizeId(application.teacherId) === normalizeId(teacherId) &&
    application.status === 'pending'
  );

  if (existingPending) {
    return {
      success: false,
      message: 'У вас уже есть активная заявка к этому преподавателю'
    };
  }

  const application = {
    id: createId(),
    studentId,
    studentName,
    studentGroup,
    studentCourse,
    teacherId,
    teacherName,
    teacher: teacherName,
    status: 'pending',
    date: createDate(),
    createdAt: createDateTime(),
    topic: null,
    rejectReason: null
  };

  systemData.applications.push(application);

  // Уведомление преподавателю
  systemData.notifications.push(
    createNotificationObject(
      teacherId,
      'new_application',
      '📩 Новая заявка',
      `${studentName} отправил(а) вам заявку на руководство ВКР`,
      {
        applicationId: application.id,
        studentId,
        studentName,
        studentGroup,
        studentCourse
      }
    )
  );

  saveSystemData(systemData);

  return {
    success: true,
    application
  };
};

// Принятие заявки преподавателем
export const approveApplication = (applicationId, teacherId) => {
  const systemData = getSystemData();

  const application = systemData.applications.find(app =>
    normalizeId(app.id) === normalizeId(applicationId)
  );

  if (!application) {
    return {
      success: false,
      message: 'Заявка не найдена'
    };
  }

  if (normalizeId(application.teacherId) !== normalizeId(teacherId)) {
    return {
      success: false,
      message: 'Нет доступа'
    };
  }

  systemData.applications = systemData.applications.map(app => {
    if (normalizeId(app.id) === normalizeId(applicationId)) {
      return {
        ...app,
        status: 'approved',
        approvedDate: createDate(),
        approvedAt: createDateTime(),
        rejectReason: null
      };
    }

    if (
      normalizeId(app.studentId) === normalizeId(application.studentId) &&
      app.status === 'pending'
    ) {
      return {
        ...app,
        status: 'rejected',
        rejectReason: 'Студент выбрал другого преподавателя',
        rejectedDate: createDate()
      };
    }

    return app;
  });

  // Уведомление студенту о принятии
  systemData.notifications.push(
    createNotificationObject(
      application.studentId,
      'application_approved',
      'Заявка утверждена',
      `Преподаватель ${application.teacherName} принял(а) вашу заявку`,
      {
        applicationId: application.id,
        teacherId: application.teacherId,
        teacherName: application.teacherName
      }
    )
  );

  // Уведомления студенту об автоматическом отклонении остальных заявок
  systemData.applications
    .filter(app =>
      normalizeId(app.studentId) === normalizeId(application.studentId) &&
      normalizeId(app.id) !== normalizeId(applicationId) &&
      app.status === 'rejected' &&
      app.rejectReason === 'Студент выбрал другого преподавателя'
    )
    .forEach(app => {
      systemData.notifications.push(
        createNotificationObject(
          app.studentId,
          'application_rejected',
          'Заявка отклонена',
          `Ваша заявка к преподавателю ${app.teacherName} автоматически отклонена, так как вы выбрали другого руководителя.`,
          {
            applicationId: app.id,
            teacherId: app.teacherId,
            teacherName: app.teacherName,
            reason: app.rejectReason
          }
        )
      );
    });

  saveSystemData(systemData);

  const approvedApplication = systemData.applications.find(app =>
    normalizeId(app.id) === normalizeId(applicationId)
  );

  return {
    success: true,
    application: approvedApplication
  };
};

// Отклонение заявки преподавателем
export const rejectApplication = (applicationId, teacherId, reason = 'Без указания причины') => {
  const systemData = getSystemData();

  const application = systemData.applications.find(app =>
    normalizeId(app.id) === normalizeId(applicationId)
  );

  if (!application) {
    return {
      success: false,
      message: 'Заявка не найдена'
    };
  }

  if (normalizeId(application.teacherId) !== normalizeId(teacherId)) {
    return {
      success: false,
      message: 'Нет доступа'
    };
  }

  systemData.applications = systemData.applications.map(app =>
    normalizeId(app.id) === normalizeId(applicationId)
      ? {
          ...app,
          status: 'rejected',
          rejectReason: reason,
          rejectedDate: createDate()
        }
      : app
  );

  systemData.notifications.push(
    createNotificationObject(
      application.studentId,
      'application_rejected',
      'Заявка отклонена',
      `Преподаватель ${application.teacherName} отклонил(а) вашу заявку. Причина: ${reason}`,
      {
        applicationId: application.id,
        teacherId: application.teacherId,
        teacherName: application.teacherName,
        reason
      }
    )
  );

  saveSystemData(systemData);

  return {
    success: true,
    application: {
      ...application,
      status: 'rejected',
      rejectReason: reason
    }
  };
};

// Отмена заявки студентом
export const cancelApplication = (applicationId, studentId) => {
  const systemData = getSystemData();

  const application = systemData.applications.find(app =>
    normalizeId(app.id) === normalizeId(applicationId) &&
    normalizeId(app.studentId) === normalizeId(studentId)
  );

  if (!application) {
    return {
      success: false,
      message: 'Заявка не найдена'
    };
  }

  systemData.applications = systemData.applications.filter(app =>
    !(
      normalizeId(app.id) === normalizeId(applicationId) &&
      normalizeId(app.studentId) === normalizeId(studentId)
    )
  );

  saveSystemData(systemData);

  return {
    success: true
  };
};

// Получение заявок студента
export const getStudentApplications = (studentId) => {
  const systemData = getSystemData();

  return systemData.applications.filter(app =>
    normalizeId(app.studentId) === normalizeId(studentId)
  );
};

// Получение утверждённого руководителя студента
export const getStudentApprovedTeacher = (studentId) => {
  const systemData = getSystemData();

  return systemData.applications.find(app =>
    normalizeId(app.studentId) === normalizeId(studentId) &&
    app.status === 'approved'
  ) || null;
};

// Получение заявок к преподавателю
export const getTeacherPendingApplications = (teacherId) => {
  const systemData = getSystemData();

  return systemData.applications.filter(app =>
    normalizeId(app.teacherId) === normalizeId(teacherId) &&
    app.status === 'pending'
  );
};

// Получение утверждённых дипломников преподавателя
export const getTeacherApprovedStudents = (teacherId) => {
  const systemData = getSystemData();

  return systemData.applications.filter(app =>
    normalizeId(app.teacherId) === normalizeId(teacherId) &&
    app.status === 'approved'
  );
};

// ==================== ЗАДАНИЯ И ОЦЕНКИ ====================

export const submitTask = (studentId, taskId, files) => {
  const systemData = getSystemData();
  const key = `${studentId}_${taskId}`;

  const approvedTeacher = getStudentApprovedTeacher(studentId);

  systemData.tasks[key] = {
    ...systemData.tasks[key],
    status: 'submitted',
    files,
    submittedDate: createDate(),
    submittedAt: createDateTime(),
    teacherId: approvedTeacher?.teacherId || null,
    teacherName: approvedTeacher?.teacherName || null
  };

  if (approvedTeacher?.teacherId) {
    systemData.notifications.push(
      createNotificationObject(
        approvedTeacher.teacherId,
        'task_submitted',
        '📄 Новая работа на проверку',
        `${approvedTeacher.studentName || 'Студент'} отправил(а) работу на проверку`,
        {
          studentId,
          taskId,
          files
        }
      )
    );
  }

  saveSystemData(systemData);

  return {
    success: true
  };
};

export const gradeTask = (studentId, taskId, taskName, teacherId, teacherName, grade, feedback) => {
  const systemData = getSystemData();
  const key = `${studentId}_${taskId}`;

  systemData.tasks[key] = {
    ...systemData.tasks[key],
    status: 'completed',
    grade: `${grade} / 5,0`,
    feedback,
    feedbackDate: createDate(),
    feedbackAt: createDateTime(),
    teacherId,
    teacherName
  };

  systemData.notifications.push(
    createNotificationObject(
      studentId,
      'task_graded',
      '📝 Задание оценено',
      `Преподаватель ${teacherName} оценил задание "${taskName}" на ${grade}/5,0`,
      {
        taskId,
        taskName,
        grade,
        feedback,
        teacherId,
        teacherName
      }
    )
  );

  saveSystemData(systemData);

  return {
    success: true
  };
};

export const getStudentTasks = (studentId) => {
  const systemData = getSystemData();
  const tasks = {};

  Object.keys(systemData.tasks).forEach(key => {
    if (key.startsWith(`${studentId}_`)) {
      const taskId = parseInt(key.split('_')[1], 10);
      tasks[taskId] = systemData.tasks[key];
    }
  });

  return tasks;
};

// ==================== ЧАТЫ ====================

const getPersonalChatKey = (studentId, teacherId) => `student_${studentId}_teacher_${teacherId}`;

export const sendPersonalMessage = (studentId, teacherId, sender, senderId, senderName, text) => {
  const systemData = getSystemData();
  const chatKey = getPersonalChatKey(studentId, teacherId);

  if (!systemData.chats[chatKey]) {
    systemData.chats[chatKey] = [];
  }

  const message = {
    id: createId(),
    text,
    sender,
    senderId,
    senderName,
    timestamp: Date.now()
  };

  systemData.chats[chatKey].push(message);
  saveSystemData(systemData);

  return {
    success: true,
    message
  };
};

export const getPersonalChatMessages = (studentId, teacherId) => {
  const systemData = getSystemData();
  const chatKey = getPersonalChatKey(studentId, teacherId);

  return systemData.chats[chatKey] || [];
};

export const editChatMessage = (chatKey, messageId, newText) => {
  const systemData = getSystemData();
  const messages = systemData.chats[chatKey];

  if (!messages) {
    return { success: false };
  }

  const message = messages.find(item =>
    normalizeId(item.id) === normalizeId(messageId)
  );

  if (!message) {
    return { success: false };
  }

  message.text = newText;
  message.edited = true;

  saveSystemData(systemData);

  return { success: true };
};

export const deleteChatMessage = (chatKey, messageId) => {
  const systemData = getSystemData();

  if (!systemData.chats[chatKey]) {
    return { success: false };
  }

  systemData.chats[chatKey] = systemData.chats[chatKey].filter(message =>
    normalizeId(message.id) !== normalizeId(messageId)
  );

  saveSystemData(systemData);

  return { success: true };
};

// ==================== ГРУППЫ ====================

export const createTeacherGroup = (teacherId, name, course, students) => {
  const systemData = getSystemData();

  if (!systemData.teacherGroups[teacherId]) {
    systemData.teacherGroups[teacherId] = [];
  }

  const group = {
    id: createId(),
    name,
    course,
    students,
    messages: [],
    createdAt: createDate()
  };

  systemData.teacherGroups[teacherId].push(group);
  saveSystemData(systemData);

  return {
    success: true,
    group
  };
};

export const getTeacherGroups = (teacherId) => {
  const systemData = getSystemData();

  return systemData.teacherGroups[teacherId] || [];
};

export const updateGroupName = (teacherId, groupId, newName) => {
  const systemData = getSystemData();
  const groups = systemData.teacherGroups[teacherId];

  if (!groups) {
    return { success: false };
  }

  const group = groups.find(item =>
    normalizeId(item.id) === normalizeId(groupId)
  );

  if (!group) {
    return { success: false };
  }

  group.name = newName;

  saveSystemData(systemData);

  return { success: true };
};

export const deleteTeacherGroup = (teacherId, groupId) => {
  const systemData = getSystemData();

  if (!systemData.teacherGroups[teacherId]) {
    return { success: false };
  }

  systemData.teacherGroups[teacherId] = systemData.teacherGroups[teacherId].filter(group =>
    normalizeId(group.id) !== normalizeId(groupId)
  );

  saveSystemData(systemData);

  return { success: true };
};

export const getStudentGroups = (studentId, teacherId) => {
  const systemData = getSystemData();
  const teacherGroups = systemData.teacherGroups[teacherId] || [];

  return teacherGroups
    .filter(group =>
      group.students &&
      group.students.some(id => normalizeId(id) === normalizeId(studentId))
    )
    .map(group => ({
      ...group,
      messages: group.messages || []
    }));
};

// ==================== КОНФЕРЕНЦИИ ====================

export const addConference = (teacherId, conference) => {
  const systemData = getSystemData();

  const newConference = {
    ...conference,
    id: createId(),
    teacherId,
    createdAt: createDate()
  };

  systemData.conferences.push(newConference);
  saveSystemData(systemData);

  return {
    success: true,
    conference: newConference
  };
};

export const getTeacherConferences = (teacherId) => {
  const systemData = getSystemData();

  return systemData.conferences.filter(conference =>
    normalizeId(conference.teacherId) === normalizeId(teacherId)
  );
};

export const deleteConference = (conferenceId, teacherId) => {
  const systemData = getSystemData();

  const index = systemData.conferences.findIndex(conference =>
    normalizeId(conference.id) === normalizeId(conferenceId) &&
    normalizeId(conference.teacherId) === normalizeId(teacherId)
  );

  if (index === -1) {
    return { success: false };
  }

  systemData.conferences.splice(index, 1);
  saveSystemData(systemData);

  return { success: true };
};

// ==================== ДЕМО-ДАННЫЕ ====================

export const initDemoData = () => {
  const systemData = getSystemData();

  if (!systemData.teacherGroups[1]) {
    systemData.teacherGroups[1] = [
      {
        id: 2001,
        name: 'Общая группа ВКР 2026',
        course: 4,
        students: [1, 2, 3, 4, 5],
        messages: [
          {
            id: 3001,
            text: 'Добро пожаловать в общую группу ВКР!',
            sender: 'Аждер Т.Б.',
            time: '10:00'
          },
          {
            id: 3002,
            text: 'Здесь будут публиковаться важные объявления',
            sender: 'Аждер Т.Б.',
            time: '10:01'
          }
        ],
        createdAt: '15.03.2026'
      },
      {
        id: 2002,
        name: 'Разработка веб-приложений',
        course: 4,
        students: [1, 3],
        messages: [
          {
            id: 3003,
            text: 'Группа для обсуждения тем по веб-разработке',
            sender: 'Аждер Т.Б.',
            time: '11:00'
          }
        ],
        createdAt: '20.03.2026'
      }
    ];
  }

  saveSystemData(systemData);
};

// ==================== СПИСОК ПРЕПОДАВАТЕЛЕЙ ====================

const FULL_TEACHERS_LIST = [
  { id: 'teacher_1', fullName: 'Аждер Татьяна Борисовна', position: 'Доцент', institute: 'Институт технологий управления', department: 'Кафедра информационных технологий в государственном управлении', email: 'azhder@mirea.ru', maxSlots: 3, occupied: 1 },
  { id: 'teacher_2', fullName: 'Бакланов Павел Анатольевич', position: 'Доцент', institute: 'Институт технологий управления', department: 'Кафедра информационных технологий в государственном управлении', email: 'baklanov@mirea.ru', maxSlots: 3, occupied: 0 },
  { id: 'teacher_3', fullName: 'Бурлаков Вячеслав Викторович', position: 'Профессор', institute: 'Институт технологий управления', department: 'Кафедра информационных технологий в государственном управлении', email: 'burlakov@mirea.ru', maxSlots: 2, occupied: 2 },
  { id: 'teacher_4', fullName: 'Вартанян Аревшад Апетович', position: 'Профессор', institute: 'Институт технологий управления', department: 'Кафедра информационных технологий в государственном управлении', email: 'vartanyan@mirea.ru', maxSlots: 3, occupied: 1 },
  { id: 'teacher_5', fullName: 'Гостева Мария Александровна', position: 'Доцент', institute: 'Институт технологий управления', department: 'Кафедра информационных технологий в государственном управлении', email: 'gosteva@mirea.ru', maxSlots: 3, occupied: 0 },
  { id: 'teacher_6', fullName: 'Елагина Ольга Александровна', position: 'Доцент', institute: 'Институт технологий управления', department: 'Кафедра информационных технологий в государственном управлении', email: 'elagina@mirea.ru', maxSlots: 2, occupied: 1 },
  { id: 'teacher_7', fullName: 'Емельянова Ольга Владимировна', position: 'Доцент', institute: 'Институт технологий управления', department: 'Кафедра информационных технологий в государственном управлении', email: 'emelyanova@mirea.ru', maxSlots: 3, occupied: 0 },
  { id: 'teacher_8', fullName: 'Земцов Алексей Дмитриевич', position: 'Доцент', institute: 'Институт технологий управления', department: 'Кафедра информационных технологий в государственном управлении', email: 'zemtsov@mirea.ru', maxSlots: 3, occupied: 2 },
  { id: 'teacher_9', fullName: 'Корецкий Владимир Павлович', position: 'Доцент', institute: 'Институт технологий управления', department: 'Кафедра информационных технологий в государственном управлении', email: 'koretsky@mirea.ru', maxSlots: 2, occupied: 0 },
  { id: 'teacher_10', fullName: 'Кудрявцева Ирина Генадьевна', position: 'Доцент', institute: 'Институт технологий управления', department: 'Кафедра информационных технологий в государственном управлении', email: 'kudryavtseva@mirea.ru', maxSlots: 3, occupied: 1 },
  { id: 'teacher_11', fullName: 'Лукашевич Евгения Вадимовна', position: 'Доцент', institute: 'Институт технологий управления', department: 'Кафедра информационных технологий в государственном управлении', email: 'lukashevich@mirea.ru', maxSlots: 3, occupied: 0 },
  { id: 'teacher_12', fullName: 'Марухленко Анатолий Леонидович', position: 'Доцент', institute: 'Институт технологий управления', department: 'Кафедра информационных технологий в государственном управлении', email: 'marukhlenko@mirea.ru', maxSlots: 2, occupied: 1 },
  { id: 'teacher_13', fullName: 'Новикова Ольга Александровна', position: 'Доцент', institute: 'Институт технологий управления', department: 'Кафедра информационных технологий в государственном управлении', email: 'novikova@mirea.ru', maxSlots: 3, occupied: 2 },
  { id: 'teacher_14', fullName: 'Паршин Игорь Олегович', position: 'Доцент', institute: 'Институт технологий управления', department: 'Кафедра информационных технологий в государственном управлении', email: 'parshin@mirea.ru', maxSlots: 3, occupied: 0 },
  { id: 'teacher_15', fullName: 'Перминова Ольга Михайловна', position: 'Доцент', institute: 'Институт технологий управления', department: 'Кафедра информационных технологий в государственном управлении', email: 'perminova@mirea.ru', maxSlots: 2, occupied: 1 },
  { id: 'teacher_16', fullName: 'Перцева Ольга Вадимовна', position: 'Доцент', institute: 'Институт технологий управления', department: 'Кафедра информационных технологий в государственном управлении', email: 'pertseva@mirea.ru', maxSlots: 3, occupied: 0 },
  { id: 'teacher_17', fullName: 'Проворова Ирина Павловна', position: 'Доцент', institute: 'Институт технологий управления', department: 'Кафедра информационных технологий в государственном управлении', email: 'provorova@mirea.ru', maxSlots: 3, occupied: 1 },
  { id: 'teacher_18', fullName: 'Раменская Алина Владимировна', position: 'Доцент', institute: 'Институт технологий управления', department: 'Кафедра информационных технологий в государственном управлении', email: 'ramenskaya@mirea.ru', maxSlots: 2, occupied: 0 },
  { id: 'teacher_19', fullName: 'Семенычева Ирина Флюровна', position: 'Доцент', institute: 'Институт технологий управления', department: 'Кафедра информационных технологий в государственном управлении', email: 'semenycheva@mirea.ru', maxSlots: 3, occupied: 2 },
  { id: 'teacher_20', fullName: 'Сиганьков Алексей Александрович', position: 'Доцент', institute: 'Институт технологий управления', department: 'Кафедра информационных технологий в государственном управлении', email: 'sigankov@mirea.ru', maxSlots: 3, occupied: 0 },
  { id: 'teacher_21', fullName: 'Сороко Андрей Викторович', position: 'Заведующий кафедрой', institute: 'Институт технологий управления', department: 'Кафедра информационных технологий в государственном управлении', email: 'soroko@mirea.ru', maxSlots: 3, occupied: 1 },
  { id: 'teacher_22', fullName: 'Стариковская Надежда Анатольевна', position: 'Доцент', institute: 'Институт технологий управления', department: 'Кафедра информационных технологий в государственном управлении', email: 'starikovskaya@mirea.ru', maxSlots: 2, occupied: 0 },
  { id: 'teacher_23', fullName: 'Стебунова Ольга Ивановна', position: 'Доцент', institute: 'Институт технологий управления', department: 'Кафедра информационных технологий в государственном управлении', email: 'stebunova@mirea.ru', maxSlots: 3, occupied: 1 },
  { id: 'teacher_24', fullName: 'Тюрин Андрей Геннадьевич', position: 'Доцент', institute: 'Институт технологий управления', department: 'Кафедра информационных технологий в государственном управлении', email: 'tyurin@mirea.ru', maxSlots: 3, occupied: 0 }
];

export const getFullTeachersList = () => {
  const stored = localStorage.getItem('fullTeachersList');

  if (stored) {
    return JSON.parse(stored);
  }

  localStorage.setItem('fullTeachersList', JSON.stringify(FULL_TEACHERS_LIST));

  return FULL_TEACHERS_LIST;
};

export const getTeachersOnlineStatus = () => {
  const stored = localStorage.getItem('teachersOnlineStatus');
  const now = Date.now();

  const statuses = stored ? JSON.parse(stored) : {};

  FULL_TEACHERS_LIST.forEach(teacher => {
    if (!statuses[teacher.id]) {
      statuses[teacher.id] = {
        lastSeen: now - Math.floor(Math.random() * 86400000),
        isOnline: Math.random() > 0.7
      };
    }
  });

  localStorage.setItem('teachersOnlineStatus', JSON.stringify(statuses));

  return statuses;
};