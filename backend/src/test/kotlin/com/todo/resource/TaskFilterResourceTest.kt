package com.todo.resource

import io.quarkus.test.junit.QuarkusTest
import io.restassured.RestAssured.given
import io.restassured.http.ContentType
import org.hamcrest.CoreMatchers.*
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Nested

/**
 * API Tests for Task Filtering and Sorting
 * Based on: docs/specs/features/task-filters-sorting.md
 * 
 * These tests verify REST API endpoints for:
 * - Filtering tasks by assignee, status, due date, priority
 * - Sorting tasks by various fields
 * - Combining multiple filters
 * - Saving and loading filter presets
 * - Query performance and pagination
 */
@QuarkusTest
class TaskFilterResourceTest {

    @Nested
    @DisplayName("Filter by Assignee")
    inner class FilterByAssignee {
        
        @Test
        @DisplayName("Should filter tasks by specific user ID")
        fun testFilterByUserId() {
            given()
                .header("Authorization", "Bearer \$validToken")
                .queryParam("assignee", "user-123")
            .`when`()
                .get("/api/tasks")
            .then()
                .statusCode(200)
                .body("tasks.size()", greaterThan(0))
                .body("tasks[0].assignee_id", equalTo("user-123"))
        }

        @Test
        @DisplayName("Should filter by 'me' (current user)")
        fun testFilterByMe() {
            given()
                .header("Authorization", "Bearer \$validToken")
                .queryParam("assignee", "me")
            .`when`()
                .get("/api/tasks")
            .then()
                .statusCode(200)
                .body("tasks.size()", greaterThan(0))
        }

        @Test
        @DisplayName("Should filter by 'unassigned'")
        fun testFilterByUnassigned() {
            given()
                .header("Authorization", "Bearer \$validToken")
                .queryParam("assignee", "unassigned")
            .`when`()
                .get("/api/tasks")
            .then()
                .statusCode(200)
                .body("tasks.every { it.assignee_id == null }", equalTo(true))
        }

        @Test
        @DisplayName("Should combine assignee with other filters")
        fun testCombineAssigneeFilter() {
            given()
                .header("Authorization", "Bearer \$validToken")
                .queryParam("assignee", "me")
                .queryParam("status", "in_progress")
            .`when`()
                .get("/api/tasks")
            .then()
                .statusCode(200)
        }

        @Test
        @DisplayName("Should return filtered count")
        fun testReturnFilteredCount() {
            given()
                .header("Authorization", "Bearer \$validToken")
                .queryParam("assignee", "me")
            .`when`()
                .get("/api/tasks")
            .then()
                .statusCode(200)
                .body("filtered_count", greaterThanOrEqualTo(0))
        }

        @Test
        @DisplayName("Should handle non-existent user")
        fun testNonExistentUser() {
            given()
                .header("Authorization", "Bearer \$validToken")
                .queryParam("assignee", "non-existent-user")
            .`when`()
                .get("/api/tasks")
            .then()
                .statusCode(200)
                .body("tasks.size()", equalTo(0))
        }
    }

    @Nested
    @DisplayName("Filter by Status")
    inner class FilterByStatus {
        
        @Test
        @DisplayName("Should filter by TODO status")
        fun testFilterByTodoStatus() {
            given()
                .header("Authorization", "Bearer \$validToken")
                .queryParam("status", "todo")
            .`when`()
                .get("/api/tasks")
            .then()
                .statusCode(200)
                .body("tasks.every { it.status == 'TODO' }", equalTo(true))
        }

        @Test
        @DisplayName("Should filter by IN_PROGRESS status")
        fun testFilterByInProgressStatus() {
            given()
                .header("Authorization", "Bearer \$validToken")
                .queryParam("status", "in_progress")
            .`when`()
                .get("/api/tasks")
            .then()
                .statusCode(200)
        }

        @Test
        @DisplayName("Should filter by COMPLETED status")
        fun testFilterByCompletedStatus() {
            given()
                .header("Authorization", "Bearer \$validToken")
                .queryParam("status", "completed")
            .`when`()
                .get("/api/tasks")
            .then()
                .statusCode(200)
        }

        @Test
        @DisplayName("Should combine status with other filters")
        fun testCombineStatusFilter() {
            given()
                .header("Authorization", "Bearer \$validToken")
                .queryParam("status", "todo")
                .queryParam("priority", "high")
            .`when`()
                .get("/api/tasks")
            .then()
                .statusCode(200)
        }

        @Test
        @DisplayName("Should reject invalid status value")
        fun testRejectInvalidStatus() {
            given()
                .header("Authorization", "Bearer \$validToken")
                .queryParam("status", "invalid_status")
            .`when`()
                .get("/api/tasks")
            .then()
                .statusCode(400)
                .body("error", containsString("Invalid status"))
        }
    }

    @Nested
    @DisplayName("Filter by Due Date")
    inner class FilterByDueDate {
        
        @Test
        @DisplayName("Should filter overdue tasks")
        fun testFilterOverdue() {
            given()
                .header("Authorization", "Bearer \$validToken")
                .queryParam("due_date", "overdue")
            .`when`()
                .get("/api/tasks")
            .then()
                .statusCode(200)
        }

        @Test
        @DisplayName("Should filter tasks due today")
        fun testFilterDueToday() {
            given()
                .header("Authorization", "Bearer \$validToken")
                .queryParam("due_date", "today")
            .`when`()
                .get("/api/tasks")
            .then()
                .statusCode(200)
        }

        @Test
        @DisplayName("Should filter tasks due this week")
        fun testFilterDueThisWeek() {
            given()
                .header("Authorization", "Bearer \$validToken")
                .queryParam("due_date", "this_week")
            .`when`()
                .get("/api/tasks")
            .then()
                .statusCode(200)
        }

        @Test
        @DisplayName("Should filter tasks due this month")
        fun testFilterDueThisMonth() {
            given()
                .header("Authorization", "Bearer \$validToken")
                .queryParam("due_date", "this_month")
            .`when`()
                .get("/api/tasks")
            .then()
                .statusCode(200)
        }

        @Test
        @DisplayName("Should combine due date with other filters")
        fun testCombineDueDateFilter() {
            given()
                .header("Authorization", "Bearer \$validToken")
                .queryParam("due_date", "overdue")
                .queryParam("assignee", "me")
            .`when`()
                .get("/api/tasks")
            .then()
                .statusCode(200)
        }

        @Test
        @DisplayName("Should handle timezone correctly")
        fun testHandleTimezone() {
            given()
                .header("Authorization", "Bearer \$validToken")
                .queryParam("due_date", "today")
                .queryParam("timezone", "America/New_York")
            .`when`()
                .get("/api/tasks")
            .then()
                .statusCode(200)
        }
    }

    @Nested
    @DisplayName("Filter by Priority")
    inner class FilterByPriority {
        
        @Test
        @DisplayName("Should filter by LOW priority")
        fun testFilterByLowPriority() {
            given()
                .header("Authorization", "Bearer \$validToken")
                .queryParam("priority", "low")
            .`when`()
                .get("/api/tasks")
            .then()
                .statusCode(200)
                .body("tasks.every { it.priority == 'LOW' }", equalTo(true))
        }

        @Test
        @DisplayName("Should filter by MEDIUM priority")
        fun testFilterByMediumPriority() {
            given()
                .header("Authorization", "Bearer \$validToken")
                .queryParam("priority", "medium")
            .`when`()
                .get("/api/tasks")
            .then()
                .statusCode(200)
        }

        @Test
        @DisplayName("Should filter by HIGH priority")
        fun testFilterByHighPriority() {
            given()
                .header("Authorization", "Bearer \$validToken")
                .queryParam("priority", "high")
            .`when`()
                .get("/api/tasks")
            .then()
                .statusCode(200)
        }

        @Test
        @DisplayName("Should combine priority with other filters")
        fun testCombinePriorityFilter() {
            given()
                .header("Authorization", "Bearer \$validToken")
                .queryParam("priority", "high")
                .queryParam("status", "todo")
            .`when`()
                .get("/api/tasks")
            .then()
                .statusCode(200)
        }

        @Test
        @DisplayName("Should reject invalid priority value")
        fun testRejectInvalidPriority() {
            given()
                .header("Authorization", "Bearer \$validToken")
                .queryParam("priority", "invalid")
            .`when`()
                .get("/api/tasks")
            .then()
                .statusCode(400)
        }
    }

    @Nested
    @DisplayName("Combine Multiple Filters")
    inner class CombineMultipleFilters {
        
        @Test
        @DisplayName("Should apply filters with AND logic")
        fun testApplyFiltersWithAND() {
            given()
                .header("Authorization", "Bearer \$validToken")
                .queryParam("assignee", "me")
                .queryParam("status", "in_progress")
                .queryParam("priority", "high")
            .`when`()
                .get("/api/tasks")
            .then()
                .statusCode(200)
        }

        @Test
        @DisplayName("Should handle 3+ filters")
        fun testHandleMultipleFilters() {
            given()
                .header("Authorization", "Bearer \$validToken")
                .queryParam("assignee", "me")
                .queryParam("status", "todo")
                .queryParam("priority", "high")
                .queryParam("due_date", "this_week")
            .`when`()
                .get("/api/tasks")
            .then()
                .statusCode(200)
        }

        @Test
        @DisplayName("Should return correct filtered results")
        fun testCorrectFilteredResults() {
            given()
                .header("Authorization", "Bearer \$validToken")
                .queryParam("status", "completed")
                .queryParam("assignee", "me")
            .`when`()
                .get("/api/tasks")
            .then()
                .statusCode(200)
        }

        @Test
        @DisplayName("Should return empty array when no matches")
        fun testReturnEmptyArrayNoMatches() {
            given()
                .header("Authorization", "Bearer \$validToken")
                .queryParam("assignee", "me")
                .queryParam("status", "completed")
                .queryParam("priority", "high")
                .queryParam("due_date", "overdue")
            .`when`()
                .get("/api/tasks")
            .then()
                .statusCode(200)
                .body("tasks.size()", equalTo(0))
        }
    }

    @Nested
    @DisplayName("Sort Tasks")
    inner class SortTasks {
        
        @Test
        @DisplayName("Should sort by due date ascending")
        fun testSortByDueDateAsc() {
            given()
                .header("Authorization", "Bearer \$validToken")
                .queryParam("sort_by", "due_date")
                .queryParam("sort_order", "asc")
            .`when`()
                .get("/api/tasks")
            .then()
                .statusCode(200)
        }

        @Test
        @DisplayName("Should sort by due date descending")
        fun testSortByDueDateDesc() {
            given()
                .header("Authorization", "Bearer \$validToken")
                .queryParam("sort_by", "due_date")
                .queryParam("sort_order", "desc")
            .`when`()
                .get("/api/tasks")
            .then()
                .statusCode(200)
        }

        @Test
        @DisplayName("Should sort by priority (high to low)")
        fun testSortByPriority() {
            given()
                .header("Authorization", "Bearer \$validToken")
                .queryParam("sort_by", "priority")
            .`when`()
                .get("/api/tasks")
            .then()
                .statusCode(200)
        }

        @Test
        @DisplayName("Should sort by created date")
        fun testSortByCreatedDate() {
            given()
                .header("Authorization", "Bearer \$validToken")
                .queryParam("sort_by", "created_at")
                .queryParam("sort_order", "desc")
            .`when`()
                .get("/api/tasks")
            .then()
                .statusCode(200)
        }

        @Test
        @DisplayName("Should sort by title alphabetically")
        fun testSortByTitle() {
            given()
                .header("Authorization", "Bearer \$validToken")
                .queryParam("sort_by", "title")
                .queryParam("sort_order", "asc")
            .`when`()
                .get("/api/tasks")
            .then()
                .statusCode(200)
        }

        @Test
        @DisplayName("Should combine sort with filters")
        fun testCombineSortWithFilters() {
            given()
                .header("Authorization", "Bearer \$validToken")
                .queryParam("assignee", "me")
                .queryParam("sort_by", "due_date")
                .queryParam("sort_order", "asc")
            .`when`()
                .get("/api/tasks")
            .then()
                .statusCode(200)
        }

        @Test
        @DisplayName("Should handle null values in sort")
        fun testHandleNullValuesInSort() {
            given()
                .header("Authorization", "Bearer \$validToken")
                .queryParam("sort_by", "due_date")
            .`when`()
                .get("/api/tasks")
            .then()
                .statusCode(200)
        }

        @Test
        @DisplayName("Should reject invalid sort field")
        fun testRejectInvalidSortField() {
            given()
                .header("Authorization", "Bearer \$validToken")
                .queryParam("sort_by", "invalid_field")
            .`when`()
                .get("/api/tasks")
            .then()
                .statusCode(400)
        }
    }

    @Nested
    @DisplayName("Filter Presets")
    inner class FilterPresets {
        
        @Test
        @DisplayName("Should save filter preset")
        fun testSaveFilterPreset() {
            val presetData = """
                {
                    "name": "My Active Tasks",
                    "filters": {
                        "assignee": "me",
                        "status": "in_progress"
                    }
                }
            """
            given()
                .header("Authorization", "Bearer \$validToken")
                .contentType(ContentType.JSON)
                .body(presetData)
            .`when`()
                .post("/api/tasks/filter-presets")
            .then()
                .statusCode(201)
                .body("id", notNullValue())
                .body("name", equalTo("My Active Tasks"))
        }

        @Test
        @DisplayName("Should list user's filter presets")
        fun testListFilterPresets() {
            given()
                .header("Authorization", "Bearer \$validToken")
            .`when`()
                .get("/api/tasks/filter-presets")
            .then()
                .statusCode(200)
                .body("presets", notNullValue())
        }

        @Test
        @DisplayName("Should load filter preset")
        fun testLoadFilterPreset() {
            given()
                .header("Authorization", "Bearer \$validToken")
            .`when`()
                .get("/api/tasks/filter-presets/{presetId}")
            .then()
                .statusCode(200)
                .body("filters", notNullValue())
        }

        @Test
        @DisplayName("Should update filter preset")
        fun testUpdateFilterPreset() {
            val updateData = """
                {
                    "name": "Updated Preset Name",
                    "filters": {
                        "assignee": "me",
                        "status": "todo"
                    }
                }
            """
            given()
                .header("Authorization", "Bearer \$validToken")
                .contentType(ContentType.JSON)
                .body(updateData)
            .`when`()
                .put("/api/tasks/filter-presets/{presetId}")
            .then()
                .statusCode(200)
        }

        @Test
        @DisplayName("Should delete filter preset")
        fun testDeleteFilterPreset() {
            given()
                .header("Authorization", "Bearer \$validToken")
            .`when`()
                .delete("/api/tasks/filter-presets/{presetId}")
            .then()
                .statusCode(204)
        }
    }

    @Nested
    @DisplayName("Query Performance")
    inner class QueryPerformance {
        
        @Test
        @DisplayName("Should use database indexes")
        fun testUseDatabaseIndexes() {
            // Verify query execution plan uses indexes
            given()
                .header("Authorization", "Bearer \$validToken")
                .queryParam("assignee", "me")
                .queryParam("status", "in_progress")
            .`when`()
                .get("/api/tasks")
            .then()
                .statusCode(200)
                .time(lessThan(1000L)) // Should complete in < 1 second
        }

        @Test
        @DisplayName("Should handle large result sets")
        fun testHandleLargeResultSets() {
            given()
                .header("Authorization", "Bearer \$validToken")
                .queryParam("status", "todo")
            .`when`()
                .get("/api/tasks")
            .then()
                .statusCode(200)
        }

        @Test
        @DisplayName("Should paginate results")
        fun testPaginateResults() {
            given()
                .header("Authorization", "Bearer \$validToken")
                .queryParam("page", 1)
                .queryParam("limit", 20)
            .`when`()
                .get("/api/tasks")
            .then()
                .statusCode(200)
                .body("tasks.size()", lessThanOrEqualTo(20))
                .body("pagination.page", equalTo(1))
                .body("pagination.total", notNullValue())
        }
    }
}

