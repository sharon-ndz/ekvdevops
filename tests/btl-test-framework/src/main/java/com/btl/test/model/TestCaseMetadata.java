package com.btl.test.model;

import java.util.List;

public class TestCaseMetadata {
    private String epic;
    private String feature;
    private String severity;
    private List<String> tags;
    private List<String> expectedResults;

    // Getters and setters
    public String getEpic() { return epic; }
    public void setEpic(String epic) { this.epic = epic; }
    public String getFeature() { return feature; }
    public void setFeature(String feature) { this.feature = feature; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
    public List<String> getExpectedResults() { return expectedResults; }
    public void setExpectedResults(List<String> expectedResults) { this.expectedResults = expectedResults; }
}