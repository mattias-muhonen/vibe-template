package com.todo.resource

import io.quarkus.test.junit.QuarkusTest
import io.restassured.RestAssured.given
import io.restassured.http.ContentType
import org.hamcrest.Matchers.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.BeforeEach

/**
 * Integration tests for Workspace Management API endpoints
 * Based on: docs/specs/features/workspace-management.md
 * 
 * These tests are written FIRST (TDD approach) and should FAIL until implementation is complete.
 */
@QuarkusTest
class WorkspaceResourceTest {

    private lateinit var authToken: String
    private lateinit var userId: String

    @BeforeEach
    fun setup() {
        // Setup: Login to get auth token
        authToken = "valid-auth-token"
        userId = "test-user-id"
    }

    // ========================================
    // Scenario: Create New Workspace
    // ========================================
    
    @Test
    @DisplayName("Should create workspace with valid name and description")
    fun testCreateWorkspaceWithFullDetails() {
        val workspaceRequest = mapOf(
            "name" to "Marketing Team",
            "description" to "Workspace for marketing campaigns"
        )
        
        given()
            .header("Authorization", "Bearer $authToken")
            .contentType(ContentType.JSON)
            .body(workspaceRequest)
        .`when`()
            .post("/api/workspaces")
        .then()
            .statusCode(201)
            .body("id", notNullValue())
            .body("name", equalTo("Marketing Team"))
            .body("description", equalTo("Workspace for marketing campaigns"))
            .body("createdBy", equalTo(userId))
            .body("createdAt", notNullValue())
            .body("members", hasSize<Int>(1))
            .body("members[0].userId", equalTo(userId))
            .body("members[0].role", equalTo("ADMIN"))
    }
    
    @Test
    @DisplayName("Should create workspace with only name (minimal)")
    fun testCreateWorkspaceMinimal() {
        val workspaceRequest = mapOf(
            "name" to "Simple Workspace"
        )
        
        given()
            .header("Authorization", "Bearer $authToken")
            .contentType(ContentType.JSON)
            .body(workspaceRequest)
        .`when`()
            .post("/api/workspaces")
        .then()
            .statusCode(201)
            .body("name", equalTo("Simple Workspace"))
            .body("description", nullValue())
    }
    
    @Test
    @DisplayName("Should assign creator as Admin role automatically")
    fun testCreatorIsAdmin() {
        val workspaceRequest = mapOf(
            "name" to "Test Workspace"
        )
        
        given()
            .header("Authorization", "Bearer $authToken")
            .contentType(ContentType.JSON)
            .body(workspaceRequest)
        .`when`()
            .post("/api/workspaces")
        .then()
            .statusCode(201)
            .body("members", hasSize<Int>(1))
            .body("members[0].role", equalTo("ADMIN"))
    }
    
    @Test
    @DisplayName("Should reject workspace creation without name")
    fun testCreateWorkspaceWithoutName() {
        val workspaceRequest = mapOf(
            "description" to "No name provided"
        )
        
        given()
            .header("Authorization", "Bearer $authToken")
            .contentType(ContentType.JSON)
            .body(workspaceRequest)
        .`when`()
            .post("/api/workspaces")
        .then()
            .statusCode(400)
            .body("error", containsString("Name is required"))
    }
    
    @Test
    @DisplayName("Should reject workspace creation without authentication")
    fun testCreateWorkspaceUnauthenticated() {
        val workspaceRequest = mapOf(
            "name" to "Unauthorized Workspace"
        )
        
        given()
            .contentType(ContentType.JSON)
            .body(workspaceRequest)
        .`when`()
            .post("/api/workspaces")
        .then()
            .statusCode(401)
    }

    // ========================================
    // Scenario: Invite User to Workspace
    // ========================================
    
    @Test
    @DisplayName("Should send invitation email to new user")
    fun testSendInvitation() {
        val workspaceId = "existing-workspace-id"
        val inviteRequest = mapOf(
            "email" to "newmember@example.com",
            "role" to "MEMBER"
        )
        
        given()
            .header("Authorization", "Bearer $authToken")
            .contentType(ContentType.JSON)
            .body(inviteRequest)
        .`when`()
            .post("/api/workspaces/$workspaceId/invite")
        .then()
            .statusCode(201)
            .body("invitationId", notNullValue())
            .body("email", equalTo("newmember@example.com"))
            .body("role", equalTo("MEMBER"))
            .body("status", equalTo("PENDING"))
            .body("token", notNullValue())
            .body("expiresAt", notNullValue())
    }
    
    @Test
    @DisplayName("Should allow admin to specify role")
    fun testInviteWithAdminRole() {
        val workspaceId = "existing-workspace-id"
        val inviteRequest = mapOf(
            "email" to "newadmin@example.com",
            "role" to "ADMIN"
        )
        
        given()
            .header("Authorization", "Bearer $authToken")
            .contentType(ContentType.JSON)
            .body(inviteRequest)
        .`when`()
            .post("/api/workspaces/$workspaceId/invite")
        .then()
            .statusCode(201)
            .body("role", equalTo("ADMIN"))
    }
    
    @Test
    @DisplayName("Should reject invitation by non-admin")
    fun testInviteByNonAdmin() {
        val workspaceId = "existing-workspace-id"
        val memberToken = "member-token-not-admin"
        val inviteRequest = mapOf(
            "email" to "someone@example.com",
            "role" to "MEMBER"
        )
        
        given()
            .header("Authorization", "Bearer $memberToken")
            .contentType(ContentType.JSON)
            .body(inviteRequest)
        .`when`()
            .post("/api/workspaces/$workspaceId/invite")
        .then()
            .statusCode(403)
            .body("error", containsString("Admin role required"))
    }
    
    @Test
    @DisplayName("Should reject invitation to existing member")
    fun testInviteExistingMember() {
        val workspaceId = "existing-workspace-id"
        val inviteRequest = mapOf(
            "email" to "existing@example.com",
            "role" to "MEMBER"
        )
        
        given()
            .header("Authorization", "Bearer $authToken")
            .contentType(ContentType.JSON)
            .body(inviteRequest)
        .`when`()
            .post("/api/workspaces/$workspaceId/invite")
        .then()
            .statusCode(409)
            .body("error", containsString("already a member"))
    }
    
    @Test
    @DisplayName("Should reject invitation with invalid email")
    fun testInviteInvalidEmail() {
        val workspaceId = "existing-workspace-id"
        val inviteRequest = mapOf(
            "email" to "invalid-email",
            "role" to "MEMBER"
        )
        
        given()
            .header("Authorization", "Bearer $authToken")
            .contentType(ContentType.JSON)
            .body(inviteRequest)
        .`when`()
            .post("/api/workspaces/$workspaceId/invite")
        .then()
            .statusCode(400)
            .body("error", containsString("Invalid email format"))
    }

    // ========================================
    // Scenario: Accept Workspace Invitation
    // ========================================
    
    @Test
    @DisplayName("Should accept invitation with valid token")
    fun testAcceptInvitation() {
        val invitationToken = "valid-invitation-token"
        
        given()
            .header("Authorization", "Bearer $authToken")
            .queryParam("token", invitationToken)
        .`when`()
            .post("/api/workspaces/accept-invite")
        .then()
            .statusCode(200)
            .body("workspaceId", notNullValue())
            .body("role", notNullValue())
            .body("message", containsString("Successfully joined workspace"))
    }
    
    @Test
    @DisplayName("Should reject invitation with invalid token")
    fun testAcceptInvitationInvalidToken() {
        given()
            .header("Authorization", "Bearer $authToken")
            .queryParam("token", "invalid-token")
        .`when`()
            .post("/api/workspaces/accept-invite")
        .then()
            .statusCode(400)
            .body("error", containsString("Invalid invitation token"))
    }
    
    @Test
    @DisplayName("Should reject expired invitation")
    fun testAcceptExpiredInvitation() {
        val expiredToken = "expired-invitation-token"
        
        given()
            .header("Authorization", "Bearer $authToken")
            .queryParam("token", expiredToken)
        .`when`()
            .post("/api/workspaces/accept-invite")
        .then()
            .statusCode(400)
            .body("error", containsString("expired"))
    }

    // ========================================
    // Scenario: Update User Role
    // ========================================
    
    @Test
    @DisplayName("Should update member role from Member to Admin")
    fun testPromoteMemberToAdmin() {
        val workspaceId = "existing-workspace-id"
        val memberId = "member-user-id"
        val roleUpdateRequest = mapOf(
            "role" to "ADMIN"
        )
        
        given()
            .header("Authorization", "Bearer $authToken")
            .contentType(ContentType.JSON)
            .body(roleUpdateRequest)
        .`when`()
            .put("/api/workspaces/$workspaceId/members/$memberId/role")
        .then()
            .statusCode(200)
            .body("role", equalTo("ADMIN"))
    }
    
    @Test
    @DisplayName("Should update member role from Admin to Member")
    fun testDemoteAdminToMember() {
        val workspaceId = "existing-workspace-id"
        val adminId = "admin-user-id"
        val roleUpdateRequest = mapOf(
            "role" to "MEMBER"
        )
        
        given()
            .header("Authorization", "Bearer $authToken")
            .contentType(ContentType.JSON)
            .body(roleUpdateRequest)
        .`when`()
            .put("/api/workspaces/$workspaceId/members/$adminId/role")
        .then()
            .statusCode(200)
            .body("role", equalTo("MEMBER"))
    }
    
    @Test
    @DisplayName("Should reject role change by non-admin")
    fun testRoleChangeByNonAdmin() {
        val workspaceId = "existing-workspace-id"
        val memberId = "member-user-id"
        val memberToken = "member-token"
        val roleUpdateRequest = mapOf(
            "role" to "ADMIN"
        )
        
        given()
            .header("Authorization", "Bearer $memberToken")
            .contentType(ContentType.JSON)
            .body(roleUpdateRequest)
        .`when`()
            .put("/api/workspaces/$workspaceId/members/$memberId/role")
        .then()
            .statusCode(403)
    }

    // ========================================
    // Scenario: Remove User from Workspace
    // ========================================
    
    @Test
    @DisplayName("Should remove user from workspace")
    fun testRemoveMember() {
        val workspaceId = "existing-workspace-id"
        val memberId = "member-to-remove-id"
        
        given()
            .header("Authorization", "Bearer $authToken")
        .`when`()
            .delete("/api/workspaces/$workspaceId/members/$memberId")
        .then()
            .statusCode(204)
    }
    
    @Test
    @DisplayName("Should reject removal by non-admin")
    fun testRemoveMemberByNonAdmin() {
        val workspaceId = "existing-workspace-id"
        val memberId = "some-member-id"
        val memberToken = "member-token"
        
        given()
            .header("Authorization", "Bearer $memberToken")
        .`when`()
            .delete("/api/workspaces/$workspaceId/members/$memberId")
        .then()
            .statusCode(403)
    }
    
    @Test
    @DisplayName("Should reject removal of last admin")
    fun testRemoveLastAdmin() {
        val workspaceId = "existing-workspace-id"
        val lastAdminId = "last-admin-id"
        
        given()
            .header("Authorization", "Bearer $authToken")
        .`when`()
            .delete("/api/workspaces/$workspaceId/members/$lastAdminId")
        .then()
            .statusCode(400)
            .body("error", containsString("Cannot remove last admin"))
    }

    // ========================================
    // Scenario: Leave Workspace
    // ========================================
    
    @Test
    @DisplayName("Should allow member to leave workspace")
    fun testMemberLeaveWorkspace() {
        val workspaceId = "existing-workspace-id"
        
        given()
            .header("Authorization", "Bearer $authToken")
        .`when`()
            .post("/api/workspaces/$workspaceId/leave")
        .then()
            .statusCode(200)
            .body("message", containsString("Successfully left workspace"))
    }
    
    @Test
    @DisplayName("Should reject leave if user is last admin")
    fun testLastAdminCannotLeave() {
        val workspaceId = "existing-workspace-id"
        
        given()
            .header("Authorization", "Bearer $authToken")
        .`when`()
            .post("/api/workspaces/$workspaceId/leave")
        .then()
            .statusCode(400)
            .body("error", containsString("Cannot leave as last admin"))
    }

    // ========================================
    // Scenario: Switch Between Workspaces
    // ========================================
    
    @Test
    @DisplayName("Should list all user's workspaces")
    fun testListUserWorkspaces() {
        given()
            .header("Authorization", "Bearer $authToken")
        .`when`()
            .get("/api/workspaces")
        .then()
            .statusCode(200)
            .body("workspaces", notNullValue())
            .body("workspaces", hasSize<Int>(greaterThan(0)))
            .body("workspaces[0].id", notNullValue())
            .body("workspaces[0].name", notNullValue())
            .body("workspaces[0].role", notNullValue())
    }
    
    @Test
    @DisplayName("Should get workspace details by ID")
    fun testGetWorkspaceById() {
        val workspaceId = "existing-workspace-id"
        
        given()
            .header("Authorization", "Bearer $authToken")
        .`when`()
            .get("/api/workspaces/$workspaceId")
        .then()
            .statusCode(200)
            .body("id", equalTo(workspaceId))
            .body("name", notNullValue())
            .body("members", notNullValue())
            .body("createdBy", notNullValue())
    }
    
    @Test
    @DisplayName("Should reject access to workspace user is not member of")
    fun testAccessNonMemberWorkspace() {
        val otherWorkspaceId = "other-workspace-id"
        
        given()
            .header("Authorization", "Bearer $authToken")
        .`when`()
            .get("/api/workspaces/$otherWorkspaceId")
        .then()
            .statusCode(403)
            .body("error", containsString("Not a member"))
    }

    // ========================================
    // Workspace Management
    // ========================================
    
    @Test
    @DisplayName("Should update workspace name and description")
    fun testUpdateWorkspace() {
        val workspaceId = "existing-workspace-id"
        val updateRequest = mapOf(
            "name" to "Updated Workspace Name",
            "description" to "Updated description"
        )
        
        given()
            .header("Authorization", "Bearer $authToken")
            .contentType(ContentType.JSON)
            .body(updateRequest)
        .`when`()
            .put("/api/workspaces/$workspaceId")
        .then()
            .statusCode(200)
            .body("name", equalTo("Updated Workspace Name"))
            .body("description", equalTo("Updated description"))
    }
    
    @Test
    @DisplayName("Should delete workspace (owner only)")
    fun testDeleteWorkspace() {
        val workspaceId = "workspace-to-delete-id"
        
        given()
            .header("Authorization", "Bearer $authToken")
        .`when`()
            .delete("/api/workspaces/$workspaceId")
        .then()
            .statusCode(204)
    }
    
    @Test
    @DisplayName("Should list workspace members with roles")
    fun testListWorkspaceMembers() {
        val workspaceId = "existing-workspace-id"
        
        given()
            .header("Authorization", "Bearer $authToken")
        .`when`()
            .get("/api/workspaces/$workspaceId/members")
        .then()
            .statusCode(200)
            .body("members", notNullValue())
            .body("members", hasSize<Int>(greaterThan(0)))
            .body("members[0].userId", notNullValue())
            .body("members[0].role", notNullValue())
            .body("members[0].joinedAt", notNullValue())
    }
}

