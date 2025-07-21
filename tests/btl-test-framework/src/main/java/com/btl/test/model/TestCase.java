package com.btl.test.model;

import java.util.List;

public class TestCase {
    private TestCaseMetadata metadata;
    private List<TestStep> steps;

    public TestCaseMetadata getMetadata() { return metadata; }
    public void setMetadata(TestCaseMetadata metadata) { this.metadata = metadata; }
    public List<TestStep> getSteps() { return steps; }
    public void setSteps(List<TestStep> steps) { this.steps = steps; }
}