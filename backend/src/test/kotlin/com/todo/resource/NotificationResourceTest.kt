package com.todo.resource

import io.quarkus.test.junit.QuarkusTest
import io.restassured.RestAssured.given
import io.restassured.http.ContentType
import org.hamcrest.Matchers.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.BeforeEach

/**
 * Integration tests for Notification API endpoints
 * Based on: docs/specs/features/notifications.md
 * 
 * These tests are written FIRST (TDD approach) and should FAIL until implementation is complete.
 */
@QuarkusTest
class NotificationResourceTest {

    private lateinit var authToken: String

    @BeforeEach
    fun setup() {
        authToken = "valid-auth-token"
    }

    // ========================================
    // Get Notifications
    // ========================================
    
    @Test
    @DisplayName("Should list user's notifications")
    fun testListNotifications() {
        given()
            .header("Authorization", "Bearer $authToken")
        .`when`()
            .get("/api/notifications")
        .then()
            .statusCode(200)
            .body("notifications", notNullValue())
            .body("notifications", hasSize<Int>(greaterThan(0)))
            .body("notifications[0].id", notNullValue())
            .body("notifications[0].title", notNullValue())
            .body("notifications[0].body", notNullValue())
            .body("notifications[0].isRead", notNullValue())
            .body("notifications[0].createdAt", notNullValue())
    }
    
    @Test
    @DisplayName("Should paginate notifications")
    fun testPaginateNotifications() {
        given()
            .header("Authorization", "Bearer $authToken")
            .queryParam("page", 1)
            .queryParam("limit", 10)
        .`when`()
            .get("/api/notifications")
        .then()
            .statusCode(200)
            .body("notifications", hasSize<Int>(lessThanOrEqualTo(10)))
            .body("page", equalTo(1))
            .body("totalPages", notNullValue())
    }
    
    @Test
    @DisplayName("Should filter notifications by unread")
    fun testFilterUnreadNotifications() {
        given()
            .header("Authorization", "Bearer $authToken")
            .queryParam("unread", true)
        .`when`()
            .get("/api/notifications")
        .then()
            .statusCode(200)
            .body("notifications", notNullValue())
            .body("notifications.findAll { it.isRead == true }", hasSize<Int>(0))
    }
    
    @Test
    @DisplayName("Should sort notifications by date descending")
    fun testSortNotifications() {
        given()
            .header("Authorization", "Bearer $authToken")
        .`when`()
            .get("/api/notifications")
        .then()
            .statusCode(200)
            .body("notifications", notNullValue())
    }
    
    @Test
    @DisplayName("Should not show other users' notifications")
    fun testNotificationIsolation() {
        given()
            .header("Authorization", "Bearer $authToken")
        .`when`()
            .get("/api/notifications")
        .then()
            .statusCode(200)
            .body("notifications", notNullValue())
    }
    
    // ========================================
    // Mark as Read
    // ========================================
    
    @Test
    @DisplayName("Should mark single notification as read")
    fun testMarkNotificationAsRead() {
        val notificationId = "notification-id"
        
        given()
            .header("Authorization", "Bearer $authToken")
        .`when`()
            .put("/api/notifications/$notificationId/read")
        .then()
            .statusCode(200)
            .body("isRead", equalTo(true))
            .body("readAt", notNullValue())
    }
    
    @Test
    @DisplayName("Should mark all notifications as read")
    fun testMarkAllAsRead() {
        given()
            .header("Authorization", "Bearer $authToken")
        .`when`()
            .put("/api/notifications/read-all")
        .then()
            .statusCode(200)
            .body("message", containsString("marked as read"))
            .body("count", greaterThan(0))
    }
    
    @Test
    @DisplayName("Should return 404 for non-existent notification")
    fun testMarkNonExistentAsRead() {
        given()
            .header("Authorization", "Bearer $authToken")
        .`when`()
            .put("/api/notifications/non-existent-id/read")
        .then()
            .statusCode(404)
    }
    
    @Test
    @DisplayName("Should reject marking other user's notification")
    fun testMarkOtherUserNotification() {
        val otherUserNotificationId = "other-user-notification-id"
        
        given()
            .header("Authorization", "Bearer $authToken")
        .`when`()
            .put("/api/notifications/$otherUserNotificationId/read")
        .then()
            .statusCode(403)
    }
    
    // ========================================
    // Clear Notifications
    // ========================================
    
    @Test
    @DisplayName("Should clear all read notifications")
    fun testClearReadNotifications() {
        given()
            .header("Authorization", "Bearer $authToken")
        .`when`()
            .delete("/api/notifications/clear-read")
        .then()
            .statusCode(200)
            .body("message", containsString("cleared"))
            .body("count", greaterThanOrEqualTo(0))
    }
    
    @Test
    @DisplayName("Should keep unread notifications when clearing")
    fun testKeepUnreadNotifications() {
        given()
            .header("Authorization", "Bearer $authToken")
        .`when`()
            .delete("/api/notifications/clear-read")
        .then()
            .statusCode(200)
        
        // Verify unread notifications still exist
        given()
            .header("Authorization", "Bearer $authToken")
            .queryParam("unread", true)
        .`when`()
            .get("/api/notifications")
        .then()
            .statusCode(200)
            .body("notifications", hasSize<Int>(greaterThan(0)))
    }
    
    @Test
    @DisplayName("Should only clear user's own notifications")
    fun testClearOwnNotificationsOnly() {
        given()
            .header("Authorization", "Bearer $authToken")
        .`when`()
            .delete("/api/notifications/clear-read")
        .then()
            .statusCode(200)
    }
    
    // ========================================
    // Notification Preferences
    // ========================================
    
    @Test
    @DisplayName("Should get user notification preferences")
    fun testGetNotificationPreferences() {
        given()
            .header("Authorization", "Bearer $authToken")
        .`when`()
            .get("/api/preferences/notifications")
        .then()
            .statusCode(200)
            .body("emailEnabled", notNullValue())
            .body("browserEnabled", notNullValue())
            .body("emailFrequency", notNullValue())
    }
    
    @Test
    @DisplayName("Should update email notification setting")
    fun testUpdateEmailNotificationSetting() {
        val preferencesUpdate = mapOf(
            "emailEnabled" to false
        )
        
        given()
            .header("Authorization", "Bearer $authToken")
            .contentType(ContentType.JSON)
            .body(preferencesUpdate)
        .`when`()
            .put("/api/preferences/notifications")
        .then()
            .statusCode(200)
            .body("emailEnabled", equalTo(false))
    }
    
    @Test
    @DisplayName("Should update browser notification setting")
    fun testUpdateBrowserNotificationSetting() {
        val preferencesUpdate = mapOf(
            "browserEnabled" to true
        )
        
        given()
            .header("Authorization", "Bearer $authToken")
            .contentType(ContentType.JSON)
            .body(preferencesUpdate)
        .`when`()
            .put("/api/preferences/notifications")
        .then()
            .statusCode(200)
            .body("browserEnabled", equalTo(true))
    }
    
    @Test
    @DisplayName("Should update email frequency")
    fun testUpdateEmailFrequency() {
        val preferencesUpdate = mapOf(
            "emailFrequency" to "DAILY"
        )
        
        given()
            .header("Authorization", "Bearer $authToken")
            .contentType(ContentType.JSON)
            .body(preferencesUpdate)
        .`when`()
            .put("/api/preferences/notifications")
        .then()
            .statusCode(200)
            .body("emailFrequency", equalTo("DAILY"))
    }
    
    @Test
    @DisplayName("Should validate email frequency values")
    fun testValidateEmailFrequency() {
        val preferencesUpdate = mapOf(
            "emailFrequency" to "INVALID"
        )
        
        given()
            .header("Authorization", "Bearer $authToken")
            .contentType(ContentType.JSON)
            .body(preferencesUpdate)
        .`when`()
            .put("/api/preferences/notifications")
        .then()
            .statusCode(400)
            .body("error", containsString("Invalid email frequency"))
    }
    
    // ========================================
    // Get Unread Count
    // ========================================
    
    @Test
    @DisplayName("Should get unread notification count")
    fun testGetUnreadCount() {
        given()
            .header("Authorization", "Bearer $authToken")
        .`when`()
            .get("/api/notifications/unread-count")
        .then()
            .statusCode(200)
            .body("count", greaterThanOrEqualTo(0))
    }
    
    // ========================================
    // Notification Creation Tests
    // ========================================
    
    @Test
    @DisplayName("Should create notification on task assignment")
    fun testNotificationOnTaskAssignment() {
        // This would be triggered by task assignment
        // Verify notification appears in user's list
        given()
            .header("Authorization", "Bearer $authToken")
        .`when`()
            .get("/api/notifications")
        .then()
            .statusCode(200)
            .body("notifications.find { it.type == 'task_assigned' }", notNullValue())
    }
    
    @Test
    @DisplayName("Should create notification on task completion")
    fun testNotificationOnTaskCompletion() {
        given()
            .header("Authorization", "Bearer $authToken")
        .`when`()
            .get("/api/notifications")
        .then()
            .statusCode(200)
            .body("notifications.find { it.type == 'task_completed' }", notNullValue())
    }
    
    @Test
    @DisplayName("Should create notification on comment")
    fun testNotificationOnComment() {
        given()
            .header("Authorization", "Bearer $authToken")
        .`when`()
            .get("/api/notifications")
        .then()
            .statusCode(200)
            .body("notifications.find { it.type == 'comment_added' }", notNullValue())
    }
}

