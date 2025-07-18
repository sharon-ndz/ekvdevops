package com.btl.test.runner;

import com.btl.test.assertions.ResponseAsserter;
import com.btl.test.config.JsonHelper;
import com.btl.test.config.PlaceholderResolver;
import com.btl.test.context.ContextManager;
import com.btl.test.reports.AllureReporter;
import com.fasterxml.jackson.databind.JsonNode;
import io.restassured.response.Response;
import org.junit.jupiter.api.Assertions;

public class ApiStepRunner {

    private final ContextManager context;

    public ApiStepRunner(ContextManager context) {
        this.context = context;
    }

    public void runStep(JsonNode stepNode, String stepName) {
       // AllureReporter.step(stepName, () -> {
            try {
                String method = stepNode.get("method").asText();
                String rawPath = stepNode.get("path").asText();
                String resolvedPath = PlaceholderResolver.resolve(rawPath, context.getAll());

                // Use RequestBuiolder . Also take care of the Pretty string

                RequestBuilder builder = new RequestBuilder(context);
                RequestData requestData = builder.build(stepNode);

                // Log to Allure
                AllureReporter.attachRequest(method, resolvedPath, requestData.getPrettyBody());
                AllureReporter.attachExpectedResults("Expected Results - Step: " + stepName, stepNode.get("expectedResults"));
                //AllureReporter.applyLabels(stepNode, 0); // optional label handling

                // Send request
                Response response = sendRequest(method, resolvedPath, requestData.getRequest());

                // Log response
                AllureReporter.attachResponse(response.getStatusCode(), response.asPrettyString());

                // Assertions
                ResponseAsserter.assertResponse(stepNode.get("assertions"), response);

                // Extract to context
                JsonNode extractNode = stepNode.get("extract");
                if (extractNode != null) {
                    for (String key : JsonHelper.fieldNames(extractNode)) {
                        String jsonPath = extractNode.get(key).asText();
                        String value = response.jsonPath().getString(jsonPath);
                        context.put(key, value);
                    }
                }

            } catch (Throwable e) {
                if (e instanceof AssertionError) {
                    throw e;
                }
                Assertions.fail("Error executing step '" + stepName + "': " + e.getMessage(), e);
            }
    }

    private Response sendRequest(String method, String path, io.restassured.specification.RequestSpecification request) {
        switch (method.toUpperCase()) {
            case "GET":
                return request.get("/" + path);
            case "POST":
                return request.post("/" + path);
            case "PUT":
                return request.put("/" + path);
            case "PATCH":
                return request.patch("/" + path);
            case "DELETE":
                return request.delete("/" + path);
            default:
                throw new IllegalArgumentException("Unsupported method: " + method);
        }
    }
}
