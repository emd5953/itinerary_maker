package com.aspot.user.repository;

import com.aspot.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByClerkUserId(String clerkUserId);
    
    boolean existsByEmail(String email);
    
    boolean existsByClerkUserId(String clerkUserId);
}