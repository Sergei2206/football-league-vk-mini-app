import { db } from '../firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

const APP_ADMINS_DOC_ID = 'main';
const SUPER_ADMIN_ID = 91747933;

// Получить данные об админах приложения
export const getAppAdmins = async () => {
  const docRef = doc(db, 'appAdmins', APP_ADMINS_DOC_ID);
  const snapshot = await getDoc(docRef);
  
  if (!snapshot.exists()) {
    // Инициализация при первом запуске
    await updateDoc(docRef, {
      superAdminId: SUPER_ADMIN_ID,
      admins: [SUPER_ADMIN_ID]
    });
    return { superAdminId: SUPER_ADMIN_ID, admins: [SUPER_ADMIN_ID] };
  }
  
  return snapshot.data();
};

// Проверить, является ли пользователь админом приложения
export const isAppAdmin = async (userId: number): Promise<boolean> => {
  const data = await getAppAdmins();
  return data.admins.includes(userId);
};

// Проверить, является ли пользователь главным админом
export const isSuperAdmin = (userId: number): boolean => {
  return userId === SUPER_ADMIN_ID;
};

// Добавить админа (только главный админ)
export const addAppAdmin = async (newAdminId: number) => {
  const docRef = doc(db, 'appAdmins', APP_ADMINS_DOC_ID);
  await updateDoc(docRef, {
    admins: arrayUnion(newAdminId)
  });
};

// Удалить админа (только главный админ)
export const removeAppAdmin = async (adminId: number) => {
  const docRef = doc(db, 'appAdmins', APP_ADMINS_DOC_ID);
  await updateDoc(docRef, {
    admins: arrayRemove(adminId)
  });
};