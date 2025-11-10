import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  Timestamp,
  doc,
  getDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/firebase/config';

export interface DocumentRecord {
  id?: string;
  userId: string;
  type: 'generated' | 'scanned';
  documentType?: string; // For generated documents: 'nda', 'rent', etc.
  title: string;
  language?: string;
  simplifiedLanguage?: string; // For scanned documents
  createdAt: Timestamp;
  metadata?: {
    partyName?: string;
    effectiveDate?: string;
    simplifiedLanguage?: string;
  };
}

/**
 * Save a document generation record
 */
export async function saveDocumentGeneration(
  userId: string,
  documentType: string,
  title: string,
  language: string,
  metadata?: {
    partyName?: string;
    effectiveDate?: string;
  }
): Promise<void> {
  try {
    console.log('Saving document generation:', { userId, documentType, title, language });
    const docRef = await addDoc(collection(db, 'documents'), {
      userId,
      type: 'generated',
      documentType,
      title,
      language,
      createdAt: Timestamp.now(),
      metadata: metadata || {},
    });
    console.log('Document saved successfully with ID:', docRef.id);
  } catch (error) {
    console.error('Error saving document generation:', error);
    // Log the full error for debugging
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
    }
    // Don't throw - tracking shouldn't break the main flow
  }
}

/**
 * Save a document scanning record
 */
export async function saveDocumentScanning(
  userId: string,
  title: string,
  simplifiedLanguage?: string
): Promise<void> {
  try {
    await addDoc(collection(db, 'documents'), {
      userId,
      type: 'scanned',
      title,
      simplifiedLanguage: simplifiedLanguage || null,
      createdAt: Timestamp.now(),
      metadata: {
        simplifiedLanguage: simplifiedLanguage || undefined,
      },
    });
  } catch (error) {
    console.error('Error saving document scanning:', error);
    // Don't throw - tracking shouldn't break the main flow
  }
}

/**
 * Get user's document statistics
 */
export async function getUserDocumentStats(userId: string): Promise<{
  totalDocuments: number;
  generatedDocuments: number;
  scannedDocuments: number;
  documentsByType: Record<string, number>;
  recentDocuments: DocumentRecord[];
}> {
  try {
    const documentsRef = collection(db, 'documents');
    let querySnapshot;
    
    try {
      // Try with orderBy first
      const q = query(
        documentsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      querySnapshot = await getDocs(q);
    } catch (error: any) {
      // If orderBy fails (no index or permission), try without it
      console.warn('Query with orderBy failed, trying without orderBy:', error.message);
      const q = query(
        documentsRef,
        where('userId', '==', userId)
      );
      querySnapshot = await getDocs(q);
    }
    
    const documents: DocumentRecord[] = [];
    
    querySnapshot.forEach((doc) => {
      documents.push({
        id: doc.id,
        ...doc.data(),
      } as DocumentRecord);
    });
    
    // Sort client-side if orderBy wasn't used
    documents.sort((a, b) => {
      const aTime = a.createdAt?.toMillis() || 0;
      const bTime = b.createdAt?.toMillis() || 0;
      return bTime - aTime; // Descending order
    });
    
    const generated = documents.filter(d => d.type === 'generated');
    const scanned = documents.filter(d => d.type === 'scanned');
    
    const documentsByType: Record<string, number> = {};
    generated.forEach(doc => {
      const type = doc.documentType || 'unknown';
      documentsByType[type] = (documentsByType[type] || 0) + 1;
    });
    
    return {
      totalDocuments: documents.length,
      generatedDocuments: generated.length,
      scannedDocuments: scanned.length,
      documentsByType,
      recentDocuments: documents.slice(0, 10), // Last 10 documents
    };
  } catch (error: any) {
    console.error('Error fetching document stats:', error);
    if (error.code === 'permission-denied') {
      console.error('Permission denied. Please check Firestore security rules.');
    }
    return {
      totalDocuments: 0,
      generatedDocuments: 0,
      scannedDocuments: 0,
      documentsByType: {},
      recentDocuments: [],
    };
  }
}

/**
 * Get recent scanned documents
 */
export async function getRecentScannedDocuments(
  userId: string,
  limitCount: number = 5
): Promise<DocumentRecord[]> {
  try {
    const documentsRef = collection(db, 'documents');
    // First get all user documents, then filter and sort client-side
    // This avoids needing a composite index initially
    const q = query(
      documentsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const documents: DocumentRecord[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Filter scanned documents
      if (data.type === 'scanned') {
        documents.push({
          id: doc.id,
          ...data,
        } as DocumentRecord);
      }
    });
    
    // Return limited results
    return documents.slice(0, limitCount);
  } catch (error) {
    console.error('Error fetching recent scanned documents:', error);
    // If orderBy fails (no index), try without orderBy
    try {
      const documentsRef = collection(db, 'documents');
      const q = query(
        documentsRef,
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const documents: DocumentRecord[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.type === 'scanned') {
          documents.push({
            id: doc.id,
            ...data,
          } as DocumentRecord);
        }
      });
      
      // Sort client-side by createdAt
      documents.sort((a, b) => {
        const aTime = a.createdAt?.toMillis() || 0;
        const bTime = b.createdAt?.toMillis() || 0;
        return bTime - aTime;
      });
      
      return documents.slice(0, limitCount);
    } catch (fallbackError) {
      console.error('Error in fallback query:', fallbackError);
      return [];
    }
  }
}

