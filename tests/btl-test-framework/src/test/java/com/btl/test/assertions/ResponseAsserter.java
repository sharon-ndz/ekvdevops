package com.btl.test.assertions;

import com.fasterxml.jackson.databind.JsonNode;
import io.restassured.response.Response;
import org.junit.jupiter.api.Assertions;

import java.util.Iterator;
import java.util.Map;

/**
 * Performs assertions on an API response based on a JSON configuration.
 */
public class ResponseAsserter {

    /**
     * Asserts the API response using rules defined in the 'assertions' JsonNode.
     *
     * @param assertionsNode the JSON node containing assertions
     * @param response       the RestAssured response
     */
    public static void assertResponse(JsonNode assertionsNode, Response response) {
        if (assertionsNode == null || assertionsNode.isNull()) {
            return; // No assertions to apply
        }

        // 1. Assert status code
        if (assertionsNode.has("status")) {
            int expectedStatus = assertionsNode.get("status").asInt();
            int actualStatus = response.getStatusCode();
            Assertions.assertEquals(expectedStatus, actualStatus,
                    "Expected HTTP status " + expectedStatus + " but got " + actualStatus);
        }

        // 2. Assert response body fields via JSON paths
        if (assertionsNode.has("body")) {
            JsonNode bodyAssertions = assertionsNode.get("body");
            Iterator<Map.Entry<String, JsonNode>> fields = bodyAssertions.fields();

            while (fields.hasNext()) {
                Map.Entry<String, JsonNode> entry = fields.next();
                String jsonPath = entry.getKey();
                JsonNode expectedNode = entry.getValue();

                if (expectedNode.isObject() && expectedNode.has("exists")) {
                    boolean shouldExist = expectedNode.get("exists").asBoolean();
                    String actualValue = response.jsonPath().getString(jsonPath);
                    if (shouldExist) {
                        Assertions.assertNotNull(actualValue,
                                String.format("Expected path [%s] to exist but it was null", jsonPath));
                        Assertions.assertFalse(actualValue.isEmpty(),
                                String.format("Expected path [%s] to exist but it was empty", jsonPath));
                    } else {
                        Assertions.assertTrue(actualValue == null || actualValue.isEmpty(),
                                String.format("Expected path [%s] NOT to exist but it was [%s]", jsonPath, actualValue));
                    }
                } else {
                    String expectedValue = expectedNode.asText();
                    String actualValue = response.jsonPath().getString(jsonPath);

                    Assertions.assertEquals(expectedValue, actualValue,
                            String.format("Assertion failed for path [%s]: expected [%s] but got [%s]",
                                    jsonPath, expectedValue, actualValue));
                }
            }
        }

    }
}
