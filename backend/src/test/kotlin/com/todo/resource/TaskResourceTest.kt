package com.todo.resource

import io.quarkus.test.junit.QuarkusTest
import io.restassured.RestAssured.given
import io.restassured.http.ContentType
import org.hamcrest.Matchers.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.BeforeEach

/**
 * Integration tests for Task Management API endpoints
 * Based on: docs/specs/features/task-management.md
 * 
 * These tests are written FIRST (TDD approach) and should FAIL until implementation is complete.
 */
@QuarkusTest
class TaskResourceTest {

    private lateinit var authToken: String
    private lateinit var workspaceId: String

    @BeforeEach
    fun setup() {
        // Setup: Create and login user, create workspace
        // This would be extracted to a test helper class
        authToken = "valid-auth-token"
        workspaceId = "test-workspace-id"
    }

    // ========================================
    // Scenario: Create New Task
    // ========================================
    
    @Test
    @DisplayName("Should create task with all required fields")
    fun testCreateTaskWithAllFields() {
        val taskRequest = mapOf(
            "title" to "Prepare Q4 presentation",
            "description" to "Create slides for quarterly review",
            "dueDate" to "2025-12-15T10:00:00Z",
            "priority" to "HIGH",
            "workspaceId" to workspaceId
        )
        
        given()
            .header("Authorization", "Bearer $authToken")
            .contentType(ContentType.JSON)
            .body(taskRequest)
        .`when`()
            .post("/api/tasks")
        .then()
            .statusCode(201)
            .body("id", notNullValue())
            .body("title", equalTo("Prepare Q4 presentation"))
            .body("description", equalTo("Create slides for quarterly review"))
            .body("dueDate", equalTo("2025-12-15T10:00:00Z"))
            .body("priority", equalTo("HIGH"))
            .body("status", equalTo("TODO"))
            .body("createdBy", notNullValue())
            .body("createdAt", notNullValue())
            .body("workspaceId", equalTo(workspaceId))
    }
    
    @Test
    @DisplayName("Should create task with only required fields (title)")
    fun testCreateTaskMinimalFields() {
        val taskRequest = mapOf(
            "title" to "Simple task",
            "workspaceId" to workspaceId
        )
        
        given()
            .header("Authorization", "Bearer $authToken")
            .contentType(ContentType.JSON)
            .body(taskRequest)
        .`when`()
            .post("/api/tasks")
        .then()
            .statusCode(201)
            .body("title", equalTo("Simple task"))
            .body("description", nullValue())
            .body("dueDate", nullValue())
            .body("priority", equalTo("MEDIUM")) // Default priority
            .body("status", equalTo("TODO"))
    }
    
    @Test
    @DisplayName("Should reject task creation with missing title")
    fun testCreateTaskWithoutTitle() {
        val taskRequest = mapOf(
            "description" to "Missing title",
            "workspaceId" to workspaceId
        )
        
        given()
            .header("Authorization", "Bearer $authToken")
            .contentType(ContentType.JSON)
            .body(taskRequest)
        .`when`()
            .post("/api/tasks")
        .then()
            .statusCode(400)
            .body("error", containsString("Title is required"))
    }
    
    @Test
    @DisplayName("Should reject task creation with title exceeding 255 characters")
    fun testCreateTaskWithTooLongTitle() {
        val longTitle = "a".repeat(256)
        val taskRequest = mapOf(
            "title" to longTitle,
            "workspaceId" to workspaceId
        )
        
        given()
            .header("Authorization", "Bearer $authToken")
            .contentType(ContentType.JSON)
            .body(taskRequest)
        .`when`()
            .post("/api/tasks")
        .then()
            .statusCode(400)
            .body("error", containsString("Title must not exceed 255 characters"))
    }
    
    @Test
    @DisplayName("Should reject task creation without authentication")
    fun testCreateTaskUnauthenticated() {
        val taskRequest = mapOf(
            "title" to "Unauthenticated task",
            "workspaceId" to workspaceId
        )
        
        given()
            .contentType(ContentType.JSON)
            .body(taskRequest)
        .`when`()
            .post("/api/tasks")
        .then()
            .statusCode(401)
    }
    
    @Test
    @DisplayName("Should reject task creation for workspace user is not a member of")
    fun testCreateTaskInNonMemberWorkspace() {
        val taskRequest = mapOf(
            "title" to "Unauthorized task",
            "workspaceId" to "other-workspace-id"
        )
        
        given()
            .header("Authorization", "Bearer $authToken")
            .contentType(ContentType.JSON)
            .body(taskRequest)
        .`when`()
            .post("/api/tasks")
        .then()
            .statusCode(403)
            .body("error", containsString("Not a member of this workspace"))
    }

    // ========================================
    // Scenario: Edit Task Details
    // ========================================
    
    @Test
    @DisplayName("Should update task title and other fields")
    fun testUpdateTaskDetails() {
        // First create a task
        val createRequest = mapOf(
            "title" to "Design new landing page",
            "priority" to "MEDIUM",
            "workspaceId" to workspaceId
        )
        
        val taskId = given()
            .header("Authorization", "Bearer $authToken")
            .contentType(ContentType.JSON)
            .body(createRequest)
        .`when`()
            .post("/api/tasks")
        .then()
            .statusCode(201)
            .extract()
            .path<String>("id")
        
        // Update the task
        val updateRequest = mapOf(
            "title" to "Redesign landing page with new branding",
            "dueDate" to "2025-11-30T10:00:00Z",
            "priority" to "HIGH"
        )
        
        given()
            .header("Authorization", "Bearer $authToken")
            .contentType(ContentType.JSON)
            .body(updateRequest)
        .`when`()
            .put("/api/tasks/$taskId")
        .then()
            .statusCode(200)
            .body("title", equalTo("Redesign landing page with new branding"))
            .body("dueDate", equalTo("2025-11-30T10:00:00Z"))
            .body("priority", equalTo("HIGH"))
            .body("updatedAt", notNullValue())
    }
    
    @Test
    @DisplayName("Should update task partially (only specified fields)")
    fun testPartialTaskUpdate() {
        val taskId = "existing-task-id"
        
        val updateRequest = mapOf(
            "priority" to "HIGH"
        )
        
        given()
            .header("Authorization", "Bearer $authToken")
            .contentType(ContentType.JSON)
            .body(updateRequest)
        .`when`()
            .put("/api/tasks/$taskId")
        .then()
            .statusCode(200)
            .body("priority", equalTo("HIGH"))
            // Other fields should remain unchanged
    }
    
    @Test
    @DisplayName("Should reject task update by non-workspace member")
    fun testUpdateTaskByNonMember() {
        val taskId = "existing-task-id"
        val otherUserToken = "other-user-token"
        
        val updateRequest = mapOf(
            "title" to "Unauthorized update"
        )
        
        given()
            .header("Authorization", "Bearer $otherUserToken")
            .contentType(ContentType.JSON)
            .body(updateRequest)
        .`when`()
            .put("/api/tasks/$taskId")
        .then()
            .statusCode(403)
    }

    // ========================================
    // Scenario: Assign Task to Team Member
    // ========================================
    
    @Test
    @DisplayName("Should assign task to single user")
    fun testAssignTaskToSingleUser() {
        val taskId = "existing-task-id"
        val assigneeId = "user-john-id"
        
        val assignRequest = mapOf(
            "userIds" to listOf(assigneeId)
        )
        
        given()
            .header("Authorization", "Bearer $authToken")
            .contentType(ContentType.JSON)
            .body(assignRequest)
        .`when`()
            .post("/api/tasks/$taskId/assign")
        .then()
            .statusCode(200)
            .body("assignees", hasSize<Int>(1))
            .body("assignees[0].id", equalTo(assigneeId))
    }
    
    @Test
    @DisplayName("Should assign task to multiple users")
    fun testAssignTaskToMultipleUsers() {
        val taskId = "existing-task-id"
        val assigneeIds = listOf("user-sarah-id", "user-mike-id")
        
        val assignRequest = mapOf(
            "userIds" to assigneeIds
        )
        
        given()
            .header("Authorization", "Bearer $authToken")
            .contentType(ContentType.JSON)
            .body(assignRequest)
        .`when`()
            .post("/api/tasks/$taskId/assign")
        .then()
            .statusCode(200)
            .body("assignees", hasSize<Int>(2))
    }
    
    @Test
    @DisplayName("Should reject assignment of non-workspace member")
    fun testAssignTaskToNonMember() {
        val taskId = "existing-task-id"
        val nonMemberId = "non-member-user-id"
        
        val assignRequest = mapOf(
            "userIds" to listOf(nonMemberId)
        )
        
        given()
            .header("Authorization", "Bearer $authToken")
            .contentType(ContentType.JSON)
            .body(assignRequest)
        .`when`()
            .post("/api/tasks/$taskId/assign")
        .then()
            .statusCode(400)
            .body("error", containsString("User is not a workspace member"))
    }
    
    @Test
    @DisplayName("Should send notification to assigned user")
    fun testNotificationSentOnAssignment() {
        // This test would verify that notification service is called
        // Implementation would use a mock or verify database entry
        
        val taskId = "existing-task-id"
        val assigneeId = "user-john-id"
        
        val assignRequest = mapOf(
            "userIds" to listOf(assigneeId)
        )
        
        given()
            .header("Authorization", "Bearer $authToken")
            .contentType(ContentType.JSON)
            .body(assignRequest)
        .`when`()
            .post("/api/tasks/$taskId/assign")
        .then()
            .statusCode(200)
        
        // Verify notification was created
        // This would be checked in a separate notification test
    }

    // ========================================
    // Scenario: Mark Task as Complete
    // ========================================
    
    @Test
    @DisplayName("Should mark task as complete")
    fun testMarkTaskAsComplete() {
        val taskId = "existing-task-id"
        
        given()
            .header("Authorization", "Bearer $authToken")
        .`when`()
            .post("/api/tasks/$taskId/complete")
        .then()
            .statusCode(200)
            .body("status", equalTo("COMPLETED"))
            .body("completedAt", notNullValue())
    }
    
    @Test
    @DisplayName("Should notify task creator when task is completed")
    fun testNotifyCreatorOnCompletion() {
        val taskId = "existing-task-id"
        
        given()
            .header("Authorization", "Bearer $authToken")
        .`when`()
            .post("/api/tasks/$taskId/complete")
        .then()
            .statusCode(200)
        
        // Verify notification sent to creator
    }

    // ========================================
    // Scenario: Reopen Completed Task
    // ========================================
    
    @Test
    @DisplayName("Should reopen completed task")
    fun testReopenCompletedTask() {
        val taskId = "completed-task-id"
        
        given()
            .header("Authorization", "Bearer $authToken")
        .`when`()
            .post("/api/tasks/$taskId/reopen")
        .then()
            .statusCode(200)
            .body("status", equalTo("IN_PROGRESS"))
            .body("completedAt", nullValue())
    }

    // ========================================
    // Scenario: Delete Task
    // ========================================
    
    @Test
    @DisplayName("Should delete task")
    fun testDeleteTask() {
        val taskId = "task-to-delete-id"
        
        given()
            .header("Authorization", "Bearer $authToken")
        .`when`()
            .delete("/api/tasks/$taskId")
        .then()
            .statusCode(204)
        
        // Verify task no longer exists
        given()
            .header("Authorization", "Bearer $authToken")
        .`when`()
            .get("/api/tasks/$taskId")
        .then()
            .statusCode(404)
    }
    
    @Test
    @DisplayName("Should allow only task creator or admin to delete task")
    fun testDeleteTaskAuthorization() {
        val taskId = "task-created-by-other-user"
        val nonCreatorToken = "non-creator-token"
        
        given()
            .header("Authorization", "Bearer $nonCreatorToken")
        .`when`()
            .delete("/api/tasks/$taskId")
        .then()
            .statusCode(403)
    }

    // ========================================
    // Scenario: Reassign Task
    // ========================================
    
    @Test
    @DisplayName("Should reassign task to different user")
    fun testReassignTask() {
        val taskId = "existing-task-id"
        val newAssigneeId = "user-emma-id"
        
        val reassignRequest = mapOf(
            "userIds" to listOf(newAssigneeId)
        )
        
        given()
            .header("Authorization", "Bearer $authToken")
            .contentType(ContentType.JSON)
            .body(reassignRequest)
        .`when`()
            .post("/api/tasks/$taskId/assign")
        .then()
            .statusCode(200)
            .body("assignees[0].id", equalTo(newAssigneeId))
    }
    
    @Test
    @DisplayName("Should notify new assignee when task is reassigned")
    fun testNotifyNewAssigneeOnReassignment() {
        val taskId = "existing-task-id"
        val newAssigneeId = "user-emma-id"
        
        val reassignRequest = mapOf(
            "userIds" to listOf(newAssigneeId)
        )
        
        given()
            .header("Authorization", "Bearer $authToken")
            .contentType(ContentType.JSON)
            .body(reassignRequest)
        .`when`()
            .post("/api/tasks/$taskId/assign")
        .then()
            .statusCode(200)
        
        // Verify notification sent to new assignee
    }

    // ========================================
    // Scenario: List Tasks
    // ========================================
    
    @Test
    @DisplayName("Should list all tasks in workspace")
    fun testListAllTasksInWorkspace() {
        given()
            .header("Authorization", "Bearer $authToken")
            .queryParam("workspaceId", workspaceId)
        .`when`()
            .get("/api/tasks")
        .then()
            .statusCode(200)
            .body("tasks", notNullValue())
            .body("tasks", hasSize<Int>(greaterThan(0)))
    }
    
    @Test
    @DisplayName("Should list only tasks assigned to current user")
    fun testListMyTasks() {
        given()
            .header("Authorization", "Bearer $authToken")
            .queryParam("assignedToMe", true)
        .`when`()
            .get("/api/tasks")
        .then()
            .statusCode(200)
            .body("tasks", notNullValue())
    }
    
    @Test
    @DisplayName("Should list tasks created by current user")
    fun testListTasksCreatedByMe() {
        given()
            .header("Authorization", "Bearer $authToken")
            .queryParam("createdByMe", true)
        .`when`()
            .get("/api/tasks")
        .then()
            .statusCode(200)
            .body("tasks", notNullValue())
    }

    // ========================================
    // Scenario: Get Task Details
    // ========================================
    
    @Test
    @DisplayName("Should get task details by ID")
    fun testGetTaskById() {
        val taskId = "existing-task-id"
        
        given()
            .header("Authorization", "Bearer $authToken")
        .`when`()
            .get("/api/tasks/$taskId")
        .then()
            .statusCode(200)
            .body("id", equalTo(taskId))
            .body("title", notNullValue())
            .body("createdBy", notNullValue())
            .body("createdAt", notNullValue())
    }
    
    @Test
    @DisplayName("Should return 404 for non-existent task")
    fun testGetNonExistentTask() {
        val nonExistentId = "non-existent-task-id"
        
        given()
            .header("Authorization", "Bearer $authToken")
        .`when`()
            .get("/api/tasks/$nonExistentId")
        .then()
            .statusCode(404)
    }
    
    @Test
    @DisplayName("Should not allow access to task in workspace user is not a member of")
    fun testGetTaskFromNonMemberWorkspace() {
        val taskId = "task-in-other-workspace"
        
        given()
            .header("Authorization", "Bearer $authToken")
        .`when`()
            .get("/api/tasks/$taskId")
        .then()
            .statusCode(403)
    }

    // ========================================
    // Validation Tests
    // ========================================
    
    @Test
    @DisplayName("Should reject task with invalid priority value")
    fun testInvalidPriority() {
        val taskRequest = mapOf(
            "title" to "Invalid priority task",
            "priority" to "INVALID",
            "workspaceId" to workspaceId
        )
        
        given()
            .header("Authorization", "Bearer $authToken")
            .contentType(ContentType.JSON)
            .body(taskRequest)
        .`when`()
            .post("/api/tasks")
        .then()
            .statusCode(400)
            .body("error", containsString("Invalid priority"))
    }
    
    @Test
    @DisplayName("Should reject task with past due date")
    fun testPastDueDate() {
        val taskRequest = mapOf(
            "title" to "Past due date task",
            "dueDate" to "2020-01-01T10:00:00Z",
            "workspaceId" to workspaceId
        )
        
        given()
            .header("Authorization", "Bearer $authToken")
            .contentType(ContentType.JSON)
            .body(taskRequest)
        .`when`()
            .post("/api/tasks")
        .then()
            .statusCode(400)
            .body("error", containsString("Due date must be in the future"))
    }
}

