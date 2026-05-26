package com.codearena.backend.problem;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProblemResponse {
    private Long id;
    private String title;
    private String description;
    private String constraints;
    private Difficulty difficulty;
    private int timeLimit;
    private int memoryLimit;
    private Set<String> tags;
    private List<TestCaseResponse> sampleTestCases;
    private int totalSubmissions;
    private int acceptedSubmissions;
    private double acceptanceRate;
    private LocalDateTime createdAt;
}