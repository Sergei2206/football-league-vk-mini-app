import { db } from '../firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

const APP_ADMINS_DOC_ID = 'main';
const SUPER_ADMIN_ID = 91747933;

export const getAppAdmins = async () => {
  const docRef = doc(db, 'appAdmins', APP_ADMINS_DOC_ID);
  const snapshot = await getDoc(docRef);
  
  if (!snapshot.exists()) {
    // Инициализация
    await updateDoc(docRef, {
      superAdminId: SUPER_ADMIN_ID,
      admins: [SUPER_ADMIN_ID]
    });
    return { superAdminId: SUPER_ADMIN_ID, admins: [SUPER_ADMIN_ID] };
  }
  
  return snapshot.data();
};

export const isAppAdmin = async (userId: number): Promise<boolean> => {
  const data = await getAppAdmins();
  return Array.isArray(data.admins) && data.admins.includes(userId);
};

export const addAppAdmin = async (newAdminId: number) => {
  const docRef = doc(db, 'appAdmins', APP_ADMINS_DOC_ID);
  await updateDoc(docRef, {
    admins: arrayUnion(newAdminId)
  });
};

export const removeAppAdmin = async (adminId: number) => {
  const docRef = doc(db, 'appAdmins', APP_ADMINS_DOC_ID);
  await updateDoc(docRef, {
    admins: arrayRemove(adminId)
  });
};