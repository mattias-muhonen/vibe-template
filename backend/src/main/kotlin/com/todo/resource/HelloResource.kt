package com.todo.resource

import jakarta.ws.rs.GET
import jakarta.ws.rs.Path
import jakarta.ws.rs.Produces
import jakarta.ws.rs.core.MediaType

@Path("/api/hello")
class HelloResource {

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    fun hello(): Map<String, String> {
        return mapOf("message" to "Hello World from Quarkus + Kotlin!")
    }
}

