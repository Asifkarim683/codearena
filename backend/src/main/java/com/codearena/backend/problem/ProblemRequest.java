package com.codearena.backend.problem;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProblemRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Constraints are required")
    private String constraints;

    @NotNull(message = "Difficulty is required")
    private Difficulty difficulty;

    private int timeLimit;
    private int memoryLimit;
    private Set<String> tags;
}