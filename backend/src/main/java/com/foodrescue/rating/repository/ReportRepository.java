package com.foodrescue.rating.repository;

import com.foodrescue.rating.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByStatusOrderByCreatedAtDesc(String status);
}
