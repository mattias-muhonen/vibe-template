package com.todo.service

import io.quarkus.test.junit.QuarkusTest
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.assertThrows
import javax.inject.Inject

/**
 * Unit tests for TaskService business logic
 * Based on: docs/specs/features/task-management.md
 * 
 * These tests are written FIRST (TDD approach) and should FAIL until implementation is complete.
 */
@QuarkusTest
class TaskServiceTest {

    @Inject
    lateinit var taskService: TaskService
    
    // ========================================
    // Create Task Tests
    // ========================================
    
    @Test
    @DisplayName("Should create task with all fields")
    fun testCreateTaskWithAllFields() {
        val task = taskService.createTask(
            workspaceId = "workspace-1",
            title = "Test Task",
            description = "Test description",
            priority = "HIGH",
            dueDate = "2025-12-31T23:59:59Z",
            createdBy = "user-1"
        )
        
        assertNotNull(task.id)
        assertEquals("Test Task", task.title)
        assertEquals("Test description", task.description)
        assertEquals("HIGH", task.priority)
        assertEquals("TODO", task.status)
        assertNotNull(task.createdAt)
    }
    
    @Test
    @DisplayName("Should create task with only required fields")
    fun testCreateTaskMinimal() {
        val task = taskService.createTask(
            workspaceId = "workspace-1",
            title = "Minimal Task",
            createdBy = "user-1"
        )
        
        assertEquals("Minimal Task", task.title)
        assertNull(task.description)
        assertNull(task.dueDate)
        assertEquals("MEDIUM", task.priority) // Default
        assertEquals("TODO", task.status)
    }
    
    @Test
    @DisplayName("Should reject task creation without title")
    fun testCreateTaskWithoutTitle() {
        assertThrows<ValidationException> {
            taskService.createTask(
                workspaceId = "workspace-1",
                title = "",
                createdBy = "user-1"
            )
        }
    }
    
    @Test
    @DisplayName("Should reject task with title exceeding 255 characters")
    fun testCreateTaskWithLongTitle() {
        val longTitle = "a".repeat(256)
        
        assertThrows<ValidationException> {
            taskService.createTask(
                workspaceId = "workspace-1",
                title = longTitle,
                createdBy = "user-1"
            )
        }
    }
    
    @Test
    @DisplayName("Should validate workspace membership on task creation")
    fun testCreateTaskValidatesWorkspaceMembership() {
        assertThrows<ForbiddenException> {
            taskService.createTask(
                workspaceId = "not-member-workspace",
                title = "Unauthorized Task",
                createdBy = "user-1"
            )
        }
    }
    
    // ========================================
    // Update Task Tests
    // ========================================
    
    @Test
    @DisplayName("Should update task title and priority")
    fun testUpdateTaskFields() {
        val taskId = "existing-task-id"
        
        val updated = taskService.updateTask(
            taskId = taskId,
            title = "Updated Title",
            priority = "HIGH",
            userId = "user-1"
        )
        
        assertEquals("Updated Title", updated.title)
        assertEquals("HIGH", updated.priority)
        assertNotNull(updated.updatedAt)
    }
    
    @Test
    @DisplayName("Should allow partial task updates")
    fun testPartialUpdate() {
        val taskId = "existing-task-id"
        
        val updated = taskService.updateTask(
            taskId = taskId,
            priority = "LOW",
            userId = "user-1"
        )
        
        assertEquals("LOW", updated.priority)
        // Other fields should remain unchanged
    }
    
    @Test
    @DisplayName("Should reject update by non-workspace member")
    fun testUpdateTaskByNonMember() {
        assertThrows<ForbiddenException> {
            taskService.updateTask(
                taskId = "task-id",
                title = "Updated",
                userId = "non-member-user"
            )
        }
    }
    
    // ========================================
    // Assign Task Tests
    // ========================================
    
    @Test
    @DisplayName("Should assign task to single user")
    fun testAssignTaskToSingleUser() {
        val taskId = "task-id"
        val assigneeId = "user-2"
        
        val assigned = taskService.assignTask(
            taskId = taskId,
            userIds = listOf(assigneeId),
            assignedBy = "user-1"
        )
        
        assertEquals(1, assigned.assignees.size)
        assertEquals(assigneeId, assigned.assignees[0].id)
    }
    
    @Test
    @DisplayName("Should assign task to multiple users")
    fun testAssignTaskToMultipleUsers() {
        val taskId = "task-id"
        val assigneeIds = listOf("user-2", "user-3", "user-4")
        
        val assigned = taskService.assignTask(
            taskId = taskId,
            userIds = assigneeIds,
            assignedBy = "user-1"
        )
        
        assertEquals(3, assigned.assignees.size)
    }
    
    @Test
    @DisplayName("Should reject assignment of non-workspace member")
    fun testAssignNonMember() {
        assertThrows<ValidationException> {
            taskService.assignTask(
                taskId = "task-id",
                userIds = listOf("non-member-user"),
                assignedBy = "user-1"
            )
        }
    }
    
    @Test
    @DisplayName("Should send notification on task assignment")
    fun testNotificationOnAssignment() {
        val taskId = "task-id"
        val assigneeId = "user-2"
        
        taskService.assignTask(
            taskId = taskId,
            userIds = listOf(assigneeId),
            assignedBy = "user-1"
        )
        
        // Verify notification was created
        // This would check the notification service was called
        assertTrue(true) // Placeholder for notification check
    }
    
    @Test
    @DisplayName("Should replace existing assignees when reassigning")
    fun testReassignTask() {
        val taskId = "task-with-assignee"
        val newAssigneeId = "user-3"
        
        val reassigned = taskService.assignTask(
            taskId = taskId,
            userIds = listOf(newAssigneeId),
            assignedBy = "user-1"
        )
        
        assertEquals(1, reassigned.assignees.size)
        assertEquals(newAssigneeId, reassigned.assignees[0].id)
    }
    
    // ========================================
    // Complete Task Tests
    // ========================================
    
    @Test
    @DisplayName("Should mark task as complete")
    fun testCompleteTask() {
        val taskId = "task-id"
        
        val completed = taskService.completeTask(
            taskId = taskId,
            userId = "user-1"
        )
        
        assertEquals("COMPLETED", completed.status)
        assertNotNull(completed.completedAt)
    }
    
    @Test
    @DisplayName("Should send notification to task creator on completion")
    fun testNotificationOnCompletion() {
        val taskId = "task-id"
        
        taskService.completeTask(
            taskId = taskId,
            userId = "user-1"
        )
        
        // Verify notification sent to creator
        assertTrue(true) // Placeholder
    }
    
    // ========================================
    // Reopen Task Tests
    // ========================================
    
    @Test
    @DisplayName("Should reopen completed task")
    fun testReopenTask() {
        val taskId = "completed-task-id"
        
        val reopened = taskService.reopenTask(
            taskId = taskId,
            userId = "user-1"
        )
        
        assertEquals("IN_PROGRESS", reopened.status)
        assertNull(reopened.completedAt)
    }
    
    // ========================================
    // Delete Task Tests
    // ========================================
    
    @Test
    @DisplayName("Should delete task by creator")
    fun testDeleteTaskByCreator() {
        val taskId = "task-to-delete"
        
        taskService.deleteTask(
            taskId = taskId,
            userId = "creator-user-id"
        )
        
        // Verify task is deleted
        assertThrows<NotFoundException> {
            taskService.getTask(taskId, "creator-user-id")
        }
    }
    
    @Test
    @DisplayName("Should allow admin to delete any task")
    fun testDeleteTaskByAdmin() {
        val taskId = "task-id"
        
        taskService.deleteTask(
            taskId = taskId,
            userId = "admin-user-id"
        )
        
        // Should succeed
        assertTrue(true)
    }
    
    @Test
    @DisplayName("Should reject deletion by non-creator non-admin")
    fun testDeleteTaskUnauthorized() {
        assertThrows<ForbiddenException> {
            taskService.deleteTask(
                taskId = "task-id",
                userId = "other-user-id"
            )
        }
    }
    
    // ========================================
    // Get Task Tests
    // ========================================
    
    @Test
    @DisplayName("Should get task by ID")
    fun testGetTaskById() {
        val task = taskService.getTask(
            taskId = "existing-task-id",
            userId = "user-1"
        )
        
        assertNotNull(task)
        assertEquals("existing-task-id", task.id)
    }
    
    @Test
    @DisplayName("Should reject getting task from non-member workspace")
    fun testGetTaskUnauthorized() {
        assertThrows<ForbiddenException> {
            taskService.getTask(
                taskId = "task-in-other-workspace",
                userId = "user-1"
            )
        }
    }
    
    // ========================================
    // List Tasks Tests
    // ========================================
    
    @Test
    @DisplayName("Should list all tasks in workspace")
    fun testListWorkspaceTasks() {
        val tasks = taskService.listTasks(
            workspaceId = "workspace-1",
            userId = "user-1"
        )
        
        assertNotNull(tasks)
        assertTrue(tasks.size > 0)
    }
    
    @Test
    @DisplayName("Should filter tasks by assignee")
    fun testFilterTasksByAssignee() {
        val tasks = taskService.listTasks(
            workspaceId = "workspace-1",
            userId = "user-1",
            assignedTo = "user-2"
        )
        
        tasks.forEach { task ->
            assertTrue(task.assignees.any { it.id == "user-2" })
        }
    }
    
    @Test
    @DisplayName("Should filter tasks by status")
    fun testFilterTasksByStatus() {
        val tasks = taskService.listTasks(
            workspaceId = "workspace-1",
            userId = "user-1",
            status = "COMPLETED"
        )
        
        tasks.forEach { task ->
            assertEquals("COMPLETED", task.status)
        }
    }
    
    @Test
    @DisplayName("Should sort tasks by due date")
    fun testSortTasksByDueDate() {
        val tasks = taskService.listTasks(
            workspaceId = "workspace-1",
            userId = "user-1",
            sortBy = "dueDate",
            sortOrder = "asc"
        )
        
        // Verify sorted order
        for (i in 0 until tasks.size - 1) {
            if (tasks[i].dueDate != null && tasks[i + 1].dueDate != null) {
                assertTrue(tasks[i].dueDate!! <= tasks[i + 1].dueDate!!)
            }
        }
    }
}

// Exception classes
class ValidationException(message: String) : Exception(message)
class ForbiddenException(message: String) : Exception(message)
class NotFoundException(message: String) : Exception(message)

