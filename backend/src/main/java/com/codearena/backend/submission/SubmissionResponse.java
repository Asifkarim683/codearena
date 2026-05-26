package com.codearena.backend.submission;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionResponse {
    private Long id;
    private Long problemId;
    private String problemTitle;
    private String username;
    private Language language;
    private Verdict verdict;
    private Integer runtimeMs;
    private Integer memoryKb;
    private String errorMessage;
    private String code;
    private LocalDateTime submittedAt;
}