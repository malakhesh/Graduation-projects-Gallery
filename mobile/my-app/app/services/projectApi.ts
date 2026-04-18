// app/services/projectApi.ts

import { getApproved, addProj, getUserProjs } from '../../backend/projects';
import { getUser } from '../../backend/auth';

export interface Project {
  id: string;
  title: string;
  desc: string;
  userId: string;
  year: string | null;
  stack: string[];
  category: string;
  gitLink: string;
  imgUrl: string;
  tags: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
  comments?: any[];
  ratings?: number[];
}

// جلب المشاريع المقبولة فقط
export async function fetchApprovedProjects(): Promise<Project[]> {
  try {
    const result = await getApproved();
    if (result === 'approved-fail') return [];
    return result as Project[];
  } catch (error) {
    console.error('fetchApprovedProjects error:', error);
    return [];
  }
}

// جلب مشاريع مستخدم معين
export async function fetchUserProjects(userId: string): Promise<Project[]> {
  try {
    const result = await getUserProjs(userId);
    if (result === 'user-fail') return [];
    return result as Project[];
  } catch (error) {
    console.error('fetchUserProjects error:', error);
    return [];
  }
}

// إضافة مشروع جديد (status = pending)
export async function createProject(projectData: {
  title: string;
  desc: string;
  userId: string;
  year: string | null;
  stack: string[];
  category: string;
  gitLink: string;
  imgUrl: string;
  tags: string[];
}): Promise<string> {
  try {
    const result = await addProj(
      projectData.title,
      projectData.desc,
      projectData.userId,
      projectData.year,
      projectData.stack,
      projectData.category,
      projectData.gitLink,
      projectData.imgUrl,
      projectData.tags
    );
    return result; // project id or 'add-fail'
  } catch (error) {
    console.error('createProject error:', error);
    return 'add-fail';
  }
}

// جلب بيانات المستخدم من Firestore
export async function getCurrentUserData(uid: string) {
  try {
    const result = await getUser(uid);
    if (result === 'get-fail' || result === 'no-data') return null;
    return result;
  } catch (error) {
    console.error('getCurrentUserData error:', error);
    return null;
  }
}

// جلب السنة الدراسية للمستخدم
export async function getCurrentUserYear(uid: string): Promise<string | null> {
  const userData = await getCurrentUserData(uid);
  return userData?.year || null;
}