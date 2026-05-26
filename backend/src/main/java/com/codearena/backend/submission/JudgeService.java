package com.codearena.backend.submission;

import com.codearena.backend.problem.TestCase;
import org.springframework.stereotype.Service;
import java.io.*;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class JudgeService {

    private static final String TEMP_DIR = System.getProperty("java.io.tmpdir") + "/codearena/";

    public JudgeResult judge(String code, Language language,
            List<TestCase> testCases,
            int timeLimitMs, int memoryLimitMb) {

        String submissionId = UUID.randomUUID().toString();
        Path workDir = Paths.get(TEMP_DIR + submissionId);

        try {
            // Create working directory
            Files.createDirectories(workDir);

            // Write code to file
            String fileName = getFileName(language);
            Path codeFile = workDir.resolve(fileName);
            Files.writeString(codeFile, code);

            // Compile if needed
            if (requiresCompilation(language)) {
                JudgeResult compileResult = compile(
                        codeFile, workDir, language);
                if (compileResult != null)
                    return compileResult;
            }

            // Run against each test case
            for (int i = 0; i < testCases.size(); i++) {
                TestCase tc = testCases.get(i);
                JudgeResult result = runTestCase(
                        workDir, language, tc,
                        timeLimitMs, memoryLimitMb);
                if (result.getVerdict() != Verdict.ACCEPTED) {
                    return result;
                }
            }

            return JudgeResult.builder()
                    .verdict(Verdict.ACCEPTED)
                    .build();

        } catch (Exception e) {
            return JudgeResult.builder()
                    .verdict(Verdict.RUNTIME_ERROR)
                    .errorMessage(e.getMessage())
                    .build();
        } finally {
            cleanup(workDir);
        }
    }

    private JudgeResult compile(Path codeFile, Path workDir,
            Language language) {
        try {
            ProcessBuilder pb;
            if (language == Language.JAVA) {
                pb = new ProcessBuilder(
                        "javac", codeFile.toString());
            } else if (language == Language.CPP) {
                pb = new ProcessBuilder(
                        "g++", "-o",
                        workDir.resolve("solution").toString(),
                        codeFile.toString());
            } else {
                return null;
            }

            pb.directory(workDir.toFile());
            pb.redirectErrorStream(true);
            Process process = pb.start();

            String output = new String(
                    process.getInputStream().readAllBytes());
            boolean finished = process.waitFor(
                    30, TimeUnit.SECONDS);

            if (!finished || process.exitValue() != 0) {
                return JudgeResult.builder()
                        .verdict(Verdict.COMPILATION_ERROR)
                        .errorMessage(output)
                        .build();
            }
            return null;

        } catch (Exception e) {
            return JudgeResult.builder()
                    .verdict(Verdict.COMPILATION_ERROR)
                    .errorMessage(e.getMessage())
                    .build();
        }
    }

    private JudgeResult runTestCase(Path workDir,
            Language language,
            TestCase testCase,
            int timeLimitMs,
            int memoryLimitMb) {
        try {
            ProcessBuilder pb = buildRunCommand(
                    workDir, language);
            pb.directory(workDir.toFile());
            pb.redirectErrorStream(false);

            long startTime = System.currentTimeMillis();
            Process process = pb.start();

            // Send input to process
            try (OutputStream stdin = process.getOutputStream()) {
                stdin.write(testCase.getInput()
                        .getBytes());
                stdin.flush();
            }

            // Wait with time limit
            boolean finished = process.waitFor(
                    timeLimitMs, TimeUnit.MILLISECONDS);
            long runtimeMs = System.currentTimeMillis()
                    - startTime;

            if (!finished) {
                process.destroyForcibly();
                return JudgeResult.builder()
                        .verdict(Verdict.TIME_LIMIT_EXCEEDED)
                        .runtimeMs((int) runtimeMs)
                        .build();
            }

            // Check for runtime error
            if (process.exitValue() != 0) {
                String error = new String(
                        process.getErrorStream()
                                .readAllBytes());
                return JudgeResult.builder()
                        .verdict(Verdict.RUNTIME_ERROR)
                        .runtimeMs((int) runtimeMs)
                        .errorMessage(error)
                        .build();
            }

            // Get output
            String actualOutput = new String(
                    process.getInputStream().readAllBytes())
                    .trim();
            String expectedOutput = testCase
                    .getExpectedOutput().trim();

            if (!actualOutput.equals(expectedOutput)) {
                return JudgeResult.builder()
                        .verdict(Verdict.WRONG_ANSWER)
                        .runtimeMs((int) runtimeMs)
                        .build();
            }

            return JudgeResult.builder()
                    .verdict(Verdict.ACCEPTED)
                    .runtimeMs((int) runtimeMs)
                    .build();

        } catch (Exception e) {
            return JudgeResult.builder()
                    .verdict(Verdict.RUNTIME_ERROR)
                    .errorMessage(e.getMessage())
                    .build();
        }
    }

    private ProcessBuilder buildRunCommand(Path workDir,
            Language language) {
        return switch (language) {
            case JAVA -> new ProcessBuilder(
                    "java", "-cp",
                    workDir.toString(), "Solution");
            case PYTHON -> new ProcessBuilder(
                    "python",
                    workDir.resolve("solution.py").toString());
            case CPP -> new ProcessBuilder(
                    workDir.resolve("solution").toString());
            case JAVASCRIPT -> new ProcessBuilder(
                    "node",
                    workDir.resolve("solution.js").toString());
        };
    }

    private String getFileName(Language language) {
        return switch (language) {
            case JAVA -> "Solution.java";
            case PYTHON -> "solution.py";
            case CPP -> "solution.cpp";
            case JAVASCRIPT -> "solution.js";
        };
    }

    private boolean requiresCompilation(Language language) {
        return language == Language.JAVA
                || language == Language.CPP;
    }

    private void cleanup(Path workDir) {
        try {
            if (Files.exists(workDir)) {
                Files.walk(workDir)
                        .sorted((a, b) -> -a.compareTo(b))
                        .forEach(p -> {
                            try {
                                Files.delete(p);
                            } catch (IOException ignored) {
                            }
                        });
            }
        } catch (IOException ignored) {
        }
    }
}