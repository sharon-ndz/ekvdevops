package com.btl.test.documentation;

import com.btl.test.model.TestCase;
import com.btl.test.model.TestStep;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class DocumentationGenerator {
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateMarkdown(TestCase testCase) {
        StringBuilder sb = new StringBuilder();

        // Generate metadata section
        sb.append("# ").append(testCase.getMetadata().getFeature()).append("\n\n");
        sb.append("## Metadata\n\n");
        sb.append("- **Epic:** ").append(testCase.getMetadata().getEpic()).append("\n");
        sb.append("- **Feature:** ").append(testCase.getMetadata().getFeature()).append("\n");
        sb.append("- **Severity:** ").append(testCase.getMetadata().getSeverity()).append("\n");
        sb.append("- **Tags:** ").append(String.join(", ", testCase.getMetadata().getTags())).append("\n\n");

        sb.append("### Expected Results\n");
        for (String result : testCase.getMetadata().getExpectedResults()) {
            sb.append("- ").append(result).append("\n");
        }
        sb.append("\n");

        // Generate steps table
        sb.append("## Test Steps\n\n");
        sb.append("| Story | Name | Method | Path | Query | Request Body | Assertions | Extract | Requires | Expected Results |\n");
        sb.append("|-------|------|--------|------|-------|--------------|------------|---------|----------|-----------------|\n");

        for (TestStep step : testCase.getSteps()) {
            String bodyStr = step.getBody() != null ? step.getBody().toString().replace("|", "\\|") : "-";
            String assertionsStr = step.getAssertions().toString().replace("|", "\\|");
            String queryStr = step.getQuery() != null ? step.getQuery().toString().replace("|", "\\|") : "-";
            String extractStr = step.getExtract() != null ?
                    step.getExtract().entrySet().stream()
                            .map(e -> e.getKey() + ": " + e.getValue())
                            .collect(Collectors.joining(", "))
                    : "-";
            String requiresStr = step.getRequires() != null ?
                    String.join(", ", step.getRequires()) : "-";
            String expectedResultsStr = step.getExpectedResults() != null ?
                    step.getExpectedResults().stream()
                            .map(r -> "- " + r)
                            .collect(Collectors.joining("<br>"))
                    : "-";

            sb.append("| ")
                    .append(step.getStory()).append(" | ")
                    .append(step.getName()).append(" | ")
                    .append(step.getMethod()).append(" | ")
                    .append(step.getPath()).append(" | ")
                    .append(queryStr).append(" | ")  // Add Query column
                    .append(bodyStr).append(" | ")
                    .append(assertionsStr).append(" | ")
                    .append(extractStr).append(" | ")
                    .append(requiresStr).append(" | ")
                    .append(expectedResultsStr).append(" |\n");
        }

        return sb.toString();
    }




    public void processDirectory(File inputDir, File outputDir) throws IOException {
        if (!inputDir.exists() || !inputDir.isDirectory()) {
            throw new IllegalArgumentException("Input directory does not exist or is not a directory: " + inputDir);
        }

        outputDir.mkdirs();

        try (Stream<Path> paths = Files.walk(inputDir.toPath())) {
            paths.filter(path -> path.toString().endsWith(".json"))
                    .filter(path -> !path.getFileName().toString().equals("index.json"))
                    .forEach(path -> processFile(path.toFile(), outputDir));
        }
    }

    private void processFile(File jsonFile, File outputDir) {
        try {
            System.out.println("Processing: " + jsonFile.getName());
            TestCase testCase = objectMapper.readValue(jsonFile, TestCase.class);
            String markdown = generateMarkdown(testCase);

            String outputFileName = jsonFile.getName().replace(".json", ".md");
            File outputFile = new File(outputDir, outputFileName);
            Files.writeString(outputFile.toPath(), markdown);

            System.out.println("Generated: " + outputFile.getName());
        } catch (IOException e) {
            System.err.println("Error processing " + jsonFile.getName() + ": " + e.getMessage());
        }
    }

}