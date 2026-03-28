package com.taskmanager.service;

import com.taskmanager.dto.request.CreateTaskRequest;
import com.taskmanager.dto.request.UpdateTaskRequest;
import com.taskmanager.dto.response.PagedResponse;
import com.taskmanager.dto.response.TaskResponse;
import com.taskmanager.entity.Task;
import com.taskmanager.entity.User;
import com.taskmanager.enums.Role;
import com.taskmanager.enums.TaskStatus;
import com.taskmanager.exception.ForbiddenException;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.TaskSpecification;
import com.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    @Transactional
    public TaskResponse createTask(CreateTaskRequest request, UserDetails currentUser) {
        User creator = resolveUser(currentUser.getUsername());

        User assignee = null;
        if (request.getAssignedToId() != null) {
            assignee = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Assignee not found with id: " + request.getAssignedToId()));
        }

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : TaskStatus.TODO)
                .createdBy(creator)
                .assignedTo(assignee)
                .build();

        Task saved = taskRepository.save(task);
        auditService.log("TASK", saved.getId(), "CREATED", creator.getId(), creator.getEmail(),
                "Task created: \"" + saved.getTitle() + "\"");
        return TaskResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public PagedResponse<TaskResponse> getTasks(
            TaskStatus status, Long assignedToId, String search,
            int page, int size, String sortBy, String direction) {

        Sort sort = direction.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<Task> spec = Specification
                .where(TaskSpecification.hasStatus(status))
                .and(TaskSpecification.assignedTo(assignedToId))
                .and(TaskSpecification.search(search));

        Page<Task> taskPage = taskRepository.findAll(spec, pageable);
        return PagedResponse.from(taskPage, TaskResponse::from);
    }

    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
        return TaskResponse.from(task);
    }

    @Transactional
    public TaskResponse updateTask(Long id, UpdateTaskRequest request, UserDetails currentUser) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));

        User actor = resolveUser(currentUser.getUsername());
        assertCanModify(task, actor);

        List<String> changes = new ArrayList<>();

        if (request.getTitle() != null && !request.getTitle().equals(task.getTitle())) {
            changes.add("title: \"" + task.getTitle() + "\" → \"" + request.getTitle() + "\"");
            task.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
            changes.add("description updated");
        }
        if (request.getStatus() != null && !request.getStatus().equals(task.getStatus())) {
            changes.add("status: " + task.getStatus() + " → " + request.getStatus());
            task.setStatus(request.getStatus());
        }
        if (request.getAssignedToId() != null) {
            User assignee = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Assignee not found with id: " + request.getAssignedToId()));
            changes.add("assignedTo: " + assignee.getEmail());
            task.setAssignedTo(assignee);
        } else if (Boolean.TRUE.equals(request.getClearAssignee())) {
            changes.add("assignedTo: cleared");
            task.setAssignedTo(null);
        }

        Task saved = taskRepository.save(task);
        if (!changes.isEmpty()) {
            auditService.log("TASK", saved.getId(), "UPDATED", actor.getId(), actor.getEmail(),
                    String.join("; ", changes));
        }
        return TaskResponse.from(saved);
    }

    @Transactional
    public void deleteTask(Long id, UserDetails currentUser) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));

        User actor = resolveUser(currentUser.getUsername());
        if (actor.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Only admins can delete tasks");
        }

        auditService.log("TASK", id, "DELETED", actor.getId(), actor.getEmail(),
                "Task deleted: \"" + task.getTitle() + "\"");
        taskRepository.delete(task);
        log.info("Task {} deleted by admin {}", id, actor.getEmail());
    }

    private User resolveUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private void assertCanModify(Task task, User actor) {
        if (actor.getRole() == Role.ADMIN) return;
        boolean isCreator = task.getCreatedBy().getId().equals(actor.getId());
        boolean isAssignee = task.getAssignedTo() != null
                && task.getAssignedTo().getId().equals(actor.getId());
        if (!isCreator && !isAssignee) {
            throw new ForbiddenException("You can only update tasks you created or are assigned to");
        }
    }
}
