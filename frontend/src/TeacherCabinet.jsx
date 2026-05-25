import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import {
  getTeacherPendingApplications,
  getTeacherApprovedStudents,
  approveApplication,
  rejectApplication,
  getPersonalChatMessages,
  sendPersonalMessage,
  gradeTask,
  initDemoData,
  getFullTeachersList
} from './utils/systemStorage';

// ==================== ДАННЫЕ ДЕМО ====================
const VKR_TASKS = [
  'Утверждение темы ВКР',
  'Заявление на ВКР',
  'Введение и обзор литературы',
  'Глава 1. Теоретическая часть',
  'Глава 2. Практическая часть',
  'Итоговая версия',
];

const TASK_DESCRIPTIONS = [
  'Необходимо согласовать с научным руководителем тему выпускной квалификационной работы. Студент должен предложить тему, обосновать её актуальность и получить утверждение.',
  'Заполните и загрузите подписанное заявление на закрепление темы ВКР. Документ должен быть подписан студентом и научным руководителем.',
  'Подготовьте введение к ВКР и обзор литературы. Необходимо проанализировать не менее 15 источников, описать актуальность, цель и задачи исследования.',
  'Разработайте теоретическую часть ВКР. Опишите основные концепции, методы и подходы, используемые в исследовании.',
  'Разработайте практическую часть ВКР. Реализуйте проект, проведите эксперименты, опишите полученные результаты.',
  'Загрузите итоговую версию ВКР. Документ должен быть полностью оформлен, включая все главы, список литературы и приложения.'
];

const TASK_OPEN_FROM = [
  '15 марта 2026, 00:00',
  '15 марта 2026, 00:00',
  '28 марта 2026, 00:00',
  '5 апреля 2026, 00:00',
  '25 апреля 2026, 00:00',
  '1 июня 2026, 00:00'
];

const TASK_DEADLINE = [
  '1 апреля 2026, 23:59',
  '5 апреля 2026, 23:59',
  '3 мая 2026, 23:59',
  '20 мая 2026, 23:59',
  '15 июня 2026, 23:59',
  '20 июня 2026, 23:59'
];

const TASK_MAX_ATTEMPTS = [1, 1, 3, 3, 3, 1];

const NEWS = [
  { id: 1, title: 'Приём заявок на ВКР завершён', desc: 'Заявки принимались до 1 марта 2026', date: '2 мар. 2026 г.', important: true },
  { id: 2, title: 'Утверждение тем до 1 апреля', desc: 'Не забудьте утвердить темы дипломников', date: '15 мар. 2026 г.', important: true },
  { id: 3, title: 'График защит утверждён', desc: 'Защиты пройдут с 1 по 20 июня', date: '10 апр. 2026 г.', important: false },
];

const DEMO_PENDING_APPLICATIONS = [
  { id: 101, studentId: 101, studentName: 'Иванов Иван Иванович', group: 'УИБО-01-22', date: '25.02.2026', gpa: 4.8, course: 3, degree: 'Бакалавриат', topicProposed: false },
  { id: 102, studentId: 102, studentName: 'Петров Пётр Петрович', group: 'УИБО-02-23', date: '27.02.2026', gpa: 4.5, course: 4, degree: 'Бакалавриат', topicProposed: true, proposedTopic: 'Анализ больших данных' },
];

const DEMO_DIPLOMNIKS = [
  { id: 4, studentName: 'Смирнов Алексей Владимирович', group: 'УИБО-04-22', topic: 'Веб-сервис для бронирования', gpa: 4.6, course: 4, degree: 'Бакалавриат' },
  { id: 5, studentName: 'Морозова Елена Игоревна', group: 'УИБО-05-22', topic: null, gpa: 4.4, course: 4, degree: 'Бакалавриат' },
  { id: 6, studentName: 'Козлов Дмитрий Андреевич', group: 'УИМО-01-22', topic: 'Исследование алгоритмов шифрования', gpa: 4.7, course: 4, degree: 'Магистратура' },
];

const DEMO_SUBMITTED_TASKS = [
  { id: 1, studentId: 4, studentName: 'Смирнов Алексей Владимирович', taskName: 'Утверждение темы ВКР', taskIndex: 0, description: TASK_DESCRIPTIONS[0], openFrom: TASK_OPEN_FROM[0], deadline: TASK_DEADLINE[0], attemptNumber: 1, maxAttempts: 1, status: 'submitted', gradeStatus: 'graded', grade: '5 / 5,0', gradedDate: '2 апреля 2026, 10:30', gradedBy: 'Преподаватель', feedback: 'Тема утверждена.', comments: ['Тема утверждена.'], submittedDate: '28 марта 2026, 15:20', files: [{ name: 'Тема_ВКР_Смирнов.docx', date: '28 марта 2026, 15:20' }], timeRemaining: 'Ответ на задание представлен заранее' },
  { id: 2, studentId: 4, studentName: 'Смирнов Алексей Владимирович', taskName: 'Заявление на ВКР', taskIndex: 1, description: TASK_DESCRIPTIONS[1], openFrom: TASK_OPEN_FROM[1], deadline: TASK_DEADLINE[1], attemptNumber: 1, maxAttempts: 1, status: 'submitted', gradeStatus: 'graded', grade: '5 / 5,0', gradedDate: '6 апреля 2026, 09:15', gradedBy: 'Преподаватель', feedback: 'Заявление принято.', comments: ['Заявление принято.'], submittedDate: '3 апреля 2026, 11:40', files: [{ name: 'Заявление_Смирнов.pdf', date: '3 апреля 2026, 11:40' }], timeRemaining: 'Ответ на задание представлен заранее' },
  { id: 3, studentId: 4, studentName: 'Смирнов Алексей Владимирович', taskName: 'Введение и обзор литературы', taskIndex: 2, description: TASK_DESCRIPTIONS[2], openFrom: TASK_OPEN_FROM[2], deadline: TASK_DEADLINE[2], attemptNumber: 1, maxAttempts: 3, status: 'submitted', gradeStatus: 'graded', grade: '4.5 / 5,0', gradedDate: '4 апреля 2026, 15:46', gradedBy: 'Преподаватель', feedback: 'Хорошая работа.', comments: ['Хорошая работа.'], submittedDate: '3 апреля 2026, 22:02', files: [{ name: 'Введение_Смирнов.docx', date: '3 апреля 2026, 20:16' }], timeRemaining: 'Ответ на задание представлен заранее' },
  { id: 4, studentId: 4, studentName: 'Смирнов Алексей Владимирович', taskName: 'Глава 1. Теоретическая часть', taskIndex: 3, description: TASK_DESCRIPTIONS[3], openFrom: TASK_OPEN_FROM[3], deadline: TASK_DEADLINE[3], attemptNumber: 1, maxAttempts: 3, status: 'submitted', gradeStatus: 'graded', grade: '5 / 5,0', gradedDate: '21 апреля 2026, 10:15', gradedBy: 'Преподаватель', feedback: 'Отличная работа!', comments: ['Отличная работа!'], submittedDate: '18 апреля 2026, 14:30', files: [{ name: 'Глава1_Смирнов.docx', date: '18 апреля 2026, 14:30' }], timeRemaining: 'Ответ на задание представлен заранее' },
  { id: 5, studentId: 4, studentName: 'Смирнов Алексей Владимирович', taskName: 'Глава 2. Практическая часть', taskIndex: 4, description: TASK_DESCRIPTIONS[4], openFrom: TASK_OPEN_FROM[4], deadline: TASK_DEADLINE[4], attemptNumber: 1, maxAttempts: 3, status: 'submitted', gradeStatus: 'not_graded', grade: null, gradedDate: null, gradedBy: null, feedback: null, comments: [], submittedDate: '14 мая 2026, 11:20', files: [{ name: 'Глава2_Смирнов.docx', date: '14 мая 2026, 11:20' }], timeRemaining: 'Ответ на задание представлен заранее' },
  { id: 6, studentId: 5, studentName: 'Морозова Елена Игоревна', taskName: 'Введение и обзор литературы', taskIndex: 2, description: TASK_DESCRIPTIONS[2], openFrom: TASK_OPEN_FROM[2], deadline: TASK_DEADLINE[2], attemptNumber: 1, maxAttempts: 3, status: 'submitted', gradeStatus: 'not_graded', grade: null, gradedDate: null, gradedBy: null, feedback: null, comments: [], submittedDate: '2 апреля 2026, 18:30', files: [{ name: 'Введение_Морозова.docx', date: '2 апреля 2026, 18:30' }], timeRemaining: 'Ответ на задание представлен заранее' },
];

// ==================== УТИЛИТЫ ====================
const detectGender = (fullName) => {
  if (!fullName) return 'Не указан';
  const lastName = fullName.split(' ')[0];
  if (lastName.endsWith('а') || lastName.endsWith('я') || lastName.endsWith('ова') || lastName.endsWith('ева') || lastName.endsWith('ина')) return 'Женский';
  return 'Мужской';
};

const getTaskWord = (count) => {
  const lastDigit = count % 10;
  const lastTwo = count % 100;
  if (lastTwo >= 11 && lastTwo <= 19) return 'заданий';
  if (lastDigit === 1) return 'задание';
  if (lastDigit >= 2 && lastDigit <= 4) return 'задания';
  return 'заданий';
};

const formatNow = () => {
  const d = new Date();
  return `${d.toLocaleDateString('ru-RU')}, ${d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
};

// ==================== ИКОНКИ ====================
const HomeIcon = ({ active, isDark }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 transition-all hover:scale-110 ${active ? (isDark ? 'text-[#A78BFA]' : 'text-[#2563EB]') : (isDark ? 'text-gray-400' : 'text-gray-500')}`}>
    <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.69-8.69a2.25 2.25 0 00-3.18 0l-8.69 8.69a.75.75 0 001.06 1.06l8.69-8.69z" />
    <path d="M12 5.432l8.159 8.159a2.25 2.25 0 01.659 1.591v5.568a.75.75 0 01-.75.75h-5.25a.75.75 0 01-.75-.75v-4.5c0-.414-.336-.75-.75-.75h-3c-.414 0-.75.336-.75.75v4.5a.75.75 0 01-.75.75H3.75a.75.75 0 01-.75-.75v-5.568a2.25 2.25 0 01.659-1.591L12 5.432z" />
  </svg>
);

const ServicesIcon = ({ active, isDark }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 transition-all hover:scale-110 ${active ? (isDark ? 'text-[#A78BFA]' : 'text-[#2563EB]') : (isDark ? 'text-gray-400' : 'text-gray-500')}`}>
    <path fillRule="evenodd" d="M6 3a3 3 0 00-3 3v12a3 3 0 003 3h12a3 3 0 003-3V6a3 3 0 00-3-3H6zm1.5 1.5h9A1.5 1.5 0 0118 6v12a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 015.5 18V6A1.5 1.5 0 017 4.5zm2 3a.75.75 0 000 1.5h6a.75.75 0 000-1.5H9zm0 3a.75.75 0 000 1.5h6a.75.75 0 000-1.5H9zm0 3a.75.75 0 000 1.5h4a.75.75 0 000-1.5H9z" clipRule="evenodd" />
  </svg>
);

const CheckIcon = ({ active, isDark }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 transition-all hover:scale-110 ${active ? (isDark ? 'text-[#A78BFA]' : 'text-[#2563EB]') : (isDark ? 'text-gray-400' : 'text-gray-500')}`}>
    <path fillRule="evenodd" d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 013 20.625V9.375zM9 12a.75.75 0 000 1.5h6a.75.75 0 000-1.5H9zm0 3a.75.75 0 000 1.5h4a.75.75 0 000-1.5H9z" clipRule="evenodd" />
  </svg>
);

const ProfileIcon = ({ active, isDark }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-6 h-6 transition-all hover:scale-110 ${active ? (isDark ? 'text-[#A78BFA]' : 'text-[#2563EB]') : (isDark ? 'text-gray-400' : 'text-gray-500')}`}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const BellIcon = ({ isDark }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
    className={`w-6 h-6 transition-all duration-200 hover:scale-110 ${
      isDark ? 'text-[#A78BFA]' : 'text-[#2563EB]'
    }`}
  >
    <path
      fillRule="evenodd"
      d="M5.74 8.5a6.26 6.26 0 1112.52 0c0 1.432.364 2.84 1.057 4.093l.665 1.203A1.5 1.5 0 0118.67 16H5.33a1.5 1.5 0 01-1.312-2.204l.665-1.203A8.273 8.273 0 005.74 8.5zM9 18a3 3 0 006 0H9z"
      clipRule="evenodd"
    />
  </svg>
);

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 hover:scale-110 transition-transform">
    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
  </svg>
);
const MoonIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" /></svg>;


const NewsIcon = ({ isDark }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 mr-2 ${isDark ? 'text-[#A78BFA]' : 'text-[#2563EB]'}`}>
    <path fillRule="evenodd" d="M4.125 3C3.089 3 2.25 3.84 2.25 4.875V18a3 3 0 003 3h15a3 3 0 01-3-3V4.875C17.25 3.839 16.41 3 15.375 3H4.125zM12 9.75a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H12zm-.75-2.25a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5H12a.75.75 0 01-.75-.75zM6 12.75a.75.75 0 000 1.5h7.5a.75.75 0 000-1.5H6zm-.75 3.75a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5H6a.75.75 0 01-.75-.75zM6 6.75a.75.75 0 00-.75.75v3c0 .414.336.75.75.75h3a.75.75 0 00.75-.75v-3A.75.75 0 009 6.75H6z" clipRule="evenodd" />
  </svg>
);

const SmallIcon = ({ type, isDark, active = false }) => {
  const cls = `w-5 h-5 mr-2 flex-shrink-0 ${active ? 'text-white' : (isDark ? 'text-[#A78BFA]' : 'text-[#2563EB]')}`;
  if (type === 'doc') return <svg viewBox="0 0 24 24" fill="currentColor" className={cls}><path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625z" /></svg>;
  if (type === 'chat') return <svg viewBox="0 0 24 24" fill="currentColor" className={cls}><path d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97z" /></svg>;
  return <svg viewBox="0 0 24 24" fill="currentColor" className={cls}><path d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z" /></svg>;
};

// ==================== ОСНОВНОЙ КОМПОНЕНТ ====================
function TeacherCabinet({ user, profile, onLogout }) {
  const { API_URL } = useAuth();
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('teacherActiveTab') || 'home');
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('teacherTheme');
    return saved ? saved === 'dark' : true;
  });

  const [activeNewsTab, setActiveNewsTab] = useState('all');
  const [servicesTab, setServicesTab] = useState('diplomniks');
  const [diplomniksSubTab, setDiplomniksSubTab] = useState('approved');
  const [pendingApplications, setPendingApplications] = useState(DEMO_PENDING_APPLICATIONS);
  const [diplomniks, setDiplomniks] = useState(DEMO_DIPLOMNIKS);
  const [submittedTasks, setSubmittedTasks] = useState(DEMO_SUBMITTED_TASKS);

  const [expandedStudent, setExpandedStudent] = useState(null);
  const [expandedTask, setExpandedTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewGrade, setReviewGrade] = useState('');
  const [newTaskComment, setNewTaskComment] = useState('');

  const [rejectDialog, setRejectDialog] = useState({ show: false, application: null });
  const [rejectReasonType, setRejectReasonType] = useState('');
  const [rejectReasonCustom, setRejectReasonCustom] = useState('');

  const [showNotifications, setShowNotifications] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState([]);
  const [chats, setChats] = useState([]);

  const teacherFullName = profile?.full_name || 'Преподаватель';
  const filteredNews = activeNewsTab === 'all' ? NEWS : NEWS.filter(n => n.important);

  const getCurrentTeacherIds = () => {
    const ids = [user.id];

    try {
      const fullName = (profile?.full_name || '').trim().toLowerCase();
      const matchedTeacher = getFullTeachersList().find(teacher =>
        teacher.fullName.trim().toLowerCase() === fullName ||
        teacher.fullName.trim().toLowerCase().includes(fullName) ||
        fullName.includes(teacher.fullName.trim().toLowerCase())
      );

      if (matchedTeacher?.id) {
        ids.push(matchedTeacher.id);
      }
    } catch (error) {
      // Если список преподавателей недоступен, используем только user.id
    }

    return [...new Set(ids.map(String))];
  };

  const theme = {
    bg: isDark ? 'bg-[#121218]' : 'bg-white',
    header: isDark ? 'bg-[#121218]/80 backdrop-blur-md border-[#2A2A3A]' : 'bg-white/80 backdrop-blur-md border-gray-200',
    card: isDark ? 'bg-[#1E1E2A] border border-[#2A2A3A]' : 'bg-white border border-gray-200 shadow-sm',
    cardInner: isDark ? 'bg-[#121218]' : 'bg-gray-50',
    text: isDark ? 'text-[#F1F5F9]' : 'text-[#1E293B]',
    textSecondary: isDark ? 'text-[#94A3B8]' : 'text-[#64748B]',
    textMuted: isDark ? 'text-[#64748B]' : 'text-[#94A3B8]',
    input: isDark ? 'bg-[#1E1E2A] border-2 border-[#A78BFA] text-white placeholder-gray-400' : 'bg-white border-2 border-[#2563EB] text-gray-800 placeholder-gray-400',
    bottomBar: isDark ? 'bg-[#1E1E2A]/90 backdrop-blur-xl border-[#2A2A3A]' : 'bg-white/90 backdrop-blur-xl border-gray-200 shadow-lg',
    progressBg: isDark ? 'bg-gray-700' : 'bg-gray-200',
  };

  const noScrollbar = { scrollbarWidth: 'none', msOverflowStyle: 'none' };
  const scrollbarCSS = `
    html, body { background-color: ${isDark ? '#121218' : '#ffffff'}; min-height: 100vh; margin: 0; padding: 0; }
    .no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
  `;

  useEffect(() => {
    initDemoData();
    loadTeacherData();
  }, []);

  useEffect(() => { localStorage.setItem('teacherTheme', isDark ? 'dark' : 'light'); }, [isDark]);
  useEffect(() => { localStorage.setItem('teacherActiveTab', activeTab); }, [activeTab]);

  const loadTeacherData = () => {
    try {
      const teacherIds = getCurrentTeacherIds();

      const realPending = teacherIds
        .flatMap(id => getTeacherPendingApplications(id) || [])
        .filter((app, index, arr) => arr.findIndex(item => String(item.id) === String(app.id)) === index)
        .map(app => ({
          id: app.id,
          studentId: app.studentId,
          studentName: app.studentName,
          group: app.studentGroup || app.group,
          date: app.date,
          course: app.studentCourse || app.course || 4,
          degree: 'Бакалавриат',
          gpa: 4.5,
          topicProposed: !!app.topic,
          proposedTopic: app.topic,
          teacherId: app.teacherId,
          teacherName: app.teacherName
        }));

      const realApproved = teacherIds
        .flatMap(id => getTeacherApprovedStudents(id) || [])
        .filter((app, index, arr) => arr.findIndex(item => String(item.id) === String(app.id)) === index)
        .map(app => ({
          id: app.studentId,
          studentName: app.studentName,
          group: app.studentGroup || app.group,
          course: app.studentCourse || app.course || 4,
          topic: app.topic,
          gpa: 4.5,
          degree: 'Бакалавриат',
          teacherId: app.teacherId,
          applicationId: app.id
        }));

      setPendingApplications([
        ...DEMO_PENDING_APPLICATIONS,
        ...realPending.filter(app => !DEMO_PENDING_APPLICATIONS.some(demo => String(demo.id) === String(app.id)))
      ]);

      setDiplomniks([
        ...DEMO_DIPLOMNIKS,
        ...realApproved.filter(app => !DEMO_DIPLOMNIKS.some(demo => String(demo.id) === String(app.id)))
      ]);

      const allDiplomniks = [
        ...DEMO_DIPLOMNIKS,
        ...realApproved.filter(app => !DEMO_DIPLOMNIKS.some(demo => String(demo.id) === String(app.id)))
      ];

      setChats(allDiplomniks.map(student => {
        const teacherIdForChat = student.teacherId || user.id;
        const messages = getPersonalChatMessages(student.id, teacherIdForChat) || [];
        return {
          id: student.id,
          studentName: student.studentName,
          course: student.course,
          teacherId: teacherIdForChat,
          messages
        };
      }));
    } catch (e) {
      setPendingApplications(DEMO_PENDING_APPLICATIONS);
      setDiplomniks(DEMO_DIPLOMNIKS);
    }
  };

  const unreadReviewTasks = submittedTasks.filter(t => t.gradeStatus === 'not_graded');
  const notifications = [
    ...unreadReviewTasks.map(t => ({
      id: `task-${t.id}`,
      title: 'Новая работа на проверку',
      text: `${t.studentName} прислал(а) работу: ${t.taskName}`,
      date: t.submittedDate,
      taskId: t.id
    })),
    ...pendingApplications.map(app => ({
      id: `app-${app.id}`,
      title: 'Новая заявка на руководство',
      text: `${app.studentName} подал(а) заявку`,
      date: app.date,
      applicationId: app.id
    }))
  ];

  const unreadCount = notifications.filter(n => !readNotificationIds.includes(n.id)).length;
  const notificationDotColor = isDark ? 'bg-[#22C55E]' : 'bg-[#EF4444]';
  const getGradeColorClass = (gradeValue) => {
    const numericGrade = parseFloat(String(gradeValue || '').replace(',', '.'));

    if (Number.isNaN(numericGrade)) {
      return isDark
        ? 'bg-gray-600/20 text-gray-400 border border-gray-500/30'
        : 'bg-gray-100 text-gray-600 border border-gray-200';
    }

    if (numericGrade <= 2) {
      return isDark
        ? 'bg-red-600/20 text-red-400 border border-red-500/30'
        : 'bg-red-100 text-red-700 border border-red-200';
    }

    if (numericGrade === 3) {
      return isDark
        ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-500/30'
        : 'bg-yellow-100 text-yellow-700 border border-yellow-200';
    }

    return isDark
      ? 'bg-green-600/20 text-green-400 border border-green-500/30'
      : 'bg-green-100 text-green-700 border border-green-200';
  };

  const calculateProgress = (sid) => {
    const tasks = submittedTasks.filter(t => t.studentId === sid);
    const done = tasks.filter(t => t.gradeStatus === 'graded' && parseFloat(String(t.grade).replace(',', '.')) >= 3).length;
    return Math.round((done / VKR_TASKS.length) * 100);
  };

  const getStudentTasks = (studentId) => {
    const rawTasks = submittedTasks.filter(t => t.studentId === studentId);

    // Показываем только корректную последовательность: следующий раздел доступен
    // только после того, как предыдущий раздел сдан и оценён минимум на 3.
    return rawTasks.filter(task => {
      if (task.taskIndex === 0) return true;
      for (let idx = 0; idx < task.taskIndex; idx += 1) {
        const prevTask = rawTasks.find(t => t.taskIndex === idx);
        const prevGrade = parseFloat(String(prevTask?.grade || '').replace(',', '.'));
        if (!prevTask || prevTask.gradeStatus !== 'graded' || Number.isNaN(prevGrade) || prevGrade < 3) {
          return false;
        }
      }
      return true;
    });
  };
  const studentsWithSubmissions = diplomniks.map(s => ({ ...s, submittedTasks: getStudentTasks(s.id) }));

  const goToReviewTask = (task) => {
    setActiveTab('check');
    setExpandedStudent(task.studentId);
    setExpandedTask(`${task.studentId}-${task.taskIndex}`);
    setSelectedTask(task);
    setReadNotificationIds(prev => [...new Set([...prev, `task-${task.id}`])]);
    setShowNotifications(false);
  };

  const handleAccept = (app) => {
    const isRealApplication = !!app.teacherId;

    if (isRealApplication) {
      const result = approveApplication(app.id, app.teacherId);

      if (!result.success) {
        alert(result.message || 'Не удалось принять заявку');
        return;
      }
    }

    const newDiplomnik = {
      id: app.studentId || app.id,
      studentName: app.studentName,
      group: app.group,
      topic: app.proposedTopic || null,
      gpa: app.gpa || 4.5,
      course: app.course || 4,
      degree: app.degree || 'Бакалавриат',
      teacherId: app.teacherId || user.id,
      applicationId: app.id
    };

    setDiplomniks(prev =>
      prev.some(d => String(d.id) === String(newDiplomnik.id))
        ? prev
        : [...prev, newDiplomnik]
    );

    setPendingApplications(prev => prev.filter(a => String(a.id) !== String(app.id)));
    setDiplomniksSubTab('approved');

    if (isRealApplication) {
      loadTeacherData();
    }
  };

  const handleReject = (app) => {
    setRejectDialog({ show: true, application: app });
    setRejectReasonType('');
    setRejectReasonCustom('');
  };

  const confirmReject = () => {
    const app = rejectDialog.application;
    if (!app) return;
    const reason = rejectReasonCustom.trim() || rejectReasonType || 'Без указания причины';
    try { rejectApplication(app.id, app.teacherId || user.id, reason); } catch (e) {}
    setPendingApplications(prev => prev.filter(a => a.id !== app.id));
    setRejectDialog({ show: false, application: null });
    setRejectReasonType('');
    setRejectReasonCustom('');
  };

  const openTaskModal = (t) => {
    setSelectedTask(t);
    setNewTaskComment((t.comments && t.comments.length > 0) ? t.comments[0] : (t.feedback || ''));
    setShowTaskModal(true);
  };

  const openReviewModal = (t) => {
    setSelectedTask(t);
    setReviewComment(t.feedback || '');
    setReviewGrade(t.grade ? String(t.grade).split(' ')[0].replace(',', '.') : '');
    setShowReviewModal(true);
  };

  const updateSelectedTaskEverywhere = (updatedTask) => {
    setSubmittedTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    setSelectedTask(updatedTask);
  };

  const addTaskComment = () => {
    if (!newTaskComment.trim() || !selectedTask) return;
    const comment = newTaskComment.trim();
    const updatedTask = {
      ...selectedTask,
      comments: [comment],
      feedback: comment
    };
    updateSelectedTaskEverywhere(updatedTask);
    setNewTaskComment(comment);
  };

  const submitReview = () => {
    if (!reviewGrade || !selectedTask) return;

    try {
      gradeTask(
        selectedTask.studentId,
        selectedTask.taskIndex,
        selectedTask.taskName,
        user.id,
        profile.full_name,
        reviewGrade,
        reviewComment
      );
    } catch (e) {}

    const updatedTask = {
      ...selectedTask,
      gradeStatus: 'graded',
      grade: `${reviewGrade} / 5,0`,
      gradedDate: formatNow(),
      gradedBy: profile.full_name,
      feedback: reviewComment,
      comments: reviewComment.trim() ? [reviewComment.trim()] : []
    };

    updateSelectedTaskEverywhere(updatedTask);
    setShowReviewModal(false);
  };

  const startChatWithStudent = (student) => {
    setServicesTab('chats');
    setChats(prev => prev.some(c => c.id === student.id)
      ? prev
      : [...prev, { id: student.id, studentName: student.studentName, course: student.course, messages: [] }]
    );
  };

  const sendChatMessage = (chatId, text) => {
    if (!text.trim()) return;

    const chat = chats.find(c => String(c.id) === String(chatId));
    if (!chat) return;

    let message = {
      id: Date.now(),
      text: text.trim(),
      sender: 'teacher',
      senderName: profile.full_name,
      timestamp: Date.now()
    };

    if (!chat.isGroup) {
      try {
        const result = sendPersonalMessage(
          chat.id,
          chat.teacherId || user.id,
          'teacher',
          user.id,
          profile.full_name,
          text.trim()
        );
        if (result.success) message = result.message;
      } catch (e) {}
    }

    setChats(prev => prev.map(c =>
      String(c.id) === String(chatId)
        ? { ...c, messages: [...(c.messages || []), message] }
        : c
    ));
  };

  const NotificationBell = () => (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowNotifications(!showNotifications)}
        className={`relative p-2 rounded-full transition ${isDark ? 'bg-[#1E1E2A] text-[#A78BFA] hover:bg-[#2A2A3A]' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
        title="Уведомления"
      >
        <BellIcon isDark={isDark} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowNotifications(false)}
          />
          <div className={`absolute right-0 mt-2 w-80 rounded-xl shadow-xl z-50 ${theme.card} max-h-96 overflow-hidden`}>
            <div className={`p-3 border-b flex items-center justify-between ${isDark ? 'border-[#2A2A3A]' : 'border-gray-200'}`}>
              <h4 className={`font-medium ${theme.text}`}>Уведомления</h4>
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={() => setReadNotificationIds(notifications.map(n => n.id))}
                  className={`text-xs ${isDark ? 'text-[#A78BFA]' : 'text-[#2563EB]'} hover:underline`}
                >
                  Прочитать все
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto no-scrollbar" style={noScrollbar}>
              {notifications.length === 0 ? (
                <p className={`p-4 text-center text-sm ${theme.textMuted}`}>Нет уведомлений</p>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    className={`p-3 border-b cursor-pointer transition-colors ${isDark ? 'border-[#2A2A3A] hover:bg-[#1A1A2A]' : 'border-gray-100 hover:bg-gray-50'} ${!readNotificationIds.includes(n.id) ? (isDark ? 'bg-[#A78BFA]/10' : 'bg-blue-50') : ''}`}
                    onClick={() => {
                      setReadNotificationIds(prev => [...new Set([...prev, n.id])]);

                      if (n.taskId) {
                        const task = submittedTasks.find(t => t.id === n.taskId);
                        if (task) goToReviewTask(task);
                      } else {
                        setActiveTab('services');
                        setServicesTab('diplomniks');
                        setDiplomniksSubTab('applications');
                        setShowNotifications(false);
                      }
                    }}
                  >
                    <p className={`text-sm font-medium flex items-center gap-2 ${theme.text}`}>
                      <span className={`w-2 h-2 rounded-full mr-1 ${
                        n.taskId ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></span>
                      {n.title}
                    </p>
                    <p className={`text-xs mt-1 ${theme.textSecondary}`}>{n.message || n.text}</p>
                    <p className={`text-xs mt-1 ${theme.textMuted}`}>{n.date}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );

  const HomeScreen = () => (
    <div className="space-y-4 fade-in">
      <div className={`${isDark ? 'bg-[#1E1E2A] border-[#2A2A3A]' : 'bg-[#F8FAFC] border-gray-200'} rounded-2xl border p-5`}>
        <h2 className={`font-semibold text-lg flex items-center ${theme.text}`}>
          <NewsIcon isDark={isDark} />
          Добрый день, {profile.full_name?.split(' ').slice(1).join(' ') || 'преподаватель'}!
        </h2>
      </div>

      <div className="flex items-center justify-between">
        <h3 className={`font-semibold text-lg flex items-center ${theme.text}`}>
          <SmallIcon isDark={isDark} />
          Новости
        </h3>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <button onClick={() => setIsDark(!isDark)} className={`p-2 rounded-full transition ${isDark ? 'bg-[#1E1E2A] text-[#A78BFA]' : 'bg-gray-200 text-gray-600'}`}>
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setActiveNewsTab('all')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeNewsTab === 'all' ? (isDark ? 'bg-[#A78BFA] text-white' : 'bg-[#2563EB] text-white') : (isDark ? 'bg-[#1E1E2A] text-gray-400' : 'bg-gray-100 text-gray-500')}`}>Все</button>
        <button onClick={() => setActiveNewsTab('important')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeNewsTab === 'important' ? (isDark ? 'bg-[#A78BFA] text-white' : 'bg-[#2563EB] text-white') : (isDark ? 'bg-[#1E1E2A] text-gray-400' : 'bg-gray-100 text-gray-500')}`}>Важное</button>
      </div>

      <div className="space-y-3">
        {filteredNews.map(item => (
          <div key={item.id} className={`rounded-xl overflow-hidden transition-all hover:scale-[1.01] ${item.important ? (isDark ? 'border-l-4 border-l-[#A78BFA]' : 'border-l-4 border-l-[#2563EB]') : ''} ${theme.card}`}>
            <div className="p-4">
              <h4 className={`font-semibold mb-2 ${theme.text}`}>{item.title}</h4>
              <p className={`text-sm mb-3 ${theme.textSecondary}`}>{item.desc}</p>
              <span className={`text-xs font-medium ${isDark ? 'text-[#A78BFA]' : 'text-[#2563EB]'}`}>{item.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ServicesScreen = () => (
    <div className="space-y-4 fade-in">
      <div className="flex items-center justify-between">
        <h2 className={`font-semibold text-lg flex items-center ${theme.text}`}>
          <ServicesIcon active={true} isDark={isDark} />
          Сервисы
        </h2>
        <button onClick={() => setIsDark(!isDark)} className={`p-2 rounded-full transition ${isDark ? 'bg-[#1E1E2A] text-[#A78BFA]' : 'bg-gray-200 text-gray-600'}`}>
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          ['diplomniks', 'Мои дипломники'],
          ['chats', 'Чаты'],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setServicesTab(id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 flex items-center ${
              servicesTab === id
                ? (isDark ? 'bg-[#A78BFA] text-white' : 'bg-[#2563EB] text-white')
                : (isDark ? 'bg-[#1E1E2A] text-gray-400 border border-[#2A2A3A]' : 'bg-[#F8FAFC] text-gray-500 border border-gray-200')
            }`}
          >
            <SmallIcon isDark={isDark} active={servicesTab === id} type={id === 'chats' ? 'chat' : 'user'} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {servicesTab === 'diplomniks' && (
        <div className="space-y-3">
          <div className="flex gap-2 border-b pb-2" style={{ borderColor: isDark ? '#2A2A3A' : '#E5E7EB' }}>
            <button onClick={() => setDiplomniksSubTab('approved')} className={`px-4 py-2 text-sm font-medium ${diplomniksSubTab === 'approved' ? (isDark ? 'text-white border-b-2 border-[#A78BFA]' : 'text-[#2563EB] border-b-2 border-[#2563EB]') : theme.textMuted}`}>
              Утверждённые ({diplomniks.length})
            </button>
            <button onClick={() => setDiplomniksSubTab('applications')} className={`px-4 py-2 text-sm font-medium ${diplomniksSubTab === 'applications' ? (isDark ? 'text-white border-b-2 border-[#A78BFA]' : 'text-[#2563EB] border-b-2 border-[#2563EB]') : theme.textMuted}`}>
              Заявки ({pendingApplications.length})
            </button>
          </div>

          {diplomniksSubTab === 'approved' && (
            <div className="space-y-3">
              {diplomniks.map(d => {
                const progress = calculateProgress(d.id);
                const studentTasks = getStudentTasks(d.id);
                const currentReview = studentTasks.find(t => t.gradeStatus === 'not_graded');
                return (
                  <div key={d.id} className={`w-full p-4 rounded-xl transition-all hover:scale-[1.01] ${theme.card}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className={`font-medium flex items-center ${theme.text}`}>
                          <SmallIcon isDark={isDark} />
                          {d.studentName}
                        </h4>
                        <p className={`text-xs ${theme.textMuted}`}>{d.group} • {d.course} курс • {d.degree}</p>
                        <p className={`text-xs ${theme.textMuted}`}>Средний балл: {d.gpa}</p>
                      </div>
                      {currentReview && (
                        <button
                          onClick={() => goToReviewTask(currentReview)}
                          className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-yellow-600/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'}`}
                        >
                          На проверке
                        </button>
                      )}
                    </div>

                    {d.topic && <p className={`text-sm mb-3 ${theme.textSecondary}`}>Тема: {d.topic}</p>}

                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        if (currentReview) goToReviewTask(currentReview);
                        else {
                          setActiveTab('check');
                          setExpandedStudent(d.id);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (currentReview) goToReviewTask(currentReview);
                          else { setActiveTab('check'); setExpandedStudent(d.id); }
                        }
                      }}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs ${theme.textMuted}`}>Прогресс ВКР</span>
                        <span className={`text-xs font-medium ${theme.text}`}>{progress}%</span>
                      </div>
                      <div className={`w-full h-2 ${theme.progressBg} rounded-full`}>
                        <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => {
                          if (currentReview) goToReviewTask(currentReview);
                          else { setActiveTab('check'); setExpandedStudent(d.id); }
                        }}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-[#A78BFA]/20 text-[#A78BFA] border border-[#A78BFA]/30' : 'bg-blue-100 text-[#2563EB]'}`}
                      >
                        Подробнее
                      </button>
                      <button
                        onClick={() => startChatWithStudent(d)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center ${isDark ? 'bg-[#A78BFA] text-white' : 'bg-[#2563EB] text-white'}`}
                      >
                        <SmallIcon isDark={isDark} active={true} type="chat" />
                        <span>Чат</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {diplomniksSubTab === 'applications' && (
            <div className="space-y-3">
              {pendingApplications.length === 0 ? (
                <div className={`p-8 text-center rounded-xl ${theme.card}`}>
                  <p className={`text-lg mb-2 ${theme.text}`}>Нет новых заявок</p>
                </div>
              ) : pendingApplications.map(app => (
                <div key={app.id} className={`p-4 rounded-xl ${theme.card} border-l-4 border-l-yellow-500`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className={`font-medium flex items-center ${theme.text}`}>
                        <SmallIcon isDark={isDark} />
                        {app.studentName}
                      </h4>
                      <p className={`text-xs ${theme.textMuted}`}>{app.group} • {app.course} курс • {app.degree}</p>
                      <p className={`text-xs ${theme.textMuted}`}>Средний балл: {app.gpa}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-yellow-600/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'}`}>На рассмотрении</span>
                  </div>
                  {app.topicProposed && <p className={`text-sm mb-3 ${theme.textSecondary}`}>Предложенная тема: {app.proposedTopic}</p>}
                  <p className={`text-xs mb-3 ${theme.textMuted}`}>Подана: {app.date}</p>
                  <div className="flex gap-2">
                    <button onClick={() => handleAccept(app)} className="flex-1 py-2 rounded-lg text-sm font-medium bg-green-500 hover:bg-green-600 text-white">Принять</button>
                    <button onClick={() => handleReject(app)} className="flex-1 py-2 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 text-white">Отклонить</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {servicesTab === 'chats' && <ChatsScreen />}
    </div>
  );

  const ChatsScreen = () => {
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [messageText, setMessageText] = useState('');
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [selectedStudents, setSelectedStudents] = useState([]);

    const selectedChat = chats.find(c => String(c.id) === String(selectedChatId));

    const toggleStudentInGroup = (studentId) => {
      setSelectedStudents(prev =>
        prev.includes(studentId)
          ? prev.filter(id => id !== studentId)
          : [...prev, studentId]
      );
    };

    const createGroupChat = () => {
      const trimmedName = groupName.trim();

      if (!trimmedName) {
        alert('Введите название группового чата');
        return;
      }

      if (selectedStudents.length === 0) {
        alert('Выберите хотя бы одного студента');
        return;
      }

      const members = diplomniks.filter(student => selectedStudents.includes(student.id));

      const newGroupChat = {
        id: `group-${Date.now()}`,
        isGroup: true,
        groupName: trimmedName,
        studentName: trimmedName,
        course: 'Групповой чат',
        members,
        messages: [
          {
            id: Date.now() + 1,
            text: `Групповой чат «${trimmedName}» создан. Участники: ${members.map(item => item.studentName).join(', ')}`,
            sender: 'system',
            senderName: 'Система',
            timestamp: Date.now()
          }
        ]
      };

      setChats(prev => [newGroupChat, ...prev]);
      setSelectedChatId(newGroupChat.id);
      setShowGroupModal(false);
      setGroupName('');
      setSelectedStudents([]);
    };

    if (selectedChat) {
      const isGroupChat = !!selectedChat.isGroup;
      const title = isGroupChat ? selectedChat.groupName : selectedChat.studentName;
      const subtitle = isGroupChat
        ? `${selectedChat.members?.length || 0} участников`
        : `${selectedChat.course} курс`;

      return (
        <div className={`h-[500px] rounded-xl overflow-hidden flex flex-col ${theme.card}`}>
          <div className={`p-4 border-b flex items-center gap-3 ${isDark ? 'border-[#2A2A3A]' : 'border-gray-200'}`}>
            <button
              onClick={() => setSelectedChatId(null)}
              aria-label="Назад"
              className={`p-2 rounded-full transition ${isDark ? 'text-[#A78BFA] hover:bg-[#2A2A3A]' : 'text-[#2563EB] hover:bg-gray-100'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
              </svg>
            </button>

            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${isDark ? 'bg-[#A78BFA]' : 'bg-[#2563EB]'}`}>
              {isGroupChat ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
                </svg>
              ) : title.charAt(0)}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className={`font-medium truncate ${theme.text}`}>{title}</h3>
              <p className={`text-xs ${theme.textMuted}`}>{subtitle}</p>
            </div>
          </div>

          {isGroupChat && selectedChat.members?.length > 0 && (
            <div className={`px-4 py-2 border-b ${isDark ? 'border-[#2A2A3A] bg-[#121218]' : 'border-gray-100 bg-gray-50'}`}>
              <div className="flex gap-2 overflow-x-auto no-scrollbar" style={noScrollbar}>
                {selectedChat.members.map(member => (
                  <span key={member.id} className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${isDark ? 'bg-[#2A2A3A] text-gray-300' : 'bg-white text-gray-600 border border-gray-200'}`}>
                    {member.studentName}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 p-4 space-y-2 overflow-y-auto no-scrollbar" style={noScrollbar}>
            {!selectedChat.messages || selectedChat.messages.length === 0 ? (
              <p className={`text-sm text-center mt-20 ${theme.textMuted}`}>Сообщений пока нет</p>
            ) : selectedChat.messages.map(msg => {
              const isTeacher = msg.sender === 'teacher';
              const isSystem = msg.sender === 'system';

              if (isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center">
                    <div className={`max-w-[90%] px-3 py-2 rounded-full text-xs ${isDark ? 'bg-[#2A2A3A] text-gray-300' : 'bg-gray-100 text-gray-500'}`}>
                      {msg.text}
                    </div>
                  </div>
                );
              }

              return (
                <div key={msg.id} className={`max-w-[78%] p-3 rounded-2xl ${isTeacher ? `ml-auto ${isDark ? 'bg-[#A78BFA]' : 'bg-[#2563EB]'} text-white` : `${isDark ? 'bg-[#2E7D32] text-white' : 'bg-[#E8F5E9] text-gray-800'}`}`}>
                  {isGroupChat && !isTeacher && msg.senderName && (
                    <p className="text-[11px] opacity-75 mb-1">{msg.senderName}</p>
                  )}
                  <p className="text-sm">{msg.text}</p>
                </div>
              );
            })}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendChatMessage(selectedChat.id, messageText);
              setMessageText('');
            }}
            className={`p-4 border-t flex gap-2 ${isDark ? 'border-[#2A2A3A]' : 'border-gray-200'}`}
          >
            <input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={isGroupChat ? 'Напишите сообщение в группу...' : 'Введите сообщение...'}
              className={`flex-1 px-4 py-3 rounded-full focus:outline-none ${theme.input}`}
            />
            <button disabled={!messageText.trim()} className={`px-5 rounded-full text-white ${messageText.trim() ? (isDark ? 'bg-[#A78BFA]' : 'bg-[#2563EB]') : 'bg-gray-400'}`}>➤</button>
          </form>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setShowGroupModal(true)}
          className={`w-full py-3 rounded-xl text-sm font-medium text-white transition-all hover:scale-[1.01] flex items-center justify-center gap-2 ${isDark ? 'bg-[#A78BFA] hover:bg-[#9B7BEA]' : 'bg-[#2563EB] hover:bg-[#1D4ED8]'}`}
        >
          <span className="text-lg leading-none">＋</span>
          Создать групповой чат
        </button>

        {chats.length === 0 ? (
          <div className={`p-8 text-center rounded-xl ${theme.card}`}>
            <SmallIcon isDark={isDark} type="chat" />
            <p className={`text-lg mb-2 ${theme.text}`}>Нет чатов</p>
            <p className={`text-sm ${theme.textSecondary}`}>Вы можете открыть личный чат со студентом или создать групповой чат.</p>
          </div>
        ) : chats.map(c => {
          const isGroupChat = !!c.isGroup;
          const title = isGroupChat ? c.groupName : c.studentName;
          const subtitle = isGroupChat ? `${c.members?.length || 0} участников` : `${c.course} курс`;
          const lastMessage = c.messages?.[c.messages.length - 1]?.text;

          return (
            <button key={c.id} onClick={() => setSelectedChatId(c.id)} className={`w-full p-4 rounded-xl text-left transition-all hover:scale-[1.01] ${theme.card}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${isDark ? 'bg-[#A78BFA]' : 'bg-[#2563EB]'}`}>
                  {isGroupChat ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
                    </svg>
                  ) : title.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${theme.text}`}>{title}</p>
                  <p className={`text-xs ${theme.textMuted}`}>{subtitle}</p>
                  {lastMessage && <p className={`text-xs mt-1 truncate ${theme.textSecondary}`}>{lastMessage}</p>}
                </div>
              </div>
            </button>
          );
        })}

        {showGroupModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowGroupModal(false)}>
            <div className={`rounded-2xl max-w-md w-full p-6 ${theme.card}`} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-bold ${theme.text}`}>Новый групповой чат</h3>
                <button
                  type="button"
                  onClick={() => setShowGroupModal(false)}
                  className={`text-2xl leading-none ${theme.textMuted}`}
                >
                  ×
                </button>
              </div>

              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Название группы"
                className={`w-full p-3 rounded-lg text-sm mb-4 focus:outline-none ${theme.input}`}
                autoFocus
              />

              <p className={`text-sm font-medium mb-2 ${theme.text}`}>Выберите студентов</p>
              <div className="max-h-72 overflow-y-auto no-scrollbar space-y-2 mb-4" style={noScrollbar}>
                {diplomniks.length === 0 ? (
                  <p className={`text-sm text-center py-6 ${theme.textMuted}`}>Нет утверждённых студентов</p>
                ) : diplomniks.map(student => {
                  const checked = selectedStudents.includes(student.id);

                  return (
                    <label
                      key={student.id}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${checked ? (isDark ? 'bg-[#A78BFA]/20 border border-[#A78BFA]/40' : 'bg-blue-50 border border-blue-200') : theme.cardInner}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleStudentInGroup(student.id)}
                        className="w-4 h-4 accent-[#A78BFA]"
                      />
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold ${isDark ? 'bg-[#A78BFA]' : 'bg-[#2563EB]'}`}>
                        {student.studentName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${theme.text}`}>{student.studentName}</p>
                        <p className={`text-xs ${theme.textMuted}`}>{student.group} • {student.course} курс</p>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={createGroupChat}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium text-white ${isDark ? 'bg-[#A78BFA] hover:bg-[#9B7BEA]' : 'bg-[#2563EB] hover:bg-[#1D4ED8]'}`}
                >
                  Создать
                </button>
                <button
                  type="button"
                  onClick={() => setShowGroupModal(false)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium ${theme.card} ${theme.text}`}
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const CheckScreen = () => (
    <div className="space-y-4 fade-in">
      <div className="flex items-center justify-between">
        <h2 className={`font-semibold text-lg flex items-center ${theme.text}`}>
          <CheckIcon active={true} isDark={isDark} />
          Проверка отчётов
        </h2>
        <button onClick={() => setIsDark(!isDark)} className={`p-2 rounded-full transition ${isDark ? 'bg-[#1E1E2A] text-[#A78BFA]' : 'bg-gray-200 text-gray-600'}`}>
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>

      <div className="space-y-3">
        {studentsWithSubmissions.map(s => {
          const cnt = s.submittedTasks.filter(t => t.gradeStatus === 'not_graded').length;
          return (
            <div key={s.id} className={`rounded-xl overflow-hidden ${theme.card}`}>
              <button onClick={() => setExpandedStudent(expandedStudent === s.id ? null : s.id)} className="w-full p-4 text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`font-medium ${theme.text}`}>{s.studentName}</h4>
                    <p className={`text-xs ${theme.textMuted}`}>{s.group} • {s.course} курс • {s.degree}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {cnt > 0 && <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-yellow-600/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'}`}>{cnt} {getTaskWord(cnt)} на проверке</span>}
                    <span className={theme.textMuted}>{expandedStudent === s.id ? '▲' : '▼'}</span>
                  </div>
                </div>
              </button>

              {expandedStudent === s.id && (
                <div className="px-4 pb-4 border-t" style={{ borderColor: isDark ? '#2A2A3A' : '#E5E7EB' }}>
                  <div className="pt-3 space-y-2">
                    {VKR_TASKS.map((name, idx) => {
                      const t = s.submittedTasks.find(x => x.taskIndex === idx);
                      const key = `${s.id}-${idx}`;
                      const expanded = expandedTask === key;
                      const isGraded = t?.gradeStatus === 'graded';
                      const isSubmitted = t && t.gradeStatus !== 'graded';

                      return (
                        <div key={idx} className={`rounded-lg overflow-hidden ${theme.cardInner}`}>
                          <button onClick={() => setExpandedTask(expanded ? null : key)} className="w-full p-3 text-left">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className={`w-3 h-3 rounded-full ${isGraded ? 'bg-green-500' : isSubmitted ? 'bg-yellow-500' : (isDark ? 'bg-gray-600' : 'bg-gray-300')}`} />
                                <span className={`text-sm ${isGraded || isSubmitted ? theme.text : theme.textMuted}`}>{name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {isGraded ? (
                                  <span className={`text-xs px-2 py-1 rounded-full ${getGradeColorClass(t.grade)}`}>Оценка: {t.grade}</span>
                                ) : isSubmitted ? (
                                  <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-yellow-600/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'}`}>На проверке</span>
                                ) : (
                                  <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-gray-600/20 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>Не сдано</span>
                                )}
                                <span className={theme.textMuted}>{expanded ? '▲' : '▼'}</span>
                              </div>
                            </div>
                            {t && <p className={`text-xs mt-1 ${theme.textMuted}`}>Сдано: {t.submittedDate}</p>}
                          </button>

                          {expanded && (
                            <div className="px-3 pb-3 space-y-3 border-t" style={{ borderColor: isDark ? '#2A2A3A' : '#E5E7EB' }}>
                              {t ? (
                                <>
                                  <div className="pt-3">
                                    <p className={`text-xs font-medium ${theme.textMuted}`}>Описание:</p>
                                    <p className={`text-sm mt-1 ${theme.textSecondary}`}>{t.description}</p>
                                  </div>
                                  <div>
                                    <p className={`text-xs font-medium ${theme.textMuted} mb-2`}>Файлы:</p>
                                    {t.files.map((f, i) => (
                                      <div key={i} className={`p-2 rounded-lg flex items-center justify-between ${isDark ? 'bg-[#0A0A0F]' : 'bg-white'}`}>
                                        <div className="flex items-center gap-2">
                                          <SmallIcon isDark={isDark} type="doc" />
                                          <span className={`text-sm ${theme.text}`}>{f.name}</span>
                                        </div>
                                        <button
                          className={`p-1.5 rounded-lg transition ${isDark ? 'text-[#A78BFA] hover:bg-[#1A1A2A]' : 'text-[#2563EB] hover:bg-blue-50'}`}
                          aria-label="Скачать файл"
                          title="Скачать"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M12 2.25a.75.75 0 01.75.75v11.69l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V3a.75.75 0 01.75-.75zm-9 13.5a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
                          </svg>
                        </button>
                                      </div>
                                    ))}
                                  </div>
                                  <div className={`p-3 rounded-lg ${isDark ? 'bg-[#0A0A0F]' : 'bg-white'}`}>
                                    <p className={`text-xs font-medium ${theme.textMuted}`}>Состояние ответа:</p>
                                    <p className={`text-xs ${theme.textSecondary}`}>Номер попытки: {t.attemptNumber} / {t.maxAttempts}</p>
                                    <p className={`text-xs ${theme.textSecondary}`}>Последнее изменение: {t.submittedDate}</p>
                                    <p className={`text-xs ${theme.textSecondary}`}>Оставшееся время: {t.timeRemaining}</p>
                                  </div>

                                  {(t.feedback || (t.comments && t.comments.length > 0)) && (
                                    <div className={`p-3 rounded-lg ${isDark ? 'bg-[#0A0A0F]' : 'bg-white'}`}>
                                      <p className={`text-xs font-medium ${theme.text}`}>Комментарии преподавателя:</p>
                                      {(t.comments?.length ? t.comments : [t.feedback]).map((c, i) => (
                                        <p key={i} className={`text-sm mt-1 whitespace-pre-line ${theme.textSecondary}`}>{c}</p>
                                      ))}
                                      {t.gradedDate && <p className={`text-xs mt-2 ${theme.textMuted}`}>{t.gradedBy || teacherFullName} • {t.gradedDate}</p>}
                                    </div>
                                  )}

                                  <div className="flex gap-2 pt-2">
                                    <button onClick={() => openTaskModal(t)} className={`flex-1 py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-[#A78BFA]/20 text-[#A78BFA] border border-[#A78BFA]/30' : 'bg-blue-100 text-[#2563EB]'}`}>Подробнее</button>
                                    <button onClick={() => openReviewModal(t)} className={`flex-1 py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-green-600/20 text-green-400 border border-green-500/30' : 'bg-green-100 text-green-700'}`}>{t.gradeStatus === 'graded' ? 'Изменить' : 'Оценить'}</button>
                                  </div>
                                </>
                              ) : (
                                <div className="pt-3">
                                  <p className={`text-sm ${theme.textSecondary}`}>{TASK_DESCRIPTIONS[idx]}</p>
                                  <div className={`p-3 mt-3 rounded-lg ${isDark ? 'bg-[#0A0A0F]' : 'bg-white'}`}>
                                    <p className={`text-xs ${theme.textSecondary}`}>Открыто с: {TASK_OPEN_FROM[idx]}</p>
                                    <p className={`text-xs ${theme.textSecondary}`}>Срок сдачи: {TASK_DEADLINE[idx]}</p>
                                    <p className={`text-xs ${theme.textSecondary}`}>Попытки: 0 / {TASK_MAX_ATTEMPTS[idx]}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const ProfileScreen = () => (
    <div className="space-y-4 fade-in">
      <div className="flex items-center justify-between">
        <h2 className={`font-semibold text-lg flex items-center ${theme.text}`}>
          <ProfileIcon active={true} isDark={isDark} />
          Профиль
        </h2>
        <button onClick={() => setIsDark(!isDark)} className={`p-2 rounded-full transition ${isDark ? 'bg-[#1E1E2A] text-[#A78BFA]' : 'bg-gray-200 text-gray-600'}`}>
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
      <div className={`rounded-2xl p-5 transition-all hover:scale-[1.01] ${theme.card}`}>
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDark ? 'text-[#A78BFA]' : 'text-[#2563EB]'}`}>
            <ProfileIcon active={true} isDark={isDark} />
          </div>
          <div>
            <h3 className={`font-semibold text-lg ${theme.text}`}>{profile.full_name}</h3>
            <p className={`text-sm ${theme.textSecondary}`}>{profile.position || 'Преподаватель'}</p>
          </div>
        </div>
      </div>
      <div className={`rounded-2xl p-4 ${theme.card}`}>
        <h4 className={`text-sm font-medium mb-3 ${theme.text}`}>Личные данные</h4>
        <div className="space-y-2">
          <InfoRow label="Кафедра" value={profile.department || 'Кафедра информационных технологий'} />
          <InfoRow label="Научная степень" value={profile.academic_degree || 'Кандидат наук'} />
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Дипломников" value={diplomniks.length} />
        </div>
      </div>
      <button onClick={onLogout} className={`w-full p-4 rounded-2xl font-medium transition-all hover:scale-105 flex items-center justify-center ${isDark ? 'bg-[#A78BFA]/20 text-red-400 border border-[#A78BFA]/30 hover:bg-[#A78BFA]/30' : 'bg-[#2563EB]/10 text-red-600 border border-[#2563EB]/20 hover:bg-[#2563EB]/20'}`}>
        Выйти из аккаунта
      </button>
    </div>
  );

  const InfoRow = ({ label, value }) => (
    <div className="flex items-center justify-between py-1.5 gap-4">
      <span className={`text-sm ${theme.textMuted}`}>{label}</span>
      <span className={`text-sm text-right ${theme.text}`}>{value}</span>
    </div>
  );

  return (
    <div className={`min-h-screen pb-28 sm:pb-24 relative ${theme.bg}`}>
      <style>{scrollbarCSS}</style>

      <div className={`px-4 py-4 sticky top-0 z-30 border-b ${theme.header}`}>
        <div className="max-w-3xl mx-auto">
          <h1 className={`text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r ${isDark ? 'from-[#A78BFA] via-[#C4B5FD] to-[#A78BFA]' : 'from-[#2563EB] via-[#3B82F6] to-[#2563EB]'}`}>
            РТУ МИРЭА • Преподаватель
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 tab-content">
        {activeTab === 'home' && <HomeScreen />}
        {activeTab === 'services' && <ServicesScreen />}
        {activeTab === 'check' && <CheckScreen />}
        {activeTab === 'profile' && <ProfileScreen />}
      </div>

      {rejectDialog.show && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl max-w-md w-full p-6 ${theme.card}`}>
            <h3 className={`text-lg font-bold mb-4 ${theme.text}`}>Причина отказа</h3>
            <p className={`text-sm mb-3 ${theme.textSecondary}`}>{rejectDialog.application?.studentName}</p>

            <label className={`block text-sm mb-2 ${theme.text}`}>Выберите причину</label>
            <select
              value={rejectReasonType}
              onChange={(e) => setRejectReasonType(e.target.value)}
              className={`w-full p-3 rounded-lg text-sm mb-4 ${theme.input}`}
            >
              <option value="">Выберите из списка</option>
              <option value="Нет свободных мест для руководства">Нет свободных мест для руководства</option>
              <option value="Тема не соответствует научным интересам руководителя">Тема не соответствует научным интересам руководителя</option>
            </select>

            <label className={`block text-sm mb-2 ${theme.text}`}>Или напишите свою причину</label>
            <textarea
              value={rejectReasonCustom}
              onChange={e => setRejectReasonCustom(e.target.value)}
              placeholder="Введите причину отказа..."
              className={`w-full p-3 rounded-lg text-sm mb-4 ${theme.input}`}
              rows="3"
            />

            <div className="flex gap-3">
              <button onClick={confirmReject} className="flex-1 py-2 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 text-white">Отклонить</button>
              <button onClick={() => setRejectDialog({ show: false, application: null })} className={`flex-1 py-2 rounded-lg ${theme.card} ${theme.text}`}>Отмена</button>
            </div>
          </div>
        </div>
      )}

      {showTaskModal && selectedTask && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden ${theme.card}`}>
            <div className={`p-4 border-b ${isDark ? 'border-[#2A2A3A]' : 'border-gray-200'} flex justify-between items-center`}>
              <h3 className={`font-semibold text-lg ${theme.text}`}>{selectedTask.taskName}</h3>
              <button onClick={() => setShowTaskModal(false)} className={`text-2xl ${theme.textMuted}`}>✕</button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4 no-scrollbar" style={noScrollbar}>
              <div className={`p-3 rounded-lg ${theme.cardInner}`}>
                <p className={`text-sm ${theme.text}`}><span className={theme.textMuted}>Студент:</span> {selectedTask.studentName}</p>
                <p className={`text-sm ${theme.text}`}><span className={theme.textMuted}>Срок сдачи:</span> {selectedTask.deadline}</p>
                <p className={`text-sm ${theme.text}`}><span className={theme.textMuted}>Попытка:</span> {selectedTask.attemptNumber} / {selectedTask.maxAttempts}</p>
              </div>

              <div>
                <h4 className={`font-medium mb-2 ${theme.text}`}>Файлы:</h4>
                <div className="space-y-2">
                  {(selectedTask.files || []).length ? selectedTask.files.map((f, i) => (
                    <div key={i} className={`p-3 rounded-lg flex items-center justify-between ${theme.cardInner}`}>
                      <div className="flex items-center gap-2">
                        <SmallIcon isDark={isDark} type="doc" />
                        <span className={`text-sm ${theme.text}`}>{f.name}</span>
                      </div>
                      <button className={`p-1.5 rounded-lg ${isDark ? 'text-[#A78BFA] hover:bg-[#2A2A3A]' : 'text-[#2563EB] hover:bg-blue-50'}`} title="Скачать">
                        ⬇️
                      </button>
                    </div>
                  )) : <p className={`text-sm ${theme.textMuted}`}>Файлы не прикреплены</p>}
                </div>
              </div>

              <div className={`p-3 rounded-lg ${theme.cardInner}`}>
                <h4 className={`font-medium mb-2 ${theme.text}`}>{selectedTask.feedback ? 'Редактировать комментарий' : 'Комментарий преподавателя'}</h4>
                <textarea
                  value={newTaskComment}
                  onChange={(e) => setNewTaskComment(e.target.value)}
                  placeholder="Введите комментарий к работе..."
                  className={`w-full p-3 rounded-lg text-sm resize-none ${theme.input}`}
                  rows="3"
                />
                <button
                  onClick={addTaskComment}
                  disabled={!newTaskComment.trim()}
                  className={`w-full mt-3 py-2 rounded-lg text-sm font-medium text-white ${newTaskComment.trim() ? (isDark ? 'bg-[#A78BFA]' : 'bg-[#2563EB]') : 'bg-gray-500 cursor-not-allowed'}`}
                >
                  {selectedTask.feedback ? 'Сохранить изменения' : 'Отправить комментарий'}
                </button>
              </div>
            </div>
            <div className={`p-4 border-t ${isDark ? 'border-[#2A2A3A]' : 'border-gray-200'} flex gap-3`}>
              <button onClick={() => { setShowTaskModal(false); openReviewModal(selectedTask); }} className={`flex-1 py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-[#A78BFA]/20 text-[#A78BFA] border border-[#A78BFA]/30' : 'bg-blue-100 text-[#2563EB]'}`}>
                {selectedTask.gradeStatus === 'graded' ? 'Изменить оценку' : 'Оценить'}
              </button>
              <button onClick={() => setShowTaskModal(false)} className={`flex-1 py-2 rounded-lg ${theme.card} ${theme.text}`}>Закрыть</button>
            </div>
          </div>
        </div>
      )}

      {showReviewModal && selectedTask && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl max-w-md w-full p-6 ${theme.card}`}>
            <h3 className={`text-lg font-bold mb-4 ${theme.text}`}>Оценить работу</h3>
            <p className={`text-sm mb-2 ${theme.textSecondary}`}>Студент: {selectedTask.studentName}</p>
            <p className={`text-sm mb-4 ${theme.textSecondary}`}>Задание: {selectedTask.taskName}</p>

            <label className={`block text-sm mb-2 ${theme.text}`}>Оценка</label>
            <select value={reviewGrade} onChange={(e) => setReviewGrade(e.target.value)} className={`w-full p-3 rounded-lg text-sm mb-4 ${theme.input}`}>
              <option value="">Выберите оценку</option>
              <option value="5">5 — Отлично</option>
              <option value="4">4 — Хорошо</option>
              <option value="3">3 — Удовлетворительно</option>
              <option value="2">2 — На доработку</option>
            </select>

            <label className={`block text-sm mb-2 ${theme.text}`}>Комментарий</label>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Комментарий к оценке..."
              className={`w-full p-3 rounded-lg text-sm mb-4 resize-none ${theme.input}`}
              rows="3"
            />

            <div className="flex gap-3">
              <button onClick={submitReview} disabled={!reviewGrade} className={`flex-1 py-2 rounded-lg text-sm font-medium text-white ${reviewGrade ? (isDark ? 'bg-[#A78BFA]' : 'bg-[#2563EB]') : 'bg-gray-500 cursor-not-allowed'}`}>Сохранить</button>
              <button onClick={() => setShowReviewModal(false)} className={`flex-1 py-2 rounded-lg ${theme.card} ${theme.text}`}>Отмена</button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 h-28 sm:h-32 z-30 pointer-events-none"
        style={{
          background: isDark
            ? 'linear-gradient(to top, rgba(18,18,24,0.95) 0%, rgba(18,18,24,0.85) 15%, rgba(18,18,24,0.5) 40%, rgba(18,18,24,0.1) 70%, rgba(18,18,24,0) 100%)'
            : 'linear-gradient(to top, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 15%, rgba(255,255,255,0.5) 40%, rgba(255,255,255,0.1) 70%, rgba(255,255,255,0) 100%)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)'
        }}
      />

      <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-3 sm:pb-4 pt-2">
        <div className={`rounded-full px-1.5 sm:px-2 py-1.5 sm:py-2 shadow-2xl ${theme.bottomBar}`}>
          <div className="flex items-center gap-0.5 sm:gap-1">
            {['home', 'services', 'check', 'profile'].map(id => {
              const icons = { home: HomeIcon, services: ServicesIcon, check: CheckIcon, profile: ProfileIcon };
              const labels = { home: 'Главная', services: 'Сервисы', check: 'Проверка', profile: 'Профиль' };
              const Icon = icons[id];
              return (
                <button key={id} onClick={() => setActiveTab(id)} className="relative px-3 sm:px-5 py-1.5 sm:py-2 rounded-full transition-all flex flex-col items-center">
                  <Icon active={activeTab === id} isDark={isDark} />
                  <span className={`text-[10px] sm:text-xs font-medium mt-0.5 ${activeTab === id ? (isDark ? 'text-[#A78BFA]' : 'text-[#2563EB]') : (isDark ? 'text-gray-400' : 'text-gray-500')}`}>
                    {labels[id]}
                  </span>
                  {activeTab === id && <span className={`absolute bottom-[-4px] w-1 h-1 rounded-full ${isDark ? 'bg-[#A78BFA]' : 'bg-[#2563EB]'}`} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherCabinet;