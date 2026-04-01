# Firestore Setup Instructions

## Issue: "Insufficient Permission" Error

Agar aapko "insufficient permission" error aa raha hai, to Firestore security rules ko configure karna hoga.

## Solution 1: Firebase Console se Rules Set Karein (Recommended)

### Step 1: Firebase Console mein jayein
1. [Firebase Console](https://console.firebase.google.com/) mein jayein
2. Apna project select karein: `covenai-c09d6`
3. Left sidebar mein **Firestore Database** click karein

### Step 2: Security Rules Update Karein
1. **Rules** tab pe click karein
2. Neeche diye gaye rules ko paste karein:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the document
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Documents collection rules
    match /documents/{documentId} {
      // Allow read if user owns the document
      allow read: if isOwner(resource.data.userId);
      
      // Allow create if user is authenticated and sets their own userId
      allow create: if isAuthenticated() 
        && request.resource.data.userId == request.auth.uid
        && request.resource.data.type in ['generated', 'scanned'];
      
      // Allow update if user owns the document
      allow update: if isOwner(resource.data.userId) 
        && request.resource.data.userId == resource.data.userId;
      
      // Allow delete if user owns the document
      allow delete: if isOwner(resource.data.userId);
      
      // Allow listing user's own documents
      allow list: if isAuthenticated() && request.query.limit <= 100;
    }
  }
}
```

3. **Publish** button click karein

## Solution 2: Test Mode (Development Only - NOT for Production)

Agar aap development/testing kar rahe ho, to temporarily test mode enable kar sakte ho:

⚠️ **WARNING: Ye sirf development ke liye hai. Production mein use mat karein!**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 12, 31);
    }
  }
}
```

## Solution 3: Firebase CLI se Deploy Karein

Agar aap Firebase CLI use kar rahe ho:

1. Firebase CLI install karein (agar nahi hai):
```bash
npm install -g firebase-tools
```

2. Login karein:
```bash
firebase login
```

3. Project initialize karein:
```bash
firebase init firestore
```

4. Rules deploy karein:
```bash
firebase deploy --only firestore:rules
```

## Verification

Rules set karne ke baad:
1. Browser console check karein - koi permission errors nahi hone chahiye
2. Document generate karke test karein
3. Dashboard mein statistics check karein

## Troubleshooting

### Agar abhi bhi error aa raha hai:

1. **Check karein ki user authenticated hai:**
   - Browser console mein `auth.currentUser` check karein
   - Login properly hua hai ya nahi verify karein

2. **Check Firestore Rules:**
   - Firebase Console → Firestore Database → Rules
   - Rules properly publish hui hai ya nahi check karein

3. **Check Browser Console:**
   - Koi specific error messages check karein
   - Network tab mein Firestore requests check karein

4. **Firestore Index:**
   - Agar composite query use kar rahe ho, to index create karna padega
   - Firebase Console automatically index creation link provide karega

## Security Best Practices

1. **Production Rules:**
   - Test mode use mat karein production mein
   - Proper authentication checks add karein
   - User-specific data access restrict karein

2. **Data Validation:**
   - Client-side data validate karein
   - Server-side validation bhi add karein (agar backend hai)

3. **Rate Limiting:**
   - Agar possible ho, to rate limiting add karein
   - Firebase App Check use karein for additional security

