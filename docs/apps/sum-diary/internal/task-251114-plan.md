# Task 251114 – Crisis Monitoring Follow-up Plan

## Background
- A previously resolved crisis alert (status `FALSE_POSITIVE`) still appears as "확인 필요" in the monitoring list because the urgent flag only checks `risk_level >= 3`, ignoring the resolved status.
- This causes confusion for operators who already triaged and closed the alert.

## Implementation (Completed)

### 1. Updated Urgency Logic ✅
- **File**: `app/admin/monitoring/crisis/page.tsx`
- **Changes**:
  - Modified `isUrgent()` function to exclude resolved statuses (`FALSE_POSITIVE`, `HANDLED`, `DISMISSED`) from urgent badge display
  - Added explicit status check: only `PENDING` and `CONFIRMED` alerts can be marked as urgent
  - Added inline documentation explaining the urgency rule to prevent future regressions
- **Logic**:
  ```typescript
  const isUrgent = (alert: CrisisAlert): boolean => {
    // 해결된 상태는 urgent 아님
    const resolvedStatuses = ['FALSE_POSITIVE', 'HANDLED', 'DISMISSED'];
    if (resolvedStatuses.includes(alert.status)) {
      return false;
    }
    
    // 활성 상태(PENDING, CONFIRMED)만 urgent 판단
    const activeStatuses = ['PENDING', 'CONFIRMED'];
    if (!activeStatuses.includes(alert.status)) {
      return false;
    }
    
    // 위험도 4 이상 또는 Escalation된 항목 또는 위험도 3 이상
    return alert.risk_level >= 4 || 
           (alert.historical_context?.escalated === true) ||
           alert.risk_level >= 3;
  };
  ```

### 2. Added "확인 완료" Badge ✅
- **Enhancement**: Added a muted "확인 완료" badge for resolved alerts (`FALSE_POSITIVE`, `HANDLED`, `DISMISSED`)
- **Purpose**: Allows operators to distinguish resolved items at a glance without opening the detail view
- **Visual**: Gray badge with check icon, non-pulsing

### 3. Backend API Verification ✅
- **File**: `app/api/admin/crisis-alerts/route.ts`
- **Status**: Already correctly filters by status when `urgentOnly=true`
- **Logic**: API restricts results to `status in ['PENDING', 'CONFIRMED']` when `urgentOnly` is enabled

## Testing Checklist
- [ ] Verify that `FALSE_POSITIVE` alerts never show the "지금 확인 필요" badge
- [ ] Verify that `HANDLED` alerts never show the "지금 확인 필요" badge
- [ ] Verify that `DISMISSED` alerts never show the "지금 확인 필요" badge
- [ ] Verify that resolved alerts show the "확인 완료" badge
- [ ] Verify that `PENDING` alerts with `risk_level >= 3` still show the urgent badge
- [ ] Verify that `CONFIRMED` alerts with `risk_level >= 3` still show the urgent badge
- [ ] Verify that `urgentOnly` filter only shows active high-risk alerts
- [ ] Verify that alerts with `risk_level >= 4` still show urgent badge (when status is active)
- [ ] Verify that escalated alerts still show urgent badge (when status is active)

## Notes
- The urgency rule is now documented inline in the code to prevent future regressions
- The backend API already had correct filtering logic; only the frontend display logic needed updating
- The "확인 완료" badge provides better visual feedback for resolved items
