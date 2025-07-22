package com.btl.test.reports;

import com.fasterxml.jackson.databind.JsonNode;
import io.qameta.allure.Allure;

public class AllureReporter {

    public static void attachRequest(String method, String path, String body) {
        Allure.addAttachment("Request Method", method);
        Allure.addAttachment("Request Path", path);
        if (body != null && !body.isEmpty()) {
            Allure.addAttachment("Request Body", "application/json", body, ".json");
        }
    }

    public static void attachResponse(int statusCode, String body) {
        Allure.addAttachment("HTTP Status Code", String.valueOf(statusCode));
        if (body != null && !body.isEmpty()) {
            Allure.addAttachment("Response Body", "application/json", body, ".json");
        }
    }

    public static void attachExpectedResults(String title, JsonNode node) {
        AllureLabelHelper.attachExpectedResultsHtml(title, node);
    }

    public static void applyLabels(JsonNode node, int stepIndex) {
        AllureLabelHelper.applyAllureLabels(node, stepIndex);
    }

    public static void step(String name, Runnable runnable) {
            runnable.run();
    }
}
