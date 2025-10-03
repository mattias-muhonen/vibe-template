# TDD Test Plan

## Overview

This document outlines all tests that should be written FIRST (before implementation) for all features in the application. This follows our TDD approach where tests define the contract and drive implementation.

**Status:** Tests should be written for all features listed below  
**Purpose:** LLM + TDD Experiment Lab  
**Approach:** Gherkin Scenarios → Tests → Implementation

---

## ✅ COMPLETED: Authentication Tests

### Backend Tests
- ✅ `backend/src/test/kotlin/com/todo/resource/AuthResourceTest.kt` - Created (30+ tests)
- ✅ `backend/src/test/kotlin/com/todo/service/AuthServiceTest.kt` - Created (30+ tests)

### Frontend Tests
- ⏳ `frontend/src/__tests__/components/auth/RegisterForm.test.tsx` - TO CREATE
- ⏳ `frontend/src/__tests__/components/auth/LoginForm.test.tsx` - TO CREATE
- ⏳ `frontend/src/__tests__/components/auth/EmailVerification.test.tsx` - TO CREATE
- ⏳ `frontend/src/__tests__/hooks/useAuth.test.ts` - TO CREATE
- ⏳ `frontend/src/__tests__/api/authApi.test.ts` - TO CREATE
- ⏳ `frontend/src/__tests__/pages/signup.test.tsx` - TO CREATE
- ⏳ `frontend/src/__tests__/pages/login.test.tsx` - TO CREATE

---

## ✅ IN PROGRESS: Task Management Tests

### Backend Tests
- ✅ `backend/src/test/kotlin/com/todo/resource/TaskResourceTest.kt` - Created (25+ tests)
- ⏳ `backend/src/test/kotlin/com/todo/service/TaskServiceTest.kt` - TO CREATE

### Frontend Tests  
- ⏳ `frontend/src/__tests__/components/tasks/TaskList.test.tsx` - TO CREATE
- ⏳ `frontend/src/__tests__/components/tasks/TaskCard.test.tsx` - TO CREATE
- ⏳ `frontend/src/__tests__/components/tasks/TaskForm.test.tsx` - TO CREATE
- ⏳ `frontend/src/__tests__/components/tasks/TaskModal.test.tsx` - TO CREATE
- ⏳ `frontend/src/__tests__/components/tasks/AssigneeSelector.test.tsx` - TO CREATE
- ⏳ `frontend/src/__tests__/hooks/useTasks.test.ts` - TO CREATE
- ⏳ `frontend/src/__tests__/api/taskApi.test.ts` - TO CREATE

---

## 📋 TODO: Workspace Management Tests

Based on: `docs/specs/features/workspace-management.md`

### Backend Tests TO CREATE

#### `backend/src/test/kotlin/com/todo/resource/WorkspaceResourceTest.kt`

**Test Categories:**
1. **Create New Workspace (5 tests)**
   - Should create workspace with valid name and description
   - Should create workspace with only name (minimal)
   - Should assign creator as Admin role automatically
   - Should reject workspace creation without name
   - Should reject workspace creation without authentication

2. **Invite User to Workspace (8 tests)**
   - Should send invitation email to new user
   - Should record invitation as "Pending"
   - Should allow specifying role (Admin/Member)
   - Should reject invitation by non-admin
   - Should reject invitation to existing member
   - Should reject invitation with invalid email
   - Should allow admin to invite multiple users
   - Should generate unique invitation token

3. **Accept Workspace Invitation (6 tests)**
   - Should accept invitation with valid token
   - Should add user to workspace with specified role
   - Should mark invitation as "Accepted"
   - Should reject invitation with invalid token
   - Should reject invitation with expired token
   - Should reject already-accepted invitation

4. **Update User Role (5 tests)**
   - Should update member role from Member to Admin
   - Should update member role from Admin to Member
   - Should notify user of role change
   - Should reject role change by non-admin
   - Should reject role change for non-existent user

5. **Remove User from Workspace (7 tests)**
   - Should remove user from workspace
   - Should unassign all tasks from removed user
   - Should notify removed user
   - Should reject removal by non-admin
   - Should reject removal of last admin
   - Should reject removal of non-existent user
   - Should reject self-removal if last admin

6. **Leave Workspace (5 tests)**
   - Should allow member to leave workspace
   - Should unassign user's tasks on leave
   - Should reject leave if user is last admin
   - Should allow leave if other admins exist
   - Should notify workspace admins when member leaves

7. **Switch Between Workspaces (4 tests)**
   - Should list all user's workspaces
   - Should get workspace details by ID
   - Should reject access to workspace user is not member of
   - Should return workspace with member list

8. **Workspace Management (6 tests)**
   - Should update workspace name and description
   - Should reject update by non-admin
   - Should delete workspace (owner only)
   - Should reject deletion by non-owner
   - Should cascade delete tasks when workspace deleted
   - Should list workspace members with roles

**Total: ~46 tests**

#### `backend/src/test/kotlin/com/todo/service/WorkspaceServiceTest.kt`

**Test Categories:**
1. **Workspace Creation (5 tests)**
   - Should create workspace with admin assignment
   - Should validate workspace name
   - Should generate unique workspace ID
   - Should record creation timestamp
   - Should handle concurrent workspace creation

2. **Invitation Management (8 tests)**
   - Should generate secure invitation token
   - Should set expiration (e.g., 7 days)
   - Should send invitation email
   - Should validate email format
   - Should check user not already a member
   - Should allow resending invitation
   - Should handle invitation expiration
   - Should clean up old expired invitations

3. **Role Management (6 tests)**
   - Should enforce RBAC rules
   - Should validate role enum values
   - Should prevent removing last admin
   - Should allow multiple admins
   - Should record role change history
   - Should validate role change permissions

4. **Member Management (5 tests)**
   - Should enforce workspace isolation
   - Should handle member removal cleanup
   - Should validate workspace membership
   - Should count active members
   - Should track member join date

**Total: ~24 tests**

### Frontend Tests TO CREATE

#### `frontend/src/__tests__/components/workspaces/WorkspaceSelector.test.tsx`
- Render workspace selector dropdown
- Display user's workspaces
- Switch to selected workspace
- Show current workspace indicator
- Handle loading state
- Handle error state

#### `frontend/src/__tests__/components/workspaces/WorkspaceCreateForm.test.tsx`
- Render create workspace form
- Submit form with valid data
- Validate required fields
- Show success message
- Handle API errors
- Close modal on success

#### `frontend/src/__tests__/components/workspaces/MemberList.test.tsx`
- Display workspace members
- Show member roles
- Filter by role
- Handle empty state
- Display pending invitations
- Show member action buttons (admin only)

#### `frontend/src/__tests__/components/workspaces/InviteMemberModal.test.tsx`
- Render invite form
- Validate email format
- Select role (Admin/Member)
- Submit invitation
- Show success feedback
- Handle duplicate email error

#### `frontend/src/__tests__/components/workspaces/RoleManager.test.tsx`
- Display role selector
- Change member role
- Confirm role change
- Show only to admins
- Prevent removing last admin
- Show error messages

#### `frontend/src/__tests__/hooks/useWorkspace.test.ts`
- Fetch user workspaces
- Get current workspace
- Switch workspace
- Create workspace
- Update workspace
- Delete workspace

#### `frontend/src/__tests__/api/workspaceApi.test.ts`
- API client methods
- Request/response handling
- Error handling
- Token management

**Total: ~40 tests**

---

## 📋 TODO: Real-Time Collaboration Tests

Based on: `docs/specs/features/real-time-collaboration.md`

### Backend Tests TO CREATE

#### `backend/src/test/kotlin/com/todo/websocket/TaskWebSocketTest.kt`

**Test Categories:**
1. **WebSocket Connection (5 tests)**
   - Should establish WebSocket connection with valid JWT
   - Should reject connection without authentication
   - Should reject connection with invalid JWT
   - Should handle connection timeout
   - Should implement heartbeat/ping-pong

2. **Real-Time Task Updates (8 tests)**
   - Should broadcast task creation to all workspace members
   - Should broadcast task updates to all workspace members
   - Should broadcast task deletion to all workspace members
   - Should broadcast task assignment events
   - Should broadcast task completion events
   - Should not broadcast to non-workspace members
   - Should include actor information in events
   - Should include timestamp in events

3. **Online Presence (6 tests)**
   - Should track user online status
   - Should broadcast presence updates
   - Should handle user disconnect
   - Should handle user reconnect
   - Should list online users per workspace
   - Should clean up stale connections

4. **Conflict Detection (5 tests)**
   - Should detect concurrent edits
   - Should send conflict warning to second editor
   - Should include version information
   - Should allow conflict resolution
   - Should maintain data consistency

5. **Event History (4 tests)**
   - Should record event history
   - Should provide event history on reconnect
   - Should limit history size
   - Should clean up old events

**Total: ~28 tests**

#### `backend/src/test/kotlin/com/todo/service/RealtimeServiceTest.kt`

**Test Categories:**
1. **Event Broadcasting (6 tests)**
2. **Room Management (5 tests)**
3. **Connection Management (5 tests)**
4. **Event Serialization (4 tests)**

**Total: ~20 tests**

### Frontend Tests TO CREATE

#### `frontend/src/__tests__/hooks/useWebSocket.test.ts`
- Connect to WebSocket
- Handle connection states
- Auto-reconnect on disconnect
- Send events
- Receive events
- Handle errors

#### `frontend/src/__tests__/hooks/useRealtimeUpdates.test.ts`
- Subscribe to task updates
- Handle task created event
- Handle task updated event
- Handle task deleted event
- Update local state
- Handle conflicts

#### `frontend/src/__tests__/components/realtime/OnlineIndicator.test.tsx`
- Display online status
- Update on presence change
- Show online users count
- Display user avatars

#### `frontend/src/__tests__/components/realtime/ConflictResolver.test.tsx`
- Show conflict warning
- Display conflicting changes
- Allow user to choose version
- Merge changes
- Cancel operation

#### `frontend/src/__tests__/services/websocket.test.ts`
- WebSocket client wrapper
- Connection management
- Event emitter
- Reconnection logic
- Error handling

**Total: ~30 tests**

---

## 📋 TODO: Notifications & Activity Feed Tests

Based on: `docs/specs/features/notifications.md`

### Backend Tests TO CREATE

#### `backend/src/test/kotlin/com/todo/resource/NotificationResourceTest.kt`

**Test Categories:**
1. **Get Notifications (6 tests)**
   - Should list user's notifications
   - Should paginate notifications
   - Should filter by unread
   - Should sort by date (newest first)
   - Should include notification metadata
   - Should not show other users' notifications

2. **Mark as Read (5 tests)**
   - Should mark single notification as read
   - Should mark all notifications as read
   - Should update read timestamp
   - Should return 404 for non-existent notification
   - Should reject marking other user's notification

3. **Clear Notifications (4 tests)**
   - Should clear all read notifications
   - Should keep unread notifications
   - Should only clear user's own notifications
   - Should return count of cleared notifications

4. **Notification Preferences (5 tests)**
   - Should get user preferences
   - Should update email notification setting
   - Should update browser notification setting
   - Should update email frequency
   - Should validate preference values

5. **Task Assignment Notifications (4 tests)**
   - Should create notification on task assignment
   - Should include task details
   - Should include assigner information
   - Should create notification for each assignee

6. **Task Completion Notifications (3 tests)**
   - Should notify task creator on completion
   - Should include completer information
   - Should include completion timestamp

7. **Comment Notifications (3 tests)**
   - Should notify assigned users on comment
   - Should notify task creator on comment
   - Should include comment preview

**Total: ~30 tests**

#### `backend/src/test/kotlin/com/todo/service/NotificationServiceTest.kt`

**Test Categories:**
1. **Notification Creation (8 tests)**
2. **Email Notification Service (6 tests)**
3. **Notification Preferences (4 tests)**
4. **Notification Cleanup (3 tests)**

**Total: ~21 tests**

### Frontend Tests TO CREATE

#### `frontend/src/__tests__/components/notifications/NotificationBell.test.tsx`
- Display unread count
- Open dropdown on click
- Show loading state
- Mark notification as read on click
- Clear all notifications
- Handle empty state

#### `frontend/src/__tests__/components/notifications/NotificationDropdown.test.tsx`
- Display recent notifications
- Group by date
- Mark as read on click
- Navigate to task on click
- Show "view all" link
- Handle real-time updates

#### `frontend/src/__tests__/components/notifications/NotificationItem.test.tsx`
- Display notification icon
- Display notification message
- Display timestamp
- Show read/unread state
- Handle click action
- Display actor avatar

#### `frontend/src/__tests__/components/notifications/ActivityFeed.test.tsx`
- Display activity timeline
- Group events by day
- Show event icons
- Display actor and action
- Filter by event type
- Paginate activities

#### `frontend/src/__tests__/components/notifications/NotificationPreferences.test.tsx`
- Display preferences form
- Toggle email notifications
- Toggle browser notifications
- Update email frequency
- Save preferences
- Show success message

#### `frontend/src/__tests__/hooks/useNotifications.test.ts`
- Fetch notifications
- Get unread count
- Mark as read
- Mark all as read
- Clear read notifications
- Poll for updates

#### `frontend/src/__tests__/api/notificationApi.test.ts`
- API client methods
- Request/response handling

**Total: ~35 tests**

---

## 📋 TODO: Task Filters & Sorting Tests

Based on: `docs/specs/features/task-filters-sorting.md`

### Backend Tests TO CREATE

#### `backend/src/test/kotlin/com/todo/resource/TaskFilterResourceTest.kt`

**Test Categories:**
1. **Filter by Assignee (6 tests)**
   - Should filter by specific user ID
   - Should filter by "me" (current user)
   - Should filter by "unassigned"
   - Should combine with other filters
   - Should return filtered count
   - Should handle non-existent user

2. **Filter by Status (5 tests)**
   - Should filter by TODO status
   - Should filter by IN_PROGRESS status
   - Should filter by COMPLETED status
   - Should combine with other filters
   - Should reject invalid status value

3. **Filter by Due Date (6 tests)**
   - Should filter overdue tasks
   - Should filter tasks due today
   - Should filter tasks due this week
   - Should filter tasks due this month
   - Should combine with other filters
   - Should handle timezone correctly

4. **Filter by Priority (5 tests)**
   - Should filter by LOW priority
   - Should filter by MEDIUM priority
   - Should filter by HIGH priority
   - Should combine with other filters
   - Should reject invalid priority value

5. **Combine Multiple Filters (4 tests)**
   - Should apply filters with AND logic
   - Should handle 3+ filters
   - Should return correct filtered results
   - Should return empty array when no matches

6. **Sort Tasks (8 tests)**
   - Should sort by due date ascending
   - Should sort by due date descending
   - Should sort by priority (high to low)
   - Should sort by created date
   - Should sort by title alphabetically
   - Should combine sort with filters
   - Should handle null values in sort
   - Should reject invalid sort field

7. **Filter Presets (5 tests)**
   - Should save filter preset
   - Should list user's filter presets
   - Should load filter preset
   - Should update filter preset
   - Should delete filter preset

8. **Query Performance (3 tests)**
   - Should use database indexes
   - Should handle large result sets
   - Should paginate results

**Total: ~42 tests**

#### `backend/src/test/kotlin/com/todo/service/TaskFilterServiceTest.kt`

**Test Categories:**
1. **Query Building (10 tests)**
2. **Filter Validation (5 tests)**
3. **Sort Validation (4 tests)**

**Total: ~19 tests**

### Frontend Tests TO CREATE

#### `frontend/src/__tests__/components/filters/FilterBar.test.tsx`
- Display all filter options
- Apply single filter
- Apply multiple filters
- Clear all filters
- Show active filter count
- Persist filters in URL

#### `frontend/src/__tests__/components/filters/AssigneeFilter.test.tsx`
- Display assignee dropdown
- Select assignee
- Show "Me" option
- Show "Unassigned" option
- Display avatar and name
- Clear filter

#### `frontend/src/__tests__/components/filters/StatusFilter.test.tsx`
- Display status options
- Select status
- Show status icons
- Clear filter

#### `frontend/src/__tests__/components/filters/PriorityFilter.test.tsx`
- Display priority options
- Select priority
- Show priority badges
- Clear filter

#### `frontend/src/__tests__/components/filters/DueDateFilter.test.tsx`
- Display date range options
- Select "Overdue"
- Select "Today"
- Select "This Week"
- Select "This Month"
- Show custom date picker
- Clear filter

#### `frontend/src/__tests__/components/filters/SortSelector.test.tsx`
- Display sort options
- Select sort field
- Toggle sort direction
- Show current sort
- Combine with filters

#### `frontend/src/__tests__/components/filters/SavedFilters.test.tsx`
- Display saved filters
- Load saved filter
- Save current filters
- Update saved filter
- Delete saved filter
- Show default filters

#### `frontend/src/__tests__/hooks/useTaskFilters.test.ts`
- Apply filters
- Clear filters
- Combine filters
- Sort tasks
- Save filter preset
- Load filter preset

**Total: ~40 tests**

---

## Summary

### Total Test Count by Feature

| Feature | Backend Tests | Frontend Tests | Total |
|---------|--------------|----------------|-------|
| Authentication | 60 | 35 | 95 |
| Task Management | 35 | 40 | 75 |
| Workspace Management | 70 | 40 | 110 |
| Real-Time Collaboration | 48 | 30 | 78 |
| Notifications | 51 | 35 | 86 |
| Task Filters & Sorting | 61 | 40 | 101 |
| **TOTAL** | **325** | **220** | **545** |

---

## Test File Structure

### Backend Test Structure
```
backend/src/test/kotlin/com/todo/
├── resource/              # API endpoint tests (RestAssured)
│   ├── AuthResourceTest.kt (✅ Created)
│   ├── TaskResourceTest.kt (✅ Created)
│   ├── WorkspaceResourceTest.kt
│   ├── NotificationResourceTest.kt
│   ├── TaskFilterResourceTest.kt
│   └── WebSocketTest.kt
├── service/               # Business logic tests (JUnit + Mockito)
│   ├── AuthServiceTest.kt (✅ Created)
│   ├── TaskServiceTest.kt
│   ├── WorkspaceServiceTest.kt
│   ├── NotificationServiceTest.kt
│   ├── TaskFilterServiceTest.kt
│   └── RealtimeServiceTest.kt
└── repository/            # Data access tests (if needed)
    ├── UserRepositoryTest.kt
    ├── TaskRepositoryTest.kt
    └── WorkspaceRepositoryTest.kt
```

### Frontend Test Structure
```
frontend/src/__tests__/
├── components/
│   ├── auth/
│   │   ├── RegisterForm.test.tsx
│   │   ├── LoginForm.test.tsx
│   │   └── EmailVerification.test.tsx
│   ├── tasks/
│   │   ├── TaskList.test.tsx
│   │   ├── TaskCard.test.tsx
│   │   ├── TaskForm.test.tsx
│   │   ├── TaskModal.test.tsx
│   │   └── AssigneeSelector.test.tsx
│   ├── workspaces/
│   │   ├── WorkspaceSelector.test.tsx
│   │   ├── WorkspaceCreateForm.test.tsx
│   │   ├── MemberList.test.tsx
│   │   ├── InviteMemberModal.test.tsx
│   │   └── RoleManager.test.tsx
│   ├── notifications/
│   │   ├── NotificationBell.test.tsx
│   │   ├── NotificationDropdown.test.tsx
│   │   ├── NotificationItem.test.tsx
│   │   ├── ActivityFeed.test.tsx
│   │   └── NotificationPreferences.test.tsx
│   ├── filters/
│   │   ├── FilterBar.test.tsx
│   │   ├── AssigneeFilter.test.tsx
│   │   ├── StatusFilter.test.tsx
│   │   ├── PriorityFilter.test.tsx
│   │   ├── DueDateFilter.test.tsx
│   │   ├── SortSelector.test.tsx
│   │   └── SavedFilters.test.tsx
│   └── realtime/
│       ├── OnlineIndicator.test.tsx
│       └── ConflictResolver.test.tsx
├── hooks/
│   ├── useAuth.test.ts
│   ├── useTasks.test.ts
│   ├── useWorkspace.test.ts
│   ├── useNotifications.test.ts
│   ├── useTaskFilters.test.ts
│   ├── useWebSocket.test.ts
│   └── useRealtimeUpdates.test.ts
├── api/
│   ├── authApi.test.ts
│   ├── taskApi.test.ts
│   ├── workspaceApi.test.ts
│   └── notificationApi.test.ts
├── pages/
│   ├── signup.test.tsx
│   ├── login.test.tsx
│   └── dashboard.test.tsx
└── services/
    └── websocket.test.ts
```

---

## Next Steps

### Phase 1: Complete Test Writing
1. ✅ Authentication backend tests (DONE)
2. ✅ Task Management backend tests (DONE)
3. ⏳ Create remaining backend tests (Workspace, Realtime, Notifications, Filters)
4. ⏳ Create ALL frontend tests for ALL features
5. ⏳ Verify all tests FAIL (no implementation)

### Phase 2: Backend Implementation
6. Implement backends to make tests pass
7. Verify all backend tests pass

### Phase 3: Frontend Implementation
8. Implement frontends to make tests pass
9. Verify all frontend tests pass

### Phase 4: Validation
10. Manual testing of all Gherkin scenarios
11. Accessibility audit
12. Performance testing

---

## Testing Tools & Frameworks

### Backend
- **JUnit 5** - Test framework
- **RestAssured** - REST API testing
- **Mockito** - Mocking framework
- **Quarkus Test** - Quarkus testing support
- **TestContainers** - Database testing (optional)

### Frontend
- **Vitest** - Test framework
- **React Testing Library** - Component testing
- **MSW (Mock Service Worker)** - API mocking
- **@testing-library/user-event** - User interaction simulation
- **@testing-library/jest-dom** - Custom matchers

---

## Test Coverage Goals

- Backend Coverage: **>80%**
- Frontend Coverage: **>80%**
- All Gherkin scenarios: **100%**
- Critical paths: **100%**
- Edge cases: **>90%**

---

## Running Tests

### Backend
```bash
cd backend
./gradlew test              # Run all tests
./gradlew test --tests AuthResourceTest  # Run specific test class
./gradlew test --tests "*Auth*"  # Run all auth tests
./gradlew testReport        # Generate HTML report
```

### Frontend
```bash
cd frontend
npm test                    # Run all tests
npm test -- --coverage      # Run with coverage
npm test -- Auth            # Run auth tests only
npm test -- --watch         # Watch mode
```

---

## Test Documentation

Each test file should include:
- Clear test names using `@DisplayName`
- Comments linking to Gherkin scenarios
- Setup and teardown logic
- Test data factories/fixtures
- Helper methods for common operations

---

**Last Updated:** October 3, 2025  
**Status:** TDD Experiment Lab - Tests First Approach  
**Next Action:** Complete remaining test file creation

