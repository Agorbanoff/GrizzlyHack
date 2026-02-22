package com.mischievous.fairies.repository;

import com.mischievous.fairies.model.dto.res.WebActivityAnalysisDto;
import com.mischievous.fairies.model.entity.WebActivityEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WebActivityRepository extends JpaRepository<WebActivityEntity, Long> {
}
