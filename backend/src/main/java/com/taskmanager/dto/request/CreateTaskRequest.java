package com.taskmanager.dto.request;

import com.taskmanager.enums.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateTaskRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title cannot exceed 255 characters")
    private String title;

    private String description;

    private TaskStatus status;   // defaults to TODO in service if null

    private Long assignedToId;   // nullable — unassigned tasks allowed
}
