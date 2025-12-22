# Abuse Detection vs Crisis Detection    

##   

### 1. **Crisis Detection System**  

####  
- ** **: `CrisisAlert`
- ****: `CrisisType[]` (SUICIDE, SELF_HARM, DRUG, CHILD_ABUSE, SERIOUS_MEDICAL, TERRORISM)
- ** **: `risk_level` (0-4)
- ** **: `CrisisAlertStatus` (PENDING, CONFIRMED, FALSE_POSITIVE, HANDLED, DISMISSED)
- ****: `ai_ethics_tags` (String[])
- ****: `detected_patterns` (String[])
- ** **: `reviewed_by`, `reviewed_at`, `admin_notes`, `action_taken`

####  
1. AI  (GPT-5 Mini / Gemini 2.5 Flash)
2.  Fail-Safe
3.   

####  
-    (   )
-  `CrisisAlert`  
-    (`/admin/monitoring/crisis`)
-    API (`PATCH /api/admin/crisis-alerts/[id]`)
-    

---

### 2. **Abuse Detection System**   

####  
- **DiaryEntry **: `exclude_from_analysis` (Boolean)
- **AnalysisSystemMetadata **: `content_flags` (String[]) - `analysisTags` 
- ** **: `AbusePattern` (RAPID_REQUESTS, REPETITIVE_CONTENT, SUSPICIOUS_PROMPTS, TOKEN_ABUSE, MULTI_ACCOUNT, API_SCRAPING)
- ** **: `PenaltyLevel` (WARNING, RATE_LIMIT, TEMPORARY_BAN, PERMANENT_BAN)

####  
1.    (Rate Limiting)
2.    
   -  : `exclude_from_analysis = true` ( )
   -   : `content_flags`  ( )

####  
-    (   )
-  `LoginLog`  ()
-   AbuseAlert  
-    
-    API 
-     
-  TODO : "      ( )"

---

## 

1. ** **:       
2. ** **:     (crisis: `ai_ethics_tags`, abuse: `content_flags`)
3. **  **:      
4. ** **:       
5. ** **:       / 

---

## 

|  | Crisis | Abuse |
|------|-------|-------|
| **** |   (  ) |   ( ) |
| **** |  (  ) |  ( ) |
| ** ** |  `CrisisAlert`  | `DiaryEntry` + `AnalysisSystemMetadata` |
| ** ** | `CrisisAlertStatus` enum |  () |
| ** UI** |   |   |
| ** ** |   |   |
| ** ** |  ( ) |  Rate Limiting  |

---

## / 

###  1: AbuseAlert   (CrisisAlert  )

**:**
- Crisis      
-    
-   

** :**
```prisma
model AbuseAlert {
  id                 String  @id @default(uuid())
  user_id            String
  diary_id           String?
  analysis_result_id String?
  
  //   
  abuse_patterns     AbusePattern[]  //   
  penalty_level      PenaltyLevel    //  
  status             AbuseAlertStatus @default(PENDING) // PENDING, REVIEWED, DISMISSED, ACTION_TAKEN
  
  //  
  content_flags      String[]  //  (jailbreak_attempt, vector_injection )
  detected_patterns String[]  //   
  
  //  
  reviewed_by        String?
  reviewed_at        DateTime?
  admin_notes        String?
  action_taken       String?
  
  created_at         DateTime @default(now())
  updated_at         DateTime @updatedAt
}
```

###  2:    +   API 

**:**
-    
-   

**:**
- `DiaryEntry.exclude_from_analysis = true`  `AnalysisSystemMetadata.content_flags`    API
-    

###  3:  Alert  (Crisis + Abuse)

**:**
-     
-   

**:**
- Crisis Abuse   (  vs  )
-    

---

##  

** 1 .** :

1. ****: Crisis     
2. ****:      
3. ** **:        
4. ****:        

###  

1. **Phase 1**: `AbuseAlert`   + 
2. **Phase 2**: `abuse-detection.ts` `AbuseAlert`   
3. **Phase 3**:   API (`/api/admin/abuse-alerts`)
4. **Phase 4**:   UI (`/admin/monitoring/abuse`)
5. **Phase 5**:   API (`PATCH /api/admin/abuse-alerts/[id]`)

---

##   

###    
- Crisis:   ( →  →   →  )
- Abuse:     

###    
- Abuse:    
- Abuse:    
- Abuse:    

###   
    1 (AbuseAlert )   

