package com.mischievous.fairies.repository;

import com.mischievous.fairies.model.entity.WebActivityEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WebActivityRepository extends JpaRepository<WebActivityEntity, Long> {
}
