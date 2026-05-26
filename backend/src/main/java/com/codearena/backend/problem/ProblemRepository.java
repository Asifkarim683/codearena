package com.codearena.backend.problem;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProblemRepository extends JpaRepository<Problem, Long> {

    Page<Problem> findByIsActiveTrue(Pageable pageable);

    Page<Problem> findByIsActiveTrueAndDifficulty(
            Difficulty difficulty, Pageable pageable);

    @Query("SELECT p FROM Problem p WHERE p.isActive = true " +
            "AND LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Problem> searchByTitle(
            @Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT p FROM Problem p JOIN p.tags t " +
            "WHERE p.isActive = true AND t.name = :tagName")
    Page<Problem> findByTagName(
            @Param("tagName") String tagName, Pageable pageable);

    @Query("SELECT p FROM Problem p WHERE p.isActive = true " +
            "AND (:difficulty IS NULL OR p.difficulty = :difficulty) " +
            "AND (:keyword IS NULL OR LOWER(p.title) " +
            "LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Problem> findWithFilters(
            @Param("difficulty") Difficulty difficulty,
            @Param("keyword") String keyword,
            Pageable pageable);
}