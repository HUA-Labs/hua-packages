#      

##    

### 
     ,    

---

##    

### 1.    ( )

|  |   |  |
|------|----------|------|
|  | → [] | "" → "[]" |
|  | → [] | "010-1234-5678" → "[]" |
|  | → [] | "user@example.com" → "[]" |
|  | → [] | " " → "[]" |
|  | → [] | "123456-1234567" → "[]" |
|  | → [] | "OO 123-456" → "[]" |
|  | → [] | "1234-5678-9012-3456" → "[]" |

### 2.    (   )

|  |   |  |
|------|----------|------|
|    | → []   | "OO " → "[]" |
|   (, ) | → [] | "OO" → "[]" |
|    | →  | "25" → "[20]" |
|   | → [] | "" → "[]"   (  ) |

### 3.   ()

|  |   |  |
|------|----------|------|
|   | →  | ", ,  1" → "[]" |
|   | → [] | "" → "[]" |

---

##    

###   

#### 🟢  (Low)
-   
-    
-   

**:**
```
"   .  ."
→  ,  
```

#### 🟡  (Medium)
-    
-     

**:**
```
"[] []   . 
OO  ."
→  +        
```

####   (High)
-  ,  ,      

**:**
```
"[] []  [] . 
    . 
[20 ] []."
→  +  +  +     
```

---

##     

### 1.   

```typescript
function assessReidentificationRisk(
  anonymizedText: string,
  originalPatterns: string[]
): 'low' | 'medium' | 'high' {
  let riskScore = 0;
  
  // 1.    (10)
  const locationPatterns = [
    /\[\]|\[\]|\[\]/g,
    / | /g
  ];
  if (locationPatterns.some(p => p.test(anonymizedText))) {
    riskScore += 10;
  }
  
  // 2.  +   (15)
  if (/\[\].*\[\]|\[\].*\[\]/.test(anonymizedText)) {
    riskScore += 15;
  }
  
  // 3.  +   (10)
  if (/\[20\]|\[30\]|\[\].*\[\]/.test(anonymizedText)) {
    riskScore += 10;
  }
  
  // 4.   +   (15)
  if (/\[\].*\[\]/.test(anonymizedText)) {
    riskScore += 15;
  }
  
  // 5.    (10)
  const uniquePatterns = new Set(originalPatterns);
  if (uniquePatterns.size <= 3) {
    riskScore += 10; //      
  }
  
  // 
  if (riskScore >= 40) return 'high';
  if (riskScore >= 20) return 'medium';
  return 'low';
}
```

### 2.  

#### 🟢 Low
-    
-    

#### 🟡 Medium
-    
-     ( → [],  → [])
-    

####  High
-        
-    
-       

---

##    

###  

```typescript
interface RiskAssessmentLog {
  assessedAt: string; //  
  riskLevel: 'low' | 'medium' | 'high';
  riskScore: number; //  (0-100)
  riskFactors: string[]; //   
  anonymizedBefore: string; //     ()
  anonymizedAfter: string; //     (  )
  actionTaken: string; //  
}
```

### 

```json
{
  "assessedAt": "2025-11-07T10:30:00Z",
  "riskLevel": "medium",
  "riskScore": 25,
  "riskFactors": [
    "  ",
    " +  "
  ],
  "anonymizedBefore": "[] [] ...",
  "anonymizedAfter": "[] []...",
  "actionTaken": " →  "
}
```

---

##   

```
1.   
   ↓
2. filterSensitiveInfo() 
   →   (,  )
   ↓
3.   
   → assessReidentificationRisk()
   ↓
4.  
    Low →   
    Medium →   
    High →      
   ↓
5.    
   → risk_assessment_log 
   ↓
6.    
   → diary_full_anonymized
```

---

##   

### GDPR 
-      
-       

### DSR (  ) 
-      
-     

### (Audit) 
-      
- , ,     

---

##  

###  
- [ ]      
- [ ]     
- [ ]    
- [ ]    
- [ ]    

###    
- [ ]    
- [ ]     
- [ ]    
- [ ]     

---

##  

** :**
1. ** **:     
2. **  **:       
3. ** **:     
4. ** **:        

