package com.codearena.backend.submission;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JudgeResult {
    private Verdict verdict;
    private Integer runtimeMs;
    private Integer memoryKb;
    private String errorMessage;
}