package com.taskmanager.dto.response;

import com.taskmanager.entity.AuditLog;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AuditLogResponse {
    private Long id;
    private String entityType;
    private Long entityId;
    private String action;
    private Long changedById;
    private String changedByEmail;
    private String detail;
    private LocalDateTime createdAt;

    public static AuditLogResponse from(AuditLog log) {
        return AuditLogResponse.builder()
                .id(log.getId())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId())
                .action(log.getAction())
                .changedById(log.getChangedById())
                .changedByEmail(log.getChangedByEmail())
                .detail(log.getDetail())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
