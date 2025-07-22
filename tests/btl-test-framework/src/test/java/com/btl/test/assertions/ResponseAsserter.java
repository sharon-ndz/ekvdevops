package com.btl.test.assertions;

import com.fasterxml.jackson.databind.JsonNode;
import io.restassured.response.Response;
import org.junit.jupiter.api.Assertions;

import java.util.Iterator;
import java.util.List;
import java.util.Map;

/**
 * Performs assertions on an API response based on a JSON configuration.
 */
public class ResponseAsserter {

    private static Object convertJsonNodeToValue(JsonNode node) {
        if (node.isTextual()) return node.asText();
        if (node.isBoolean()) return node.asBoolean();
        if (node.isNumber()) return node.numberValue();
        return node;
    }


    private static void validateType(Object value, String expectedType, String jsonPath) {
        boolean isValid;
        switch (expectedType.toLowerCase()) {
            case "string":
                isValid = value instanceof String;
                break;
            case "number":
                isValid = value instanceof Number;
                break;
            case "boolean":
                isValid = value instanceof Boolean;
                break;
            case "array":
                isValid = value instanceof List;
                break;
            case "object":
                isValid = value instanceof Map;
                break;
            case "null":
                isValid = value == null;
                break;
            default:
                throw new IllegalArgumentException("Unsupported type: " + expectedType);
        }

        Assertions.assertTrue(isValid,
                String.format("Expected path [%s] to be of type [%s] but got type [%s]",
                        jsonPath, expectedType, value != null ? value.getClass().getSimpleName() : "null"));
    }

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

                // If the value is an object with directives like "equals" or "exists"
                if (expectedNode.isObject()) {
                    if (expectedNode.has("exists")) {
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

                    }

                    if (expectedNode.has("equals")) {
                        Object actualValue = response.jsonPath().get(jsonPath);
                        JsonNode expectedEqualsNode = expectedNode.get("equals");

                        Object expectedValue = expectedEqualsNode.isTextual() ? expectedEqualsNode.asText() :
                                expectedEqualsNode.isBoolean() ? expectedEqualsNode.asBoolean() :
                                        expectedEqualsNode.isNumber() ? expectedEqualsNode.numberValue() :
                                                expectedEqualsNode;

                        Assertions.assertEquals(expectedValue, actualValue,
                                String.format("Assertion failed for path [%s]: expected [%s] but got [%s]",
                                        jsonPath, expectedValue, actualValue));
                    }

                    if (expectedNode.has("notEquals")) {
                        Object actualValue = response.jsonPath().get(jsonPath);
                        JsonNode expectedNotEqualsNode = expectedNode.get("notEquals");
                        Object expectedValue = convertJsonNodeToValue(expectedNotEqualsNode);
                        Assertions.assertNotEquals(expectedValue, actualValue,
                                String.format("Values should not be equal for path [%s]: both are [%s]",
                                        jsonPath, actualValue));
                    }

                    if (expectedNode.has("contains")) {
                        String actualValue = response.jsonPath().getString(jsonPath);
                        String expectedSubstring = expectedNode.get("contains").asText();
                        Assertions.assertTrue(actualValue.contains(expectedSubstring),
                                String.format("Expected path [%s] to contain [%s] but got [%s]",
                                        jsonPath, expectedSubstring, actualValue));
                    }

                    if (expectedNode.has("type")) {
                        Object actualValue = response.jsonPath().get(jsonPath);
                        String expectedType = expectedNode.get("type").asText();
                        validateType(actualValue, expectedType, jsonPath);
                    }

                    if (expectedNode.has("greaterThan")) {
                        Number actualValue = response.jsonPath().get(jsonPath);
                        Number expectedValue = expectedNode.get("greaterThan").numberValue();
                        Assertions.assertTrue(actualValue.doubleValue() > expectedValue.doubleValue(),
                                String.format("Expected path [%s] to be greater than [%s] but got [%s]",
                                        jsonPath, expectedValue, actualValue));
                    }

                    if (expectedNode.has("lessThan")) {
                        Number actualValue = response.jsonPath().get(jsonPath);
                        Number expectedValue = expectedNode.get("lessThan").numberValue();
                        Assertions.assertTrue(actualValue.doubleValue() < expectedValue.doubleValue(),
                                String.format("Expected path [%s] to be less than [%s] but got [%s]",
                                        jsonPath, expectedValue, actualValue));
                    }

                    if (expectedNode.has("regex")) {
                        String actualValue = response.jsonPath().getString(jsonPath);
                        String pattern = expectedNode.get("regex").asText();
                        Assertions.assertTrue(actualValue.matches(pattern),
                                String.format("Expected path [%s] to match pattern [%s] but got [%s]",
                                        jsonPath, pattern, actualValue));
                    }

                    if (expectedNode.has("length")) {
                        Object actualValue = response.jsonPath().get(jsonPath);
                        int expectedLength = expectedNode.get("length").asInt();
                        if (actualValue instanceof String) {
                            Assertions.assertEquals(expectedLength, ((String) actualValue).length(),
                                    String.format("Expected string length at path [%s] to be [%d] but got [%d]",
                                            jsonPath, expectedLength, ((String) actualValue).length()));
                        } else if (actualValue instanceof List) {
                            Assertions.assertEquals(expectedLength, ((List<?>) actualValue).size(),
                                    String.format("Expected array length at path [%s] to be [%d] but got [%d]",
                                            jsonPath, expectedLength, ((List<?>) actualValue).size()));
                        }
                    }
                    // Future: Add more assertion types here

                } else {
                    // Direct value comparison if it's not an object with operators
                    Object actualValue = response.jsonPath().get(jsonPath);
                    Object expectedValue = expectedNode.isTextual() ? expectedNode.asText() :
                            expectedNode.isBoolean() ? expectedNode.asBoolean() :
                                    expectedNode.isNumber() ? expectedNode.numberValue() :
                                            expectedNode;

                    Assertions.assertEquals(expectedValue, actualValue,
                            String.format("Assertion failed for path [%s]: expected [%s] but got [%s]",
                                    jsonPath, expectedValue, actualValue));
                }
            }
        }
    }
}
