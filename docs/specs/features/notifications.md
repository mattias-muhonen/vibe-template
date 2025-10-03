## 1. Feature Overview

**Feature Name:** Notifications & Activity Feed

**Feature Description:** In-app and email notification system for task assignments, completions, comments, and workspace activity. Includes a comprehensive activity feed showing workspace-level changes.

**Priority:** Medium

**Goal:** Keep users informed of relevant updates without overwhelming them.

**Dependencies:** Task Management, Workspace Management, Real-Time Collaboration

---

## 2. Functional Requirements (User Behaviors)

```gherkin
Feature: Notifications & Activity Feed

Scenario: Task Assignment Notification
  Given I am a workspace member
  When another user assigns a task to me
  Then I receive an in-app notification
  And I receive an email notification (if enabled)
  And the notification shows task title and assigner name
  And clicking the notification navigates to the task

Scenario: Task Completion Notification
  Given I created a task assigned to John
  When John marks the task as complete
  Then I receive a notification "John completed 'Deploy to staging'"
  And the notification includes completion timestamp

Scenario: Comment Notification
  Given I am assigned to a task or created it
  When someone comments on the task
  Then I receive a notification with comment preview
  And clicking opens the task with comment highlighted

Scenario: View Activity Feed
  Given I am viewing my workspace
  When I click "Activity" in the sidebar
  Then I see a chronological feed of workspace events
  And each event shows: icon, actor, action, entity, timestamp
  And events are grouped by day

Scenario: Notification Preferences
  Given I am in my settings
  When I toggle "Email notifications" off
  Then I stop receiving emails
  But I still receive in-app notifications
  And my preferences are saved

Scenario: Mark Notifications as Read
  Given I have 5 unread notifications
  When I click on a notification
  Then it is marked as read
  And the unread count decreases
  And the notification styling changes to "read"

Scenario: Clear All Notifications
  Given I have multiple read notifications
  When I click "Clear all"
  Then all read notifications are removed
  And unread notifications remain
```

---

## 3. Technical Requirements

### 3.1 Backend Functionality

**Database Schema:**

- **notifications** table:
  - `id` (UUID)
  - `user_id` (UUID, foreign key)
  - `workspace_id` (UUID, foreign key)
  - `type` (ENUM: 'task_assigned', 'task_completed', 'comment_added', 'mention')
  - `entity_type` (VARCHAR: 'task', 'comment')
  - `entity_id` (UUID)
  - `actor_id` (UUID, foreign key to users)
  - `title` (VARCHAR, 255)
  - `body` (TEXT)
  - `is_read` (BOOLEAN, default false)
  - `created_at` (TIMESTAMP)

- **notification_preferences** table:
  - `user_id` (UUID, primary key)
  - `email_enabled` (BOOLEAN, default true)
  - `browser_enabled` (BOOLEAN, default true)
  - `email_frequency` (ENUM: 'instant', 'daily', 'weekly', 'never')
  - `updated_at` (TIMESTAMP)

**API Endpoints:**
- `GET /api/notifications` - List user's notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/clear-read` - Clear read notifications
- `GET /api/preferences/notifications` - Get preferences
- `PUT /api/preferences/notifications` - Update preferences

**Email Service:**
- Use SMTP or transactional email service (SendGrid, Mailgun)
- Email templates for each notification type
- Batch daily/weekly digests
- Unsubscribe links

### 3.2 Frontend Functionality

**UI Components:**
- **NotificationBell**: Icon with unread count badge
- **NotificationDropdown**: List of recent notifications
- **NotificationItem**: Single notification with actions
- **ActivityFeed**: Full-page activity timeline
- **NotificationPreferences**: Settings panel

**State Management:**
- Notifications list in context
- Unread count
- Real-time notification updates (WebSocket)
- Polling fallback (every 30s)

### 3.3 Database Design

**Indexes:**
- `idx_notifications_user_created` - User's notifications by date
- `idx_notifications_user_unread` - Unread notifications
- `idx_notifications_workspace` - Workspace activity feed

**Cleanup:**
- Delete read notifications older than 30 days
- Keep unread notifications indefinitely

---

## 4. Manual Verification Protocol

### Test Case 1: Complete Notification Flow
1. User A assigns task to User B
2. Verify User B gets in-app notification
3. Verify User B gets email (if enabled)
4. User B clicks notification
5. Verify navigation to task

**Expected Result:** Notification delivered via all channels, navigation works.

### Test Case 2: Notification Preferences
1. User disables email notifications
2. Receive task assignment
3. Verify no email sent
4. Verify in-app notification still works

**Expected Result:** Preferences respected, only enabled channels used.

### Test Case 3: Activity Feed
1. Perform various actions (create, assign, complete tasks)
2. View activity feed
3. Verify all events present and chronological
4. Verify event details correct

**Expected Result:** Complete, accurate activity history.

---

## 5. Implementation Plan

### Backend Implementation
- [ ] Create notifications table migration
- [ ] Create notification_preferences table migration
- [ ] Implement notification service
- [ ] Set up email service integration
- [ ] Create notification API endpoints
- [ ] Add notification triggers (on task events)
- [ ] Implement email templates
- [ ] Add cleanup job for old notifications
- [ ] Write tests

### Frontend Implementation
- [ ] Create NotificationContext
- [ ] Create NotificationBell component
- [ ] Create NotificationDropdown component
- [ ] Create ActivityFeed page
- [ ] Create NotificationPreferences component
- [ ] Connect to WebSocket for real-time updates
- [ ] Implement polling fallback
- [ ] Add browser notifications (Web API)
- [ ] Test notification flows

---

## 6. Success Metrics

- Notification delivery success rate: > 99%
- Email open rate: > 40%
- Notification click-through rate: > 30%
- User satisfaction with notifications: > 7 NPS

---

## 7. Future Enhancements

- Push notifications (mobile web)
- Smart notification grouping ("3 tasks assigned to you")
- Notification scheduling (quiet hours)
- Slack/Discord integrations
- Custom notification rules
- @mentions in comments

