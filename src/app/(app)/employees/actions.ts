'use server';

import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { revalidatePath } from 'next/cache';

export async function createEmployee(data: {
  name: string;
  email: string;
  password?: string;
  jobTitle: string;
  department: string;
  status: 'Active' | 'On Leave' | 'Terminated';
  hireDate: Date;
}) {
  try {
    // 1. Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email: data.email,
      password: data.password || Math.random().toString(36).slice(-10), // Random password if not provided
      displayName: data.name,
    });

    // 2. Set initial custom claims (employee by default)
    await adminAuth.setCustomUserClaims(userRecord.uid, {
        employee: true,
        manager: false,
        admin: false
    });

    // 3. Create employee document in Firestore
    const employeeData = {
      uid: userRecord.uid,
      name: data.name,
      email: data.email,
      jobTitle: data.jobTitle,
      department: data.department,
      status: data.status,
      hireDate: data.hireDate,
      avatarUrl: `https://picsum.photos/seed/${userRecord.uid.substring(0, 5)}/100/100`,
      role: 'employee',
      createdAt: new Date(),
    };

    await adminDb.collection('employees').doc(userRecord.uid).set(employeeData);

    revalidatePath('/employees');
    
    return { success: true, uid: userRecord.uid };
  } catch (error: any) {
    console.error('Error creating employee:', error);
    return { 
      success: false, 
      error: error.message || 'Error desconocido al crear el empleado' 
    };
  }
}
