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
  console.log('--- createEmployee call start ---');
  console.log('Input data:', JSON.stringify({ ...data, password: '***' }));
  
  try {
    if (!adminAuth || !adminDb) {
      console.error('Firebase Admin not initialized. adminAuth:', !!adminAuth, 'adminDb:', !!adminDb);
      throw new Error('Configuración de Firebase Admin incompleta. Por favor, verifica el secreto SERVICE_ACCOUNT_KEY en el panel de control.');
    }

    // 1. Prepare data and handle potential string dates from Server Action serialization
    const hireDate = data.hireDate instanceof Date ? data.hireDate : new Date(data.hireDate);
    console.log('Parsed hireDate:', hireDate.toISOString());

    // 2. Create user in Firebase Auth
    console.log('Step 1: Creating user in Firebase Auth for:', data.email);
    let userRecord;
    try {
        userRecord = await adminAuth.createUser({
            email: data.email,
            password: data.password || Math.random().toString(36).slice(-10),
            displayName: data.name,
        });
        console.log('User created successfully. UID:', userRecord.uid);
    } catch (authError: any) {
        console.error('Error creating Auth user:', authError);
        throw new Error(`Error en Firebase Auth: ${authError.message}`);
    }

    // 3. Set initial custom claims (employee by default)
    console.log('Step 2: Setting custom claims for:', userRecord.uid);
    try {
        await adminAuth.setCustomUserClaims(userRecord.uid, {
            employee: true,
            manager: false,
            admin: false
        });
        console.log('Claims set successfully.');
    } catch (claimsError: any) {
        console.error('Error setting claims:', claimsError);
        // We continue even if claims fail, but log it
    }

    // 4. Create employee document in Firestore
    console.log('Step 3: Creating Firestore document in employees collection');
    const employeeData = {
      uid: userRecord.uid,
      name: data.name,
      email: data.email,
      jobTitle: data.jobTitle,
      department: data.department,
      status: data.status,
      hireDate: hireDate,
      avatarUrl: `https://picsum.photos/seed/${userRecord.uid.substring(0, 5)}/100/100`,
      role: 'employee',
      createdAt: new Date(),
    };

    try {
        await adminDb.collection('employees').doc(userRecord.uid).set(employeeData);
        console.log('Firestore document created successfully.');
    } catch (dbError: any) {
        console.error('Error writing to Firestore:', dbError);
        throw new Error(`Error en Firestore: ${dbError.message}`);
    }

    revalidatePath('/employees');
    console.log('--- createEmployee call success ---');
    
    return { success: true, uid: userRecord.uid };
  } catch (error: any) {
    console.error('--- createEmployee call failed ---');
    console.error('Final Error:', error);
    return { 
      success: false, 
      error: error.message || 'Error desconocido al crear el empleado' 
    };
  }
}
