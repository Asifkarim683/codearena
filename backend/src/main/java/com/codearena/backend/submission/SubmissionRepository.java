package com.codearena.backend.submission;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SubmissionRepository
        extends JpaRepository<Submission, Long> {

    Page<Submission> findByUserIdOrderBySubmittedAtDesc(
            Long userId, Pageable pageable);

    List<Submission> findByUserIdAndProblemIdOrderBySubmittedAtDesc(
            Long userId, Long problemId);

    List<Submission> findByProblemIdOrderBySubmittedAtDesc(
            Long problemId);

    boolean existsByUserIdAndProblemIdAndVerdict(
            Long userId, Long problemId, Verdict verdict);
}