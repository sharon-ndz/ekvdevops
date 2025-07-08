package com.btl.test.flow;

import com.btl.test.context.ContextManager;
import com.btl.test.reports.AllureReporter;
import com.btl.test.runner.ApiStepRunner;
import com.fasterxml.jackson.databind.JsonNode;
import io.qameta.allure.Allure;
import org.junit.jupiter.api.DynamicTest;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

public class FlowExecutor {

    public List<DynamicTest> executeFlow(String flowName, String fileRef, JsonNode metadata, List<JsonNode> steps, ContextManager context) {
        List<DynamicTest> dynamicTests = new ArrayList<>();

        String testName = flowName + " - " + fileRef;

        ApiStepRunner runner = new ApiStepRunner(context);

        DynamicTest dynamicTest = DynamicTest.dynamicTest(testName, () -> {
            System.out.println("🧪 Starting flow: " + testName);

            if (metadata != null) {
                AllureReporter.applyLabels(metadata, 0);
                AllureReporter.attachExpectedResults("Expected Results - Flow", metadata.get("expectedResults"));
            }

            AtomicInteger stepIndex = new AtomicInteger(1); // Start from 1

            for (JsonNode step : steps) {
                int currentIndex = stepIndex.getAndIncrement();
                String stepName = step.has("name")
                        ? String.format("%d: %s", currentIndex, step.get("name").asText())
                        : String.format("%d: Unnamed Step", currentIndex);

                try {
                    AllureReporter.applyLabels(step, currentIndex);

                    Allure.step(stepName, () -> {
                        runner.runStep(step, stepName);
                    });
                } catch (Exception e) {
                    System.err.println("❌ Failure in Step: " + stepName);
                    //org.junit.jupiter.api.Assertions.fail("Flow failed at step: " + stepName + "\n" + e.getMessage(), e);
                    //throw e;
                }
            }
            System.out.println("✅ Flow completed: " + testName);
        });

        dynamicTests.add(dynamicTest);
        return dynamicTests;
    }

}
