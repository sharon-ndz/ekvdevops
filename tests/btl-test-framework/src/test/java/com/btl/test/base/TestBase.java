package com.btl.test.base;

import com.btl.test.config.JsonHelper;
import com.btl.test.config.PlaceholderResolver;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.restassured.RestAssured;
import io.restassured.response.Response;
import org.junit.jupiter.api.BeforeAll;

import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class TestBase {

    protected static String baseUrl;
    protected static ObjectMapper mapper;

    // Context holds runtime variables for placeholder substitution
    protected static Map<String, String> context = new HashMap<>();

    @BeforeAll
    public static void setupBase() throws Exception {
        String env = System.getProperty("env", "dev");
        mapper = new ObjectMapper();

        try (InputStream stream = getResourceStream("configs/environments/" + env + ".json")) {
            JsonNode config = mapper.readTree(stream);
            baseUrl = config.get("baseUrl").asText();
            RestAssured.baseURI = baseUrl;
            //System.out.println("Base URL: " + baseUrl);
        }
    }

    /**
     * Resolves placeholders in input string, e.g. ${randomString:8}, ${token}, etc.
     */
    protected static String resolvePlaceholders(String input) {
        return PlaceholderResolver.resolve(input, context);
    }

    /**
     * Load resource from classpath
     */
    protected static InputStream getResourceStream(String path) {
        InputStream stream = Thread.currentThread().getContextClassLoader().getResourceAsStream(path);
        if (stream == null) {
            System.err.println("❌ ERROR: "+"Resource not found: " + path);
            throw new RuntimeException("Resource not found: " + path);
        }
        return stream;
    }

    /**
     * Assert response based on JSON assertion node:
     * status code, body field equals and existence checks.
     */
    protected void assertResponse(JsonNode assertions, Response response) {
        if (assertions == null) return;

        // Assert HTTP status
        if (assertions.has("status")) {
            int expectedStatus = assertions.get("status").asInt();
            assertEquals(expectedStatus, response.getStatusCode(), "Status code mismatch");
        }

        // Assert JSON body fields
        if (assertions.has("body")) {
            JsonNode bodyAssertions = assertions.get("body");

            for (String field : JsonHelper.fieldNames(bodyAssertions)) {
                JsonNode conditions = bodyAssertions.get(field);

                if (conditions.has("equals")) {
                    String expectedValue = conditions.get("equals").asText();
                    String actualValue = response.jsonPath().getString(field);
                    assertEquals(expectedValue, actualValue, "Field mismatch: " + field);
                }

                if (conditions.has("exists")) {
                    boolean shouldExist = conditions.get("exists").asBoolean();
                    Object value = response.jsonPath().get(field);
                    if (shouldExist) {
                        assertNotNull(value, field + " should exist but was null");
                    } else {
                        assertNull(value, field + " should not exist but was found: " + value);
                    }
                }
            }
        }
    }
}
