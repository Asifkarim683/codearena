package com.codearena.backend.contest;

import com.codearena.backend.problem.ProblemResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContestResponse {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private ContestStatus status;
    private int totalParticipants;
    private int totalProblems;
    private List<ProblemResponse> problems;
    private LocalDateTime createdAt;
}