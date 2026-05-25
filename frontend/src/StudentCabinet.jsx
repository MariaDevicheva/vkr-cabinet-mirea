import { useState, useEffect, useRef } from 'react';
import { 
  getSystemData,
  getStudentApplications,
  getStudentApprovedTeacher,
  submitApplication,
  cancelApplication as cancelApplicationAPI,
  getPersonalChatMessages,
  sendPersonalMessage,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationsCount,
  addNotification,
  getStudentTasks,
  submitTask,
  initDemoData,
  getFullTeachersList,
  getTeachersOnlineStatus,
  getStudentGroups
} from './utils/systemStorage';

// ==================== УТИЛИТЫ ====================
const detectGender = (fullName) => {
  if (!fullName) return 'Не указан';
  const lastName = fullName.split(' ')[0].trim();
  if (lastName.endsWith('а') || lastName.endsWith('я') || 
      lastName.endsWith('ова') || lastName.endsWith('ева') || 
      lastName.endsWith('ина')) return 'Женский';
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

// ==================== ИКОНКИ ====================

// Навигация
const HomeIcon = ({ active, isDark }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 transition-all duration-200 hover:scale-110 ${active ? (isDark ? 'text-[#A78BFA]' : 'text-[#2563EB]') : (isDark ? 'text-gray-400' : 'text-gray-500')}`}>
    <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.69-8.69a2.25 2.25 0 00-3.18 0l-8.69 8.69a.75.75 0 001.06 1.06l8.69-8.69z" />
    <path d="M12 5.432l8.159 8.159a2.25 2.25 0 01.659 1.591v5.568a.75.75 0 01-.75.75h-5.25a.75.75 0 01-.75-.75v-4.5c0-.414-.336-.75-.75-.75h-3c-.414 0-.75.336-.75.75v4.5a.75.75 0 01-.75.75H3.75a.75.75 0 01-.75-.75v-5.568a2.25 2.25 0 01.659-1.591L12 5.432z" />
  </svg>
);

const CourseIcon = ({ active, isDark }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 transition-all duration-200 hover:scale-110 ${active ? (isDark ? 'text-[#A78BFA]' : 'text-[#2563EB]') : (isDark ? 'text-gray-400' : 'text-gray-500')}`}>
    <path d="M12 3L1 9l11 6 11-6-11-6z" />
    <path d="M1 15l11 6 11-6" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);

const ServicesIcon = ({ active, isDark }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 transition-all duration-200 hover:scale-110 ${active ? (isDark ? 'text-[#A78BFA]' : 'text-[#2563EB]') : (isDark ? 'text-gray-400' : 'text-gray-500')}`}>
    <path fillRule="evenodd" d="M6 3a3 3 0 00-3 3v12a3 3 0 003 3h12a3 3 0 003-3V6a3 3 0 00-3-3H6zm1.5 1.5h9A1.5 1.5 0 0118 6v12a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 015.5 18V6A1.5 1.5 0 017 4.5zm2 3a.75.75 0 000 1.5h6a.75.75 0 000-1.5H9zm0 3a.75.75 0 000 1.5h6a.75.75 0 000-1.5H9zm0 3a.75.75 0 000 1.5h4a.75.75 0 000-1.5H9z" clipRule="evenodd" />
  </svg>
);

const ProfileIcon = ({ active, isDark }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-6 h-6 transition-all duration-200 hover:scale-110 ${active ? (isDark ? 'text-[#A78BFA]' : 'text-[#2563EB]') : (isDark ? 'text-gray-400' : 'text-gray-500')}`}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

// Тема
const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 hover:scale-110 transition-transform">
    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 hover:scale-110 transition-transform">
    <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
  </svg>
);

// Функциональные иконки
const MegaphoneIcon = ({ isDark, active }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 mr-2 ${active ? 'text-white' : (isDark ? 'text-[#A78BFA]' : 'text-[#2563EB]')}`}>
    <path d="M16.881 4.345A23.112 23.112 0 018.25 6H7.5a5.25 5.25 0 00-.88 10.427 21.593 21.593 0 001.378 3.94c.464 1.004 1.674 1.32 2.582.796l.657-.379c.88-.508 1.165-1.593.772-2.468a17.116 17.116 0 01-.628-1.607c1.918.258 3.76.75 5.5 1.402A19.52 19.52 0 0021 18.75V5.25a19.52 19.52 0 00-4.119-.905z" />
  </svg>
);

const ChartIcon = ({ isDark, active }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 mr-2 ${active ? 'text-white' : (isDark ? 'text-[#A78BFA]' : 'text-[#2563EB]')}`}>
    <path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 018.25-8.25.75.75 0 01.75.75v6.75H18a.75.75 0 01.75.75 8.25 8.25 0 01-16.5 0z" clipRule="evenodd" />
    <path fillRule="evenodd" d="M12.75 3a.75.75 0 01.75-.75 8.25 8.25 0 018.25 8.25.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75V3z" clipRule="evenodd" />
  </svg>
);

const FolderIcon = ({ isDark, active }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 mr-2 ${active ? 'text-white' : (isDark ? 'text-[#A78BFA]' : 'text-[#2563EB]')}`}>
    <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-15a3 3 0 00-3 3V18a3 3 0 003 3h15zM1.5 10.146V6a3 3 0 013-3h5.379a2.25 2.25 0 011.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 013 3v1.146A4.483 4.483 0 0019.5 9h-15a4.483 4.483 0 00-3 1.146z" />
  </svg>
);

const TeacherIcon = ({ isDark, active }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 mr-2 ${active ? 'text-white' : (isDark ? 'text-[#A78BFA]' : 'text-[#2563EB]')}`}>
    <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z" clipRule="evenodd" />
  </svg>
);

const ChatIcon = ({ isDark, active }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 mr-2 ${active ? 'text-white' : (isDark ? 'text-[#A78BFA]' : 'text-[#2563EB]')}`}>
    <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97z" clipRule="evenodd" />
  </svg>
);

const ForumIcon = ({ isDark, active }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 mr-2 ${active ? 'text-white' : (isDark ? 'text-[#A78BFA]' : 'text-[#2563EB]')}`}>
    <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clipRule="evenodd" />
  </svg>
);

const VideoIcon = ({ isDark, active }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 mr-2 ${active ? 'text-white' : (isDark ? 'text-[#A78BFA]' : 'text-[#2563EB]')}`}>
    <path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h8.25a3 3 0 003-3v-9a3 3 0 00-3-3H4.5zM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06z" />
  </svg>
);

const DocumentIcon = ({ isDark }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 mr-2 ${isDark ? 'text-[#A78BFA]' : 'text-[#2563EB]'}`}>
    <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625z" />
    <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
  </svg>
);

const DownloadIcon = ({ isDark }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 ${isDark ? 'text-[#A78BFA]' : 'text-[#2563EB]'}`}>
    <path fillRule="evenodd" d="M12 2.25a.75.75 0 01.75.75v11.69l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V3a.75.75 0 01.75-.75zm-9 13.5a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
  </svg>
);

const CalendarIcon = ({ isDark }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 mr-2 ${isDark ? 'text-[#A78BFA]' : 'text-[#2563EB]'}`}>
    <path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8.25 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM10.5 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 13.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
    <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
  </svg>
);

const NewsIcon = ({ isDark }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 mr-2 ${isDark ? 'text-[#A78BFA]' : 'text-[#2563EB]'}`}>
    <path fillRule="evenodd" d="M4.125 3C3.089 3 2.25 3.84 2.25 4.875V18a3 3 0 003 3h15a3 3 0 01-3-3V4.875C17.25 3.839 16.41 3 15.375 3H4.125zM12 9.75a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H12zm-.75-2.25a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5H12a.75.75 0 01-.75-.75zM6 12.75a.75.75 0 000 1.5h7.5a.75.75 0 000-1.5H6zm-.75 3.75a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5H6a.75.75 0 01-.75-.75zM6 6.75a.75.75 0 00-.75.75v3c0 .414.336.75.75.75h3a.75.75 0 00.75-.75v-3A.75.75 0 009 6.75H6z" clipRule="evenodd" />
    <path d="M18.75 6.75h1.875c.621 0 1.125.504 1.125 1.125V18a1.5 1.5 0 01-3 0V6.75z" />
  </svg>
);

const ClockIcon = ({ isDark }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 mr-1 ${isDark ? 'text-[#A78BFA]' : 'text-[#2563EB]'}`}>
    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
  </svg>
);

const ListIcon = ({ isDark }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 mr-2 ${isDark ? 'text-[#A78BFA]' : 'text-[#2563EB]'}`}>
    <path fillRule="evenodd" d="M2.625 6.75a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0A.75.75 0 018.25 6h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75zM2.625 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zM7.5 12a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12A.75.75 0 017.5 12zm-4.875 5.25a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75z" clipRule="evenodd" />
  </svg>
);

const EditIcon = ({ isDark }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 mr-1 ${isDark ? 'text-[#A78BFA]' : 'text-[#2563EB]'}`}>
    <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
  </svg>
);

const DeleteIcon = ({ isDark }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 ${isDark ? 'text-[#A78BFA]' : 'text-[#2563EB]'}`}>
    <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zM6.12 6.164l.935 12.156A1.5 1.5 0 008.584 19.5h6.832a1.5 1.5 0 001.529-1.18l.935-12.156a49.548 49.548 0 00-11.76 0z" clipRule="evenodd" />
  </svg>
);

const SendIcon = ({ isDark }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
    <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
  </svg>
);

const ChevronDownIcon = ({ isDark }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 transition-transform ${isDark ? 'text-[#A78BFA]' : 'text-[#2563EB]'}`}>
    <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z" clipRule="evenodd" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-green-500 mr-2">
    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
  </svg>
);

const CircleIcon = ({ isDark }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 mr-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25z" clipRule="evenodd" />
  </svg>
);

const VKRIcon = ({ isDark }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-12 h-12 mb-2 ${isDark ? 'text-[#A78BFA]' : 'text-[#2563EB]'}`}>
    <path d="M12 3L1 9l11 6 11-6-11-6z" />
    <path d="M1 15l11 6 11-6" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M7 11.5l5 3 5-3" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);

const GroupIcon = ({ isDark }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 mr-2 ${isDark ? 'text-[#A78BFA]' : 'text-[#2563EB]'}`}>
    <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
  </svg>
);

// ==================== ДАННЫЕ ====================

const NEWS = [
  { id: 1, title: 'Запись на ВКР открыта!', desc: 'Период: 15 марта - 30 марта 2026', date: '15 мар. 2026 г.', important: true, tags: ['ВКР'] },
  { id: 2, title: 'Организационное собрание', desc: '10 апреля, 15:00 • Аудитория 342', date: '5 апр. 2026 г.', important: true, tags: ['ВКР'] },
  { id: 3, title: 'График защит утверждён', desc: 'Защита ВКР с 1 по 20 июня', date: '10 апр. 2026 г.', important: false, tags: ['Защита ВКР'] },
];

const COURSE_ANNOUNCEMENTS = [
  { id: 1, title: 'Запись на ВКР открыта!', desc: 'Период: 15 марта - 30 марта 2026', date: '15 мар. 2026 г.' },
  { id: 2, title: 'Организационное собрание', desc: '10 апреля, 15:00 • Аудитория 342', date: '5 апр. 2026 г.' },
];

const DEADLINES = [
  { id: 1, title: 'Сдача Введения и обзора литературы', date: '15 мая 2026 г.', deadline: '15.05.2026', urgent: true },
  { id: 2, title: 'Сдача Главы 1. Теоретическая часть', date: '30 мая 2026 г.', deadline: '30.05.2026', urgent: true },
  { id: 3, title: 'Сдача Главы 2. Практическая часть', date: '10 июня 2026 г.', deadline: '10.06.2026', urgent: false },
  { id: 4, title: 'Сдача итоговой версии ВКР', date: '20 июня 2026 г.', deadline: '20.06.2026', urgent: false },
];

const DOCUMENTS = [
  { id: 1, name: 'Заявление на закрепление темы ВКР', type: 'Word' },
  { id: 2, name: 'Титульный лист ВКР', type: 'Word' },
  { id: 3, name: 'Задание на ВКР', type: 'Word' },
  { id: 4, name: 'Отзыв руководителя', type: 'Word' },
  { id: 5, name: 'Рецензия на ВКР', type: 'Word' },
  { id: 6, name: 'Справка о проверке на антиплагиат', type: 'Word' },
];

const FORUM_QUESTIONS = [
  { id: 1, question: 'Кто-нибудь знает требования к оформлению списка литературы?', author: 'Петров П.П.', time: '09:20', date: '15 апреля 2026', answers: [
    { id: 11, text: 'ГОСТ Р 7.0.5-2008, в методичке есть примеры', author: 'Иванов И.И.', time: '09:35', date: '15 апреля 2026' },
  ]},
  { id: 2, question: 'Какой процент оригинальности требуется?', author: 'Сидорова А.С.', time: '11:10', date: '16 апреля 2026', answers: [
    { id: 21, text: 'От 70% для бакалавров, от 80% для магистров', author: 'Козлов Д.А.', time: '11:25', date: '16 апреля 2026' },
  ]},
];

const VIDEOCONFERENCES = [
  { id: 1, title: 'Групповая консультация по оформлению', date: '20 мая 2026, 18:00', link: null, activeSoon: true },
  { id: 2, title: 'Индивидуальная консультация', date: '25 мая 2026, 15:00', link: 'https://mts-link.ru/...', activeSoon: false },
];

const VKR_TASKS = [
  { id: 1, name: 'Утверждение темы ВКР', deadline: '20.04.2026', openFrom: '15.03.2026', description: 'Необходимо согласовать с научным руководителем тему выпускной квалификационной работы.', status: 'pending', grade: null, feedback: null, feedbackDate: null, teacher: null, files: [], submittedDate: null, attempts: 0, maxAttempts: 1 },
  { id: 2, name: 'Заявление на ВКР', deadline: '25.04.2026', openFrom: '15.03.2026', description: 'Заполните и загрузите подписанное заявление на закрепление темы ВКР.', status: 'pending', grade: null, feedback: null, feedbackDate: null, teacher: null, files: [], submittedDate: null, attempts: 0, maxAttempts: 1 },
  { id: 3, name: 'Введение и обзор литературы', deadline: '15.05.2026', openFrom: '01.04.2026', description: 'Подготовьте введение к ВКР и обзор литературы. Не менее 15 источников.', status: 'pending', grade: null, feedback: null, feedbackDate: null, teacher: null, files: [], submittedDate: null, attempts: 0, maxAttempts: 3 },
  { id: 4, name: 'Глава 1. Теоретическая часть', deadline: '30.05.2026', openFrom: '16.05.2026', description: 'Разработайте теоретическую часть ВКР.', status: 'pending', grade: null, feedback: null, feedbackDate: null, teacher: null, files: [], submittedDate: null, attempts: 0, maxAttempts: 3 },
  { id: 5, name: 'Глава 2. Практическая часть', deadline: '10.06.2026', openFrom: '31.05.2026', description: 'Разработайте практическую часть ВКР.', status: 'blocked', grade: null, feedback: null, feedbackDate: null, teacher: null, files: [], submittedDate: null, attempts: 0, maxAttempts: 3 },
  { id: 6, name: 'Итоговая версия', deadline: '20.06.2026', openFrom: '11.06.2026', description: 'Загрузите итоговую версию ВКР.', status: 'blocked', grade: null, feedback: null, feedbackDate: null, teacher: null, files: [], submittedDate: null, attempts: 0, maxAttempts: 1 },
];
const TEACHER_INFO = {
  'Аждер Татьяна Борисовна': {
    title: 'Доцент',
    institute: 'Институт технологий управления',
    department: 'Кафедра информационных технологий в государственном управлении',
    interests: 'Математические методы моделирования информационных систем'
  },
  'Бакланов Павел Анатольевич': {
    title: 'Доцент',
    institute: 'Институт технологий управления',
    department: 'Кафедра информационных технологий в государственном управлении',
    interests: 'Информационные системы, цифровизация управления и анализ требований'
  },
  'Бурлаков Вячеслав Викторович': {
    title: 'Профессор',
    institute: 'Институт технологий управления',
    department: 'Кафедра информационных технологий в государственном управлении',
    interests: 'Современный стратегический анализ, теория систем и системный анализ'
  },
  'Вартанян Аревшад Апетович': {
    title: 'Профессор',
    institute: 'Институт технологий управления',
    department: 'Кафедра информационных технологий в государственном управлении',
    interests: 'Архитектура предприятия'
  },
  'Гостева Мария Александровна': {
    title: 'Доцент',
    institute: 'Институт технологий управления',
    department: 'Кафедра информационных технологий в государственном управлении',
    interests: 'Экономика'
  },
  'Елагина Ольга Александровна': {
    title: 'Доцент',
    institute: 'Институт технологий управления',
    department: 'Кафедра информационных технологий в государственном управлении',
    interests: 'Моделирование бизнес-процессов'
  },
  'Емельянова Ольга Владимировна': {
    title: 'Доцент',
    institute: 'Институт технологий управления',
    department: 'Кафедра информационных технологий в государственном управлении',
    interests: 'Управление информационными проектами'
  },
  'Земцов Алексей Дмитриевич': {
    title: 'Доцент',
    institute: 'Институт технологий управления',
    department: 'Кафедра информационных технологий в государственном управлении',
    interests: 'Системы поддержки принятия решений'
  },
  'Корецкий Владимир Павлович': {
    title: 'Доцент',
    institute: 'Институт технологий управления',
    department: 'Кафедра информационных технологий в государственном управлении',
    interests: 'Информационная безопасность'
  },
  'Кудрявцева Ирина Генадьевна': {
    title: 'Доцент',
    institute: 'Институт технологий управления',
    department: 'Кафедра информационных технологий в государственном управлении',
    interests: 'Основы бизнес-анализа, развитие информационного общества'
  },
  'Лукашевич Eвгения Вадимовна': {
    title: 'Доцент',
    institute: 'Институт технологий управления',
    department: 'Кафедра информационных технологий в государственном управлении',
    interests: 'Финансово-экономическая корпоративная безопасность'
  },
  'Марухленко Анатолий Леонидович': {
    title: 'Доцент',
    institute: 'Институт технологий управления',
    department: 'Кафедра информационных технологий в государственном управлении',
    interests: 'Имитационное моделирование'
  },
  'Новикова Ольга Александровна': {
    title: 'Доцент',
    institute: 'Институт технологий управления',
    department: 'Кафедра информационных технологий в государственном управлении',
    interests: 'Анализ данных'
  },
  'Паршин Игорь Олегович': {
    title: 'Доцент',
    institute: 'Институт технологий управления',
    department: 'Кафедра информационных технологий в государственном управлении',
    interests: 'Системы поддержки принятия решений'
  },
  'Перминова Ольга Михайловна': {
    title: 'Доцент',
    institute: 'Институт технологий управления',
    department: 'Кафедра информационных технологий в государственном управлении',
    interests: 'Стандартизация, сертификация и управление качеством ПО'
  },
  'Перцева Ольга Вадимовна': {
    title: 'Доцент',
    institute: 'Институт технологий управления',
    department: 'Кафедра информационных технологий в государственном управлении',
    interests: 'Цифровые сервисы, управление ИТ-проектами и информационные технологии'
  },
  'Проворова Ирина Павловна': {
    title: 'Доцент',
    institute: 'Институт технологий управления',
    department: 'Кафедра информационных технологий в государственном управлении',
    interests: 'Информационные системы и технологии'
  },
  'Раменская Aлина Владимировна': {
    title: 'Доцент',
    institute: 'Институт технологий управления',
    department: 'Кафедра информационных технологий в государственном управлении',
    interests: 'Имитационное моделирование'
  },
  'Семенычева Ирина Флюровна': {
    title: 'Доцент',
    institute: 'Институт технологий управления',
    department: 'Кафедра информационных технологий в государственном управлении',
    interests: 'Развитие информационного общества'
  },
  'Сиганьков Aлексей Александрович': {
    title: 'Доцент',
    institute: 'Институт технологий управления',
    department: 'Кафедра информационных технологий в государственном управлении',
    interests: 'Моделирование бизнес-процессов'
  },
  'Сороко Андрей Викторович': {
    title: 'Заведующий кафедрой',
    institute: 'Институт технологий управления',
    department: 'Кафедра информационных технологий в государственном управлении',
    interests: 'Государственное управление, цифровая трансформация и ИТ-стратегия'
  },
  'Стариковская Надежда Анатольевна': {
    title: 'Доцент',
    institute: 'Институт технологий управления',
    department: 'Кафедра информационных технологий в государственном управлении',
    interests: 'Электронный бизнес'
  },
  'Стебунова Ольга Ивановна': {
    title: 'Доцент',
    institute: 'Институт технологий управления',
    department: 'Кафедра информационных технологий в государственном управлении',
    interests: 'Анализ данных, имитационное моделирование'
  },
  'Тюрин Андрей Геннадьевич': {
    title: 'Доцент',
    institute: 'Институт технологий управления',
    department: 'Кафедра информационных технологий в государственном управлении',
    interests: 'Информационное моделирование, проектирование ИС и автоматизация процессов'
  }
};

const getTeacherInfo = (fullName) => {
  return TEACHER_INFO[fullName?.trim()] || {
    title: 'Преподаватель',
    institute: 'Институт технологий управления',
    department: 'Кафедра информационных технологий в государственном управлении',
    interests: 'Информационные системы, цифровые технологии и управление проектами'
  };
};
const normalizeText = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/a/g, 'а')
    .replace(/e/g, 'е')
    .trim();


const TASK_OPEN_TEXT = {
  1: 'среда, 29 апреля 2026, 11:30',
  2: 'среда, 29 апреля 2026, 11:30',
  3: 'среда, 1 апреля 2026, 09:00',
  4: 'суббота, 16 мая 2026, 09:00',
  5: 'воскресенье, 31 мая 2026, 09:00',
  6: 'четверг, 11 июня 2026, 09:00',
};

const TASK_DEADLINE_TEXT = {
  1: 'понедельник, 20 апреля 2026, 23:59',
  2: 'суббота, 25 апреля 2026, 23:59',
  3: 'пятница, 15 мая 2026, 23:59',
  4: 'суббота, 30 мая 2026, 23:59',
  5: 'среда, 10 июня 2026, 23:59',
  6: 'суббота, 20 июня 2026, 23:59',
};

const getTaskOpenText = (task) => TASK_OPEN_TEXT[task.id] || task.openFrom || 'Дата открытия не указана';
const getTaskDeadlineText = (task) => TASK_DEADLINE_TEXT[task.id] || task.deadline || 'Срок сдачи не указан';

const getTaskHasAnswer = (task, hasApprovedTeacher) => {
  if (!hasApprovedTeacher) return false;
  return !!(task?.submittedDate || task?.answerText || (task?.files && task.files.length > 0));
};

const getTaskSubmissionStatusText = (task, hasApprovedTeacher) => {
  if (!hasApprovedTeacher) return 'Недоступно до закрепления руководителя';
  if (task.status === 'completed') return 'Принято преподавателем';
  if (getTaskHasAnswer(task, hasApprovedTeacher)) return 'Отправлено для оценивания';
  if (task.status === 'blocked') return 'Задание пока заблокировано';
  return 'Ответ не отправлен';
};

const getTaskGradingStatusText = (task, hasApprovedTeacher) => {
  if (!hasApprovedTeacher) return 'Недоступно';
  if (task.grade) return 'Оценено';
  if (getTaskHasAnswer(task, hasApprovedTeacher)) return 'Не оценено';
  return 'Ожидает отправки';
};

const getTaskLastChangeText = (task, hasApprovedTeacher) => {
  if (!hasApprovedTeacher) return 'Изменений нет: руководитель ещё не закреплён';
  return task.submittedDate || 'Изменений пока нет';
};

const getTaskRemainingText = (task, hasApprovedTeacher) => {
  if (!hasApprovedTeacher) return 'Отправка ответа будет доступна после закрепления руководителя';
  if (task.status === 'blocked') return 'Задание откроется позже';
  if (getTaskHasAnswer(task, hasApprovedTeacher)) {
    return 'Ответ отправлен. При необходимости можно отредактировать его до проверки преподавателем.';
  }
  return `Срок сдачи: ${getTaskDeadlineText(task)}`;
};

// ==================== КАТАЛОГ ПРЕПОДАВАТЕЛЕЙ ====================
// Вынесен наружу из StudentCabinet, чтобы строка поиска не теряла фокус
// и не моргала после ввода каждой буквы.
const TeacherCatalog = ({
  allTeachers,
  applications,
  hasApprovedTeacher,
  selectedFilter,
  setSelectedFilter,
  setSelectedTeacher,
  setShowConfirmModal,
  isDark,
  theme,
  noScrollbar,
}) => {
  const [teacherSearch, setTeacherSearch] = useState('');

  const query = normalizeText(teacherSearch);

  const filteredTeachers = allTeachers.filter((teacher) => {
    const info = getTeacherInfo(teacher.fullName);

    const teacherText = normalizeText(`
      ${teacher.fullName}
      ${info.title}
      ${info.institute}
      ${info.department}
      ${info.interests}
    `);

    const freeSlots = teacher.maxSlots - teacher.occupied;

    const matchesSearch = !query || teacherText.includes(query);
    const matchesFilter =
      selectedFilter === 'all' ||
      (selectedFilter === 'free' && freeSlots > 0);

    return matchesSearch && matchesFilter;
  });

  return (
    <>
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar" style={noScrollbar}>
        {['all', 'free'].map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setSelectedFilter(filter)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all hover:scale-105 ${
              selectedFilter === filter ? theme.filterActive : theme.filterInactive
            }`}
          >
            {filter === 'all' ? 'Все преподаватели' : 'Есть места'}
          </button>
        ))}
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Поиск преподавателя по ФИО или научным интересам..."
          value={teacherSearch}
          onChange={(e) => setTeacherSearch(e.target.value)}
          autoComplete="off"
          className={`w-full px-4 py-2.5 rounded-xl ${theme.input} focus:outline-none`}
        />
      </div>

      <div className="space-y-3">
        {filteredTeachers.length === 0 ? (
          <div className={`rounded-xl p-4 text-center ${theme.card}`}>
            <p className={`text-sm ${theme.textSecondary}`}>
              Преподаватели не найдены. Попробуйте изменить запрос.
            </p>
          </div>
        ) : (
          filteredTeachers.map((teacher) => {
            const info = getTeacherInfo(teacher.fullName);
            const freeSlots = teacher.maxSlots - teacher.occupied;
            const isFull = freeSlots <= 0;

            const hasApplication = applications.some(
              (app) =>
                app.teacherId === teacher.id &&
                (app.status === 'pending' || app.status === 'approved')
            );

            const isDisabled = isFull || hasApplication || hasApprovedTeacher;

            const buttonText = hasApprovedTeacher
              ? 'Руководитель уже выбран'
              : hasApplication
              ? 'Заявка уже подана'
              : isFull
              ? 'Нет мест'
              : 'Подать заявку';

            const buttonStyle = isDisabled
              ? isDark
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : isDark
              ? 'bg-[#A78BFA] text-white hover:bg-[#9B7BEA]'
              : 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]';

            return (
              <div
                key={teacher.id}
                className={`rounded-xl p-4 transition-all hover:scale-[1.01] hover:shadow-md ${theme.card}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3 flex-1 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold ${
                        isDark ? 'bg-[#A78BFA]' : 'bg-[#2563EB]'
                      }`}
                    >
                      {teacher.fullName.split(' ')[0].charAt(0)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium flex items-center ${theme.text}`}>
                        <TeacherIcon isDark={isDark} />
                        {teacher.fullName}
                      </h4>

                      <p className={`text-xs mt-1 ${theme.textMuted}`}>
                        {info.title} • {info.institute}
                      </p>

                      <div
                        className={`mt-2 px-3 py-2 rounded-xl border text-xs leading-relaxed ${
                          isDark
                            ? 'border-green-500/70 text-green-300 bg-green-500/10'
                            : 'border-[#2563EB] text-[#2563EB] bg-blue-50'
                        }`}
                      >
                        <span className="font-medium">Научные интересы: </span>
                        {info.interests}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-xs px-2 py-1 rounded-full flex-shrink-0 flex items-center gap-1 ${
                      isFull
                        ? 'bg-red-500/20 text-red-400'
                        : freeSlots === 1
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}
                  >
                    {freeSlots}/{teacher.maxSlots}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedTeacher(teacher);
                    setShowConfirmModal(true);
                  }}
                  disabled={isDisabled}
                  className={`w-full mt-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 ${buttonStyle}`}
                >
                  {buttonText}
                </button>
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

// ==================== ОСНОВНОЙ КОМПОНЕНТ ====================
function StudentCabinet({ user, profile, onLogout }) {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('activeTab') || 'home');
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });
  const [activeNewsTab, setActiveNewsTab] = useState('all');
  const [courseTab, setCourseTab] = useState('announcements');
  const [servicesTab, setServicesTab] = useState('teachers');
  const [teacherViewTab, setTeacherViewTab] = useState('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [allTeachers, setAllTeachers] = useState([]);
  const [teachersOnlineStatus, setTeachersOnlineStatus] = useState({});
  
  // Новые стейты для работы с системой хранения
  const [applications, setApplications] = useState([]);
  const [approvedApplication, setApprovedApplication] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const [chatTab, setChatTab] = useState('personal');
  const [personalChatMessages, setPersonalChatMessages] = useState([]);
  const [studentGroups, setStudentGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMessageText, setGroupMessageText] = useState('');
  
  const [forumQuestions, setForumQuestions] = useState(FORUM_QUESTIONS);
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [newAnswer, setNewAnswer] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [showNewQuestion, setShowNewQuestion] = useState(false);
  
  const [vkrTasks, setVkrTasks] = useState(VKR_TASKS);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskAnswerText, setTaskAnswerText] = useState('');
  const [taskSelectedFile, setTaskSelectedFile] = useState(null);
  const [taskEditMode, setTaskEditMode] = useState(false);

  const gender = detectGender(profile.full_name);
  
  const hasApprovedTeacher = !!approvedApplication;

  const calculateProgress = () => {
    if (!approvedApplication) return 0;
    const completedTasks = vkrTasks.filter(t => t.status === 'completed').length;
    return Math.round((completedTasks / vkrTasks.length) * 100);
  };

  // Инициализация и загрузка данных
  useEffect(() => {
    initDemoData();
    loadStudentData();
    
    const teachers = getFullTeachersList();
    const statuses = getTeachersOnlineStatus();
    setAllTeachers(teachers);
    setTeachersOnlineStatus(statuses);
    
    // Без интервала: страница «Сервисы» больше не перерисовывается и не моргает каждые 30 секунд.
    return undefined;
  }, []);

  useEffect(() => {
    loadStudentData();
  }, [user.id]);

  const loadStudentData = () => {
    const apps = getStudentApplications(user.id);
    setApplications(apps);
    const approved = apps.find(a => a.status === 'approved');
    setApprovedApplication(approved || null);
    
    setNotifications(getUserNotifications(user.id));
    
    const savedTasks = getStudentTasks(user.id);
    if (!approved) {
      // Пока научный руководитель не закреплён, у студента не может быть отправленных заданий.
      // Поэтому скрываем/сбрасываем сохранённые ответы в интерфейсе до одобрения заявки.
      setVkrTasks(VKR_TASKS.map(task => ({
        ...task,
        teacher: null,
        files: [],
        answerText: '',
        submittedDate: null,
        attempts: 0,
        grade: null,
        feedback: null,
        feedbackDate: null,
      })));
    } else if (Object.keys(savedTasks).length > 0) {
      setVkrTasks(prev => prev.map(task => ({
        ...task,
        ...(savedTasks[task.id] || {}),
        teacher: approved.teacherName || approved.teacher || null
      })));
    } else {
      setVkrTasks(prev => prev.map(task => ({
        ...task,
        teacher: approved.teacherName || approved.teacher
      })));
    }
    
    if (approved) {
      const messages = getPersonalChatMessages(user.id, approved.teacherId);
      setPersonalChatMessages(messages.map(m => ({
        id: m.id,
        text: m.text,
        sender: m.sender,
        time: new Date(m.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
      })));
      
      const groups = getStudentGroups(user.id, approved.teacherId);
      setStudentGroups(groups);
    }
  };

  useEffect(() => { 
    localStorage.setItem('theme', isDark ? 'dark' : 'light'); 
  }, [isDark]);
  
  useEffect(() => { 
    localStorage.setItem('activeTab', activeTab); 
  }, [activeTab]);

  const filteredNews = activeNewsTab === 'all' ? NEWS : NEWS.filter(item => item.important);

  const handleApply = (teacher) => {
    const result = submitApplication(
      user.id,
      teacher,
      {
        ...profile,
        group: profile.group_number || profile.group || 'УИБО-02-23',
        course: profile.course || 4
      }
    );
    
    if (result.success) {
      loadStudentData();
      setShowConfirmModal(false);
      setSelectedTeacher(null);
    } else {
      alert(result.message);
    }
  };

  const confirmApply = () => {
    handleApply(selectedTeacher);
  };

  const cancelApplicationHandler = (appId) => {
    const result = cancelApplicationAPI(appId, user.id);
    if (result.success) {
      loadStudentData();
    }
  };

  const handleSendMessage = (text) => {
    if (!approvedApplication) return;
    
    const result = sendPersonalMessage(
      user.id,
      approvedApplication.teacherId,
      'student',
      user.id,
      profile.full_name,
      text
    );
    
    if (result.success) {
      setPersonalChatMessages(prev => [...prev, {
        id: result.message.id,
        text: result.message.text,
        sender: result.message.sender,
        time: new Date(result.message.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  };

  const handleSendGroupMessage = (groupId, text) => {
    if (!text.trim()) return;
    setStudentGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          messages: [...g.messages, {
            id: Date.now(),
            text,
            sender: profile.full_name,
            time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
          }]
        };
      }
      return g;
    }));
  };

  const addAnswer = (questionId) => {
    if (!newAnswer.trim()) return;
    const updated = forumQuestions.map(q => q.id === questionId ? { ...q, answers: [...q.answers, { id: Date.now(), text: newAnswer, author: profile.full_name, time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }), date: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) }] } : q);
    setForumQuestions(updated); 
    setNewAnswer('');
  };

  const addQuestion = () => {
    if (!newQuestion.trim()) return;
    setForumQuestions([{ id: Date.now(), question: newQuestion, author: profile.full_name, time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }), date: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }), answers: [] }, ...forumQuestions]);
    setNewQuestion(''); 
    setShowNewQuestion(false);
  };

  const downloadDocument = (doc) => { alert(`Скачивание файла: ${doc.name}.docx`); };

  const openTaskDetails = (task) => {
    const visibleTask = hasApprovedTeacher
      ? task
      : {
          ...task,
          files: [],
          answerText: '',
          submittedDate: null,
          attempts: 0,
          grade: null,
          feedback: null,
          feedbackDate: null,
          teacher: null,
        };

    const hasAnswer = getTaskHasAnswer(visibleTask, hasApprovedTeacher);
    setSelectedTask(visibleTask);
    setTaskAnswerText(hasApprovedTeacher ? (visibleTask.answerText || '') : '');
    setTaskSelectedFile(null);
    setTaskEditMode(hasApprovedTeacher && !hasAnswer);
    setShowTaskModal(true);
  };

  const uploadFileToTask = (taskId) => {
    const preparedFiles = taskSelectedFile ? [taskSelectedFile.name] : [];

    if (!taskAnswerText.trim() && preparedFiles.length === 0) {
      alert('Введите письменный ответ или добавьте файл.');
      return;
    }

    // Если руководитель еще не закреплен, сохраняем только демонстрационный черновик в интерфейсе.
    // Статус задания при этом НЕ становится "отправлено", потому что реальная отправка доступна
    // только после закрепления преподавателя.
    if (!hasApprovedTeacher) {
      setVkrTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            files: [...(t.files || []), ...preparedFiles],
            answerText: taskAnswerText,
            submittedDate: null,
            attempts: 0,
            status: t.status === 'blocked' ? 'blocked' : 'pending',
          };
        }
        return t;
      }));

      if (selectedTask?.id === taskId) {
        setSelectedTask(prev => ({
          ...prev,
          files: [...(prev.files || []), ...preparedFiles],
          answerText: taskAnswerText,
          submittedDate: null,
          attempts: 0,
          status: prev.status === 'blocked' ? 'blocked' : 'pending',
        }));
      }

      setTaskSelectedFile(null);
      setTaskEditMode(false);
      return;
    }

    const result = submitTask(user.id, taskId, preparedFiles);

    if (result.success) {
      const submittedDate = new Date().toLocaleDateString('ru-RU');

      setVkrTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          const mergedFiles = [...(t.files || []), ...preparedFiles];
          return {
            ...t,
            files: mergedFiles,
            answerText: taskAnswerText,
            submittedDate,
            status: 'submitted',
            attempts: Math.min((t.attempts || 0) + 1, t.maxAttempts || 1),
          };
        }
        return t;
      }));

      if (selectedTask?.id === taskId) {
        setSelectedTask(prev => {
          const mergedFiles = [...(prev.files || []), ...preparedFiles];
          return {
            ...prev,
            files: mergedFiles,
            answerText: taskAnswerText,
            submittedDate,
            status: 'submitted',
            attempts: Math.min((prev.attempts || 0) + 1, prev.maxAttempts || 1),
          };
        });
      }

      setTaskAnswerText('');
      setTaskSelectedFile(null);
      setTaskEditMode(false);
      setShowTaskModal(false);
    } else {
      alert(result.message || 'Не удалось отправить ответ.');
    }
  };

  const deleteFileFromTask = (taskId, fileName) => {
    setVkrTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, files: t.files.filter(f => f !== fileName) };
      }
      return t;
    }));
    if (selectedTask?.id === taskId) {
      setSelectedTask(prev => ({ ...prev, files: prev.files.filter(f => f !== fileName) }));
    }
  };


  const deleteTaskAnswer = (taskId) => {
    if (!hasApprovedTeacher) return;

    const confirmed = window.confirm('Удалить отправленный ответ и прикрепленные файлы?');
    if (!confirmed) return;

    setVkrTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          files: [],
          answerText: '',
          submittedDate: null,
          status: t.status === 'blocked' ? 'blocked' : 'pending',
          grade: null,
          feedback: null,
          feedbackDate: null,
        };
      }
      return t;
    }));

    if (selectedTask?.id === taskId) {
      setSelectedTask(prev => ({
        ...prev,
        files: [],
        answerText: '',
        submittedDate: null,
        status: prev.status === 'blocked' ? 'blocked' : 'pending',
        grade: null,
        feedback: null,
        feedbackDate: null,
      }));
    }

    setTaskAnswerText('');
    setTaskSelectedFile(null);
    setTaskEditMode(true);
  };

  const getStatusStyle = (task) => {
    if (!approvedApplication) return { text: 'Ожидание', style: 'text-gray-400 border-gray-500/30 bg-gray-500/10' };
    switch (task.status) {
      case 'completed': return { text: ' Выполнено', style: 'text-green-400 border-green-500/30 bg-green-500/10' };
      case 'submitted': return { text: ' Отправлено', style: 'text-blue-400 border-blue-500/30 bg-blue-500/10' };
      case 'overdue': return { text: ' Просрочено', style: 'text-red-400 border-red-500/30 bg-red-500/10' };
      case 'blocked': return { text: ' Заблокировано', style: 'text-purple-400 border-purple-500/30 bg-purple-500/10' };
      default: return { text: 'Ожидание', style: 'text-gray-400 border-gray-500/30 bg-gray-500/10' };
    }
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
    inputChat: isDark ? 'bg-[#2A2A3A] border-2 border-[#A78BFA] text-white placeholder-gray-400' : 'bg-white border-2 border-[#2563EB] text-gray-800 placeholder-gray-400',
    filterActive: isDark ? 'bg-[#A78BFA] text-white' : 'bg-[#2563EB] text-white',
    filterInactive: isDark ? 'bg-[#1E1E2A] text-white border border-[#2A2A3A]' : 'bg-gray-100 text-gray-600 border-gray-200',
    bottomBar: isDark ? 'bg-[#1E1E2A]/90 backdrop-blur-xl border-[#2A2A3A]' : 'bg-white/90 backdrop-blur-xl border-gray-200 shadow-lg',
    progressBg: isDark ? 'bg-gray-700' : 'bg-gray-200',
    myMessage: isDark ? 'bg-[#A78BFA] text-white rounded-br-md' : 'bg-[#2563EB] text-white rounded-br-md',
    otherMessage: isDark ? 'bg-[#2E7D32] text-white rounded-bl-md' : 'bg-[#E8F5E9] text-gray-800 rounded-bl-md',
  };

  const noScrollbar = { scrollbarWidth: 'none', msOverflowStyle: 'none' };
  
  const scrollbarCSS = `
    html, body {
      background-color: ${isDark ? '#121218' : '#ffffff'};
      min-height: 100vh;
      margin: 0;
      padding: 0;
    }
    * { box-sizing: border-box; }
    body { overflow-x: hidden; }
    .no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
    .no-scrollbar::-webkit-scrollbar { display: none; width: 0; height: 0; }
    .forum-scroll { scrollbar-width: none; -ms-overflow-style: none; }
    .forum-scroll::-webkit-scrollbar { display: none; width: 0; height: 0; }
    .answers-scroll { scrollbar-width: none; -ms-overflow-style: none; }
    .answers-scroll::-webkit-scrollbar { display: none; width: 0; height: 0; }
  `;

  // Компонент уведомлений
  const NotificationBell = () => {
    const unreadCount = notifications.filter(n => !n.read).length;
    
    return (
      <div className="relative">
        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          className={`p-2 rounded-full transition ${isDark ? 'bg-[#1E1E2A] text-[#A78BFA] hover:bg-[#2A2A3A]' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9z" clipRule="evenodd" />
          </svg>
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
                    onClick={() => {
                      markAllNotificationsAsRead(user.id);
                      setNotifications(getUserNotifications(user.id));
                    }}
                    className={`text-xs ${isDark ? 'text-[#A78BFA]' : 'text-[#2563EB]'} hover:underline`}
                  >
                    Прочитать все
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className={`p-4 text-center text-sm ${theme.textMuted}`}>Нет уведомлений</p>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      className={`p-3 border-b cursor-pointer transition-colors ${isDark ? 'border-[#2A2A3A] hover:bg-[#1A1A2A]' : 'border-gray-100 hover:bg-gray-50'} ${!n.read ? (isDark ? 'bg-[#A78BFA]/10' : 'bg-blue-50') : ''}`}
                      onClick={() => {
                        markNotificationAsRead(n.id);
                        setNotifications(getUserNotifications(user.id));
                        setShowNotifications(false);
                      }}
                    >
                      <p className={`text-sm font-medium flex items-center gap-2 ${theme.text}`}>
                        <span className={`w-2 h-2 rounded-full mr-1 ${
                          n.type === 'application_approved' ? 'bg-green-500' : 
                          n.type === 'application_rejected' ? 'bg-red-500' : 
                          'bg-blue-500'
                        }`}></span>
                        {n.title}
                      </p>
                      <p className={`text-xs mt-1 ${theme.textSecondary}`}>{n.message}</p>
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
  };

  // ==================== ЭКРАНЫ ====================
  const HomeScreen = () => (
    <div className="space-y-4 fade-in">
      <div className={`${isDark ? 'bg-[#1E1E2A] border-[#2A2A3A]' : 'bg-[#F8FAFC] border-gray-200'} rounded-2xl border p-5`}>
        <h2 className={`font-semibold text-lg flex items-center ${theme.text}`}>
          <NewsIcon isDark={isDark} />
          Добрый день, {profile.full_name?.split(' ').slice(1).join(' ') || profile.full_name}!
        </h2>
      </div>
      
      <div className="flex items-center justify-between">
        <h3 className={`font-semibold text-lg flex items-center ${theme.text}`}>
          <MegaphoneIcon isDark={isDark} />
          Новости
        </h3>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <button onClick={() => setIsDark(!isDark)} className={`p-2 rounded-full transition ${isDark ? 'bg-[#1E1E2A] text-[#A78BFA]' : 'bg-gray-200 text-gray-600'}`}>{isDark ? <SunIcon /> : <MoonIcon />}</button>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button 
          onClick={() => setActiveNewsTab('all')} 
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 ${
            activeNewsTab === 'all' 
              ? (isDark ? 'bg-[#A78BFA] text-white' : 'bg-[#2563EB] text-white') 
              : (isDark ? 'bg-[#1E1E2A] text-gray-400 border border-[#2A2A3A] hover:text-white' : 'bg-[#F8FAFC] text-gray-500 border border-gray-200 hover:text-gray-700')
          }`}
        >
          Все
        </button>
        <button 
          onClick={() => setActiveNewsTab('important')} 
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 ${
            activeNewsTab === 'important' 
              ? (isDark ? 'bg-[#A78BFA] text-white' : 'bg-[#2563EB] text-white') 
              : (isDark ? 'bg-[#1E1E2A] text-gray-400 border border-[#2A2A3A] hover:text-white' : 'bg-[#F8FAFC] text-gray-500 border border-gray-200 hover:text-gray-700')
          }`}
        >
          Важное
        </button>
      </div>

      <div className="space-y-3">
        {filteredNews.map(item => (
          <div key={item.id} className={`news-card rounded-xl overflow-hidden transition-all hover:scale-[1.01] hover:shadow-lg ${item.important ? (isDark ? 'border-l-4 border-l-[#1E3A5F]' : 'border-l-4 border-l-blue-800') : ''} ${theme.card}`}>
            <div className="p-4">
              <h4 className={`font-semibold mb-2 ${theme.text}`}>{item.title}</h4>
              {item.desc && <p className={`text-sm mb-3 ${theme.textSecondary}`}>{item.desc}</p>}
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium flex items-center ${isDark ? 'text-[#A78BFA]' : 'text-[#2563EB]'}`}>
                  <ClockIcon isDark={isDark} />
                  {item.date}
                </span>
                <div className="flex gap-1">
                  {item.tags && item.tags.map((tag, i) => (
                    <span key={i} className={`text-xs px-2 py-0.5 rounded-md font-medium border ${isDark ? 'text-[#22C55E] border-[#22C55E]/30 bg-[#22C55E]/10' : 'text-green-600 border-green-200 bg-green-50'}`}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const CourseScreen = () => (
    <div className="space-y-4 fade-in">
      <div className="flex items-center justify-between">
        <h2 className={`font-semibold text-lg ${theme.text}`}>ВКР 2026</h2>
        <button onClick={() => setIsDark(!isDark)} className={`p-2 rounded-full transition ${isDark ? 'bg-[#1E1E2A] text-[#A78BFA]' : 'bg-gray-200 text-gray-600'}`}>{isDark ? <SunIcon /> : <MoonIcon />}</button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button 
          onClick={() => setCourseTab('announcements')} 
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 flex items-center ${
            courseTab === 'announcements' 
              ? (isDark ? 'bg-[#A78BFA] text-white' : 'bg-[#2563EB] text-white') 
              : (isDark ? 'bg-[#1E1E2A] text-gray-400 border border-[#2A2A3A] hover:text-white' : 'bg-[#F8FAFC] text-gray-500 border border-gray-200 hover:text-gray-700')
          }`}
        >
          <MegaphoneIcon isDark={isDark} active={courseTab === 'announcements'} />
          Объявления
        </button>
        
        <button 
          onClick={() => setCourseTab('progress')} 
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 flex items-center ${
            courseTab === 'progress' 
              ? (isDark ? 'bg-[#A78BFA] text-white' : 'bg-[#2563EB] text-white') 
              : (isDark ? 'bg-[#1E1E2A] text-gray-400 border border-[#2A2A3A] hover:text-white' : 'bg-[#F8FAFC] text-gray-500 border border-gray-200 hover:text-gray-700')
          }`}
        >
          <ChartIcon isDark={isDark} active={courseTab === 'progress'} />
          Прогресс
        </button>
        
        <button 
          onClick={() => setCourseTab('documents')} 
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 flex items-center ${
            courseTab === 'documents' 
              ? (isDark ? 'bg-[#A78BFA] text-white' : 'bg-[#2563EB] text-white') 
              : (isDark ? 'bg-[#1E1E2A] text-gray-400 border border-[#2A2A3A] hover:text-white' : 'bg-[#F8FAFC] text-gray-500 border border-gray-200 hover:text-gray-700')
          }`}
        >
          <FolderIcon isDark={isDark} active={courseTab === 'documents'} />
          Документы
        </button>
      </div>

      <div className="pt-2">
        {courseTab === 'announcements' && (
          <div className="space-y-4">
            <div className={`p-6 rounded-xl ${theme.card}`}>
              <h3 className={`font-semibold mb-4 flex items-center ${theme.text}`}>
                <MegaphoneIcon isDark={isDark} />
                Объявления курса
              </h3>
              <div className="space-y-3">
                {COURSE_ANNOUNCEMENTS.map(item => (
                  <div key={item.id} className={`p-4 rounded-lg transition-all hover:scale-[1.01] ${theme.cardInner}`}>
                    <h4 className={`font-medium flex items-center ${theme.text}`}>
                      <MegaphoneIcon isDark={isDark} />
                      {item.title}
                    </h4>
                    <p className={`text-sm mt-1 ${theme.textSecondary}`}>{item.desc}</p>
                    <p className={`text-xs mt-2 flex items-center ${theme.textMuted}`}>
                      <ClockIcon isDark={isDark} />
                      {item.date}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {courseTab === 'progress' && (
          <div className={`p-6 rounded-xl ${theme.card}`}>
            <h3 className={`font-semibold mb-2 flex items-center ${theme.text}`}>
              <ChartIcon isDark={isDark} />
              Прогресс выполнения ВКР
            </h3>
            <p className={`mb-4 ${theme.textSecondary}`}>
              Студент: {profile.full_name} | Руководитель: {approvedApplication?.teacherName || approvedApplication?.teacher || 'Не назначен'}
            </p>
            
            <div className="flex flex-col items-center mb-4">
              <div className={`${isDark ? 'text-[#A78BFA]' : 'text-[#2563EB]'}`}>
                <VKRIcon isDark={isDark} />
              </div>
              <span className={`text-2xl font-bold ${theme.text}`}>{calculateProgress()}%</span>
              <span className={`text-xs ${theme.textMuted}`}>общий прогресс</span>
            </div>
            
            <div className={`w-full h-2 ${theme.progressBg} rounded-full mb-6`}>
              <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500" style={{ width: `${calculateProgress()}%` }} />
            </div>
            
            <h4 className={`font-medium mb-3 flex items-center ${theme.text}`}>
              <ClockIcon isDark={isDark} />
              Ближайшие дедлайны
            </h4>
            <div className="space-y-2 mb-6">
              {DEADLINES.map(item => (
                <div key={item.id} className={`p-3 rounded-lg transition-all hover:scale-[1.01] ${item.urgent ? (isDark ? 'bg-gradient-to-r from-orange-600/20 to-red-600/20 border-l-4 border-l-orange-500' : 'bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-l-orange-500') : (isDark ? 'bg-[#121218] border border-[#2A2A3A]' : 'bg-gray-50 border border-gray-200')}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${theme.text}`}>{item.title}</span>
                    <span className={`text-xs font-medium ${item.urgent ? (isDark ? 'text-orange-400' : 'text-orange-600') : theme.textMuted}`}>
                      <ClockIcon isDark={isDark} />
                      {item.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <h4 className={`font-medium mb-3 flex items-center ${theme.text}`}>
              <DocumentIcon isDark={isDark} />
              Этапы ВКР
            </h4>
            <div className="space-y-2">
              {vkrTasks.map((task) => {
                const statusInfo = getStatusStyle(task);
                const completed = task.status === 'completed';
                return (
                  <button key={task.id} onClick={() => openTaskDetails(task)} className={`w-full p-3 rounded-lg flex items-center justify-between transition-all hover:scale-[1.01] ${isDark ? 'bg-[#121218] hover:bg-[#1A1A2A]' : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                      {completed ? <CheckCircleIcon /> : <CircleIcon isDark={isDark} />}
                      <span className={theme.text}>{task.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs ${theme.textMuted}`}>
                        <ClockIcon isDark={isDark} />
                        {task.deadline}
                      </span>
                      <span className={`text-xs px-3 py-1 rounded-full border font-medium ${statusInfo.style}`}>
                        {statusInfo.text}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {courseTab === 'documents' && (
          <div className={`p-4 rounded-xl ${theme.card}`}>
            <h3 className={`font-semibold mb-4 flex items-center ${theme.text}`}>
              <FolderIcon isDark={isDark} />
              Документы
            </h3>
            <p className={`text-sm ${theme.textSecondary} mb-3`}>Шаблоны документов для ВКР (скачать в формате Word)</p>
            <div className="space-y-2">
              {DOCUMENTS.map(doc => (
                <div key={doc.id} className={`w-full p-3 rounded-lg flex items-center justify-between transition-all hover:scale-[1.01] ${isDark ? 'bg-[#121218] hover:bg-[#1A1A2A]' : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    <DocumentIcon isDark={isDark} />
                    <div className="text-left">
                      <p className={`text-sm font-medium ${theme.text}`}>{doc.name}</p>
                      <p className={`text-xs ${theme.textMuted}`}>.{doc.type}</p>
                    </div>
                  </div>
                  <button onClick={() => downloadDocument(doc)} className={`p-2 rounded-lg transition-all hover:scale-110 ${isDark ? 'text-[#A78BFA]' : 'text-[#2563EB]'}`}>
                    <DownloadIcon isDark={isDark} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );


  // Компонент поля сообщения в чате
  const ChatInput = ({ onSend, isDark, theme }) => {
    const [localValue, setLocalValue] = useState('');
    const inputRef = useRef(null);
    
    const handleSend = () => {
      if (localValue.trim()) {
        onSend(localValue);
        setLocalValue('');
        inputRef.current?.focus();
      }
    };
    
    return (
      <div className="flex gap-2">
        <input 
          ref={inputRef}
          type="text" 
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Сообщение..." 
          className={`flex-1 px-4 py-3 rounded-full focus:outline-none ${theme.inputChat}`} 
        />
        <button 
          onClick={handleSend}
          disabled={!localValue.trim()}
          className={`p-3 rounded-full font-medium transition-all flex items-center justify-center ${
            localValue.trim() 
              ? (isDark ? 'bg-[#A78BFA] hover:bg-[#9B7BEA]' : 'bg-[#2563EB] hover:bg-[#1D4ED8]') 
              : (isDark ? 'bg-[#2A2A3A]' : 'bg-gray-200')
          }`}
        >
          <SendIcon isDark={isDark} />
        </button>
      </div>
    );
  };

  // Компонент поля ответа на форуме
  const ForumAnswerInput = ({ questionId, onAddAnswer, isDark, theme }) => {
    const [localValue, setLocalValue] = useState('');
    const inputRef = useRef(null);
    
    const handleSubmit = () => {
      if (localValue.trim()) {
        onAddAnswer(questionId, localValue);
        setLocalValue('');
      }
    };
    
    return (
      <div className="flex gap-2 mt-3">
        <input 
          ref={inputRef}
          type="text" 
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Ваш ответ..." 
          className={`flex-1 px-4 py-3 rounded-full text-sm focus:outline-none ${theme.inputChat}`} 
        />
        <button 
          onClick={handleSubmit}
          disabled={!localValue.trim()}
          className={`p-3 rounded-full text-sm font-medium transition-all flex items-center justify-center ${
            localValue.trim() 
              ? (isDark ? 'bg-[#A78BFA] hover:bg-[#9B7BEA]' : 'bg-[#2563EB] hover:bg-[#1D4ED8]') 
              : (isDark ? 'bg-[#2A2A3A]' : 'bg-gray-200')
          }`}
        >
          <SendIcon isDark={isDark} />
        </button>
      </div>
    );
  };

  // Компонент поля нового вопроса
  const NewQuestionInput = ({ onAdd, onCancel, isDark, theme }) => {
    const [localValue, setLocalValue] = useState('');
    const textareaRef = useRef(null);
    
    useEffect(() => {
      textareaRef.current?.focus();
    }, []);
    
    const handleSubmit = () => {
      if (localValue.trim()) {
        onAdd(localValue);
        setLocalValue('');
      }
    };
    
    return (
      <div className={`p-4 rounded-xl ${theme.card}`}>
        <textarea 
          ref={textareaRef}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          placeholder="Введите ваш вопрос..." 
          className={`w-full p-3 rounded-lg text-sm mb-3 focus:outline-none resize-none ${theme.input}`} 
          rows="2"
        />
        <div className="flex gap-2">
          <button 
            onClick={handleSubmit}
            disabled={!localValue.trim()}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:scale-105 ${localValue.trim() ? (isDark ? 'bg-[#A78BFA]' : 'bg-[#2563EB]') : 'bg-gray-400 cursor-not-allowed'}`}
          >
            Опубликовать
          </button>
          <button 
            onClick={onCancel}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 ${isDark ? 'bg-[#1E1E2A] text-white border border-[#2A2A3A]' : 'bg-[#F8FAFC] text-gray-600 border border-gray-200'}`}
          >
            Отмена
          </button>
        </div>
      </div>
    );
  };

  const ServicesScreen = () => (
    <div className="space-y-4 fade-in">
      <div className="flex items-center justify-between">
        <h2 className={`font-semibold text-lg flex items-center ${theme.text}`}>
          <ServicesIcon active={true} isDark={isDark} />
          Сервисы
        </h2>
        <button onClick={() => setIsDark(!isDark)} className={`p-2 rounded-full transition ${isDark ? 'bg-[#1E1E2A] text-[#A78BFA]' : 'bg-gray-200 text-gray-600'}`}>{isDark ? <SunIcon /> : <MoonIcon />}</button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button 
          onClick={() => { setServicesTab('teachers'); setTeacherViewTab('catalog'); }} 
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 flex items-center ${
            servicesTab === 'teachers' 
              ? (isDark ? 'bg-[#A78BFA] text-white' : 'bg-[#2563EB] text-white') 
              : (isDark ? 'bg-[#1E1E2A] text-gray-400 border border-[#2A2A3A] hover:text-white' : 'bg-[#F8FAFC] text-gray-500 border border-gray-200 hover:text-gray-700')
          }`}
        >
          <TeacherIcon isDark={isDark} active={servicesTab === 'teachers'} />
          Преподаватели
        </button>
        
        <button 
          onClick={() => setServicesTab('chat')} 
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 flex items-center ${
            servicesTab === 'chat' 
              ? (isDark ? 'bg-[#A78BFA] text-white' : 'bg-[#2563EB] text-white') 
              : (isDark ? 'bg-[#1E1E2A] text-gray-400 border border-[#2A2A3A] hover:text-white' : 'bg-[#F8FAFC] text-gray-500 border border-gray-200 hover:text-gray-700')
          }`}
        >
          <ChatIcon isDark={isDark} active={servicesTab === 'chat'} />
          Чаты
        </button>
        
        <button 
          onClick={() => setServicesTab('forum')} 
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 flex items-center ${
            servicesTab === 'forum' 
              ? (isDark ? 'bg-[#A78BFA] text-white' : 'bg-[#2563EB] text-white') 
              : (isDark ? 'bg-[#1E1E2A] text-gray-400 border border-[#2A2A3A] hover:text-white' : 'bg-[#F8FAFC] text-gray-500 border border-gray-200 hover:text-gray-700')
          }`}
        >
          <ForumIcon isDark={isDark} active={servicesTab === 'forum'} />
          Форум
        </button>
        
        <button 
          onClick={() => setServicesTab('video')} 
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 flex items-center ${
            servicesTab === 'video' 
              ? (isDark ? 'bg-[#A78BFA] text-white' : 'bg-[#2563EB] text-white') 
              : (isDark ? 'bg-[#1E1E2A] text-gray-400 border border-[#2A2A3A] hover:text-white' : 'bg-[#F8FAFC] text-gray-500 border border-gray-200 hover:text-gray-700')
          }`}
        >
          <VideoIcon isDark={isDark} active={servicesTab === 'video'} />
          Видео
        </button>
      </div>

      <div className="pt-2">
        {servicesTab === 'teachers' && (
          <div className="space-y-3">
            <div className="flex gap-2 border-b pb-2" style={{ borderColor: isDark ? '#2A2A3A' : '#E5E7EB' }}>
              <button onClick={() => setTeacherViewTab('catalog')} className={`px-4 py-2 text-sm font-medium transition-all ${teacherViewTab === 'catalog' ? (isDark ? 'text-[#A78BFA] border-b-2 border-[#A78BFA]' : 'text-[#2563EB] border-b-2 border-[#2563EB]') : theme.textMuted}`}>Каталог</button>
              <button onClick={() => setTeacherViewTab('myApplications')} className={`px-4 py-2 text-sm font-medium transition-all flex items-center ${teacherViewTab === 'myApplications' ? (isDark ? 'text-[#A78BFA] border-b-2 border-[#A78BFA]' : 'text-[#2563EB] border-b-2 border-[#2563EB]') : theme.textMuted}`}>
                <ListIcon isDark={isDark} />
                Мои заявки
                {applications.filter(app => app.status === 'pending').length > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">{applications.filter(app => app.status === 'pending').length}</span>
                )}
              </button>
            </div>

            {teacherViewTab === 'myApplications' && (
              <div className="space-y-3">
                {applications.filter(app => app.status === 'pending').length === 0 && applications.filter(app => app.status === 'approved').length === 0 ? (
                  <div className={`p-8 text-center rounded-xl ${theme.card}`}>
                    <ListIcon isDark={isDark} />
                    <p className={`text-lg mb-2 ${theme.text}`}>Нет активных заявок</p>
                  </div>
                ) : (
                  <>
                    {applications.filter(app => app.status === 'pending').map(app => (
                      <div key={app.id} className={`p-4 rounded-xl ${theme.card} border-l-4 border-l-yellow-500`}>
                        <h4 className={`font-medium flex items-center ${theme.text}`}>
                          <TeacherIcon isDark={isDark} />
                          {app.teacherName || app.teacher}
                        </h4>
                        <p className={`text-xs mb-3 ${theme.textMuted}`}>Подана: {app.date}</p>
                        <button
                          onClick={() => cancelApplicationHandler(app.id)}
                          className="text-xs px-3 py-1.5 rounded-lg transition-all hover:scale-105 bg-red-600 hover:bg-red-700 text-white border border-red-500 font-medium"
                        >
                          Отменить заявку
                        </button>
                      </div>
                    ))}
                    {applications.filter(app => app.status === 'approved').map(app => (
                      <div key={app.id} className={`p-4 rounded-xl ${theme.card} border-l-4 border-l-green-500`}>
                        <h4 className={`font-medium flex items-center ${theme.text}`}>
                          <TeacherIcon isDark={isDark} />
                          {app.teacherName || app.teacher}
                        </h4>
                        <p className={`text-xs mb-2 ${theme.textMuted}`}>Утверждена: {app.date}</p>
                        {app.topic && <p className={`text-sm ${theme.textSecondary}`}>Тема: {app.topic}</p>}
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {teacherViewTab === 'catalog' && (
              <>
                {approvedApplication && (
                  <div
                    className={`mb-4 p-4 rounded-xl border ${
                      isDark
                        ? 'bg-green-500/10 border-green-500/40'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <p
                      className={`text-sm font-semibold flex items-center ${
                        isDark ? 'text-green-400' : 'text-[#2563EB]'
                      }`}
                    >
                      <TeacherIcon isDark={isDark} />
                      Утверждённый преподаватель: {approvedApplication.teacherName || approvedApplication.teacher}
                    </p>
                  </div>
                )}

                <TeacherCatalog
                allTeachers={allTeachers}
                applications={applications}
                hasApprovedTeacher={hasApprovedTeacher}
                selectedFilter={selectedFilter}
                setSelectedFilter={setSelectedFilter}
                setSelectedTeacher={setSelectedTeacher}
                setShowConfirmModal={setShowConfirmModal}
                isDark={isDark}
                theme={theme}
                noScrollbar={noScrollbar}
              />
              </>
            )}
          </div>
        )}

        {servicesTab === 'chat' && (
          <div className="space-y-4">
            {!hasApprovedTeacher ? (
              <div className={`p-8 text-center rounded-xl ${theme.card}`}>
                <ChatIcon isDark={isDark} />
                <p className={`text-lg mb-2 ${theme.text}`}>Чаты недоступны</p>
                <p className={`${theme.textSecondary}`}>Чаты станут доступны после утверждения руководителя</p>
              </div>
            ) : (
              <>
                <div className="flex gap-2 border-b pb-2" style={{ borderColor: isDark ? '#2A2A3A' : '#E5E7EB' }}>
                  <button 
                    onClick={() => { setChatTab('personal'); setSelectedGroup(null); }} 
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-all hover:scale-105 flex items-center ${chatTab === 'personal' ? (isDark ? 'text-[#A78BFA] border-[#A78BFA]' : 'text-[#2563EB] border-[#2563EB]') : theme.textMuted}`}
                  >
                    <ChatIcon isDark={isDark} />
                    Чат с руководителем
                  </button>
                  <button 
                    onClick={() => setChatTab('groups')} 
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-all hover:scale-105 flex items-center ${chatTab === 'groups' ? (isDark ? 'text-[#A78BFA] border-[#A78BFA]' : 'text-[#2563EB] border-[#2563EB]') : theme.textMuted}`}
                  >
                    <GroupIcon isDark={isDark} />
                    Группы
                  </button>
                </div>
                
                {chatTab === 'personal' && (
                  <>
                    <div className={`p-3 rounded-lg ${theme.card}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${isDark ? 'bg-[#A78BFA]' : 'bg-[#2563EB]'}`}>
                          {(approvedApplication.teacherName || approvedApplication.teacher).charAt(0)}
                        </div>
                        <div>
                          <p className={`font-medium ${theme.text}`}>{approvedApplication.teacherName || approvedApplication.teacher}</p>
                          <p className={`text-xs ${theme.textMuted}`}>Научный руководитель</p>
                        </div>
                      </div>
                    </div>
                    <div className={`rounded-xl p-3 space-y-3 max-h-[300px] overflow-y-auto no-scrollbar ${isDark ? 'bg-[#121218]' : 'bg-gray-50'}`} style={noScrollbar}>
                      {personalChatMessages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] ${msg.sender === 'student' ? 'items-end' : 'items-start'} flex flex-col`}>
                            <div className={`p-3 rounded-2xl ${msg.sender === 'student' ? theme.myMessage : theme.otherMessage}`}>
                              <p className="text-sm">{msg.text}</p>
                            </div>
                            <p className={`text-xs mt-1 ${msg.sender === 'student' ? 'text-white/70' : theme.textMuted}`}>
                              {msg.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <ChatInput 
                      onSend={handleSendMessage}
                      isDark={isDark}
                      theme={theme}
                    />
                  </>
                )}
                
                {chatTab === 'groups' && (
                  <>
                    {!selectedGroup ? (
                      <div className="space-y-3">
                        {studentGroups.length === 0 ? (
                          <div className={`p-8 text-center rounded-xl ${theme.card}`}>
                            <GroupIcon isDark={isDark} />
                            <p className={`text-lg mb-2 ${theme.text}`}>Нет доступных групп</p>
                            <p className={`${theme.textSecondary}`}>Преподаватель ещё не создал группы</p>
                          </div>
                        ) : (
                          studentGroups.map(group => (
                            <button
                              key={group.id}
                              onClick={() => setSelectedGroup(group)}
                              className={`w-full p-4 rounded-xl text-left transition-all hover:scale-[1.01] ${theme.card}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${isDark ? 'bg-[#A78BFA]' : 'bg-[#2563EB]'}`}>
                                  <GroupIcon isDark={isDark} />
                                </div>
                                <div className="flex-1">
                                  <p className={`font-medium ${theme.text}`}>{group.name}</p>
                                  <p className={`text-xs ${theme.textMuted}`}>{group.course} курс • {group.students?.length || 0} студентов</p>
                                </div>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    ) : (
                      <>
                        <button 
                          onClick={() => setSelectedGroup(null)}
                          className={`flex items-center gap-2 text-sm ${theme.textMuted} hover:${theme.text}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
                          </svg>
                          Назад к списку групп
                        </button>
                        <div className={`p-3 rounded-lg ${theme.card}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${isDark ? 'bg-[#A78BFA]' : 'bg-[#2563EB]'}`}>
                              <GroupIcon isDark={isDark} />
                            </div>
                            <div>
                              <p className={`font-medium ${theme.text}`}>{selectedGroup.name}</p>
                              <p className={`text-xs ${theme.textMuted}`}>{selectedGroup.course} курс • {selectedGroup.students?.length || 0} студентов</p>
                            </div>
                          </div>
                        </div>
                        <div className={`rounded-xl p-3 space-y-3 max-h-[250px] overflow-y-auto no-scrollbar ${isDark ? 'bg-[#121218]' : 'bg-gray-50'}`} style={noScrollbar}>
                          {selectedGroup.messages?.map(msg => (
                            <div key={msg.id} className={`flex ${msg.sender === profile.full_name ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[80%] ${msg.sender === profile.full_name ? 'items-end' : 'items-start'} flex flex-col`}>
                                {msg.sender !== profile.full_name && (
                                  <span className={`text-xs mb-1 ${theme.textMuted}`}>{msg.sender}</span>
                                )}
                                <div className={`p-3 rounded-2xl ${msg.sender === profile.full_name ? theme.myMessage : theme.otherMessage}`}>
                                  <p className="text-sm">{msg.text}</p>
                                </div>
                                <p className={`text-xs mt-1 ${msg.sender === profile.full_name ? 'text-white/70' : theme.textMuted}`}>
                                  {msg.time}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={groupMessageText} 
                            onChange={(e) => setGroupMessageText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey && groupMessageText.trim()) {
                                e.preventDefault();
                                handleSendGroupMessage(selectedGroup.id, groupMessageText);
                                setGroupMessageText('');
                              }
                            }}
                            placeholder="Написать в группу..." 
                            className={`flex-1 px-4 py-3 rounded-full focus:outline-none ${theme.inputChat}`} 
                          />
                          <button 
                            onClick={() => {
                              handleSendGroupMessage(selectedGroup.id, groupMessageText);
                              setGroupMessageText('');
                            }}
                            disabled={!groupMessageText.trim()}
                            className={`p-3 rounded-full font-medium transition-all flex items-center justify-center ${
                              groupMessageText.trim() 
                                ? (isDark ? 'bg-[#A78BFA] hover:bg-[#9B7BEA]' : 'bg-[#2563EB] hover:bg-[#1D4ED8]') 
                                : (isDark ? 'bg-[#2A2A3A]' : 'bg-gray-200')
                            }`}
                          >
                            <SendIcon isDark={isDark} />
                          </button>
                        </div>
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        )}

        {servicesTab === 'forum' && (
          <div className="space-y-4">
            <button onClick={() => setShowNewQuestion(!showNewQuestion)} className={`w-full py-3 rounded-lg font-medium transition-all hover:scale-105 flex items-center justify-center ${isDark ? 'bg-[#A78BFA]/20 text-[#A78BFA] border border-[#A78BFA]/30' : 'bg-blue-50 text-[#2563EB] border border-blue-200'}`}>
              <ForumIcon isDark={isDark} />
              Задать вопрос
            </button>
            
            {showNewQuestion && (
              <NewQuestionInput 
                onAdd={(text) => {
                  setForumQuestions([{ id: Date.now(), question: text, author: profile.full_name, time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }), date: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }), answers: [] }, ...forumQuestions]);
                  setShowNewQuestion(false);
                }}
                onCancel={() => setShowNewQuestion(false)}
                isDark={isDark}
                theme={theme}
              />
            )}
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto forum-scroll" style={noScrollbar}>
              <style>{scrollbarCSS}</style>
              {forumQuestions.map(q => (
                <div key={q.id} className={`rounded-xl overflow-hidden transition-all hover:scale-[1.01] ${theme.card}`}>
                  <button onClick={() => setExpandedQuestion(expandedQuestion === q.id ? null : q.id)} className="w-full p-4 text-left">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className={`font-medium flex items-center ${theme.text}`}>
                          <ForumIcon isDark={isDark} />
                          {q.question}
                        </p>
                        <p className={`text-xs mt-1 flex items-center ${theme.textMuted}`}>
                          <TeacherIcon isDark={isDark} />
                          {q.author} • {q.date} в {q.time}
                        </p>
                      </div>
                      <ChevronDownIcon isDark={isDark} className={`transition-transform ${expandedQuestion === q.id ? 'rotate-180' : ''}`} />
                    </div>
                    {q.answers.length > 0 && <p className={`text-xs mt-2 ${isDark ? 'text-[#A78BFA]' : 'text-[#2563EB]'}`}>{q.answers.length} ответов</p>}
                  </button>
                  {expandedQuestion === q.id && (
                    <div className="px-4 pb-4 border-t" style={{ borderColor: isDark ? '#2A2A3A' : '#E5E7EB' }}>
                      <div className="pt-3 space-y-3 max-h-[250px] overflow-y-auto answers-scroll" style={noScrollbar}>
                        <style>{scrollbarCSS}</style>
                        {q.answers.map(a => (
                          <div key={a.id} className={`p-3 rounded-lg transition-all hover:scale-[1.01] ${theme.cardInner}`}>
                            <p className={`text-sm ${theme.text}`}>{a.text}</p>
                            <p className={`text-xs mt-1 flex items-center ${theme.textMuted}`}>
                              <TeacherIcon isDark={isDark} />
                              {a.author} • {a.date} в {a.time}
                            </p>
                          </div>
                        ))}
                      </div>
                      <ForumAnswerInput 
                        questionId={q.id}
                        onAddAnswer={(qId, text) => {
                          const updated = forumQuestions.map(qq => qq.id === qId ? { ...qq, answers: [...qq.answers, { id: Date.now(), text, author: profile.full_name, time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }), date: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) }] } : qq);
                          setForumQuestions(updated);
                        }}
                        isDark={isDark}
                        theme={theme}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {servicesTab === 'video' && (
          <div className={`p-6 rounded-xl ${theme.card}`}>
            <h3 className={`font-semibold mb-4 flex items-center ${theme.text}`}>
              <VideoIcon isDark={isDark} />
              Видеоконференции
            </h3>
            <div className="space-y-3">
              {VIDEOCONFERENCES.map(conf => (
                <div key={conf.id} className={`p-4 rounded-lg transition-all hover:scale-[1.01] hover:shadow-md ${theme.cardInner}`}>
                  <div className="flex items-center gap-3">
                    <VideoIcon isDark={isDark} />
                    <div className="flex-1">
                      <h4 className={`font-medium ${theme.text}`}>{conf.title}</h4>
                      <p className={`text-sm flex items-center ${theme.textSecondary}`}>
                        <CalendarIcon isDark={isDark} />
                        {conf.date}
                      </p>
                      {conf.link ? (
                        <a href={conf.link} className={`text-sm ${isDark ? 'text-[#A78BFA]' : 'text-[#2563EB]'} hover:underline`}>Подключиться</a>
                      ) : (
                        <p className={`text-sm ${isDark ? 'text-[#A78BFA]' : 'text-[#2563EB]'}`}>Ссылка станет активна за 15 минут до начала</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
        <button onClick={() => setIsDark(!isDark)} className={`p-2 rounded-full transition ${isDark ? 'bg-[#1E1E2A] text-[#A78BFA]' : 'bg-gray-200 text-gray-600'}`}>{isDark ? <SunIcon /> : <MoonIcon />}</button>
      </div>

      <div className={`rounded-2xl p-5 transition-all hover:scale-[1.01] ${theme.card}`}>
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all hover:scale-110 ${isDark ? 'text-[#A78BFA]' : 'text-[#2563EB]'}`}>
            <ProfileIcon active={true} isDark={isDark} />
          </div>
          <div>
            <h3 className={`font-semibold text-lg ${theme.text}`}>{profile.full_name}</h3>
            <p className={`text-sm ${theme.textSecondary}`}>
              УИБО-02-23 • {profile.course || 4} курс • Бакалавриат
            </p>
          </div>
        </div>
      </div>

      <div className={`rounded-2xl p-4 ${theme.card}`}>
        <h4 className={`text-sm font-medium mb-3 ${theme.text}`}>Личные данные</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-1.5">
            <span className={`text-sm ${theme.textMuted}`}>Почта</span>
            <span className={`text-sm ${theme.text}`}>{user.email}</span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className={`text-sm ${theme.textMuted}`}>Пол</span>
            <span className={`text-sm ${theme.text}`}>{detectGender(profile.full_name) === 'Женский' ? 'Женский' : 'Мужской'}</span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className={`text-sm ${theme.textMuted}`}>Курс</span>
            <span className={`text-sm ${theme.text}`}>{profile.course} курс</span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className={`text-sm ${theme.textMuted}`}>Учебная группа</span>
            <span className={`text-sm ${theme.text}`}>УИБО-02-23</span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className={`text-sm ${theme.textMuted}`}>Ученая степень</span>
            <span className={`text-sm ${theme.text}`}>Бакалавриат</span>
          </div>
        </div>
      </div>

      <div className={`rounded-2xl p-4 ${theme.card}`}>
        <h4 className={`text-sm font-medium mb-3 ${theme.text}`}>Информация об обучении</h4>
        <div className="space-y-3">
          <div>
            <span className={`text-xs ${theme.textMuted}`}>Формирующее подразделение</span>
            <p className={`text-sm mt-1 ${theme.text}`}>Институт технологий управления</p>
          </div>
          <div>
            <span className={`text-xs ${theme.textMuted}`}>Выпускающее подразделение</span>
            <p className={`text-sm mt-1 ${theme.text}`}>Кафедра информационных технологий в государственном управлении</p>
          </div>
          <div>
            <span className={`text-xs ${theme.textMuted}`}>Направление подготовки (специальность)</span>
            <p className={`text-sm mt-1 ${theme.text}`}>Бизнес-информатика (Управление ИТ-инфраструктурой организации)</p>
          </div>
        </div>
      </div>

      {approvedApplication && (
        <div className={`rounded-2xl p-4 ${theme.card}`}>
          <h4 className={`text-sm font-medium mb-3 ${theme.text}`}>Выпускная квалификационная работа</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-1.5">
              <span className={`text-sm ${theme.textMuted}`}>Научный руководитель</span>
              <span className={`text-sm ${theme.text}`}>{approvedApplication.teacherName || approvedApplication.teacher}</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className={`text-sm ${theme.textMuted}`}>Тема ВКР</span>
              <span className={`text-sm ${theme.text}`}>{approvedApplication.topic || 'На утверждении'}</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className={`text-sm ${theme.textMuted}`}>Статус</span>
              <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-green-600/20 text-green-400' : 'bg-green-100 text-green-700'}`}> Утверждён</span>
            </div>
          </div>
        </div>
      )}

      <button onClick={onLogout} className={`w-full p-4 rounded-2xl font-medium transition-all hover:scale-105 flex items-center justify-center ${isDark ? 'bg-[#A78BFA]/20 text-red-400 border border-[#A78BFA]/30 hover:bg-[#A78BFA]/30' : 'bg-[#2563EB]/10 text-red-600 border border-[#2563EB]/20 hover:bg-[#2563EB]/20'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
          <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm5.03 4.72a.75.75 0 010 1.06l-1.72 1.72h10.94a.75.75 0 010 1.5H10.81l1.72 1.72a.75.75 0 11-1.06 1.06l-3-3a.75.75 0 010-1.06l3-3a.75.75 0 011.06 0z" clipRule="evenodd" />
        </svg>
        Выйти из аккаунта
      </button>
    </div>
  );

  return (
    <div className={`min-h-screen pb-24 relative ${theme.bg}`}>
      <style>{scrollbarCSS}</style>
      <div className={`px-4 py-4 sticky top-0 z-30 border-b ${theme.header}`}>
        <div className="max-w-3xl mx-auto">
          <h1 className={`text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r ${isDark ? 'from-[#A78BFA] via-[#C4B5FD] to-[#A78BFA]' : 'from-[#2563EB] via-[#3B82F6] to-[#2563EB]'}`}>РТУ МИРЭА • Студент</h1>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-6 tab-content">
        {activeTab === 'home' && <HomeScreen />}
        {activeTab === 'course' && <CourseScreen />}
        {activeTab === 'services' && <ServicesScreen />}
        {activeTab === 'profile' && <ProfileScreen />}
      </div>

      {showConfirmModal && selectedTeacher && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl max-w-md w-full p-6 ${theme.card}`}>
            <h3 className={`text-xl font-bold mb-2 flex items-center ${theme.text}`}>
              <TeacherIcon isDark={isDark} />
              Подтверждение записи
            </h3>
            <p className={`mb-6 ${theme.textSecondary}`}>Записаться к {selectedTeacher.fullName}?</p>
            <div className="flex gap-3">
              <button onClick={confirmApply} className={`flex-1 py-3 rounded-xl font-medium text-white transition-all hover:scale-105 ${isDark ? 'bg-[#A78BFA]' : 'bg-[#2563EB]'}`}>Подтвердить</button>
              <button 
  onClick={() => setShowConfirmModal(false)} 
  style={isDark ? { color: '#FFFFFF' } : {}}
  className={`flex-1 py-3 rounded-xl transition-all hover:scale-105 ${theme.card}`}
>
  Отмена
</button>
            </div>
          </div>
        </div>
      )}

      {showTaskModal && selectedTask && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden ${theme.card}`}>
            <div className={`p-5 border-b ${isDark ? 'border-[#2A2A3A]' : 'border-gray-200'} flex justify-between items-start gap-4`}>
              <div>
                <h3 className={`font-bold text-2xl flex items-center gap-2 ${theme.text}`}>
                  <DocumentIcon isDark={isDark} />
                  {selectedTask.name}
                </h3>
                <p className={`text-sm mt-1 ${theme.textSecondary}`}>
                  Раздел для отправки письменного ответа и файла на проверку.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTaskModal(false)}
                className={`text-2xl font-bold transition hover:scale-110 ${isDark ? 'text-[#A78BFA]' : 'text-[#2563EB]'}`}
              >
                ✕
              </button>
            </div>

            <div className="p-5 max-h-[72vh] overflow-y-auto space-y-5 no-scrollbar" style={noScrollbar}>
              <div className={`rounded-2xl p-5 ${theme.cardInner}`}>
                <div className={`text-sm space-y-1 ${theme.text}`}>
                  <p><span className="font-bold">Открыто с:</span> {getTaskOpenText(selectedTask)}</p>
                  <p><span className="font-bold">Срок сдачи:</span> {getTaskDeadlineText(selectedTask)}</p>
                </div>
                <div className={`my-4 border-t ${isDark ? 'border-[#2A2A3A]' : 'border-gray-300'}`} />
                <p className={`text-sm leading-relaxed whitespace-pre-line ${theme.textSecondary}`}>
                  {selectedTask.description}
                </p>
              </div>

              {!approvedApplication && (
                <div className={`rounded-2xl p-4 border ${isDark ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-200' : 'border-yellow-300 bg-yellow-50 text-yellow-800'}`}>
                  <p className="text-sm font-medium">Преподаватель ещё не закреплён.</p>
                  <p className="text-xs mt-1">
                    Пока можно посмотреть задание и открыть демонстрационную форму добавления ответа. Реальная отправка на проверку станет доступна после одобрения заявки научным руководителем.
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setTaskEditMode(true)}
                  disabled={selectedTask.status === 'blocked'}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105 ${
                    selectedTask.status === 'blocked'
                      ? isDark ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : isDark ? 'bg-[#A78BFA] text-white hover:bg-[#9B7BEA]' : 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]'
                  }`}
                >
                  {getTaskHasAnswer(selectedTask, hasApprovedTeacher) ? 'Редактировать ответ' : 'Добавить ответ'}
                </button>

                <button
                  type="button"
                  onClick={() => deleteTaskAnswer(selectedTask.id)}
                  disabled={!hasApprovedTeacher || !getTaskHasAnswer(selectedTask, hasApprovedTeacher)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105 ${
                    (!hasApprovedTeacher || !getTaskHasAnswer(selectedTask, hasApprovedTeacher))
                      ? isDark ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                >
                  Удалить ответ
                </button>
              </div>

              <div>
                <h4 className={`text-xl font-bold mb-3 ${theme.text}`}>Состояние ответа</h4>
                <div className={`overflow-hidden rounded-xl border ${isDark ? 'border-[#2A2A3A]' : 'border-gray-200'}`}>
                  {[
                    ['Номер попытки', hasApprovedTeacher && getTaskHasAnswer(selectedTask, hasApprovedTeacher) ? `Попытка ${Math.max(selectedTask.attempts || 1, 1)} из ${selectedTask.maxAttempts || 1}` : '—'],
                    ['Состояние ответа на задание', getTaskSubmissionStatusText(selectedTask, hasApprovedTeacher), 'highlight'],
                    ['Состояние оценивания', getTaskGradingStatusText(selectedTask, hasApprovedTeacher)],
                    ['Оставшееся время', getTaskRemainingText(selectedTask, hasApprovedTeacher), 'highlight'],
                    ['Последнее изменение', getTaskLastChangeText(selectedTask, hasApprovedTeacher)],
                  ].map(([label, value, highlight]) => (
                    <div key={label} className={`grid grid-cols-1 sm:grid-cols-[240px_1fr] border-b last:border-b-0 ${isDark ? 'border-[#2A2A3A]' : 'border-gray-200'}`}>
                      <div className={`p-3 text-sm font-bold ${theme.text} ${isDark ? 'bg-[#15151F]' : 'bg-gray-50'}`}>{label}</div>
                      <div className={`p-3 text-sm ${theme.text} ${highlight ? (isDark ? 'bg-green-500/10' : 'bg-green-100') : ''}`}>{value}</div>
                    </div>
                  ))}

                  <div className={`grid grid-cols-1 sm:grid-cols-[240px_1fr] border-b ${isDark ? 'border-[#2A2A3A]' : 'border-gray-200'}`}>
                    <div className={`p-3 text-sm font-bold ${theme.text} ${isDark ? 'bg-[#15151F]' : 'bg-gray-50'}`}>Ответ в виде файла</div>
                    <div className={`p-3 text-sm ${theme.text}`}>
                      {selectedTask.files && selectedTask.files.length > 0 ? (
                        <div className="space-y-2">
                          {selectedTask.files.map((file, i) => (
                            <div key={i} className={`inline-flex mr-2 mb-2 items-center gap-2 px-3 py-2 rounded-lg ${isDark ? 'bg-[#121218]' : 'bg-gray-50'}`}>
                              <DocumentIcon isDark={isDark} />
                              <span>{file}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className={theme.textMuted}>{hasApprovedTeacher ? 'Файл не прикреплён' : 'Файл не выбран. Нажмите «Добавить ответ», чтобы открыть демонстрационную форму прикрепления.'}</span>
                      )}
                    </div>
                  </div>

                  <div className={`grid grid-cols-1 sm:grid-cols-[240px_1fr] ${isDark ? 'border-[#2A2A3A]' : 'border-gray-200'}`}>
                    <div className={`p-3 text-sm font-bold ${theme.text} ${isDark ? 'bg-[#15151F]' : 'bg-gray-50'}`}>Письменный ответ</div>
                    <div className={`p-3 text-sm ${theme.text}`}>
                      {selectedTask.answerText ? (
                        <p className="whitespace-pre-line">{selectedTask.answerText}</p>
                      ) : (
                        <span className={theme.textMuted}>{hasApprovedTeacher ? 'Письменный ответ пока не добавлен' : 'Письменный ответ не добавлен. Нажмите «Добавить ответ», чтобы открыть демонстрационную форму.'}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {taskEditMode && selectedTask.status !== 'blocked' && (
                <div className={`rounded-2xl p-4 ${theme.cardInner}`}>
                  <h4 className={`font-semibold mb-3 ${theme.text}`}>{hasApprovedTeacher ? 'Отправка ответа' : 'Демонстрационное добавление ответа'}</h4>
                  {!hasApprovedTeacher && (
                    <p className={`text-xs mb-3 ${theme.textSecondary}`}>Форма раскрыта для демонстрации: можно ввести текст и выбрать файл, но статус задания не изменится на «отправлено» до закрепления руководителя.</p>
                  )}
                  <textarea
                    value={taskAnswerText}
                    onChange={(e) => setTaskAnswerText(e.target.value)}
                    placeholder="Введите письменный ответ..."
                    rows={5}
                    className={`w-full p-3 rounded-xl text-sm focus:outline-none resize-none ${theme.input}`}
                  />

                  <div className="mt-3 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <label className={`inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all hover:scale-105 ${isDark ? 'bg-[#A78BFA]/20 text-[#A78BFA] border border-[#A78BFA]/30 hover:bg-[#A78BFA]/30' : 'bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20 hover:bg-[#2563EB]/20'}`}>
                      <span className="mr-2 text-lg">📎</span>
                      {taskSelectedFile ? taskSelectedFile.name : 'Добавить файл'}
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => setTaskSelectedFile(e.target.files?.[0] || null)}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => uploadFileToTask(selectedTask.id)}
                      className={`px-5 py-2 rounded-xl font-medium text-white transition-all hover:scale-105 ${isDark ? 'bg-[#A78BFA] hover:bg-[#9B7BEA]' : 'bg-[#2563EB] hover:bg-[#1D4ED8]'}`}
                    >
                      {hasApprovedTeacher ? 'Отправить' : 'Сохранить черновик'}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <h4 className={`text-xl font-bold mb-3 ${theme.text}`}>Проверка преподавателя</h4>
                <div className={`overflow-hidden rounded-xl border ${isDark ? 'border-[#2A2A3A]' : 'border-gray-200'}`}>
                  {[
                    ['Закрепленный преподаватель', approvedApplication?.teacherName || approvedApplication?.teacher || 'Преподаватель ещё не закреплён'],
                    ['Комментарий преподавателя', hasApprovedTeacher ? (selectedTask.feedback || 'Комментарий пока не добавлен') : 'Появится после закрепления преподавателя и проверки ответа'],
                    ['Оценка', hasApprovedTeacher ? (selectedTask.grade || 'Не выставлена') : 'Недоступна до закрепления преподавателя'],
                  ].map(([label, value]) => (
                    <div key={label} className={`grid grid-cols-1 sm:grid-cols-[240px_1fr] border-b last:border-b-0 ${isDark ? 'border-[#2A2A3A]' : 'border-gray-200'}`}>
                      <div className={`p-3 text-sm font-bold ${theme.text} ${isDark ? 'bg-[#15151F]' : 'bg-gray-50'}`}>{label}</div>
                      <div className={`p-3 text-sm ${theme.text}`}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

          {/* Градиентное размытие под панелью навигации */}
      <div className="fixed bottom-0 left-0 right-0 h-28 sm:h-32 z-30 pointer-events-none" 
        style={{ 
          background: isDark 
            ? 'linear-gradient(to top, rgba(18,18,24,0.95) 0%, rgba(18,18,24,0.85) 15%, rgba(18,18,24,0.5) 40%, rgba(18,18,24,0.1) 70%, rgba(18,18,24,0) 100%)' 
            : 'linear-gradient(to top, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 15%, rgba(255,255,255,0.5) 40%, rgba(255,255,255,0.1) 70%, rgba(255,255,255,0) 100%)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 30%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 30%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0) 100%)'
        }}>
      </div>

      {/* Панель навигации */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-3 sm:pb-4 pt-2">
        <div className={`rounded-full px-1.5 sm:px-2 py-1.5 sm:py-2 shadow-2xl ${theme.bottomBar}`}>
          <div className="flex items-center gap-0.5 sm:gap-1">
            {['home', 'course', 'services', 'profile'].map(id => {
              const icons = { home: HomeIcon, course: CourseIcon, services: ServicesIcon, profile: ProfileIcon };
              const labels = { home: 'Главная', course: 'Курс', services: 'Сервисы', profile: 'Профиль' };
              const Icon = icons[id];
              return (
                <button key={id} onClick={() => setActiveTab(id)} className={`relative px-3 sm:px-5 py-1.5 sm:py-2 rounded-full transition-all duration-200 flex flex-col items-center`}>
                  <Icon active={activeTab === id} isDark={isDark} />
                  <span className={`text-[10px] sm:text-xs font-medium mt-0.5 ${activeTab === id ? (isDark ? 'text-[#A78BFA]' : 'text-[#2563EB]') : (isDark ? 'text-gray-400' : 'text-gray-500')}`}>
                    {labels[id]}
                  </span>
                  {activeTab === id && (
                    <span className={`absolute bottom-[-4px] w-1 h-1 rounded-full ${isDark ? 'bg-[#A78BFA]' : 'bg-[#2563EB]'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentCabinet;