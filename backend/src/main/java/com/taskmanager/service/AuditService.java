package com.taskmanager.service;

import com.taskmanager.entity.AuditLog;
import com.taskmanager.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Async
    public void log(String entityType, Long entityId, String action,
                    Long actorId, String actorEmail, String detail) {
        AuditLog entry = AuditLog.builder()
                .entityType(entityType)
                .entityId(entityId)
                .action(action)
                .changedById(actorId)
                .changedByEmail(actorEmail)
                .detail(detail)
                .build();
        auditLogRepository.save(entry);
    }
}
