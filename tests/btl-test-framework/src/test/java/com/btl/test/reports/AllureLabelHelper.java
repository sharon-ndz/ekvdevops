package com.btl.test.reports;

import com.fasterxml.jackson.databind.JsonNode;
import io.qameta.allure.Allure;
import io.qameta.allure.model.Label;

import java.util.ArrayList;
import java.util.List;

public class AllureLabelHelper {

    public static void applyAllureLabels(JsonNode testCase,int storyId) {
        // Get the UUID of the currently running test case
        var currentTestCaseUuid = Allure.getLifecycle().getCurrentTestCase().orElse(null);
        if (currentTestCaseUuid == null) {
            System.err.println("No current test case found in Allure lifecycle.");
            return;
        }

        // Update the current test case with labels
        Allure.getLifecycle().updateTestCase(currentTestCaseUuid, testResult -> {
            List<Label> labels = new ArrayList<>();

            if (testCase.has("epic")) {
                labels.add(new Label().setName("epic").setValue(testCase.get("epic").asText()));
            }
            if (testCase.has("feature")) {
                labels.add(new Label().setName("feature").setValue(testCase.get("feature").asText()));
            }
            if (testCase.has("story")) {
                labels.add(new Label().setName("story").setValue(storyId+ ": "+testCase.get("story").asText()));
            }
            if (testCase.has("severity")) {
                labels.add(new Label().setName("severity").setValue(testCase.get("severity").asText()));
            }
            if (testCase.has("tags")) {
                for (JsonNode tag : testCase.get("tags")) {
                    labels.add(new Label().setName("tag").setValue(tag.asText()));
                }
            }

            testResult.getLabels().addAll(labels);
        });
    }

    /**
     * Attaches the expected results as a markdown formatted list to the Allure report.
     * @param title The title for the attachment.
     * @param expectedResults List of expected results lines.
     */
    public static void attachExpectedResultsMarkdown(String title, JsonNode expectedResultsNode) {
        if (expectedResultsNode == null || !expectedResultsNode.isArray()) {
            return; // nothing to attach
        }

        List<String> expectedResults = new ArrayList<>();
        for (JsonNode item : expectedResultsNode) {
            expectedResults.add(item.asText());
        }

        StringBuilder md = new StringBuilder();
        md.append("### ").append(title).append("\n\n");
        for (String line : expectedResults) {
            md.append("- ").append(line.trim()).append("\n");
        }

        Allure.addAttachment(title, "text/markdown", md.toString(), ".md");
    }

    public static void attachExpectedResultsHtml(String title, JsonNode expectedResultsNode) {
        if (expectedResultsNode == null || !expectedResultsNode.isArray()) {
            return; // nothing to attach
        }

        StringBuilder html = new StringBuilder();
        html.append("<h3>").append(title).append("</h3><ul>");
        for (JsonNode item : expectedResultsNode) {
            html.append("<li>").append(item.asText().trim()).append("</li>");
        }
        html.append("</ul>");

        Allure.addAttachment(title, "text/html", html.toString(), ".html");
    }

}
