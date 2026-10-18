package com.foodrescue.user.repository;

import com.foodrescue.user.entity.User;
import com.foodrescue.user.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhone(String phone);
    boolean existsByEmail(String email);
    List<User> findByRole(Role role);
    List<User> findByVerificationStatus(String verificationStatus);
}
