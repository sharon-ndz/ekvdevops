package com.btl.test.base;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.restassured.RestAssured;

import java.io.InputStream;
/**
 * Base class for API test execution. Provides common configuration loading,
 * context management, placeholder resolution, and response assertion utilities.
 *
 * <p>This class is designed to be extended by dynamic test suites such as
 * {@code ApiSuiteTest}. It sets up the environment based on a selected configuration
 * (e.g., {@code configs/environments/dev.json}) and initializes the shared runtime context.</p>
 *
 * <h2>Responsibilities</h2>
 * <ul>
 *   <li>Loads base URL and environment variables from environment-specific JSON config</li>
 *   <li>Initializes RestAssured base URI</li>
 *   <li>Maintains a runtime context map for placeholder substitution</li>
 *   <li>Provides utility for resolving dynamic placeholders in test definitions</li>
 *   <li>Provides reusable assertions for validating API responses against JSON-defined expectations</li>
 * </ul>
 *
 * <p>The runtime context enables storing and reusing dynamic values across test steps,
 * such as tokens, resource IDs, and computed values.</p>
 *
 * @author rpillai
 * @see com.btl.test.ApiSuiteTest
 * @see com.btl.test.config.JsonHelper
 * @see com.btl.test.config.PlaceholderResolver
 */
public class TestBase {

    protected static String baseUrl;
    protected static ObjectMapper mapper;

    protected static  boolean enablePayloadLogging;


    // Context holds runtime variables for placeholder substitution
    //protected static Map<String, String> context = new HashMap<>();

    /**
     * Initializes the test environment before any tests are run.
     * Loads the base URL from a JSON configuration file located in:
     * {@code configs/environments/<env>.json}.
     *
     * <p>The environment can be set using the system property {@code -Denv=<env>} (default is {@code dev}).</p>
     *
     * @throws Exception if configuration cannot be loaded
     */

    public static void setupBase() throws Exception {
        String env = System.getProperty("env", "dev");

        String val = System.getenv("ENABLE_PAYLOAD_LOGGING");
        if (val == null) {
            val = System.getProperty("enablePayloadLogging", "false");
        }
        enablePayloadLogging = Boolean.parseBoolean(val);

        mapper = new ObjectMapper();

        try (InputStream stream = getResourceStream("configs/environments/" + env + ".json")) {
            JsonNode config = mapper.readTree(stream);
            baseUrl = config.get("baseUrl").asText();
            RestAssured.baseURI = baseUrl;
            System.out.println("Base URL: " + baseUrl);
        }
    }

    /**
     * Resolves placeholders in a string using the runtime context.
     * Support patterns such as {@code ${token}}, {@code ${randomString:8}}, etc.
     *
     * @param input the input string containing one or more placeholders
     * @return the resolved string with all placeholders substituted
     */
    /*
    protected static String resolvePlaceholders(String input) {
        return PlaceholderResolver.resolve(input, context);
    }*/

    /**
     * Loads a resource from the classpath and returns it as an InputStream.
     *
     * @param path the path to the resource within the classpath
     * @return the input stream of the resource
     * @throws RuntimeException if the resource is not found
     */
    protected static InputStream getResourceStream(String path) {
        InputStream stream = Thread.currentThread().getContextClassLoader().getResourceAsStream(path);
        if (stream == null) {
            System.err.println("❌ ERROR: "+"Resource not found: " + path);
            throw new RuntimeException("Resource not found: " + path);
        }
        return stream;
    }
}
