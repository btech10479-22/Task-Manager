package com.taskmanager.controller;

import com.taskmanager.dto.request.CreateTaskRequest;
import com.taskmanager.dto.request.UpdateTaskRequest;
import com.taskmanager.dto.response.ApiResponse;
import com.taskmanager.dto.response.AuditLogResponse;
import com.taskmanager.dto.response.PagedResponse;
import com.taskmanager.dto.response.TaskResponse;
import com.taskmanager.enums.TaskStatus;
import com.taskmanager.repository.AuditLogRepository;
import com.taskmanager.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@Tag(name = "Tasks", description = "Task CRUD with pagination, search, and role-based access")
@SecurityRequirement(name = "bearerAuth")
public class TaskController {

    private final TaskService taskService;
    private final AuditLogRepository auditLogRepository;

    @PostMapping
    @Operation(summary = "Create a new task")
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(
            @Valid @RequestBody CreateTaskRequest request,
            @AuthenticationPrincipal UserDetails currentUser) {
        TaskResponse task = taskService.createTask(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Task created", task));
    }

    @GetMapping
    @Operation(summary = "List tasks — supports filtering (status, assignedTo), search, pagination, and sorting")
    public ResponseEntity<ApiResponse<PagedResponse<TaskResponse>>> getTasks(
            @Parameter(description = "Filter by status: TODO | IN_PROGRESS | DONE")
            @RequestParam(required = false) TaskStatus status,
            @Parameter(description = "Filter by assignee user ID")
            @RequestParam(required = false) Long assignedTo,
            @Parameter(description = "Full-text search on title and description")
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0")   int page,
            @RequestParam(defaultValue = "20")  int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        PagedResponse<TaskResponse> result = taskService.getTasks(
                status, assignedTo, search, page, size, sortBy, direction);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a task by ID")
    public ResponseEntity<ApiResponse<TaskResponse>> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(taskService.getTaskById(id)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a task (ADMIN: any; USER: own or assigned)")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTaskRequest request,
            @AuthenticationPrincipal UserDetails currentUser) {
        TaskResponse updated = taskService.updateTask(id, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Task updated", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a task (ADMIN only)")
    public ResponseEntity<ApiResponse<Void>> deleteTask(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails currentUser) {
        taskService.deleteTask(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Task deleted", null));
    }

    @GetMapping("/{id}/audit")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get audit log for a specific task (ADMIN only)")
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getTaskAuditLog(@PathVariable Long id) {
        List<AuditLogResponse> logs = auditLogRepository
                .findByEntityTypeAndEntityIdOrderByCreatedAtDesc("TASK", id)
                .stream().map(AuditLogResponse::from).toList();
        return ResponseEntity.ok(ApiResponse.success(logs));
    }
}
