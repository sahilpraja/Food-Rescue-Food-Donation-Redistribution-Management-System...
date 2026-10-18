package com.foodrescue.common.audit;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String actor;

    @Column(nullable = false)
    private String action;

    @Column(nullable = false, length = 1000)
    private String target;

    @Column(nullable = false, updatable = false)
    private Instant timestamp = Instant.now();

    public AuditLog() {}

    public AuditLog(String actor, String action, String target) {
        this.actor = actor;
        this.action = action;
        this.target = target;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getActor() { return actor; }
    public void setActor(String actor) { this.actor = actor; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getTarget() { return target; }
    public void setTarget(String target) { this.target = target; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
}
