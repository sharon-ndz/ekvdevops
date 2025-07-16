package com.btl.test.documentation;

import com.btl.test.model.TestCase;
import com.btl.test.model.TestCaseMetadata;
import com.btl.test.model.TestStep;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

public class DocumentationParser {
    private static final Pattern METADATA_PATTERN = Pattern.compile("\\*\\*(\\w+):\\*\\*\\s*(.+)");
    private static final ObjectMapper objectMapper = new ObjectMapper();

    public TestCase parseMarkdown(String markdown) {
        TestCase testCase = new TestCase();
        TestCaseMetadata metadata = new TestCaseMetadata();
        List<TestStep> steps = new ArrayList<>();

        String[] sections = markdown.split("\n## ");

        // Process each section
        for (String section : sections) {
            section = section.trim();
            if (section.startsWith("# ")) {
                // Extract feature name from title
                metadata.setFeature(section.substring(2).trim());
            } else if (section.startsWith("Metadata")) {
                parseMetadata(section, metadata);
            } else if (section.startsWith("Test Steps")) {
                parseSteps(section, steps);
            }
        }

        testCase.setMetadata(metadata);
        testCase.setSteps(steps);
        return testCase;
    }

    private void parseMetadata(String section, TestCaseMetadata metadata) {
        List<String> expectedResults = new ArrayList<>();
        boolean inExpectedResults = false;

        for (String line : section.split("\n")) {
            line = line.trim();

            if (line.startsWith("### Expected Results")) {
                inExpectedResults = true;
                continue;
            }

            if (inExpectedResults) {
                if (line.startsWith("-")) {
                    expectedResults.add(line.substring(1).trim());
                } else if (!line.isEmpty() && !line.startsWith("-")) {
                    inExpectedResults = false;
                }
                continue;
            }

            Matcher matcher = METADATA_PATTERN.matcher(line);
            if (matcher.find()) {
                String key = matcher.group(1).toLowerCase();
                String value = matcher.group(2).trim();

                switch (key) {
                    case "epic" -> metadata.setEpic(value);
                    case "feature" -> metadata.setFeature(value);
                    case "severity" -> metadata.setSeverity(value);
                    case "tags" -> metadata.setTags(
                            Arrays.stream(value.split(","))
                                    .map(String::trim)
                                    .collect(Collectors.toList())
                    );
                }
            }
        }

        if (!expectedResults.isEmpty()) {
            metadata.setExpectedResults(expectedResults);
        }
    }

    private void parseSteps(String section, List<TestStep> steps) {
        String[] lines = section.split("\n");
        int headerLineIndex = -1;

        // Find the header line
        for (int i = 0; i < lines.length; i++) {
            if (lines[i].contains("Story") && lines[i].contains("Method")) {
                headerLineIndex = i;
                break;
            }
        }

        if (headerLineIndex == -1) return;

        // Parse header columns
        String[] headers = lines[headerLineIndex].split("\\|");
        for (int i = 0; i < headers.length; i++) {
            headers[i] = headers[i].trim();
        }

        // Process each row
        for (int i = headerLineIndex + 2; i < lines.length; i++) {
            String line = lines[i].trim();
            if (line.isEmpty() || !line.startsWith("|")) continue;

            String[] values = line.split("\\|");
            if (values.length < 2) continue;

            TestStep step = new TestStep();

            for (int j = 1; j < values.length - 1; j++) {
                String value = values[j].trim();
                String header = j < headers.length ? headers[j].trim().toLowerCase() : "";

                switch (header) {
                    case "story" -> step.setStory(value);
                    case "name" -> step.setName(value);
                    case "method" -> step.setMethod(value);
                    case "path" -> step.setPath(value);
                    case "query" -> {
                        if (!value.equals("-")) {
                            step.setQuery(parseMap(value));
                        }
                    }
                    case "request body" -> {
                        if (!value.equals("-")) {
                            step.setBody(parseMap(value));
                        }
                    }
                    case "assertions" -> {
                        if (!value.equals("-")) {
                            step.setAssertions(parseMap(value));
                        }
                    }
                    case "extract" -> {
                        if (!value.equals("-")) {
                            step.setExtract(parseStringMap(value));
                        }
                    }
                    case "requires" -> {
                        if (!value.equals("-")) {
                            step.setRequires(parseList(value));
                        }
                    }
                    case "expected results" -> {
                        if (!value.equals("-")) {
                            step.setExpectedResults(parseList(value));
                        }
                    }
                }
            }
            steps.add(step);
        }
    }

    private Map<String, Object> parseMap(String value) {
        // Your existing map parsing logic
        Map<String, Object> map = new HashMap<>();
        if (value == null || value.trim().isEmpty() || value.equals("-")) {
            return map;
        }

        // Remove curly braces if present
        value = value.trim();
        if (value.startsWith("{")) {
            value = value.substring(1);
        }
        if (value.endsWith("}")) {
            value = value.substring(0, value.length() - 1);
        }

        // Split by comma and process each key-value pair
        String[] pairs = value.split(",");
        for (String pair : pairs) {
            String[] keyValue = pair.split("=", 2);
            if (keyValue.length == 2) {
                String key = keyValue[0].trim();
                String val = keyValue[1].trim();

                // Try to parse as boolean
                if (val.equalsIgnoreCase("true")) {
                    map.put(key, true);
                } else if (val.equalsIgnoreCase("false")) {
                    map.put(key, false);
                }
                // Try to parse as number
                else {
                    try {
                        map.put(key, Integer.parseInt(val));
                    } catch (NumberFormatException e) {
                        try {
                            map.put(key, Double.parseDouble(val));
                        } catch (NumberFormatException e2) {
                            map.put(key, val);
                        }
                    }
                }
            }
        }
        return map;
    }


    private Map<String, String> parseStringMap(String value) {
        Map<String, String> map = new HashMap<>();
        if (value == null || value.trim().isEmpty() || value.equals("-")) {
            return map;
        }

        // Split by comma and process each key-value pair
        String[] pairs = value.split(",");
        for (String pair : pairs) {
            String[] keyValue = pair.split(":", 2);
            if (keyValue.length == 2) {
                String key = keyValue[0].trim();
                String val = keyValue[1].trim();
                map.put(key, val);
            }
        }
        return map;
    }

    private List<String> parseList(String value) {
        List<String> list = new ArrayList<>();
        if (value == null || value.trim().isEmpty() || value.equals("-")) {
            return list;
        }

        // Split by comma and add each trimmed value to the list
        String[] items = value.split(",");
        for (String item : items) {
            String trimmed = item.trim();
            if (!trimmed.isEmpty()) {
                list.add(trimmed);
            }
        }
        return list;
    }

    private List<String> parseTableRow(String line) {
        return Arrays.stream(line.split("\\|"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    private TestStep parseStepRow(String line, List<String> headers) {
        List<String> values = parseTableRow(line);
        if (values.size() < headers.size()) return null;

        TestStep step = new TestStep();
        Map<String, String> columnMap = new HashMap<>();

        for (int i = 0; i < headers.size(); i++) {
            columnMap.put(headers.get(i).toLowerCase(), values.get(i));
        }

        step.setStory(columnMap.get("story"));
        step.setName(columnMap.get("name"));
        step.setMethod(columnMap.get("method"));
        step.setPath(columnMap.get("path"));

        // Parse Request Body
        String bodyStr = columnMap.get("request body");
        if (bodyStr != null && !bodyStr.equals("-")) {
            try {
                step.setBody(parseJsonLikeString(bodyStr));
            } catch (Exception e) {
                System.err.println("Error parsing request body: " + bodyStr);
            }
        }

        // Parse Assertions
        String assertionsStr = columnMap.get("assertions");
        if (assertionsStr != null && !assertionsStr.equals("-")) {
            try {
                step.setAssertions(parseJsonLikeString(assertionsStr));
            } catch (Exception e) {
                System.err.println("Error parsing assertions: " + assertionsStr);
            }
        }

        // Parse Extract
        String extractStr = columnMap.get("extract");
        if (extractStr != null && !extractStr.equals("-")) {
            Map<String, String> extract = new HashMap<>();
            String[] pairs = extractStr.split(",\\s*");
            for (String pair : pairs) {
                String[] keyValue = pair.split(":\\s*");
                if (keyValue.length == 2) {
                    extract.put(keyValue[0].trim(), keyValue[1].trim());
                }
            }
            step.setExtract(extract);
        }

        // Parse Requires
        String requiresStr = columnMap.get("requires");
        if (requiresStr != null && !requiresStr.equals("-")) {
            step.setRequires(Arrays.asList(requiresStr.split(",\\s*")));
        }

        // Parse Expected Results
        String resultsStr = columnMap.get("expected results");
        if (resultsStr != null && !resultsStr.equals("-")) {
            List<String> results = Arrays.stream(resultsStr.split("<br>"))
                    .map(s -> s.trim().startsWith("- ") ? s.substring(2).trim() : s.trim())
                    .collect(Collectors.toList());
            step.setExpectedResults(results);
        }

        return step;
    }

    private Map<String, Object> parseJsonLikeString(String input) {
        // Convert the string to proper JSON format
        String jsonStr = input.replace("=", ":")
                .replace("{", "{\"")
                .replace("}", "\"}")
                .replace(",", "\",\"")
                .replace(":", "\":\"")
                .replace("\"{", "{")
                .replace("}\"", "}")
                .replace("[\"", "[")
                .replace("\"]", "]");

        try {
            return objectMapper.readValue(jsonStr, Map.class);
        } catch (IOException e) {
            throw new RuntimeException("Failed to parse JSON-like string: " + input, e);
        }
    }

    public void writeToJson(TestCase testCase, String outputPath) throws IOException {
        objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
        objectMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);  // Add this line
        objectMapper.writeValue(new File(outputPath), testCase);
    }
}