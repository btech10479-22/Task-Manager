package com.taskmanager.dto.request;

import com.taskmanager.enums.TaskStatus;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateTaskRequest {

    @Size(min = 1, max = 255, message = "Title cannot be blank or exceed 255 characters")
    private String title;

    private String description;

    private TaskStatus status;

    private Long assignedToId;

    private Boolean clearAssignee;
}
